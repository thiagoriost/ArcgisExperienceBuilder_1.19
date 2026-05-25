import {
  VIEW_COUNTER_API_BASE_PATH,
  VIEW_COUNTER_COOKIE_NAME,
  VIEW_COUNTER_COOKIE_VALUE,
  VIEW_COUNTER_DEFAULT_STORAGE_KEY,
  type ViewCounterApiPersistenceResponse,
  type ViewCounterApiProcessResponse,
  type ProcessVisitResult,
  type ViewCounterPersistence,
  type ViewCounterService
} from '../types/view-counter'

/**
 * Crea un estado inicial seguro para la persistencia.
 *
 * @returns Estado con contador en cero y sello temporal actual.
 */
const createDefaultState = (): ViewCounterPersistence => ({
  totalVisits: 0,
  updatedAt: new Date().toISOString()
})

/**
 * Verifica que un valor desconocido tenga forma valida de persistencia.
 *
 * @param value Valor de entrada a validar.
 * @returns true cuando cumple la estructura esperada.
 */
const isValidPersistence = (value: unknown): value is ViewCounterPersistence => {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Partial<ViewCounterPersistence>
  return typeof candidate.totalVisits === 'number' && typeof candidate.updatedAt === 'string'
}

/**
 * Suma un dia calendario a una fecha de referencia.
 *
 * @param now Fecha base para calcular expiracion.
 * @returns Nueva fecha con +1 dia.
 */
const API_HEADERS = {
  'Content-Type': 'application/json'
}

/**
 * Construye la URL de un endpoint relativo del contador.
 *
 * @param suffix Ruta adicional dentro del API.
 * @returns URL lista para usar con fetch.
 */
const buildApiUrl = (suffix = ''): string => `${VIEW_COUNTER_API_BASE_PATH}${suffix}`

/**
 * Verifica si el entorno de navegador permite usar fetch y cookies de sesión.
 *
 * @returns true cuando el runtime es compatible con el API HTTP.
 */
const canUseApi = (): boolean => typeof window !== 'undefined' && typeof window.fetch === 'function'

/**
 * Suma un dia calendario a una fecha de referencia.
 *
 * @param now Fecha base para calcular expiracion.
 * @returns Nueva fecha con +1 dia.
 */
const getCookieExpirationDate = (now: Date = new Date()): Date => {
  const expires = new Date(now)
  expires.setDate(expires.getDate() + 1)
  return expires
}

/**
 * Servicio de contador con persistencia local JSON y cookie de control diario.
 *
 * Persistencia:
 * 1. Lee y escribe un documento JSON serializado en localStorage.
 * 2. Sobrescribe el payload completo en cada actualizacion.
 *
 * Validacion de visita:
 * 1. Si cookieContadorQuindio=visita no existe, incrementa y persiste.
 * 2. Si ya existe, solo lee y devuelve el acumulado.
 */
export class LocalJsonViewCounterService implements ViewCounterService {
  private readonly storageKey: string

  /**
   * @param storageKey Clave para almacenamiento local JSON.
   */
  constructor (storageKey: string = VIEW_COUNTER_DEFAULT_STORAGE_KEY) {
    this.storageKey = storageKey
  }

  /**
   * Lee el estado persistido y recupera defaults cuando el JSON es invalido.
   */
  async readPersistedCounter (): Promise<ViewCounterPersistence> {
    if (canUseApi()) {
      try {
        const response = await window.fetch(buildApiUrl(), {
          method: 'GET',
          credentials: 'include',
          headers: API_HEADERS
        })

        if (response.ok) {
          const payload = await response.json() as ViewCounterApiPersistenceResponse
          return {
            totalVisits: Number.isFinite(payload.totalVisits) && payload.totalVisits >= 0 ? Math.floor(payload.totalVisits) : 0,
            updatedAt: payload.updatedAt
          }
        }
      } catch (_error) {
        // Fallback local abajo.
      }
    }

    const persistedRaw = window.localStorage.getItem(this.storageKey)

    if (!persistedRaw) {
      return createDefaultState()
    }

    try {
      const parsed = JSON.parse(persistedRaw) as unknown
      if (!isValidPersistence(parsed)) {
        return createDefaultState()
      }

      const isTotalVisitsValid = Number.isFinite(parsed.totalVisits) && parsed.totalVisits >= 0
      if (!isTotalVisitsValid) {
        return createDefaultState()
      }

      return {
        totalVisits: isTotalVisitsValid ? parsed.totalVisits : 0,
        updatedAt: parsed.updatedAt
      }
    } catch (_error) {
      return createDefaultState()
    }
  }

  /**
   * Sobrescribe completamente el documento JSON persistido.
   *
   * @param totalVisits Nuevo total acumulado.
   * @returns Estado persistido final.
   */
  async overwritePersistedCounter (totalVisits: number): Promise<ViewCounterPersistence> {
    const safeTotalVisits = Number.isFinite(totalVisits) && totalVisits >= 0 ? Math.floor(totalVisits) : 0
    const nextState: ViewCounterPersistence = {
      totalVisits: safeTotalVisits,
      updatedAt: new Date().toISOString()
    }

    if (canUseApi()) {
      try {
        const response = await window.fetch(buildApiUrl(), {
          method: 'PUT',
          credentials: 'include',
          headers: API_HEADERS,
          body: JSON.stringify({ totalVisits: safeTotalVisits })
        })

        if (response.ok) {
          const payload = await response.json() as ViewCounterApiPersistenceResponse
          return {
            totalVisits: Number.isFinite(payload.totalVisits) && payload.totalVisits >= 0 ? Math.floor(payload.totalVisits) : safeTotalVisits,
            updatedAt: payload.updatedAt
          }
        }
      } catch (_error) {
        // Fallback local abajo.
      }
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(nextState))
    return nextState
  }

  /**
   * Evalua cookie e incrementa contador cuando corresponde.
   *
   * @returns Resultado con total final y metadatos del proceso.
   */
  async processVisit (): Promise<ProcessVisitResult> {
    if (canUseApi()) {
      try {
        const response = await window.fetch(buildApiUrl('/process'), {
          method: 'POST',
          credentials: 'include',
          headers: API_HEADERS
        })

        if (response.ok) {
          const payload = await response.json() as ViewCounterApiProcessResponse

          return {
            totalVisits: Number.isFinite(payload.totalVisits) && payload.totalVisits >= 0 ? Math.floor(payload.totalVisits) : 0,
            incremented: Boolean(payload.incremented),
            cookieExpiresAt: payload.cookieExpiresAt
          }
        }
      } catch (_error) {
        // Fallback local abajo.
      }
    }

    const persisted = await this.readPersistedCounter()
    const updated = await this.overwritePersistedCounter(persisted.totalVisits + 1)
    const expiresAt = getCookieExpirationDate()
    document.cookie = `${VIEW_COUNTER_COOKIE_NAME}=${encodeURIComponent(VIEW_COUNTER_COOKIE_VALUE)}; expires=${expiresAt.toUTCString()}; path=/; SameSite=Lax`

    return {
      totalVisits: updated.totalVisits,
      incremented: true,
      cookieExpiresAt: expiresAt.toISOString()
    }
  }
}

/**
 * Instancia por defecto del servicio para uso en runtime.
 */
export const viewCounterService = new LocalJsonViewCounterService()
