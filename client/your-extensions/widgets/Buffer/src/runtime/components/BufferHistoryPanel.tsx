/* eslint-disable @typescript-eslint/array-type */
import React from 'react'

/**
 * Estructura mínima requerida para renderizar una fila del historial de buffers.
 *
 * Define únicamente los campos que el componente de presentación necesita,
 * desacoplando la vista del tipo completo manejado por el runtime.
 */
export interface BufferHistoryRow {
  /** Identificador legible del buffer (ejemplo: "Predios #2"). */
  idBuffer: string
  /** Estado de visibilidad individual del buffer en el mapa. */
  bufferChecked: boolean
  /** Colección de entidades intersectadas asociadas al buffer. */
  intersectedFeaturesByBuffer: Array<unknown>
}

/**
 * Propiedades requeridas para renderizar el panel de historial de buffers.
 */
export interface BufferHistoryPanelProps {
  /** Registros de buffers generados por el usuario. */
  bufferHistory: BufferHistoryRow[]
  /** Identificador del buffer actualmente seleccionado. */
  selectedBufferId: string | null
  /** Estado global de visibilidad de buffers en el mapa. */
  showAllBuffers: boolean
  /** Handler para alternar visibilidad individual de un buffer. */
  onToggleBufferCheck: (bufferId: string, checked: boolean) => void
  /** Handler para eliminar un buffer específico del historial. */
  onDeleteStoredBuffer: (bufferId: string) => void
  /** Handler para eliminar todos los buffers almacenados. */
  onDeleteAllStoredBuffers: () => void
}

/**
 * Panel de historial de buffers.
 *
 * Encapsula toda la UI de la pestaña "Historial":
 * 1. Botón de borrado masivo.
 * 2. Tabla con checks de visibilidad.
 * 3. Acción de borrado individual por fila.
 *
 * Se mantiene como componente presentacional para desacoplar la vista del
 * componente principal y facilitar mantenimiento del frontend.
 *
 * @param props Propiedades de renderizado y acciones del historial.
 * @returns {JSX.Element} Sección visual del historial de buffers.
 */
const BufferHistoryPanel = (props: BufferHistoryPanelProps): JSX.Element => {
  const {
    bufferHistory,
    selectedBufferId,
    showAllBuffers,
    onToggleBufferCheck,
    onDeleteStoredBuffer,
    onDeleteAllStoredBuffers
  } = props

  if (bufferHistory.length === 0) {
    return (
      <p className='buffer-widget__hint'>Aún no hay buffers generados. Realice un análisis desde la pestaña Formulario.</p>
    )
  }

  return (
    <div style={{ marginTop: '10px' }}>
      {/* Barra de acciones del historial: permite eliminar masivamente todos los buffers almacenados. */}
      <div className='buffer-history-toolbar'>
        <button
          type='button'
          className='buffer-history-delete-all-btn'
          onClick={onDeleteAllStoredBuffers}
          title='Borrar todos los buffers almacenados'
          aria-label='Borrar todos los buffers almacenados'
        >
          <span aria-hidden='true'>🗑</span>
          <span>Borrar todos</span>
        </button>
      </div>

      <div className='widget-result-table-container' style={{ maxHeight: '240px', overflow: 'auto' }}>
        <table className='table table-sm table-striped' style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #d9d9d9', padding: '4px' }}>Ver</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #d9d9d9', padding: '4px' }}>Buffer</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #d9d9d9', padding: '4px' }}>Intersecciones</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #d9d9d9', padding: '4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {bufferHistory.map((buffer) => (
              <tr
                key={buffer.idBuffer}
                style={{
                  cursor: buffer.bufferChecked && showAllBuffers ? 'pointer' : 'default',
                  backgroundColor: selectedBufferId === buffer.idBuffer ? 'rgba(0, 128, 255, 0.08)' : 'transparent'
                }}
              >
                <td style={{ borderBottom: '1px solid #efefef', padding: '4px' }}>
                  <input
                    type='checkbox'
                    checked={buffer.bufferChecked}
                    onChange={(event) => {
                      event.stopPropagation()
                      onToggleBufferCheck(buffer.idBuffer, event.target.checked)
                    }}
                  />
                </td>
                <td style={{ borderBottom: '1px solid #efefef', padding: '4px' }}>{buffer.idBuffer}</td>
                <td style={{ borderBottom: '1px solid #efefef', padding: '4px' }}>{buffer.intersectedFeaturesByBuffer.length}</td>
                <td style={{ borderBottom: '1px solid #efefef', padding: '4px' }}>
                  {/* Acción de borrado individual del buffer actual de la fila. */}
                  <button
                    type='button'
                    className='buffer-history-delete-btn'
                    title={`Borrar ${buffer.idBuffer}`}
                    aria-label={`Borrar ${buffer.idBuffer}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      onDeleteStoredBuffer(buffer.idBuffer)
                    }}
                  >
                    <span aria-hidden='true'>🗑</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default BufferHistoryPanel
