import React from 'react'
import { Button, Label, Option, Select, TextInput } from 'jimu-ui'
import { DataLineOutlined } from 'jimu-icons/outlined/gis/data-line'
import { SelectPointOutlined } from 'jimu-icons/outlined/gis/select-point'
import { SearchActionBar } from '../../../../shared/components/search-action-bar'

/**
 * Opción simple para controles tipo select del formulario.
 */
export interface BufferFormOption {
  /** Valor interno del control. */
  value: string
  /** Etiqueta visible al usuario. */
  label: string
}

/**
 * Opción de capa usada por el formulario de buffer.
 */
export interface BufferFormLayerOption extends BufferFormOption {
  /** URL final de la capa para consultas espaciales. */
  layerUrl: string
}

/**
 * Modo de dibujo permitido en el panel de formulario.
 */
export type BufferDrawMode = 'point' | 'line' | null

/**
 * Contrato de propiedades para el panel de captura/configuración de buffer.
 */
export interface BufferFormPanelProps {
  /** Indica si el panel de formulario está activo en el sistema de tabs. */
  isActive: boolean
  /** Valor seleccionado en el combo de temas. */
  temaValue: string
  /** Lista de temas disponibles. */
  temaOptions: BufferFormOption[]
  /** Handler de cambio para el combo de temas. */
  onTemaChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  /** Solicita/valida carga de datos desde DOT al interactuar con temas. */
  checkifDOTexist: () => void

  /** Bandera para ocultar el combo de subtemas cuando el flujo lo requiere. */
  shouldBypassSubtema: boolean
  /** Valor seleccionado en el combo de subtemas. */
  subtemaValue: string
  /** Lista de subtemas disponibles. */
  subtemaOptions: BufferFormOption[]
  /** Handler de cambio para subtemas. */
  onSubtemaChange: (event: React.ChangeEvent<HTMLSelectElement>) => void

  /** Indica si debe mostrarse el combo de grupos. */
  shouldShowGrupos: boolean
  /** Valor seleccionado en el combo de grupos. */
  grupoValue: string
  /** Lista de grupos disponibles. */
  grupoOptions: BufferFormOption[]
  /** Handler de cambio para grupos. */
  onGrupoChange: (event: React.ChangeEvent<HTMLSelectElement>) => void

  /** Valor seleccionado en el combo de capas. */
  capaValue: string
  /** Lista de capas disponibles para análisis. */
  capaOptions: BufferFormLayerOption[]
  /** Handler de cambio para capas. */
  onCapaChange: (event: React.ChangeEvent<HTMLSelectElement>) => void

  /** Distancia de buffer en formato de texto. */
  distancia: string
  /** Handler para actualizar la distancia del buffer. */
  onDistanciaChange: (event: React.ChangeEvent<HTMLInputElement>) => void

  /** Unidad de distancia seleccionada. */
  unidad: string
  /** Handler para actualizar la unidad del buffer. */
  onUnidadChange: (event: React.ChangeEvent<HTMLSelectElement>) => void

  /** Modo de dibujo activo en mapa. */
  drawMode: BufferDrawMode
  /** Handler para activar/desactivar modo de dibujo. */
  onDrawModeSelect: (nextMode: 'point' | 'line') => void

  /** Ejecuta validación previa de búsqueda en SearchActionBar. */
  onSearch: () => void
  /** Ejecuta limpieza completa del widget desde SearchActionBar. */
  onClear: () => void
  /** Estado de bloqueo del botón de búsqueda. */
  disableSearch: boolean
  /** Mensaje de error de validación para SearchActionBar. */
  actionError: string

  /** Estado de procesamiento espacial activo. */
  isProcessing: boolean
  /** Mensaje de resultado cuando no hay procesamiento en curso. */
  resultMessage: string
}

/**
 * Panel de captura y configuración del análisis espacial por buffer.
 *
 * Encapsula los controles de temas/capas, distancia/unidad, modo de dibujo
 * y la barra de acciones de búsqueda/limpieza para mantener el runtime limpio.
 *
 * @param props Propiedades y handlers de interacción del formulario.
 * @returns {JSX.Element} Vista del formulario de captura de buffer.
 */
const BufferFormPanel = (props: BufferFormPanelProps): JSX.Element => {
  const {
    isActive,
    temaValue,
    temaOptions,
    onTemaChange,
    checkifDOTexist,
    shouldBypassSubtema,
    subtemaValue,
    subtemaOptions,
    onSubtemaChange,
    shouldShowGrupos,
    grupoValue,
    grupoOptions,
    onGrupoChange,
    capaValue,
    capaOptions,
    onCapaChange,
    distancia,
    onDistanciaChange,
    unidad,
    onUnidadChange,
    drawMode,
    onDrawModeSelect,
    onSearch,
    onClear,
    disableSearch,
    actionError,
    isProcessing,
    resultMessage
  } = props

  return (
    <section
      id='buffer-tabpanel-formulario'
      role='tabpanel'
      aria-labelledby='buffer-tab-formulario'
      className={`buffer-widget-panel ${isActive ? 'is-active' : ''}`}
    >
      <Label>Temas:</Label>
      <Select value={temaValue} onChange={onTemaChange} onClick={checkifDOTexist}>
        <Option value=''>Seleccione...</Option>
        {temaOptions.map((option) => (
          <Option key={option.value} value={option.value}>{option.label}</Option>
        ))}
      </Select>

      {!shouldBypassSubtema && (
        <>
          <Label>Subtemas:</Label>
          <Select value={subtemaValue} onChange={onSubtemaChange}>
            <Option value=''>Seleccione...</Option>
            {subtemaOptions.map((option) => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
        </>
      )}

      {shouldShowGrupos && (
        <>
          <Label>Grupos:</Label>
          <Select value={grupoValue} onChange={onGrupoChange}>
            <Option value=''>Seleccione...</Option>
            {grupoOptions.map((option) => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
        </>
      )}

      <Label>Capas:</Label>
      <Select value={capaValue} onChange={onCapaChange} disabled={shouldShowGrupos && !grupoValue}>
        <Option value=''>Seleccione...</Option>
        {capaOptions.map((option) => (
          <Option key={`${option.value}-${option.layerUrl}`} value={option.value}>{option.label}</Option>
        ))}
      </Select>

      {capaValue !== '' && (
        <>
          <Label>Distancia:</Label>
          <TextInput
            type='text'
            min='1'
            value={distancia}
            onChange={onDistanciaChange}
          />

          <Label>Unidad:</Label>
          <Select value={unidad} onChange={onUnidadChange}>
            <Option value='Metros'>Metros</Option>
            <Option value='Kilometros'>Kilometros</Option>
          </Select>

          <Label>Modo de dibujo:</Label>
          <div
            role='group'
            aria-label='Modo de dibujo'
            style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}
          >
            <Button
              type={drawMode === 'point' ? 'primary' : 'default'}
              aria-pressed={drawMode === 'point'}
              title='Punto'
              onClick={() => { onDrawModeSelect('point') }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <SelectPointOutlined width={16} height={16} />
              <span>Punto</span>
            </Button>
            <Button
              type={drawMode === 'line' ? 'primary' : 'default'}
              aria-pressed={drawMode === 'line'}
              title='Linea'
              onClick={() => { onDrawModeSelect('line') }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <DataLineOutlined width={16} height={16} />
              <span>Linea</span>
            </Button>
          </div>

          {drawMode === 'line' && (
            <p className='buffer-widget__hint'>Para linea: haga clic en dos puntos del mapa.</p>
          )}
        </>
      )}

      <SearchActionBar
        onSearch={onSearch}
        onClear={onClear}
        disableSearch={disableSearch}
        helpText='Seleccione un modo de dibujo para habilitar la captura en el mapa, y haga clic sobre el mapa en donde desea realizar el buffer.'
        error={actionError}
        searchLabel='Buscar'
        clearLabel='Limpiar'
        hideSearch={true}
      />

      {isProcessing && (
        <p className='buffer-widget__hint'>Procesando buffer e intersección espacial...</p>
      )}

      {!isProcessing && resultMessage && (
        <p className='buffer-widget__hint'>{resultMessage}</p>
      )}
    </section>
  )
}

export default BufferFormPanel
