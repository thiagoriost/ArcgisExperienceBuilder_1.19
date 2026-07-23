import { React } from 'jimu-core'
import { Pagination } from 'jimu-ui'
import { validaLoggerLocalStorage } from '../../../shared/utils/export.utils'

/**
 * Definicion generica de una serie de barras agrupadas por campo.
 */
export interface BarChartDefinition {
  label: string
  description: string
  color: string
  tituloGrafico: string
}

/**
 * Punto individual de una serie de barras.
 */
export interface NativeBarChartPoint {
  label: string
  value: number
}

/**
 * Serie calculada para renderizado.
 */
export interface NativeBarChartSeries {
  definition: BarChartDefinition
  points: NativeBarChartPoint[]
  total: number
  max: number
}

/**
 * Propiedades del componente de grafico de barras nativo.
 */
export interface NativeBarChartProps {
  records: Array<Record<string, any>>
  definitions: BarChartDefinition[]
  title?: string
  height?: number
  emptyMessage?: string
  onBarClick?: (payload: {
    definition: BarChartDefinition
    point: NativeBarChartPoint
    chartIndex: number
  }) => void
}

const { useEffect, useMemo, useState } = React

const SVG_WIDTH = 1000
const SVG_HEIGHT = 420
const DEFAULT_HEIGHT = 420
const MARGIN = {
  top: 24,
  right: 24,
  bottom: 100,
  left: 64
}

/**
 * Convierte un conjunto de registros y definiciones en series aptas para el grafico.
 *
 * @param records Registros origen.
 * @param definitions Definiciones de agrupacion.
 * @returns Serie calculada para cada definicion.
 */
export const buildNativeBarChartSeries = (
  records: Array<Record<string, any>>,
  definitions: BarChartDefinition[]
): NativeBarChartSeries[] => {
  return definitions.map((definition) => {
    const groupedValues = records.reduce<Record<string, number>>((accumulator, record) => {
      const key = String(record?.[definition.label] ?? 'Sin Datos')
      accumulator[key] = (accumulator[key] ?? 0) + 1
      return accumulator
    }, {})

    const points = Object.entries(groupedValues)
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value)

    const total = points.reduce((sum, point) => sum + point.value, 0)
    const max = points.reduce((sum, point) => Math.max(sum, point.value), 0)

    return {
      definition,
      points,
      total,
      max
    }
  })
}

/**
 * Componente reutilizable para renderizar graficas de barras sin dependencias
 * externas de charting. Usa SVG nativo y la paginacion de jimu-ui para navegar
 * entre varias definiciones de grafico.
 *
 * @component
 * @param {NativeBarChartProps} props Propiedades de renderizado.
 * @returns {JSX.Element} Grafico de barras nativo.
 */
const NativeBarChart = function (props: NativeBarChartProps) {
    if(validaLoggerLocalStorage('logger')) console.log('Widget NativeBarChart ID:', {props})
  const {
    records,
    definitions,
    title,
    height = DEFAULT_HEIGHT,
    emptyMessage = 'No hay datos para graficar.',
    onBarClick
  } = props

  
  const [currentPage, setCurrentPage] = useState(1)

  /**
   * Reinicia la pagina activa cuando cambia la fuente de datos.
   */
  useEffect(() => {
    setCurrentPage(1)
  }, [records, definitions])

  const seriesList = useMemo(() => {
    return buildNativeBarChartSeries(records, definitions)
  }, [records, definitions])

  const totalPages = seriesList.length
  const currentIndex = Math.min(Math.max(currentPage - 1, 0), Math.max(totalPages - 1, 0))
  const currentSeries = seriesList[currentIndex]

  /**
   * Fragmenta una etiqueta larga en dos lineas para mejorar la lectura.
   *
   * @param value Texto base.
   * @param maxChars Cantidad maxima por linea.
   * @returns Lineas listas para renderizar.
   */
  const wrapLabel = function (value: string, maxChars = 12) {
    if (!value) return ['']
    const words = value.split(/\s+/)
    const lines: string[] = []
    let buffer = ''

    words.forEach((word) => {
      const candidate = buffer ? `${buffer} ${word}` : word
      if (candidate.length > maxChars && buffer) {
        lines.push(buffer)
        buffer = word
      } else {
        buffer = candidate
      }
    })

    if (buffer) lines.push(buffer)
    return lines.slice(0, 2)
  }

  /**
   * Formatea el numero para mostrarlo en el eje y sobre cada barra.
   *
   * @param value Valor numerico.
   * @returns Texto formateado.
   */
  const formatValue = function (value: number) {
    return Number(value).toLocaleString('es-CO')
  }

  if (!seriesList.length) {
    return (
      <div className='native-bar-chart-empty'>
        {emptyMessage}
      </div>
    )
  }

  const innerWidth = SVG_WIDTH - MARGIN.left - MARGIN.right
  const innerHeight = SVG_HEIGHT - MARGIN.top - MARGIN.bottom
  const maxValue = Math.max(currentSeries?.max ?? 0, 1)
  const tickCount = 5
  const tickStep = maxValue / tickCount
  const ticks = Array.from({ length: tickCount + 1 }, (_, index) => Number((index * tickStep).toFixed(2)))
  const bars = currentSeries?.points ?? []
  const stepWidth = bars.length > 0 ? innerWidth / bars.length : innerWidth
  const barWidth = Math.max(24, stepWidth * 0.62)

  if(validaLoggerLocalStorage('logger')) console.log('Widget NativeBarChart seriesList:',
    {
        seriesList,
        currentSeries,
        bars,
        ticks,
        maxValue,
        stepWidth,
        barWidth,
        height,
        title,
        totalPages,
        currentPage,
        SVG_WIDTH,
        SVG_HEIGHT,
        innerWidth,
        innerHeight,
        MARGIN,
        tickCount,
        tickStep,
    })
  return (
    <div
      className='native-bar-chart'
      style={{
        width: '100%',
        border: '1px solid #0c4660',
        borderRadius: 10,
        backgroundColor: '#fff',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minHeight: height
      }}
    >
      {title && (
        <div style={{ color: '#126a92', fontWeight: 700, fontSize: 16 }}>
          {title}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          current={currentPage}
          size='default'
          totalPage={totalPages}
          onChangePage={(page: number) => setCurrentPage(page)}
        />
      )}

      <div style={{ flex: 1, minHeight: 0 }}>
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          role='img'
          aria-label={currentSeries.definition.tituloGrafico}
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <defs>
            <linearGradient id='nativeBarChartBackground' x1='0%' y1='0%' x2='0%' y2='100%'>
              <stop offset='0%' stopColor='#f8fcff' />
              <stop offset='100%' stopColor='#eef6fb' />
            </linearGradient>
          </defs>

          <rect x='0' y='0' width={SVG_WIDTH} height={SVG_HEIGHT} fill='url(#nativeBarChartBackground)' rx='12' ry='12' />

          <text x={MARGIN.left} y={18} fill='#0c4660' fontSize='20' fontWeight='700'>
            {currentSeries.definition.tituloGrafico}
          </text>

          {ticks.map((tick) => {
            const ratio = tick / maxValue
            const y = MARGIN.top + innerHeight - (ratio * innerHeight)
            return (
              <g key={tick}>
                <line
                  x1={MARGIN.left}
                  y1={y}
                  x2={SVG_WIDTH - MARGIN.right}
                  y2={y}
                  stroke='#dbe8ef'
                  strokeWidth='1'
                />
                <text x={MARGIN.left - 10} y={y + 4} textAnchor='end' fontSize='11' fill='#126a92'>
                  {formatValue(tick)}
                </text>
              </g>
            )
          })}

          <line
            x1={MARGIN.left}
            y1={MARGIN.top + innerHeight}
            x2={SVG_WIDTH - MARGIN.right}
            y2={MARGIN.top + innerHeight}
            stroke='#0c4660'
            strokeWidth='1.5'
          />
          <line
            x1={MARGIN.left}
            y1={MARGIN.top}
            x2={MARGIN.left}
            y2={MARGIN.top + innerHeight}
            stroke='#0c4660'
            strokeWidth='1.5'
          />

          {bars.map((point, index) => {
            const barHeight = (point.value / maxValue) * innerHeight
            const x = MARGIN.left + index * stepWidth + (stepWidth - barWidth) / 2
            const y = MARGIN.top + innerHeight - barHeight
            const labelLines = wrapLabel(point.label)
            const barCenterX = x + barWidth / 2
            const barBottomY = MARGIN.top + innerHeight

            return (
              <g key={`${point.label}-${index}`}> 
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 0)}
                  rx='6'
                  ry='6'
                  fill={currentSeries.definition.color}
                  opacity='0.9'
                  style={{ cursor: onBarClick ? 'pointer' : 'default' }}
                  onClick={() => onBarClick?.({
                    definition: currentSeries.definition,
                    point,
                    chartIndex: currentIndex
                  })}
                >
                  <title>{`${point.label}: ${formatValue(point.value)}`}</title>
                </rect>
                <text x={barCenterX} y={y - 8} textAnchor='middle' fontSize='11' fill='#0c4660'>
                  {formatValue(point.value)}
                </text>
                <text x={barCenterX} y={barBottomY + 18} textAnchor='middle' fontSize='11' fill='#0c4660'>
                  {labelLines.map((line, lineIndex) => (
                    <tspan key={lineIndex} x={barCenterX} dy={lineIndex === 0 ? 0 : 14}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', color: '#126a92' }}>
        <div>
          Registros agrupados: <strong>{currentSeries.total}</strong>
        </div>
        <div>
          Categorias: <strong>{bars.length}</strong>
        </div>
        <div>
          Campo: <strong>{currentSeries.definition.label}</strong>
        </div>
      </div>
    </div>
  )
}

export default NativeBarChart
