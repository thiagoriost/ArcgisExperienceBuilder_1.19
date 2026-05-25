import { validaLoggerLocalStorage } from '../../../../shared/utils/export.utils'
import { getViewCounterApiOrigin } from '../config/environment'
import {
  VIEW_COUNTER_API_BASE_PATH,
  type ViewCounterApiGetResponse,
  type ViewCounterApiIncrementResponse,
  type ProcessVisitResult,
  type ViewCounterPersistence,
  type ViewCounterService
} from '../types/view-counter'

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
const buildApiUrl = (suffix = ''): string => `${getViewCounterApiOrigin()}${VIEW_COUNTER_API_BASE_PATH}${suffix}`

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
    if (!canUseApi()) {
      return createDefaultState()
    }

    const url = buildApiUrl()
    if (validaLoggerLocalStorage('logger')) console.log({ url, method: 'GET' })

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

    return {
      totalVisits: Number.isFinite(payload.count) && payload.count >= 0 ? Math.floor(payload.count) : 0
    }
  }

  /**
   * Ejecuta incremento remoto del contador y retorna el total actualizado.
   *
   * @returns Resultado del flujo de visita para la capa de presentación.
   */
  async processVisit (): Promise<ProcessVisitResult> {
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

    return {
      totalVisits: Number.isFinite(payload.count) && payload.count >= 0 ? Math.floor(payload.count) : 0,
      incremented: true
    }
  }
}

/**
 * Instancia por defecto del servicio para uso en runtime.
 */
export const viewCounterService = new ExpressApiViewCounterService()
