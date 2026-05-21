import type { ImmutableObject } from 'seamless-immutable'

/**
 * Configuracion inmutable del widget ViewCounter.
 */
export interface Config {
  /** Clave de almacenamiento para persistencia local JSON. */
  storageKey?: string
}

/**
 * Tipo inmutable de configuracion del widget.
 */
export type IMConfig = ImmutableObject<Config>
