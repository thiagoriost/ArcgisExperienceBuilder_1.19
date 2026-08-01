import type { DatasetItem } from "./utilsTabIndicadores"

/**
 * @description Opción estándar para inicializar filtros tipo select.
 */
export const OPTION_SELECT = {
  value: 0,
  label: "Seleccione ...",
}

/**
 * @description Categorías temáticas del nuevo flujo que deben poblar data alfanumérica.
 */
export const CATEGORIAS_NUEVAS_CON_DATA_ALFANUMERICA = new Set([
  "fragmentacion_predial_rural",
  "distribucion_concentracion_tierra",
  "conflictos_uso_suelo",
  "analisis_genero_propiedad",
])

/**
 * @description Mapeo de indicadores del nuevo flujo que deben redirigirse
 * al flujo legado numérico para mantener compatibilidad.
 */
export const REDIRECCIONES_INDICADOR_NUEVO: { [key: string]: number } = {
  "3_1_1_gini_propiedad": 1,
  "3_1_2_ids": 2,
  "3_1_3_predios_uaf_minima": 3,
  "3_1_4_area_uaf_minima": 4,
  "3_1_5_gini_privados_2024": 5,
  "3_1_6_gini_frontera_agricola_2024": 6,
  "3_1_7_gini_frontera_agricola_destino_2024": 7,
}

/**
 * @description Determina si el indicador pertenece a la línea estratégica 1.7
 * o a los indicadores 3.1.5, 3.1.6, 3.1.7, que comparten reglas de negocio.
 */
export const esIndicadorLineaEstrat17 = (label?: string): boolean => {
  if (typeof label !== "string") return false
  return /1\.7\.|3\.1\.5|3\.1\.6|3\.1\.7/.test(label)
}

/**
 * @description Determina si un indicador debe calcular estadísticos como promedio.
 */
export const esIndicadorPromedioGini = (label?: string): boolean => {
  if (typeof label !== "string") return false
  return /3\.1\.5|3\.1\.6|3\.1\.7/.test(label)
}

/**
 * @description Convierte cualquier valor numérico potencial a un número finito seguro.
 * @param value Valor de entrada a convertir.
 * @returns Número finito o 0 si el valor no es válido.
 */
export const toSafeNumber = (value: unknown): number => {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * @description Valida si la categoría temática pertenece al conjunto que exige
 * construir dataAlfanumericaNal con los campos Microfundi y Minifundio.
 * @param categoriaValue Identificador de categoría temática seleccionada.
 * @returns true cuando la categoría requiere poblar data alfanumérica para gráfico.
 */
export const esCategoriaNuevaConDataAlfanumerica = (
  categoriaValue?: string,
): boolean => {
  return (
    typeof categoriaValue === "string" &&
    CATEGORIAS_NUEVAS_CON_DATA_ALFANUMERICA.has(categoriaValue)
  )
}

/**
 * @description Crea una lista de opciones garantizando que la primera sea
 * la opción "Seleccione ..." y evitando duplicar elementos con value 0.
 */
export const normalizarOpcionesConSeleccione = <T extends { value?: any; label?: string }>(
  opciones: T[] = [],
  opcionSeleccione?: Partial<T>,
): T[] => {
  const base = [
    {
      ...OPTION_SELECT,
      ...(opcionSeleccione || {}),
    } as T,
  ]

  const sinSelect = opciones.filter((item) => String(item?.value) !== "0")
  return [...base, ...sinSelect]
}

/**
 * @description Construye el dataset compatible con SimpleBarChart tomando los campos
 * Microfundi y Minifundio de la respuesta de la capa consultada.
 * @param features Entidades del servicio ArcGIS provenientes de queryUrl.
 * @param indicadorLabel Etiqueta del indicador para la leyenda del dataset.
 * @returns Arreglo con un único dataset para renderizar en widget.tsx.
 */
export const construirDatasetMicrofundiMinifundio = (
  features: any[] = [],
  indicadorLabel = "Distribución predial",
): DatasetItem[] => {
  /**
   * @description Construye un dataset de fallback visual cuando no existe data alfanumérica
   * útil en la respuesta del servicio.
   * @param label Etiqueta principal del dataset.
   * @returns Dataset con mensaje visible en la categoría de barras.
   */
  const construirFallbackSinDatos = (label: string): DatasetItem[] => {
    return [
      {
        labels: ["Sin datos alfanuméricos"],
        datasets: [
          {
            label,
            data: [0],
            backgroundColor: "rgba(136, 152, 170, 0.45)",
            borderColor: "rgba(136, 152, 170, 1)",
            borderWidth: 1,
          },
        ],
      },
    ]
  }

  if (!Array.isArray(features) || features.length === 0) {
    return construirFallbackSinDatos(indicadorLabel)
  }

  // Valida explícitamente que al menos una entidad incluya alguno de los dos campos esperados.
  const existeCampoEsperado = features.some((feature) => {
    const attrs = feature?.attributes ?? {}
    return (
      Object.prototype.hasOwnProperty.call(attrs, "Microfundi") ||
      Object.prototype.hasOwnProperty.call(attrs, "microfundi") ||
      Object.prototype.hasOwnProperty.call(attrs, "Minifundio") ||
      Object.prototype.hasOwnProperty.call(attrs, "minifundio")
    )
  })

  if (!existeCampoEsperado) {
    return construirFallbackSinDatos(indicadorLabel)
  }

  const acumulado = features.reduce(
    (acc, feature) => {
      const attrs = feature?.attributes ?? {}
      return {
        microfundi:
          acc.microfundi +
          toSafeNumber(attrs.Microfundi ?? attrs.microfundi),
        minifundio:
          acc.minifundio +
          toSafeNumber(attrs.Minifundio ?? attrs.minifundio),
      }
    },
    { microfundi: 0, minifundio: 0 },
  )

  return [
    {
      labels: ["Microfundi", "Minifundio"],
      datasets: [
        {
          label: indicadorLabel,
          data: [acumulado.microfundi, acumulado.minifundio],
          backgroundColor: "rgba(47, 125, 182, 0.55)",
          borderColor: "rgba(47, 125, 182, 1)",
          borderWidth: 1,
        },
      ],
    },
  ]
}
