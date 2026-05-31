import { validaLoggerLocalStorage } from '../../../../shared/utils/export.utils'
import { getViewCounterApiOrigin } from '../config/environment'
import {
  VIEW_COUNTER_API_BASE_PATH,
  VIEW_COUNTER_SESSION_STORAGE_KEY,
  VIEW_COUNTER_SESSION_TTL_MS,
  type ViewCounterApiGetResponse,
  type ViewCounterApiIncrementResponse,
  type ProcessVisitResult,
  type ViewCounterPersistence,
  type ViewCounterService
} from '../types/view-counter'

/**
 * Estructura local de cache de sesión usada internamente por el servicio.
 */
interface SessionCacheEntry {
  /** Total de visitas retornado por la API en la sesión vigente. */
  totalVisits: number
  /** Marca de expiración en epoch milisegundos. */
  expiresAt: number
}

/**
 * Crea un estado inicial seguro para la lectura del contador.
 *
 * @returns Estado con contador en cero.
 */
const createDefaultState = (): ViewCounterPersistence => ({
  totalVisits: 0
})

/**
 * Verifica si la respuesta del backend para `GET /api/visits` es valida.
 *
 * @param value Valor de entrada a validar.
 * @returns true cuando cumple la estructura esperada.
 */
const isValidGetResponse = (value: unknown): value is ViewCounterApiGetResponse => {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Partial<ViewCounterApiGetResponse>
  return typeof candidate.success === 'boolean' && typeof candidate.count === 'number'
}

/**
 * Verifica si la respuesta del backend para `POST /api/visits/increment` es valida.
 *
 * @param value Valor de entrada a validar.
 * @returns `true` cuando cumple el contrato esperado.
 */
const isValidIncrementResponse = (value: unknown): value is ViewCounterApiIncrementResponse => {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Partial<ViewCounterApiIncrementResponse>
  return typeof candidate.success === 'boolean' && typeof candidate.count === 'number'
}

/**
 * Encabezados por defecto para solicitudes JSON al backend Express.
 */
const API_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json'
}

/**
 * Construye la URL absoluta para un endpoint de la API de visitas.
 *
 * El origen usa el mismo protocolo/host del visor y un puerto configurable
 * (3002 por defecto), para desacoplar backend Express del puerto de ExB.
 *
 * @param suffix Ruta adicional dentro del API.
 * @returns URL lista para usar con fetch.
 */
const buildApiUrl = (suffix = ''): string => {
  const viewCounterApiOrigin = getViewCounterApiOrigin()
  if (validaLoggerLocalStorage('logger')) console.log("buildApiUrl",{ viewCounterApiOrigin, VIEW_COUNTER_API_BASE_PATH, suffix })
  return `${viewCounterApiOrigin}${VIEW_COUNTER_API_BASE_PATH}${suffix}`
}

/**
 * Verifica si el entorno actual soporta `fetch`.
 *
 * @returns true cuando el runtime es compatible con el API HTTP.
 */
const canUseApi = (): boolean => typeof window !== 'undefined' && typeof window.fetch === 'function'

/**
 * Construye un error de API con un mensaje consistente para UI y logging.
 *
 * @param fallback Mensaje por defecto cuando no llega detalle del servidor.
 * @param apiMessage Mensaje opcional retornado por la API.
 * @returns Error tipado para propagación controlada.
 */
const buildApiError = (fallback: string, apiMessage?: string): Error => {
  const detail = typeof apiMessage === 'string' && apiMessage.trim() ? apiMessage.trim() : fallback
  return new Error(detail)
}

/**
 * Verifica si un objeto corresponde al contrato de cache de sesión.
 *
 * @param value Valor a validar.
 * @returns `true` cuando contiene total y expiración válidos.
 */
const isValidSessionCache = (value: unknown): value is SessionCacheEntry => {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Partial<SessionCacheEntry>
  return typeof candidate.totalVisits === 'number' && typeof candidate.expiresAt === 'number'
}

/**
 * Verifica disponibilidad de `sessionStorage` en el runtime actual.
 *
 * @returns `true` cuando el widget puede leer/escribir cache de sesión.
 */
const canUseSessionStorage = (): boolean => typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'

/**
 * Lee el cache de sesión del contador si existe y es utilizable.
 *
 * @returns Cache válido/parcial o `null` cuando no existe o es inválido.
 */
const readSessionCache = (): SessionCacheEntry | null => {
  if (!canUseSessionStorage()) return null

  try {
    const raw = window.sessionStorage.getItem(VIEW_COUNTER_SESSION_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as unknown
    return isValidSessionCache(parsed) ? parsed : null
  } catch (_error) {
    return null
  }
}

/**
 * Indica si un cache de sesión aún está vigente con base en su expiración.
 *
 * @param cache Cache previamente leído.
 * @returns `true` cuando no ha expirado.
 */
const isSessionCacheActive = (cache: SessionCacheEntry | null): cache is SessionCacheEntry => {
  if (!cache) return false
  return cache.expiresAt > Date.now()
}

/**
 * Guarda/actualiza el cache de sesión con vigencia de 12 horas.
 *
 * @param totalVisits Total que será reutilizado en recargas dentro de la sesión.
 */
const writeSessionCache = (totalVisits: number): void => {
  if (!canUseSessionStorage()) return

  const safeTotalVisits = Number.isFinite(totalVisits) && totalVisits >= 0 ? Math.floor(totalVisits) : 0
  const cache: SessionCacheEntry = {
    totalVisits: safeTotalVisits,
    expiresAt: Date.now() + VIEW_COUNTER_SESSION_TTL_MS
  }

  window.sessionStorage.setItem(VIEW_COUNTER_SESSION_STORAGE_KEY, JSON.stringify(cache))
}

/**
 * Elimina cache de sesión inválido o expirado para mantener consistencia.
 */
const clearSessionCache = (): void => {
  if (!canUseSessionStorage()) return
  window.sessionStorage.removeItem(VIEW_COUNTER_SESSION_STORAGE_KEY)
}

/**
 * Servicio de contador conectado a backend Express.
 *
 * Contrato HTTP esperado:
 * - `GET /api/visits` para consultar el total actual.
 * - `POST /api/visits/increment` para incrementar y obtener el nuevo total.
 */
export class ExpressApiViewCounterService implements ViewCounterService {

  /**
   * Consulta el contador actual en la API Express.
   *
   * @returns Estado de contador normalizado para consumo del widget.
   */
  async readPersistedCounter (): Promise<ViewCounterPersistence> {
    const sessionCache = readSessionCache()
    if (isSessionCacheActive(sessionCache)) {
      if (validaLoggerLocalStorage('logger')) {
        console.log("readPersistedCounter",{
          source: 'sessionStorage',
          action: 'readPersistedCounter',
          totalVisits: sessionCache.totalVisits,
          expiresAt: sessionCache.expiresAt
        })
      }

      return {
        totalVisits: sessionCache.totalVisits
      }
    }

    if (sessionCache && !isSessionCacheActive(sessionCache)) {
      clearSessionCache()
    }

    if (!canUseApi()) {
      return createDefaultState()
    }

    const url = buildApiUrl()
    if (validaLoggerLocalStorage('logger')) console.log("readPersistedCounter", { url, method: 'GET' })

    const response = await fetch(url, {
      method: 'GET',
      headers: API_HEADERS
    })

    if (!response.ok) {
      throw buildApiError('No fue posible consultar el contador de visitas.')
    }

    const payload = await response.json() as unknown
    if (!isValidGetResponse(payload)) {
      throw buildApiError('La API devolvió una respuesta inválida al consultar visitas.')
    }

    if (!payload.success) {
      throw buildApiError('La API no pudo consultar el contador de visitas.', payload.error)
    }

    const totalVisits = Number.isFinite(payload.count) && payload.count >= 0 ? Math.floor(payload.count) : 0
    writeSessionCache(totalVisits)

    return {
      totalVisits
    }
  }

  /**
   * Ejecuta incremento remoto del contador y retorna el total actualizado.
   *
   * @returns Resultado del flujo de visita para la capa de presentación.
   */
  async processVisit (): Promise<ProcessVisitResult> {
    const sessionCache = readSessionCache()
    if (isSessionCacheActive(sessionCache)) {
      if (validaLoggerLocalStorage('logger')) {
        console.log("processVisit",{
          source: 'sessionStorage',
          action: 'processVisit-skip-api',
          totalVisits: sessionCache.totalVisits,
          expiresAt: sessionCache.expiresAt
        })
      }

      return {
        totalVisits: sessionCache.totalVisits,
        incremented: false
      }
    }

    if (sessionCache && !isSessionCacheActive(sessionCache)) {
      clearSessionCache()
    }

    if (!canUseApi()) {
      return {
        totalVisits: 0,
        incremented: false
      }
    }

    const url = buildApiUrl('/increment')
    if (validaLoggerLocalStorage('logger')) console.log({ url, method: 'POST' })
    const response = await fetch(url, {
      method: 'POST',
      headers: API_HEADERS
    })

    if (!response.ok) {
      throw buildApiError('No fue posible incrementar el contador de visitas.')
    }

    const payload = await response.json() as unknown
    if (!isValidIncrementResponse(payload)) {
      throw buildApiError('La API devolvió una respuesta inválida al incrementar visitas.')
    }

    if (!payload.success) {
      throw buildApiError('La API no pudo incrementar el contador de visitas.', payload.error)
    }

    const totalVisits = Number.isFinite(payload.count) && payload.count >= 0 ? Math.floor(payload.count) : 0
    writeSessionCache(totalVisits)

    return {
      totalVisits,
      incremented: true
    }
  }
}

/**
 * Instancia por defecto del servicio para uso en runtime.
 */
export const viewCounterService = new ExpressApiViewCounterService()
