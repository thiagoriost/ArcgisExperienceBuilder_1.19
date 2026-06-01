/**
 * @fileoverview Hook personalizado para impresión de mapas en PDF.
 * Orquesta la captura de pantalla del mapa y la generación del PDF.
 * @module printCliente/useClientPrint
 */

import { useState, useCallback } from "react"
import type { JimuMapView } from "jimu-arcgis"
import { captureMap } from "./screenshotService"
import { generatePdf } from "./pdfService"

/**
 * Opciones de metadatos para el PDF.
 * @interface PrintOptions
 * @property {string} [title] - Título del mapa en el PDF (por defecto: "MAPA TEMÁTICO").
 * @property {string} [author] - Autor del mapa (por defecto: "IGAC").
 * @property {boolean} [showGrid] - Indica si se dibuja una grilla sobre el mapa en el PDF.
 * @property {number} [gridCellSizeMm] - Tamaño de celda de grilla en mm (por defecto: 12).
 * @property {string} [gridColor] - Color de la grilla en formato hexadecimal (por defecto: #787878).
 */
export interface PrintOptions {
  /** Título del mapa en el PDF */
  title?: string
  /** Autor del mapa */
  author?: string
  /** Dibuja una grilla sobre el mapa en el PDF */
  showGrid?: boolean
  /** Tamaño de celda de grilla en mm */
  gridCellSizeMm?: number
  /** Color de la grilla en formato hexadecimal */
  gridColor?: string
}

/**
 * Hook personalizado que proporciona funcionalidad de impresión de mapas a PDF.
 *
 * Flujo de ejecución:
 * 1. Captura una imagen del estado actual del mapa
 * 2. Extrae las dimensiones de la imagen para mantener la relación de aspecto
 * 3. Genera un PDF con el mapa, metadatos y leyenda automática
 * 4. Descarga automáticamente el PDF generado
 *
 * @param {JimuMapView} [jimuMapView] - Instancia de JimuMapView del mapa a imprimir.
 * @param {PrintOptions} [options] - Opciones de metadatos para el PDF (título, autor).
 * @returns {object} Objeto con la función de impresión y estado de carga.
 * @returns {Function} returns.print - Función asíncrona para ejecutar la impresión.
 * @returns {boolean} returns.loading - Indica si hay una impresión en progreso.
 * @example
 * const { print, loading } = useClientPrint(jimuMapView, { title: 'Mi Mapa', author: 'Usuario' });
 * // Luego en el render:
 * <button onClick={print} disabled={loading}>Imprimir</button>
 */
export const useClientPrint = (jimuMapView?: JimuMapView, options?: PrintOptions) => {

  const [loading, setLoading] = useState(false)

  /**
   * Ejecuta el proceso de impresión del mapa.
   * Captura la vista actual y genera un PDF con título, fecha, escala e imagen.
   * @async
   * @returns {Promise<void>}
   */
  const print = useCallback(async () => {

    if (!jimuMapView?.view) return

    try {
      setLoading(true)

      const screenshot = await captureMap(jimuMapView.view)

      await generatePdf({
        title: options?.title || "MAPA TEMÁTICO",
        scale: jimuMapView.view.scale,
        imageUrl: screenshot.dataUrl,
        imageWidth: screenshot.width,
        imageHeight: screenshot.height,
        spatialReference: `WKID ${jimuMapView.view.spatialReference.wkid}`,
        author: options?.author || "IGAC",
        showGrid: options?.showGrid ?? false,
        gridCellSizeMm: options?.gridCellSizeMm ?? 12,
        gridColor: options?.gridColor || "#787878",
        view: jimuMapView.view
      })

    } finally {
      setLoading(false)
    }

  }, [
    jimuMapView,
    options?.title,
    options?.author,
    options?.showGrid,
    options?.gridCellSizeMm,
    options?.gridColor
  ])

  return { print, loading }
}
