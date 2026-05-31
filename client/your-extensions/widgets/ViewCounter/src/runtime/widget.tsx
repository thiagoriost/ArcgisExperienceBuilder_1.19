import { React, type AllWidgetProps } from 'jimu-core'
import type { IMConfig } from '../config'
import ViewCounter from './components/ViewCounter'

// @ts-expect-error - Estilos procesados por el build de extensiones.
import '../styles/styles.css'

/**
 * Clave de almacenamiento para persistir la última posición del panel ViewCounter.
 */
const VIEW_COUNTER_PANEL_POSITION_STORAGE_KEY = 'view-counter.panel-position'

/**
 * Posición serializable del panel arrastrable.
 */
interface PanelPosition {
  /** Coordenada horizontal en pixeles. */
  x: number
  /** Coordenada vertical en pixeles. */
  y: number
}

/**
 * Convierte un valor desconocido a una posición válida de panel.
 *
 * @param value Valor crudo leído desde localStorage.
 * @returns Posición normalizada o `null` cuando el valor es inválido.
 */
const toPanelPosition = (value: unknown): PanelPosition | null => {
  if (!value || typeof value !== 'object') return null

  const candidate = value as Partial<PanelPosition>
  if (!Number.isFinite(candidate.x) || !Number.isFinite(candidate.y)) return null

  return {
    x: Math.max(0, Number(candidate.x)),
    y: Math.max(0, Number(candidate.y))
  }
}

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
  const [panelPos, setPanelPos] = React.useState<PanelPosition | null>(null)

  /**
   * Referencia mutable de la última posición del panel para evitar cierres obsoletos en callbacks.
   */
  const panelPosRef = React.useRef<PanelPosition | null>(null)

  /**
   * Bandera mutable para controlar el ciclo de arrastre activo.
   */
  const draggingRef = React.useRef(false)

  /**
   * Desfase inicial entre cursor y esquina superior izquierda del panel.
   */
  const dragOffsetRef = React.useRef({ x: 0, y: 0 })

  React.useEffect(() => {
    panelPosRef.current = panelPos
  }, [panelPos])

  /**
   * Hidrata la posición persistida del panel durante el montaje del widget.
   */
  React.useEffect(() => {
    try {
      const rawPosition = window.localStorage.getItem(VIEW_COUNTER_PANEL_POSITION_STORAGE_KEY)
      if (!rawPosition) return

      const parsedPosition = JSON.parse(rawPosition) as unknown
      const normalizedPosition = toPanelPosition(parsedPosition)
      if (!normalizedPosition) return

      setPanelPos(normalizedPosition)
    } catch (_error) {
      // Ignora payloads corruptos y mantiene comportamiento por defecto.
      console.log({_error})
    }
  }, [])

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

      const persistedPosition = panelPosRef.current ?? {
        x: Math.max(0, panelRect.left),
        y: Math.max(0, panelRect.top)
      }

      try {
        window.localStorage.setItem(
          VIEW_COUNTER_PANEL_POSITION_STORAGE_KEY,
          JSON.stringify(persistedPosition)
        )
      } catch (_error) {
        // En caso de bloqueo de storage, no interrumpe la interacción del usuario.
      }

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
