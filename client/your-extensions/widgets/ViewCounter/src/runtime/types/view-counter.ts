/**
 * Endpoint base expuesto por la API de visitas en Express.
 */
export const VIEW_COUNTER_API_BASE_PATH = '/api/visits'

/**
 * Clave de `sessionStorage` usada para cachear contador y vigencia de sesión.
 */
export const VIEW_COUNTER_SESSION_STORAGE_KEY = 'view-counter.session-cache'

/**
 * Tiempo de vigencia del cache de sesión expresado en milisegundos (12 horas).
 */
export const VIEW_COUNTER_SESSION_TTL_MS = 12 * 60 * 60 * 1000

/**
 * Estructura persistida del contador de visitas.
 */
export interface ViewCounterPersistence {
  /** Total acumulado de visitas registradas. */
  totalVisits: number
}

/**
 * Resultado de la evaluacion de visita durante la carga del widget.
 */
export interface ProcessVisitResult {
  /** Total de visitas luego de evaluar cookie y persistencia. */
  totalVisits: number
  /** Indica si la API reporta incremento exitoso. */
  incremented: boolean
}

/**
 * Estructura de cache de sesión para evitar múltiples incrementos por recarga.
 */
export interface ViewCounterSessionCache {
  /** Total de visitas retornado por la API durante esta sesión. */
  totalVisits: number
  /** Marca temporal (epoch ms) hasta la cual el cache se considera válido. */
  expiresAt: number
}

/**
 * Respuesta HTTP del endpoint `GET /api/visits`.
 */
export interface ViewCounterApiGetResponse {
  /** Bandera de exito retornada por el backend. */
  success: boolean
  /** Total acumulado de visitas reportado por el backend. */
  count: number
  /** Mensaje de error opcional retornado por la API. */
  error?: string
}

/**
 * Respuesta HTTP del endpoint `POST /api/visits/increment`.
 */
export interface ViewCounterApiIncrementResponse {
  /** Bandera de exito retornada por el backend. */
  success: boolean
  /** Total acumulado luego del incremento. */
  count: number
  /** Mensaje de error opcional retornado por la API. */
  error?: string
}

/**
 * Abstraccion del servicio de contador para facilitar pruebas y extension.
 */
export interface ViewCounterService {
  /** Lee el contador persistido. */
  readPersistedCounter: () => Promise<ViewCounterPersistence>
  /** Ejecuta incremento remoto en la API y retorna el total actualizado. */
  processVisit: () => Promise<ProcessVisitResult>
}

/**
 * Estado expuesto por el hook de contador.
 */
export interface UseViewCounterState {
  /** Valor mostrado de visitas totales. */
  totalVisits: number
  /** Estado de carga inicial/reintentos del contador. */
  loading: boolean
  /** Mensaje de error amigable para UI. */
  error: string
  /** Permite reprocesar la lectura y validacion de visita. */
  reload: () => Promise<void>
}
