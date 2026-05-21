import { React, type AllWidgetProps } from 'jimu-core'
import type { IMConfig } from '../config'
import ViewCounter from './components/ViewCounter'

// @ts-expect-error - Estilos procesados por el build de extensiones.
import '../styles/styles.css'

/**
 * Entrada runtime del widget ViewCounter.
 *
 * @param props Propiedades estandar de Experience Builder.
 * @returns Componente de contador de visitas.
 */
const Widget = (_props: AllWidgetProps<IMConfig>) => {
  return (
    <div style={{ height: '100%', padding: '5px', boxSizing: 'border-box' }}>
      <ViewCounter />
    </div>
  )
}

export default Widget
