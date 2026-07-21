/**
 * Widget de búsqueda firmas espectrales
 * @date 2025-04-01
 * @author IGAC - DIP
 * @dateUpdated 2025-05-02
 * @changes Importación widget Sketch
 * @changes Importación componente GraphicsLayer
 * @changes Importación componente Extent
 * @changes Importación utilidades webMercator
 * @dateUpdated 2025-06-03
 * @changes Importación componente TablaResultSrcSIEC bajo objeto TABLARESULTADOS_SIEC desde commonWidgets
 * @dateUpdated 2025-06-09
 * @changes Importación componente appActions
 * @dateUpdated 2025-06-18
 * @changes Deshacer requerimiento 2025-06-03, ya que no se emplea la importación, se realiza bajo hook useEffect importación utilidades para módulos
 * @remarks Tomado del visor geográfico, REFA
 */

import type { AllWidgetProps } from "jimu-core"
import { useEffect, useState } from "react"
import GraphicsLayer from "esri/layers/GraphicsLayer"
import type { IMConfig } from "../config"
import { type JimuMapView, JimuMapViewComponent } from "jimu-arcgis"
import Sketch from "esri/widgets/Sketch"

/**
  Sección procesamiento widget => Módulo Widget Búsqueda Firmas Espectrales
  @date 2025-04-01
  @author IGAC - DIP
  @remarks Procesamiento Widget Principal
*/
const WidgetSearchSIEC = (props: AllWidgetProps<IMConfig>) => {

  const [utilsModule, setUtilsModule] = useState(null)
  const [jimuMapView, setJimuMapView] = useState<JimuMapView>()
  const [initialExtent, setInitialExtent] = useState(null)
  const [sketch, setSketch] = useState<Sketch>()
  const [widgetModules, setWidgetModules] = useState(null)
  const [servicios, setServicios] = useState(null)




  /**
   * Guarda la vista activa del mapa para operar con capas y navegación.
   *
   * @param {JimuMapView} jmv Vista activa de Experience Builder.
   * @returns {void}
   */
  const activeViewChangeHandler = (jmv: JimuMapView) => {
    let sketchWeb: Sketch | undefined
    let objJSON: any = ""
    if (utilsModule?.logger())
      { console.log("Ingresando al evento objeto JimuMapView...") }
    if (jmv) {
      setJimuMapView(jmv)

      const layerWeb = new GraphicsLayer()
      jmv.view.map.add(layerWeb)

      setInitialExtent(jmv.view.extent) // Guarda el extent inicial

      //Atributos del widget Sketch configurados con el objeto definido - 2025-06-13
      objJSON = {
        createTools: {
          point: false,
          polyline: false,
          polygon: false,
          circle: false,
          rectangle: true,
          multipoint: false,
        },
        selectionTools: {
          "custom-selection": false,
          "lasso-selection": false,
          "rectangle-selection": false,
        },
        settingsMenu: false,
        undoRedoMenu: false,
      }

      if (typeof sketchWeb === "undefined") {
        sketchWeb = new Sketch({
          layer: layerWeb,
          view: jmv.view,
          creationMode: "single",
          availableCreateTools: ["rectangle"],
          visibleElements: objJSON,
        })
      }
      setSketch(sketchWeb)
    }
  }

  useEffect(() => {
    // setResponseConsulta(dataPruebaResponse)
    import('../../../commonWidgets/widgetsModule').then(modulo => { setWidgetModules(modulo) })
    import('../../../utils/module').then(modulo => { setUtilsModule(modulo) })
    import('../../../api/servicios').then(modulo => { setServicios(modulo) })
    return () => {
      // Acción a realizar cuando el widget se cierra.
      if (utilsModule?.logger()) console.log('El widget se cerrará')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    // eslint-disable-next-line jimu-theme/no-classic-css-utilities
    <div className="w-100 p-3 bg-primary text-white">
      {props.useMapWidgetIds && props.useMapWidgetIds.length === 1 && (
        <JimuMapViewComponent
          useMapWidgetId={props.useMapWidgetIds?.[0]}
          onActiveViewChange={activeViewChangeHandler}
        />
      )}
      <h1>Rigo</h1>
    </div>
  )
}

export default WidgetSearchSIEC
