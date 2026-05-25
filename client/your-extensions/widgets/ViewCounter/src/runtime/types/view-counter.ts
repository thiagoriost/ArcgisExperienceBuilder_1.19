/**
 * Nombre del cookie que controla incremento unico por ventana de 24 horas.
 */
export const VIEW_COUNTER_COOKIE_NAME = 'cookieContadorQuindio'

/**
 * Valor esperado del cookie de control de visita.
 */
export const VIEW_COUNTER_COOKIE_VALUE = 'visita'

/**
 * Clave por defecto usada para persistencia JSON en almacenamiento local.
 */
export const VIEW_COUNTER_DEFAULT_STORAGE_KEY = 'view-counter.persistence.json'

/**
 * Ruta del endpoint REST usado por el widget para persistencia externa.
 */
export const VIEW_COUNTER_API_BASE_PATH = '/rest/view-counter'

/**
 * Estructura persistida del contador de visitas.
 */
export interface ViewCounterPersistence {
  /** Total acumulado de visitas registradas. */
  totalVisits: number
  /** Fecha de ultima actualizacion en formato ISO-8601. */
  updatedAt: string
}

/**
 * Resultado de la evaluacion de visita durante la carga del widget.
 */
export interface ProcessVisitResult {
  /** Total de visitas luego de evaluar cookie y persistencia. */
  totalVisits: number
  /** Indica si en esta carga se incremento el contador. */
  incremented: boolean
  /** Fecha de expiracion del cookie cuando fue creado en esta ejecucion. */
  cookieExpiresAt?: string
}

/**
 * Respuesta persistida del servicio HTTP.
 */
export interface ViewCounterApiPersistenceResponse {
  /** Total acumulado de visitas. */
  totalVisits: number
  /** Fecha de ultima actualizacion. */
  updatedAt: string
}

/**
 * Respuesta del endpoint que procesa una visita.
 */
export interface ViewCounterApiProcessResponse {
  /** Total acumulado luego del procesamiento. */
  totalVisits: number
  /** Indica si la visita incremento el contador. */
  incremented: boolean
  /** Fecha de expiracion del cookie cuando se creo. */
  cookieExpiresAt?: string
}

/**
 * Abstraccion del servicio de contador para facilitar pruebas y extension.
 */
export interface ViewCounterService {
  /** Lee el contador persistido. */
  readPersistedCounter: () => Promise<ViewCounterPersistence>
  /** Sobrescribe por completo el contador persistido. */
  overwritePersistedCounter: (totalVisits: number) => Promise<ViewCounterPersistence>
  /** Procesa una visita aplicando validacion de cookie e incremento condicional. */
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
