import { React, type AllWidgetProps } from 'jimu-core'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis' // The map object can be accessed using the JimuMapViewComponent
import { Pagination } from 'jimu-ui'
import { Bar} from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { typeMSM } from '../../../commonWidgets/modal/interfaces'
import type { LabelItem } from '../../../searchSIEC2026/src/runtime/widget'
import type { MouseEvent } from 'react'
import type { Chart as ChartJSInstance } from 'chart.js'

const { useEffect, useState, useRef } = React


// Registrar los componentes necesarios
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)


const barChart = (props: AllWidgetProps<any>) => {

  const [jimuMapView, setJimuMapView] = useState<JimuMapView>()
  const [initialExtent, setInitialExtent] = useState(null)
  const [dataGrafico, setDataGrafico] = useState<ChartsData[]>([])
  const [currentpage, setCurrentpage] = useState(1)
  const [widgetModules, setWidgetModules] = useState(null)
  const [utilsModule, setUtilsModule] = useState(null)
  const [mensajeModal, setMensajeModal] = useState({
      deployed: false,
      type: typeMSM.info,
      tittle: '',
      body: '',
      subBody: ''
    })

 const chartRef = useRef<ChartJSInstance<'bar'> | null>(null)


  const activeViewChangeHandler = (jmv: JimuMapView) => {
    if (utilsModule?.logger()) console.log('Ingresando al evento objeto JimuMapView...')
    if (jmv) {
      setJimuMapView(jmv)
      setInitialExtent(jmv.view.extent) // Guarda el extent inicial
    }
  }

  const handleChartClick = (event: MouseEvent<HTMLCanvasElement>) => {
      if (chartRef.current) {
        const activeElement = chartRef.current.getElementsAtEventForMode(event.nativeEvent, 'nearest', { intersect: true }, false)
        if (activeElement.length > 0) {
          const datasetIndex = activeElement[0].datasetIndex
          const index = activeElement[0].index
          const label = chartRef.current.data.labels[index]
          const value = chartRef.current.data.datasets[datasetIndex].data[index]
          if (utilsModule?.logger()) console.log(`Clicked on label: ${label}, value: ${value}`)
          // Aquí puedes agregar la lógica que desees al hacer clic en el gráfico
        }
      }
  }

 const prepareBarChartData = (features: any[], labels: LabelItem[]) => {
  const groupByField = (field: string) => {
    return features.reduce((acc, feature) => {
      const key = feature[field] || "Sin Datos"
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
  }

  // Construir el dataset para el gráfico
  const buildDataset = (groupedData: { [s: string]: unknown } | ArrayLike<unknown>, label: string, color: string) => {
    return {
      labels: Object.keys(groupedData),
      datasets: [
        {
          label,
          data: Object.values(groupedData),
          backgroundColor: color,
          borderColor: color,
          borderWidth: 1,
        },
      ],
    }
  }

  // Crear las opciones del gráfico
  const createChartOptions = (title: string) => ({
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 18,
        }
      },
    },
    scales: {
      x: {
        type: "category", // Asegúrate de especificar el tipo de escala
        title: {
          display: true,
          text: "Categorías",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Cantidad",
        },
      },
    },
  })

  // Agrupar por los campos requeridos
  const AgrupacionCamposRequeridos = []
  labels.forEach(({label}) =>{
    const groupedBy = groupByField(label)
    AgrupacionCamposRequeridos.push(groupedBy)
  })

  const chartData: ChartsData[] = []
  AgrupacionCamposRequeridos.forEach((groupedData, index) => {
    const description = labels[index].description
    const color = labels[index].color
    const dataset = buildDataset(groupedData, description, color)
    const options = createChartOptions(labels[index].tituloGrafico)
    chartData.push({dataset, options})
  })

  setDataGrafico(chartData)
}

  useEffect(() => {
    console.log({props})
      if (props.hasOwnProperty('stateProps')) {
          const dataFromDispatch = JSON.parse(props.stateProps.dataFromDispatchWidget_searchSIEC)
          console.log(props, dataFromDispatch)
          const {dataToRows, labels} = dataFromDispatch
          prepareBarChartData(dataToRows, labels)
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
                (dataGrafico.length > 0/*  && poligonoSeleccionado.departmentSelect */) && (
                  <div style={{ padding: '10px', width: '100%', height: '400px', border: 'solid', borderRadius: '10px',
                  backgroundColor: 'white', display: 'flex', justifyContent: 'center', flexDirection:'column' }}>
                    {
                      dataGrafico.length > 1 &&
                        <Pagination
                          current={currentpage}
                          size="default"
                          totalPage={dataGrafico.length}
                          onChangePage={(e: React.SetStateAction<number>) => { setCurrentpage(e) }}
                        />
                    }
                    {
                        dataGrafico.map((d, i) => (
                          currentpage === (i + 1) &&
                          <Bar options={d.options} data={d.dataset} ref={chartRef} onClick={handleChartClick} />
                        ))
                    }
                </div>
                )}
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

