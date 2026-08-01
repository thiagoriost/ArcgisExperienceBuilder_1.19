import { React } from "jimu-core"

const { useCallback } = React

/**
 * @description Hook para estandarizar logging de depuración en TabIndicadores.
 * @param enabled Indica si la traza de depuración debe estar activa.
 */
export const useTabIndicadoresDebug = (enabled: boolean) => {
  const debugLog = useCallback((message: string, payload?: unknown) => {
    if (!enabled) return
    if (typeof payload === "undefined") {
      console.log(message)
      return
    }
    console.log(message, payload)
  }, [enabled])

  return {
    debugLog,
  }
}
