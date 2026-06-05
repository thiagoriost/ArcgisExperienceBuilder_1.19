/**
 * @fileoverview Widget principal para impresión de mapas en PDF del lado del cliente.
 * Proporciona un formulario para configurar título y autor del mapa antes de generar el PDF.
 * @module printCliente/widget
 */

import { React } from "jimu-core"
import { JimuMapViewComponent } from "jimu-arcgis"
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
    <div style={{ padding: '10px' }}>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
          Título del mapa:
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value) }}
          placeholder="Ingrese el título del mapa"
          style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
          Autor:
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => { setAuthor(e.target.value) }}
          placeholder="Ingrese el autor"
          style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => { setShowGrid(e.target.checked) }}
          />
          Dibujar grilla
        </label>
      </div>

      {/* Controles avanzados de grilla visibles solo cuando la grilla está activada. */}
      {showGrid && (
        <div style={{display: 'flex', flexDirection: 'row', gap: '10px' }}>
          <div style={{ marginBottom: '10px', width: '100%' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Color de grilla:
            </label>
            <input
              type="color"
              value={gridColor}
              onChange={(e) => { setGridColor(e.target.value) }}
              style={{ height: '38px', padding: '4px', boxSizing: 'border-box', width: '100%' }}
            />
          </div>
        </div>
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
  )
}
