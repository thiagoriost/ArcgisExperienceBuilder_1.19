import {
  VIEW_COUNTER_COOKIE_NAME,
  VIEW_COUNTER_COOKIE_VALUE,
  VIEW_COUNTER_DEFAULT_STORAGE_KEY,
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
const getCookieExpirationDate = (now: Date = new Date()): Date => {
  const expires = new Date(now)
  expires.setDate(expires.getDate() + 1)
  return expires
}

/**
 * Obtiene el valor de un cookie por nombre.
 *
 * @param name Nombre exacto del cookie.
 * @returns Valor del cookie o null cuando no existe.
 */
const getCookieValue = (name: string): string | null => {
  const serialized = document.cookie
  if (!serialized) return null

  const cookieChunks = serialized.split(';').map(chunk => chunk.trim())
  const cookieEntry = cookieChunks.find(chunk => chunk.startsWith(`${name}=`))

  if (!cookieEntry) return null
  return decodeURIComponent(cookieEntry.substring(name.length + 1))
}

/**
 * Escribe un cookie de control para la validacion de visita diaria.
 *
 * @param expiresAt Fecha de expiracion UTC del cookie.
 */
const setVisitCookie = (expiresAt: Date): void => {
  document.cookie = `${VIEW_COUNTER_COOKIE_NAME}=${encodeURIComponent(VIEW_COUNTER_COOKIE_VALUE)}; expires=${expiresAt.toUTCString()}; path=/; SameSite=Lax`
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
  readPersistedCounter (): Promise<ViewCounterPersistence> {
    const persistedRaw = window.localStorage.getItem(this.storageKey)
    if (!persistedRaw) {
      return Promise.resolve(createDefaultState())
    }

    try {
      const parsed = JSON.parse(persistedRaw) as unknown
      if (!isValidPersistence(parsed)) {
        return Promise.resolve(createDefaultState())
      }
      return Promise.resolve({
        totalVisits: Number.isFinite(parsed.totalVisits) && parsed.totalVisits >= 0 ? parsed.totalVisits : 0,
        updatedAt: parsed.updatedAt
      })
    } catch (_error) {
      return Promise.resolve(createDefaultState())
    }
  }

  /**
   * Sobrescribe completamente el documento JSON persistido.
   *
   * @param totalVisits Nuevo total acumulado.
   * @returns Estado persistido final.
   */
  overwritePersistedCounter (totalVisits: number): Promise<ViewCounterPersistence> {
    const safeTotalVisits = Number.isFinite(totalVisits) && totalVisits >= 0 ? Math.floor(totalVisits) : 0
    const nextState: ViewCounterPersistence = {
      totalVisits: safeTotalVisits,
      updatedAt: new Date().toISOString()
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(nextState))
    return Promise.resolve(nextState)
  }

  /**
   * Evalua cookie e incrementa contador cuando corresponde.
   *
   * @returns Resultado con total final y metadatos del proceso.
   */
  async processVisit (): Promise<ProcessVisitResult> {
    const persisted = await this.readPersistedCounter()
    const existingCookieValue = getCookieValue(VIEW_COUNTER_COOKIE_NAME)
    const shouldIncrement = existingCookieValue !== VIEW_COUNTER_COOKIE_VALUE

    if (!shouldIncrement) {
      return {
        totalVisits: persisted.totalVisits,
        incremented: false
      }
    }

    const updated = await this.overwritePersistedCounter(persisted.totalVisits + 1)
    const expiresAt = getCookieExpirationDate()
    setVisitCookie(expiresAt)

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
