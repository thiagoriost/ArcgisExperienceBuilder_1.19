import { React } from 'jimu-core'
import { viewCounterService } from '../services/view-counter.service'
import type { UseViewCounterState, ViewCounterService } from '../types/view-counter'
import { validaLoggerLocalStorage } from '../../../../shared/utils/export.utils'

/**
 * Hook de estado para orquestar lectura, validacion de cookie y actualizacion UI.
 *
 * @param service Servicio inyectable para pruebas o reemplazo de persistencia.
 * @returns Estado consumible por la capa de presentacion.
 */
export const useViewCounter = (
  service: ViewCounterService = viewCounterService
): UseViewCounterState => {
  const [totalVisits, setTotalVisits] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  /**
   * Ejecuta el flujo de contador y sincroniza el estado de UI.
   */
  const reload = React.useCallback(async (): Promise<void> => {
    setLoading(true)
    setError('')

    try {
      const result = await service.processVisit()
      if (validaLoggerLocalStorage('logger')) console.log({ result })
      setTotalVisits(result.totalVisits)
    } catch (cause: unknown) {
      console.error('ViewCounter: error procesando visita', cause)
      setError('No fue posible leer o actualizar el contador de visitas.')
    } finally {
      setLoading(false)
    }
  }, [service])

  React.useEffect(() => {
    void reload()
  }, [reload])

  return {
    totalVisits,
    loading,
    error,
    reload
  }
}
