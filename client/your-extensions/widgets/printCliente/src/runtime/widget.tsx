/**
 * @fileoverview Widget principal para impresión de mapas en PDF del lado del cliente.
 * Proporciona un formulario para configurar título y autor del mapa antes de generar el PDF.
 * @module printCliente/widget
 */

import { React } from "jimu-core"
import { JimuMapViewComponent } from "jimu-arcgis"
import { Label, TextInput } from "jimu-ui"
import { useClientPrint } from "./useClientPrint"
import { SearchActionBar } from '../../../shared/components/search-action-bar'

/**
 * Componente principal del widget de impresión de mapas.
 * Permite al usuario:
 * - Configurar el título del mapa (valor por defecto: "MAPA TEMÁTICO")
 * - Configurar el autor del mapa (valor por defecto: "IGAC")
 * - Generar un PDF con el mapa actual, incluyendo leyenda automática
 *
 * @param {object} props - Propiedades del widget de Experience Builder.
 * @param {string[]} [props.useMapWidgetIds] - Array de IDs de widgets de mapa configurados.
 * @returns {JSX.Element} Interfaz del widget con formulario y botón de impresión.
 * @example
 * // El widget se configura automáticamente en Experience Builder
 * <Widget useMapWidgetIds={['map-widget-1']} />
 */
export default function Widget(props: any) {

  const [jimuMapView, setJimuMapView] = React.useState<any>()
  const [title, setTitle] = React.useState("Sig Quindío")
  const [author, setAuthor] = React.useState("")
  const [showGrid, setShowGrid] = React.useState(false)
  const [gridColor, setGridColor] = React.useState("#787878")

  const { print, loading } = useClientPrint(jimuMapView, {
    title,
    author,
    showGrid,
    gridColor
  })

  /**
   * Restablece los campos del formulario a sus valores vacíos.
   * Limpia el título y el autor del mapa.
   * @returns {void}
   */
  const handleLimpiar = (): void => {
    setTitle("")
    setAuthor("")
  }

  return (
    <div style={{ height: '100%', padding: '5px', boxSizing: 'border-box' }}>
      <div className='consulta-widget loading-host'>
        <div>
          <Label>Título del mapa:</Label>
          <TextInput
            type='text'
            value={title}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setTitle(event.target.value) }}
            placeholder='Ingrese el título del mapa'
          />

          <Label>Autor:</Label>
          <TextInput
            type='text'
            value={author}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setAuthor(event.target.value) }}
            placeholder='Ingrese el autor'
          />

          <Label>Dibujar grilla:</Label>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type='checkbox'
                checked={showGrid}
                onChange={(e) => { setShowGrid(e.target.checked) }}
              />
              Activar grilla
            </label>
          </div>

          {/* Controles avanzados de grilla visibles solo cuando la grilla está activada. */}
          {showGrid && (
            <>
              <Label>Color de grilla:</Label>
              <input
                type='color'
                value={gridColor}
                onChange={(e) => { setGridColor(e.target.value) }}
                style={{ height: '38px', padding: '4px', boxSizing: 'border-box', width: '100%', marginBottom: '10px' }}
              />
            </>
          )}

      {/* <button
        onClick={print}
        disabled={loading}
        style={{ width: '100%', padding: '8px', cursor: loading ? 'wait' : 'pointer' }}
      >
        {loading ? "Generando..." : "Imprimir PDF"}
      </button> */}

          <SearchActionBar
            onSearch={print}
            onClear={handleLimpiar}
            loading={loading}
            disableSearch={loading || author.trim() === "" || title.trim() === ""}
            searchLabel="Imprimir PDF"
            clearLabel="Limpiar campos"
          />

          <JimuMapViewComponent
            useMapWidgetId={props.useMapWidgetIds?.[0]}
            onActiveViewChange={setJimuMapView}
          />
        </div>
      </div>
    </div>
  )
}
