import { React, type AllWidgetProps } from 'jimu-core'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis' // The map object can be accessed using the JimuMapViewComponent
import { typeMSM } from '../../../commonWidgets/modal/interfaces'
import NativeBarChart, { type BarChartDefinition } from '../../../shared/components/NativeBarChart'
import type { LabelItem } from '../../../searchSIEC2026/src/runtime/widget'
import { validaLoggerLocalStorage } from '../../../shared/utils/export.utils'

const { useEffect, useState } = React


const barChart = (props: AllWidgetProps<any>) => {
  if(validaLoggerLocalStorage('logger')) console.log('Widget barChart ID:', {id:props.id, props})

  const [jimuMapView, setJimuMapView] = useState<JimuMapView>()
  const [initialExtent, setInitialExtent] = useState(null)
  const [chartDefinitions, setChartDefinitions] = useState<BarChartDefinition[]>([])
  const [chartRecords, setChartRecords] = useState<any[]>([])
  const [widgetModules, setWidgetModules] = useState(null)
  const [utilsModule, setUtilsModule] = useState(null)
  const [mensajeModal, setMensajeModal] = useState({
      deployed: false,
      type: typeMSM.info,
      tittle: '',
      body: '',
      subBody: ''
    })

  const activeViewChangeHandler = (jmv: JimuMapView) => {
    if (utilsModule?.logger()) console.log('Ingresando al evento objeto JimuMapView...')
    if (jmv) {
      setJimuMapView(jmv)
      setInitialExtent(jmv.view.extent) // Guarda el extent inicial
    }
  }

  /**
   * Convierte las definiciones externas del widget de busqueda en el formato
   * generico requerido por el componente reutilizable del grafico.
   *
   * @param labels Definiciones originales enviadas desde el widget de busqueda.
   */
  const mapLabelDefsToChartDefs = function (labels: LabelItem[]): BarChartDefinition[] {
    return labels.map((labelItem) => ({
      label: labelItem.label,
      description: labelItem.description,
      color: labelItem.color,
      tituloGrafico: labelItem.tituloGrafico
    }))
  }


useEffect(() => {
  if (utilsModule?.logger()) console.log({props})
  if (props.hasOwnProperty('stateProps') && props.stateProps.dataFromDispatchWidget_searchSIEC) {
      const dataFromDispatch = JSON.parse(props.stateProps.dataFromDispatchWidget_searchSIEC)
      console.log(props, dataFromDispatch)
      const {dataToRows, labels} = dataFromDispatch
      setChartRecords(dataToRows ?? [])
      setChartDefinitions(mapLabelDefsToChartDefs(labels ?? []))
      // Verificar si dataFromDispatch tiene datos para renderizar el BarChart
      // Envia features y parametros para ajustar la data a renderizar
  }

  }, [props])

  useEffect(() => {
      // setResponseConsulta(dataPruebaResponse)
      import('../../../utils/module').then(modulo => { setUtilsModule(modulo) })
       import('../../../commonWidgets/widgetsModule').then(modulo => { setWidgetModules(modulo) })
      return () => {}

    }, [])

  return (
    // eslint-disable-next-line jimu-theme/no-classic-css-utilities
    <div className='w-100 p-3 bg-primary'>

        <JimuMapViewComponent useMapWidgetId={props.useMapWidgetIds?.[0]} onActiveViewChange={activeViewChangeHandler} />

      <>
              {
                chartDefinitions.length > 0 && (
                  <NativeBarChart
                    records={chartRecords}
                    definitions={chartDefinitions}
                    title='render gráfico'
                    onBarClick={({ definition, point }) => {
                      if (utilsModule?.logger()) {
                        console.log('Barra seleccionada:', { definition, point })
                      }
                    }}
                  />
                )
              }
              {
                widgetModules?.MODAL(mensajeModal, setMensajeModal)
              }
            </>
    </div>
  )
}

// barChart.propTypes = {}

export default barChart


interface FontStyle {
  size?: number;
  family?: string;
  weight?: string;
  [key: string]: any;
}

interface TitleOptions {
  display: boolean;
  text?: string;
  font?: FontStyle;
  [key: string]: any;
}

interface LegendOptions {
  display: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  [key: string]: any;
}

interface ScaleTitle {
  display: boolean;
  text?: string;
  [key: string]: any;
}

interface ScaleOptions {
  type?: string;
  beginAtZero?: boolean;
  title?: ScaleTitle;
  [key: string]: any;
}

interface PluginOptions {
  legend?: LegendOptions;
  title?: TitleOptions;
  [key: string]: any;
}

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string | string[];
  borderColor: string | string[];
  borderWidth: number;
  [key: string]: any;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ChartOptions {
  responsive?: boolean;
  plugins?: PluginOptions;
  scales?: {
    x?: ScaleOptions;
    y?: ScaleOptions;
    [key: string]: any;
  };
  [key: string]: any;
}

interface ChartConfig {
  dataset: ChartData;
  options: ChartOptions;
}

// Tipo para el array completo
type ChartsData = ChartConfig;

