/**
 * @fileoverview Servicio para generación de documentos PDF con mapas.
 * Genera un PDF con las siguientes páginas:
 * - Página 1: Mapa con título, escala, sistema de referencia, fecha, autor y flecha de norte
 * - Página 2+ (opcional): Leyenda automática agrupada por capas visibles (solo si existen leyendas)
 * @module printCliente/pdfService
 */

import JsPDF from "jspdf"
import SpatialReference from "@arcgis/core/geometry/SpatialReference"
import * as projection from "@arcgis/core/geometry/projection"
import { buildLegendItems } from "./legendService"
import { validaLoggerLocalStorage } from "../../../shared/utils/export.utils"

/**
 * Opciones de configuración para la generación del PDF.
 * @interface PdfOptions
 * @property {string} title - Título que se mostrará en el encabezado del PDF.
 * @property {number} scale - Escala del mapa (ej: 50000 para 1:50000).
 * @property {string} imageUrl - URL de datos (data URL) de la imagen del mapa en formato PNG.
 * @property {number} imageWidth - Ancho original de la imagen capturada en píxeles.
 * @property {number} imageHeight - Alto original de la imagen capturada en píxeles.
 * @property {string} spatialReference - Sistema de referencia espacial del mapa.
 * @property {string} [author] - Autor del mapa (opcional).
 * @property {boolean} [showGrid] - Si es true, dibuja una grilla sobre la imagen del mapa.
 * @property {number} [gridCellSizeMm] - Tamaño de celda de grilla en mm (por defecto: 12).
 * @property {string} [gridColor] - Color hexadecimal de la grilla (por defecto: #787878).
 * @property {__esri.MapView | __esri.SceneView} view - Vista del mapa para extraer la leyenda.
 */
interface PdfOptions {
  title: string;
  scale: number;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  spatialReference: string;
  author?: string;
  showGrid?: boolean;
  gridCellSizeMm?: number;
  gridColor?: string;
  view: __esri.MapView | __esri.SceneView;
}

/**
 * Convierte un color hexadecimal (#RRGGBB) a componentes RGB.
 * Si el valor no es válido, retorna un gris por defecto.
 */
const hexToRgb = (hexColor?: string): [number, number, number] => {
  if (!hexColor) return [120, 120, 120]

  const sanitized = hexColor.replace("#", "")
  if (sanitized.length !== 6) return [120, 120, 120]

  const r = Number.parseInt(sanitized.slice(0, 2), 16)
  const g = Number.parseInt(sanitized.slice(2, 4), 16)
  const b = Number.parseInt(sanitized.slice(4, 6), 16)

  if ([r, g, b].some((value) => Number.isNaN(value))) {
    return [120, 120, 120]
  }

  return [r, g, b]
}

/**
 * Dibuja una grilla regular sobre el área del mapa dentro del PDF.
 * Se usa como sobreimpresión opcional para apoyar lectura cartográfica.
 */
interface GridDrawingOptions {
  mapLeft: number;
  mapTop: number;
  mapWidth: number;
  mapHeight: number;
  cellSizeMm: number;
  gridColor: string;
  extent: __esri.Extent;
  majorLineFactor?: number;
  lineWidth?: number;
}

const drawGridOnMap = (doc: JsPDF, gridOptions: GridDrawingOptions): void => {
  const {
    mapLeft,
    mapTop,
    mapWidth,
    mapHeight,
    cellSizeMm,
    gridColor,
    extent,
    majorLineFactor = 1,
    lineWidth = 0.15
  } = gridOptions

  // Convierte coordenadas del mapa (extent) al espacio del PDF para que la grilla
  // quede anclada a coordenadas proyectadas y no solo a separación visual.
  const mapCoordToPdf = (x: number, y: number): { xPdf: number, yPdf: number } => {
    const xRatio = (x - extent.xmin) / extent.width
    const yRatio = (y - extent.ymin) / extent.height

    const xPdf = mapLeft + (xRatio * mapWidth)
    const yPdf = mapTop + mapHeight - (yRatio * mapHeight)

    return { xPdf, yPdf }
  }

  // Relación entre mm en el marco del mapa y unidades del sistema de referencia.
  // Esto permite conservar la preferencia visual (p.e. 12 mm), pero alineando líneas
  // en coordenadas reales del mapa.
  const unitsPerMmX = extent.width / mapWidth
  const unitsPerMmY = extent.height / mapHeight
  const intervalUnits = Math.max(1e-9, ((unitsPerMmX + unitsPerMmY) / 2) * cellSizeMm * majorLineFactor)

  const firstVertical = Math.ceil(extent.xmin / intervalUnits) * intervalUnits
  const firstHorizontal = Math.ceil(extent.ymin / intervalUnits) * intervalUnits
  const [r, g, b] = hexToRgb(gridColor)

  doc.setDrawColor(r, g, b)
  doc.setLineWidth(lineWidth)
  // Las etiquetas de coordenadas fuera del mapa deben verse en negro.
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(6)

  // Formatea la etiqueta según el tamaño del intervalo para no perder legibilidad.
  const decimals = intervalUnits >= 100 ? 0 : intervalUnits >= 1 ? 2 : 4
  const formatCoordinateLabel = (value: number): string => value.toFixed(decimals)

  // Separación requerida respecto al borde del mapa: 5 mm hacia el exterior.
  const outerOffsetMm = 5
  const pageFrameInset = 10.5

  for (let xCoord = firstVertical; xCoord < extent.xmax; xCoord += intervalUnits) {
    const { xPdf } = mapCoordToPdf(xCoord, extent.ymin)
    doc.line(xPdf, mapTop, xPdf, mapTop + mapHeight)

    // Etiquetas al inicio (arriba) y al final (abajo) fuera del mapa.
    const xLabel = formatCoordinateLabel(xCoord)
    const xLabelWidth = doc.getTextWidth(xLabel)
    const xText = Math.max(pageFrameInset, Math.min(xPdf - (xLabelWidth / 2), (doc.internal.pageSize.getWidth() - pageFrameInset - xLabelWidth)))
    // Rotación de 45° para evitar sobreposición de etiquetas en líneas verticales.
    doc.text(xLabel, xText, mapTop - outerOffsetMm, { angle: 45 })
    doc.text(xLabel, xText, mapTop + mapHeight + outerOffsetMm, { angle: 45 })
  }

  for (let yCoord = firstHorizontal; yCoord < extent.ymax; yCoord += intervalUnits) {
    const { yPdf } = mapCoordToPdf(extent.xmin, yCoord)
    doc.line(mapLeft, yPdf, mapLeft + mapWidth, yPdf)

    // Etiquetas al inicio (izquierda) y al final (derecha) fuera del mapa.
    const yLabel = formatCoordinateLabel(yCoord)
    const yLabelWidth = doc.getTextWidth(yLabel)
    const yText = Math.max(pageFrameInset + 2.5, Math.min(yPdf + 2, doc.internal.pageSize.getHeight() - pageFrameInset))
    doc.text(yLabel, Math.max(pageFrameInset, mapLeft - outerOffsetMm - yLabelWidth), yText)
    doc.text(yLabel, Math.min(doc.internal.pageSize.getWidth() - pageFrameInset - yLabelWidth, mapLeft + mapWidth + outerOffsetMm), yText)
  }

  // Restablecer estilos para no afectar otros elementos del PDF.
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(1)
  doc.setTextColor(0, 0, 0)
}

/**
 * Reproyecta la extensión al SR 9377 para construir una cuadrícula medida homogénea.
 * Si no es posible proyectar, retorna la extensión original para no bloquear la salida.
 */
const getMeasuredGridExtent9377 = async (extent: __esri.Extent): Promise<__esri.Extent> => {
  const currentWkid = extent.spatialReference?.wkid
  if (currentWkid === 9377) return extent

  try {
    await projection.load()
    const projectedExtent = projection.project(
      extent,
      new SpatialReference({ wkid: 9377 })
    ) as __esri.Extent | null

    if (projectedExtent) {
      return projectedExtent
    }
  } catch (error) {
    if (validaLoggerLocalStorage('logger')) {
      console.warn("[generatePdf] No fue posible reproyectar la extensión a WKID 9377.", error)
    }
  }

  return extent
}


/**
 * Genera y descarga un documento PDF con el mapa y su leyenda.
 *
 * El PDF generado contiene 2 páginas:
 * - **Página 1**: Mapa con marco, título, imagen del mapa (manteniendo aspect ratio),
 *   y cajetín inferior con escala, sistema de referencia, fecha, autor y flecha de norte.
 * - **Página 2**: Leyenda automática extraída de las capas visibles del mapa,
 *   con soporte para múltiples páginas si la leyenda es extensa.
 *
 * @async
 * @param {PdfOptions} options - Opciones de configuración del PDF.
 * @returns {Promise<void>} Promesa que se resuelve cuando el PDF ha sido generado y descargado.
 * @example
 * await generatePdf({
 *   title: "Mapa de ubicación",
 *   scale: 50000,
 *   imageUrl: "data:image/png;base64,...",
 *   imageWidth: 1920,
 *   imageHeight: 1080,
 *   spatialReference: "WKID 4326",
 *   author: "IGAC",
 *   showGrid: true,
 *   gridCellSizeMm: 12,
 *   gridColor: "#787878",
 *   view: mapView
 * });
 */
export const generatePdf = async (options: PdfOptions): Promise<void> => {

  if(validaLoggerLocalStorage('logger')) console.log({options})
  const doc = new JsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  /* ==========================================
     PÁGINA 1 → MAPA COMPLETO
  ========================================== */
   /* ===============================
     MARCO EXTERNO
  =============================== */
  doc.setLineWidth(1)
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

  /* ===============================
     TÍTULO SUPERIOR
  =============================== */
    const titleY = 20 // Posicionar el título a 20 mm del borde superior para asegurar separación de etiquetas de coordenadas.
  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text(options.title.toUpperCase(), pageWidth / 2, titleY, { align: "center" })

  // Calcular dimensiones del mapa manteniendo la relación de aspecto
  const mapLeft = 15
    // Se aumenta el margen inferior del título para evitar cruces con etiquetas
    // de coordenadas ubicadas en la parte superior del mapa.
    const mapTop = 40
  const maxMapWidth = pageWidth - 30

  // Configuración del cajetín para evitar desbordes y mantener un margen superior mayor.
  const footerGapFromMap = 10
  const footerTextStartOffset = 10
  const footerLineGap = 8
  const footerBottomPadding = 8
  const footerLineCount = options.showGrid
    ? (options.author ? 5 : 4)
    : (options.author ? 4 : 3)
  const desiredFooterHeight = footerTextStartOffset + ((footerLineCount - 1) * footerLineGap) + footerBottomPadding
  const maxMapHeight = pageHeight - mapTop - footerGapFromMap - desiredFooterHeight - 15

  // Relación de aspecto de la imagen original
  const imageAspectRatio = options.imageWidth / options.imageHeight

  // Calcular dimensiones finales respetando el aspect ratio
  let mapWidth: number
  let mapHeight: number

  if (maxMapWidth / maxMapHeight > imageAspectRatio) {
    // El espacio disponible es más ancho que la imagen - ajustar por altura
    mapHeight = maxMapHeight
    mapWidth = mapHeight * imageAspectRatio
  } else {
    // El espacio disponible es más alto que la imagen - ajustar por ancho
    mapWidth = maxMapWidth
    mapHeight = mapWidth / imageAspectRatio
  }

  // Centrar horizontalmente
  const mapLeftCentered = mapLeft + (maxMapWidth - mapWidth) / 2

  doc.addImage(options.imageUrl, "PNG", mapLeftCentered, mapTop, mapWidth, mapHeight)

  // Marco del mapa para delimitar visualmente la captura dentro del layout.
  doc.rect(mapLeftCentered, mapTop, mapWidth, mapHeight)

  let measuredGridExtent: __esri.Extent | undefined


  // Dibujar grilla solo cuando el usuario la activa desde el widget.
  if (options.showGrid) {
    const cellSizeMm = options.gridCellSizeMm && options.gridCellSizeMm > 0
      ? options.gridCellSizeMm
      : 12
    const gridColor = options.gridColor || "#787878"
    const sourceExtent = options.view.extent
    measuredGridExtent = await getMeasuredGridExtent9377(sourceExtent)
    const sourceWkid = sourceExtent.spatialReference?.wkid
    const measuredWkid = measuredGridExtent.spatialReference?.wkid

    // 1) Retícula base en negro (coarser): referencia visual similar a graticule.
    drawGridOnMap(doc, {
      mapLeft: mapLeftCentered,
      mapTop,
      mapWidth,
      mapHeight,
      cellSizeMm,
      gridColor: "#000000",
      extent: sourceExtent,
      majorLineFactor: 5,
      lineWidth: 0.25
    })

    // 2) Cuadrícula medida en azul forzado, construida en SR 9377.
    // Si la reproyección falla, se usa la extensión original como contingencia.
    if (sourceWkid !== 9377 && validaLoggerLocalStorage('logger')) {
      console.info(`[generatePdf] Extensión de entrada WKID ${sourceWkid ?? 'desconocido'} proyectada a WKID ${measuredWkid ?? 'desconocido'} para cuadrícula medida azul.`)
    }

    drawGridOnMap(doc, {
      mapLeft: mapLeftCentered,
      mapTop,
      mapWidth,
      mapHeight,
      cellSizeMm,
      gridColor,
      extent: measuredGridExtent,
      lineWidth: 0.35
    })
  }

   /* ==========================================
     CAJETÍN INFERIOR
  ========================================== */

  // Posicionar el cajetín debajo del mapa con un margen
  const footerTop = mapTop + mapHeight + footerGapFromMap
  const availableFooterHeight = pageHeight - footerTop - 15
  const footerHeight = Math.min(desiredFooterHeight, availableFooterHeight)

  doc.rect(15, footerTop, pageWidth - 30, footerHeight)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")

  const footerLines: string[] = [
    `Escala: 1:${Math.round(options.scale)}`,
    `Sistema Referencia mapa base.: ${options.spatialReference}`
  ]

  if (options.showGrid) {
    footerLines.push(`Proyección SR cuadrícula: ${measuredGridExtent?.spatialReference?.wkid ?? 'desconocido'}`)
  }

  footerLines.push(`Fecha: ${new Date().toLocaleDateString()}`)

  if (options.author) {
    footerLines.push(`Autor: ${options.author}`)
  }

  for (let i = 0; i < footerLines.length; i++) {
    doc.text(footerLines[i], 20, footerTop + footerTextStartOffset + (i * footerLineGap))
  }

  // Norte
  /* const northX = pageWidth - 40
  const northY = footerTop + 25

  doc.setFontSize(14)
  doc.text("N", northX + 2, northY - 12)
  doc.line(northX, northY, northX, northY - 20)
  doc.triangle(
    northX - 4,
    northY - 15,
    northX + 4,
    northY - 15,
    northX,
    northY - 25,
    "F"
  ) */

  /* ==========================================
     PÁGINA 2 → LEYENDA COMPLETA (solo si hay leyendas)
  ========================================== */

  const legendGroups = await buildLegendItems(options.view)

  // Solo crear página de leyenda si existen elementos
  if (legendGroups.length === 0) {
    doc.save("Mapa_IGAC_A3.pdf")
    return
  }

  doc.addPage()

  doc.setLineWidth(1)
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text("LEYENDA", pageWidth / 2, 20, { align: "center" })

  let y = 35

  // Ancho máximo para el texto de items (con indentación)
  const maxTextWidth = pageWidth - 50 - 15 // 50 es donde inicia el texto indentado, 15 es el margen derecho
  // Ancho máximo para el título de la capa (sin indentación)
  const maxTitleWidth = pageWidth - 20 - 15 // 20 es donde inicia el título, 15 es el margen derecho
  const lineHeight = 5

  for (let groupIndex = 0; groupIndex < legendGroups.length; groupIndex++) {
    const group = legendGroups[groupIndex]

    // Dividir el título en líneas si es muy largo
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    const titleLines = doc.splitTextToSize(group.layerTitle, maxTitleWidth)
    const titleBlockHeight = titleLines.length * lineHeight + 3

    // Verificar si hay espacio para el título del grupo
    if (y + titleBlockHeight > pageHeight - 20) {
      doc.addPage()
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20)
      y = 25
    }

    // Renderizar título de la capa (sub-encabezado)
    doc.text(titleLines, 20, y)
    y += titleBlockHeight

    // Renderizar items de la leyenda con indentación
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    for (const item of group.items) {
      // Dividir el texto en líneas si es muy largo
      const textLines = doc.splitTextToSize(item.label, maxTextWidth)
      const blockHeight = textLines.length * lineHeight + 6

      // Salto automático de página si se llena
      if (y + blockHeight > pageHeight - 20) {
        doc.addPage()
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20)
        y = 25
      }

      // Imagen del símbolo (indentada)
      if (item.imageData) {
        try {
          doc.addImage(item.imageData, "PNG", 25, y - 5, 8, 8)
        } catch (err) {
          console.warn("[generatePdf] Error agregando imagen de leyenda:", err)
        }
      }

      // Texto del item (indentado)
      doc.text(textLines, 38, y)

      y += textLines.length * lineHeight + 4
    }

    // Línea separadora entre grupos de capas
    if (groupIndex < legendGroups.length - 1) {
      doc.setDrawColor(180, 180, 180)
      doc.setLineWidth(0.4)
      doc.line(20, y, pageWidth - 20, y)
      y += 8 // Espacio después de la línea
    }
  }

  doc.save("Mapa_IGAC_A3.pdf")
}
