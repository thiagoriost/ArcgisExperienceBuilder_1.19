import { React, type AllWidgetProps } from 'jimu-core'
import type { IMConfig } from '../config'
import ViewCounter from './components/ViewCounter'

// @ts-expect-error - Estilos procesados por el build de extensiones.
import '../styles/styles.css'

/**
 * Entrada runtime del widget ViewCounter.
 *
 * Integra un contenedor arrastrable para permitir al usuario
 * reposicionar visualmente el panel del contador dentro del viewport.
 *
 * @param _props Propiedades estandar de Experience Builder.
 * @returns Componente de contador de visitas con soporte drag and drop.
 */
const Widget = (_props: AllWidgetProps<IMConfig>) => {
  /**
   * Posición manual del panel flotante.
   *
   * Cuando es `null`, el panel usa la posición por defecto del layout.
   */
  const [panelPos, setPanelPos] = React.useState<{ x: number, y: number } | null>(null)

  /**
   * Bandera mutable para controlar el ciclo de arrastre activo.
   */
  const draggingRef = React.useRef(false)

  /**
   * Desfase inicial entre cursor y esquina superior izquierda del panel.
   */
  const dragOffsetRef = React.useRef({ x: 0, y: 0 })

  /**
   * Inicia el arrastre del panel al presionar el encabezado.
   *
   * Registra listeners temporales de `mousemove` y `mouseup` para mover
   * el contenedor y restringirlo al área visible del navegador.
   *
   * @param event Evento de mouse disparado sobre el encabezado arrastrable.
   */
  const onDragStart = React.useCallback((event: React.MouseEvent<HTMLDivElement>): void => {
    event.preventDefault()

    const panelElement = event.currentTarget.parentElement
    if (!panelElement) return

    draggingRef.current = true
    const panelRect = panelElement.getBoundingClientRect()
    dragOffsetRef.current = {
      x: event.clientX - panelRect.left,
      y: event.clientY - panelRect.top
    }

    const onMouseMove = (mouseMoveEvent: MouseEvent): void => {
      if (!draggingRef.current) return

      const maxX = Math.max(0, window.innerWidth - panelRect.width)
      const maxY = Math.max(0, window.innerHeight - panelRect.height)
      const nextX = Math.max(0, Math.min(mouseMoveEvent.clientX - dragOffsetRef.current.x, maxX))
      const nextY = Math.max(0, Math.min(mouseMoveEvent.clientY - dragOffsetRef.current.y, maxY))

      setPanelPos({ x: nextX, y: nextY })
    }

    const onMouseUp = (): void => {
      draggingRef.current = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [])

  return (
    <div style={{ height: '100%', padding: '5px', boxSizing: 'border-box', position: 'relative' }}>
      <div
        style={panelPos
          ? {
              position: 'fixed',
              left: panelPos.x,
              top: panelPos.y,
              zIndex: 20,
              // width: 'min(320px, calc(100vw - 16px))'
            }
          : {
              position: 'relative',
              width: '100%'
            }}
      >
        <div
          role='button'
          aria-label='Arrastrar widget de contador'
          tabIndex={0}
          onMouseDown={onDragStart}
          style={{
            cursor: 'move',
            userSelect: 'none',
            padding: '6px 10px',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            // backgroundColor: '#f1eadf',
            // border: '1px solid #d6c9b3',
            borderBottom: 'none',
            fontWeight: 700,
            color: '#3a3128'
          }}
          title='Mantenga presionado y arrastre para mover el panel'
        >
          <ViewCounter />
        </div>
      </div>
    </div>
  )
}

export default Widget
