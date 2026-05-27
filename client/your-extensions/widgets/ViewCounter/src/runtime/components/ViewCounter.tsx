import { React } from 'jimu-core'
// import { Button } from 'jimu-ui'
import { useViewCounter } from '../hooks/use-view-counter'
import { validaLoggerLocalStorage } from '../../../../shared/utils/export.utils'

/**
 * Propiedades del componente visual de contador.
 */
export interface ViewCounterProps {
  /** Locale para formateo de miles/decimales en la vista. */
  locale?: string
}

/**
 * Presentacion principal del contador de visitas.
 *
 * Renderiza estados de carga, error y resultado final formateado.
 */
const ViewCounter = ({ locale = 'es-CO' }: ViewCounterProps) => {
  const { totalVisits, loading/* , error, reload  */} = useViewCounter()

  /**
   * Valor de contador formateado para visualizacion local.
   */
  const formattedCounter = React.useMemo(() => {
    const formatted = new Intl.NumberFormat(locale).format(totalVisits)
    if (validaLoggerLocalStorage('logger')) console.log({ totalVisits, locale, formatted })
    return formatted
  }, [locale, totalVisits])

  return (
    <section className='view-counter-widget consulta-widget loading-host' aria-live='polite'>
      <header className='view-counter-widget__header'>
        <h3 className='view-counter-widget__title'>Número de visitas: {formattedCounter}</h3>
        {/* <p className='view-counter-widget__subtitle'>Contador persistente de accesos</p> */}
      </header>

      {loading && (
        <div className='view-counter-widget__state view-counter-widget__state--loading'>
          Cargando contador...
        </div>
      )}

      {/* {!loading && error && (
        <div className='view-counter-widget__state view-counter-widget__state--error'>
          <p>{error}</p>
          <Button type='primary' size='sm' onClick={() => { void reload() }}>
            Reintentar
          </Button>
        </div>
      )} */}
{/*
      {!loading && !error && (
        <div className='view-counter-widget__value-panel'>
          <span className='view-counter-widget__value'>{formattedCounter}</span>
          <span className='view-counter-widget__label'>visitas registradas</span>
        </div>
      )} */}
    </section>
  )
}

export default React.memo(ViewCounter)
