import { React } from 'jimu-core'

/**
 * Serie de datos compatible con estructuras tipo chart.js.
 */
export interface SimpleChartDataset {
  label?: string
  data: number[]
  backgroundColor?: string | string[]
}

/**
 * Estructura minima para renderizar barras con etiquetas.
 */
export interface SimpleChartLikeData {
  labels: Array<string | number | null | undefined>
  datasets: SimpleChartDataset[]
}

/**
 * Propiedades del componente SimpleBarChart compartido.
 */
export interface SimpleBarChartProps {
  data: SimpleChartLikeData
  title?: string
  emptyMessage?: string
  maxLabelLength?: number
}

const SVG_WIDTH = 1200
const SVG_HEIGHT = 620
const MARGIN = {
  top: 82,
  right: 24,
  bottom: 170,
  left: 76
}

/**
 * Convierte un valor desconocido en numero seguro para graficar.
 *
 * @param value Valor origen.
 * @returns Numero finito o 0 cuando no es valido.
 */
const toFiniteNumber = (value: unknown): number => {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Recorta una etiqueta a una longitud maxima conservando legibilidad.
 *
 * @param label Etiqueta original.
 * @param maxLength Longitud maxima permitida.
 * @returns Etiqueta truncada o completa.
 */
const trimLabel = (label: string, maxLength: number): string => {
  if (label.length <= maxLength) return label
  return `${label.slice(0, maxLength)}...`
}

/**
 * Grafica de barras ligera en SVG para escenarios donde no se desea
 * depender de librerias de charting externas.
 *
 * @component
 * @param {SimpleBarChartProps} props Propiedades de renderizado.
 * @returns {JSX.Element} Grafica de barras con ejes y etiquetas.
 */
const SimpleBarChart = (props: SimpleBarChartProps) => {
  const {
    data,
    title,
    emptyMessage = 'No hay datos para graficar.',
    maxLabelLength = 28
  } = props

  const labels = Array.isArray(data?.labels)
    ? data.labels.map((label) => String(label ?? 'Sin dato'))
    : []

  const dataset = data?.datasets?.[0]
  const values = Array.isArray(dataset?.data)
    ? dataset.data.map(toFiniteNumber)
    : []

  if (!labels.length || !values.length) {
    return <div style={{ color: '#2d3a4a', width: '100%' }}>{emptyMessage}</div>
  }

  const innerWidth = SVG_WIDTH - MARGIN.left - MARGIN.right
  const innerHeight = SVG_HEIGHT - MARGIN.top - MARGIN.bottom
  const maxValue = Math.max(...values, 1)
  const stepWidth = innerWidth / Math.max(values.length, 1)
  const barWidth = Math.max(26, Math.min(74, stepWidth * 0.7))
  const color = Array.isArray(dataset?.backgroundColor)
    ? (dataset?.backgroundColor?.[0] ?? '#2f7db6')
    : (dataset?.backgroundColor ?? '#2f7db6')
  const tickCount = 5
  const ticks = Array.from({ length: tickCount + 1 }, (_, index) => {
    return Math.round((maxValue / tickCount) * index)
  })

  return (
    <div style={{ width: '100%', minHeight: 470 }}>
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        style={{ width: '100%', height: '100%', display: 'block' }}
        role='img'
        aria-label='Grafica de barras'
      >
        <defs>
          <linearGradient id='simpleBarChartBackground' x1='0%' y1='0%' x2='0%' y2='100%'>
            <stop offset='0%' stopColor='#f6fbff' />
            <stop offset='100%' stopColor='#edf5fc' />
          </linearGradient>
        </defs>

        <rect x='0' y='0' width={SVG_WIDTH} height={SVG_HEIGHT} fill='url(#simpleBarChartBackground)' rx='12' ry='12' />

        {title && (
          <text x={MARGIN.left} y='38' fill='#0c4660' fontSize='28' fontWeight='700'>
            {title}
          </text>
        )}

        {ticks.map((tick, tickIndex) => {
          const ratio = tick / maxValue
          const y = MARGIN.top + innerHeight - (ratio * innerHeight)
          return (
            <g key={`tick-${tickIndex}`}>
              <line x1={MARGIN.left} y1={y} x2={SVG_WIDTH - MARGIN.right} y2={y} stroke='#d5e5f1' strokeWidth='1' />
              <text x={MARGIN.left - 10} y={y + 5} textAnchor='end' fill='#33526a' fontSize='16'>
                {tick.toLocaleString('es-CO')}
              </text>
            </g>
          )
        })}

        <line
          x1={MARGIN.left}
          y1={MARGIN.top + innerHeight}
          x2={MARGIN.left + innerWidth}
          y2={MARGIN.top + innerHeight}
          stroke='#55748c'
          strokeWidth='2'
        />
        <line
          x1={MARGIN.left}
          y1={MARGIN.top}
          x2={MARGIN.left}
          y2={MARGIN.top + innerHeight}
          stroke='#55748c'
          strokeWidth='2'
        />

        {values.map((value, index) => {
          const ratio = value / maxValue
          const barHeight = ratio * innerHeight
          const x = MARGIN.left + (index * stepWidth) + ((stepWidth - barWidth) / 2)
          const y = MARGIN.top + innerHeight - barHeight
          const labelText = trimLabel(labels[index], maxLabelLength)

          return (
            <g key={`${labels[index]}-${index}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 1)}
                fill={String(color)}
                rx='6'
                ry='6'
                opacity='0.9'
              >
                <title>{`${labels[index]}: ${value.toLocaleString('es-CO')}`}</title>
              </rect>
              <text x={x + (barWidth / 2)} y={y - 10} textAnchor='middle' fill='#233140' fontSize='16' fontWeight='600'>
                {value.toLocaleString('es-CO')}
              </text>
              <text x={x + (barWidth / 2)} y={MARGIN.top + innerHeight + 24} textAnchor='middle' fill='#233140' fontSize='14'>
                {labelText}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default SimpleBarChart