import { validaLoggerLocalStorage } from "../../../../shared/utils/export.utils"

/**
 * Puerto por defecto del backend Express del contador de visitas.
 */
export const DEFAULT_VIEW_COUNTER_API_PORT = 8055

/**
 * Extensión de `Window` para permitir configuración runtime opcional.
 */
declare global {
  interface Window {
    /**
     * Puerto opcional de API configurado dinámicamente en runtime.
     *
     * Ejemplo: `window.__VIEW_COUNTER_API_PORT__ = 8055`.
     */
    __VIEW_COUNTER_API_PORT__?: string | number
  }
}

/**
 * Normaliza un valor de puerto y garantiza rango válido TCP.
 *
 * @param value Valor de entrada en texto o número.
 * @returns Puerto válido o `null` cuando el valor no es utilizable.
 */
const normalizePort = (value: string | number | undefined): number | null => {
  if (value == null) return null

  const parsed = typeof value === 'number' ? value : Number(String(value).trim())
  if (!Number.isInteger(parsed)) return null
  if (parsed < 1 || parsed > 65535) return null

  return parsed
}

/**
 * Obtiene el puerto API desde distintas fuentes de configuración.
 *
 * Prioridad:
 * 1. `window.__VIEW_COUNTER_API_PORT__` (runtime).
 * 2. `process.env.VIEW_COUNTER_API_PORT` (build/env).
 * 3. Puerto por defecto 8055.
 *
 * @returns Puerto de backend para consumir la API de visitas.
 */
export const getViewCounterApiPort = (): number => {
  const windowPort = typeof window !== 'undefined' ? normalizePort(window.__VIEW_COUNTER_API_PORT__) : null
  if (windowPort != null) return windowPort

  const envPortCandidate = typeof process !== 'undefined' ? process.env?.VIEW_COUNTER_API_PORT : undefined
  const envPort = normalizePort(envPortCandidate)
  if (validaLoggerLocalStorage('logger')) console.log({ windowPort, envPortCandidate, envPort })
  if (envPort != null) return envPort

  return DEFAULT_VIEW_COUNTER_API_PORT
}

/**
 * Construye el origen absoluto del backend de visitas.
 *
 * Mantiene host/protocolo del visor y desacopla únicamente el puerto,
 * permitiendo ejecutar la API en 8055 y ExB en un puerto distinto.
 *
 * @returns Origen absoluto del backend Express.
 */
export const getViewCounterApiOrigin = (): string => {
  const apiPort = getViewCounterApiPort()
  /* if (typeof window === 'undefined') {
    return `http://localhost:${apiPort}`
  } */
  const protocol = window.location.protocol // evalua si es http o https
  // const ApiOrigin = `https//${window.location.hostname}:${apiPort}`
  const ApiOrigin = `${protocol}//${window.location.hostname}:${apiPort}`
  if (validaLoggerLocalStorage('logger')) console.log("getViewCounterApiOrigin", { apiPort, ApiOrigin, location: typeof window !== 'undefined' ? window.location : 'no-window' })
  return ApiOrigin
}

