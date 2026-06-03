import { appActions, getAppStore, type AllWidgetProps, WidgetState } from 'jimu-core'
import React from 'react'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import { Button, Label, Option, Select, TextInput } from 'jimu-ui'
// import { SelectLineOutlined } from 'jimu-icons/outlined/gis/select-line'
import { DataLineOutlined } from 'jimu-icons/outlined/gis/data-line'
import { SelectPointOutlined } from 'jimu-icons/outlined/gis/select-point'
import esriConfig from '@arcgis/core/config'
import Graphic from '@arcgis/core/Graphic'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import Polyline from '@arcgis/core/geometry/Polyline'
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine'
import * as geometryJsonUtils from '@arcgis/core/geometry/support/jsonUtils'
import * as normalizeUtils from '@arcgis/core/geometry/support/normalizeUtils'
import * as geometryServiceRest from '@arcgis/core/rest/geometryService'
import BufferParameters from '@arcgis/core/rest/support/BufferParameters'
import { SearchActionBar } from '../../../shared/components/search-action-bar'
import { urls } from '../../../api/serviciosQuindio'
import { abrirTablaResultados, limpiarYCerrarWidgetResultados } from '../../../widget-result/src/runtime/widget'

// @ts-expect-error - No se encuentran tipos de la API de ArcGIS, se asume que están disponibles globalmente en runtime.
import '../styles/styles.css'
import { goToInitialExtent, validaLoggerLocalStorage } from '../../../shared/utils/export.utils'
import { WIDGET_IDS } from '../../../shared/constants/widget-ids'
import { useSelector } from 'react-redux'
import OurLoading from '../../../commonWidgets/our_loading/OurLoading'


let nameCapa = "" // Variable global para almacenar el nombre de la capa seleccionada, usada en la generación de ID de buffer para resultados y trazas de depuración.
/**
 * Opcion renderizada en controles tipo select.
 */
interface SelectOption {
  /** Valor interno de la opcion. */
  value: string
  /** Texto visible de la opcion. */
  label: string
}

/**
 * Campos de texto usados para construir etiquetas legibles.
 */
interface LabelSource {
  /** Nombre del tema o subtema. */
  NOMBRETEMATICA?: string
  /** Nombre de la capa. */
  NOMBRECAPA?: string
  /** Titulo alterno de la capa. */
  TITULOCAPA?: string
}

/**
 * Nodo de capa final del árbol de contenido.
 */
interface BufferCapaNode {
  /** Nombre del tema o subtema si la fuente lo reutiliza. */
  NOMBRETEMATICA?: string
  /** Nombre de la capa. */
  NOMBRECAPA?: string
  /** Nombre legible alterno. */
  TITULOCAPA?: string
  /** URL del servicio/capa. */
  URL?: string

  capasBisnietos?: BufferCapaNode[]

  capasNietas?: BufferCapaNode[]

}

/**
 * Nodo de grupo cuando un subtema organiza capas en un nivel intermedio.
 */
interface BufferGrupoNode {
  /** Nombre del grupo. */
  NOMBRETEMATICA?: string
  /** Título legible del grupo. */
  TITULOCAPA?: string
  /** Nombre alterno del grupo/capa. */
  NOMBRECAPA?: string
  /** URL opcional cuando el grupo también representa una capa. */
  URL?: string
  /** Capas de tercer nivel (bisnietos) asociadas al grupo. */
  capasBisnietos?: BufferCapaNode[]
}

/**
 * Nodo de subtema del árbol de contenido.
 */
interface BufferSubtemaNode {
  /** Nombre del subtema. */
  NOMBRETEMATICA?: string
  /** Nombre legible alterno. */
  TITULOCAPA?: string
  /** Capa hija asociada al subtema. */
  capasNietas?: BufferGrupoNode[]

  IDTEMATICAPADRE?: number

}

/**
 * Nodo de tema del árbol de contenido.
 */
interface BufferTemaNode {
  /** Identificador de temática padre en la estructura origen. */
  IDTEMATICAPADRE?: number | string
  /** Nombre del tema. */
  NOMBRETEMATICA?: string
  /** Nombre legible alterno. */
  TITULOCAPA?: string
  /** Subtemas asociados al tema. */
  capasHijas?: BufferSubtemaNode[]
}

/**
 * Carga útil recibida desde el widget de tabla de contenido.
 */
interface TablaDeContenidoPayload {
  /** Identifica la acción emitida por el widget origen. */
  task: string
  /** Árbol de temas, subtemas y capas disponible para llenar el formulario. */
  temas?: BufferTemaNode[]
}

/**
 * Opción de select que conserva el nodo original para resolver dependencias.
 */
interface NodeOption<T> extends SelectOption {
  /** Nodo asociado a la opción. */
  node: T
}

/**
 * Item de capa listo para usarse en UI y manejo de mapa.
 */
interface CapaOption extends NodeOption<BufferCapaNode> {
  /** URL final de FeatureLayer (MapServer/<layerId>). */
  layerUrl: string
}

/**
 * Valor permitido para atributos mostrados en la tabla de resultados.
 */
type ResultCell = string | number | boolean | null

/**
 * Fila normalizada para renderizado de tabla y publicación en widget-result.
 */
interface BufferResultRow {
  /** Identificador local para render estable en React. */
  rowId: number
  /** Atributos limpios para visualización y exportación. */
  attributes: Record<string, ResultCell>
  /** Geometría JSON opcional para navegación y visualización externa. */
  geometry?: __esri.GeometryProperties
}

/**
 * Definición de columna para tabla local de resultados.
 */
interface BufferResultField {
  /** Nombre interno del campo. */
  name: string
  /** Etiqueta visible. */
  alias: string
  /** Tipo de dato ArcGIS para exportación/tabla. */
  type: __esri.FieldProperties['type']
}

/**
 * Feature intersectada almacenada para reconstrucción de mapa y tabla.
 */
interface StoredIntersectedFeature {
  /** Atributos limpios para visualización y exportación. */
  attributes: Record<string, ResultCell>
  /** Geometría serializada del feature intersectado. */
  geometry?: __esri.GeometryProperties
}

/**
 * Registro de buffer ejecutado por el usuario.
 */
interface StoredBufferRecord {
  /**
   * Identificador legible del buffer con formato:
   * "<nombre de capa> #<consecutivo>".
   *
   * Permite diferenciar buffers entre capas distintas en historial y resultados.
   */
  idBuffer: string
  /** Extent serializado del buffer para navegación rápida. */
  extent?: __esri.ExtentProperties
  /** Geometría base usada para construir buffer (punto o línea). */
  sourceGeometry: __esri.GeometryProperties
  /** Geometría poligonal del buffer resultante. */
  bufferGeometry: __esri.GeometryProperties
  /** Entidades intersectadas para renderizado y tabla. */
  intersectedFeatures: StoredIntersectedFeature[]
  /** Campos de tabla asociados al conjunto de resultados. */
  resultFields: BufferResultField[]
  /** Filas normalizadas para visualización tabular. */
  intersectedFeaturesByBuffer: BufferResultRow[]
  /** Referencia espacial de los resultados de este buffer. */
  spatialReference?: __esri.SpatialReference
  /** Estado de visibilidad individual del buffer. */
  bufferChecked: boolean
}

/**
 * Adaptador de GeometryService para SDK 4.x basado en API REST.
 *
 * Mantiene la firma esperada por el flujo del widget:
 * - constructor(url)
 * - buffer(BufferParameters)
 */
class GeometryService {
  /** URL base del GeometryServer. */
  url: string

  /**
   * @param url URL del servicio de geometría.
   */
  constructor (url: string) {
    this.url = url
  }

  /**
   * Ejecuta el proceso de buffer en el GeometryServer.
   *
   * @param params Parámetros del buffer.
   * @returns Geometrías resultantes del servicio.
   */
  buffer (params: BufferParameters) {
    return geometryServiceRest.buffer(this.url, params)
  }
}

/**
 * Configuración mínima de esriConfig con compatibilidad de defaults.
 */
type EsriConfigWithDefaults = typeof esriConfig & {
  defaults?: {
    geometryService?: GeometryService
  }
  geometryServiceUrl?: string
}

/**
 * Servicio de geometría único reutilizado por todo el ciclo de vida del widget.
 */
let geometryServiceSingleton: GeometryService | null = null

/**
 * Unidades lineales aceptadas por BufferParameters (REST GeometryService).
 */
type BufferLinearUnit = 'meters' | 'feet' | 'kilometers' | 'miles' | 'nautical-miles' | 'yards'

/**
 * Diccionario de conversion de unidad UI a unidad ArcGIS.
 */
const UNIT_TO_ARCGIS: { [key: string]: BufferLinearUnit } = {
  Metros: 'meters',
  Kilometros: 'kilometers'
}

/**
 * URL del GeometryServer oficial usado por el widget Buffer.
 */
const BUFFER_GEOMETRY_SERVICE_URL = urls.SERVICIO_GEOMETRIA

/**
 * Inicializa (una sola vez) y retorna el GeometryService compartido.
 *
 * Además deja configurado esriConfig.defaults.geometryService para compatibilidad
 * con implementaciones existentes y publica geometryServiceUrl para 4.x.
 *
 * @returns Instancia única de GeometryService.
 */
const getOrCreateGeometryService = () => {
  if (!geometryServiceSingleton) {
    geometryServiceSingleton = new GeometryService(BUFFER_GEOMETRY_SERVICE_URL)
  }

  const config = esriConfig as EsriConfigWithDefaults
  config.defaults = config.defaults ?? {}
  config.defaults.geometryService = geometryServiceSingleton
  config.geometryServiceUrl = BUFFER_GEOMETRY_SERVICE_URL

  return geometryServiceSingleton
}

/**
 * Construye una etiqueta para tematicas/subtematicas/capas.
 *
 * @param item Nodo de la tabla de contenido.
 * @param fallback Texto por defecto cuando no exista nombre.
 * @returns Etiqueta normalizada para mostrar en un select.
 */
const getNodeLabel = (
  item: LabelSource,
  fallback: string
) => {
  return String(item.NOMBRETEMATICA ?? item.TITULOCAPA ?? item.NOMBRECAPA ?? fallback).trim()
}

/**
 * Normaliza texto para comparaciones de UI sin sensibilidad a acentos/mayúsculas.
 *
 * @param {string} value Texto de entrada.
 * @returns {string} Texto normalizado en minúsculas y sin diacríticos.
 */
const normalizeUiText = (value: string) => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * Construye la URL final de una capa usando la estructura de tematicas.
 *
 * @param item Nodo de capa proveniente de la tabla de contenido.
 * @returns URL de layer para FeatureLayer o cadena vacia si no se puede construir.
 */
const buildLayerUrl = (item: BufferCapaNode) => {
  const baseUrl = String(item.URL || '').trim()
  const serviceLayerId = String(item.NOMBRECAPA || '').trim()

  if (!baseUrl) return ''
  if (!serviceLayerId) return baseUrl

  return `${baseUrl}/${serviceLayerId}`
}

/**
 * Convierte a numero una entrada de distancia con fallback seguro.
 *
 * @param value Valor ingresado por el usuario.
 * @returns Distancia numerica valida, o 0 cuando la entrada no sea valida.
 */
const toPositiveDistance = (value: string) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

/**
 * Convierte un atributo crudo a tipo visualizable en tabla.
 *
 * @param value Valor del atributo en el feature original.
 * @returns Valor normalizado para UI/exportación.
 */
const toResultCell = (value: unknown): ResultCell => {
  if (value == null) return null
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }
  return String(value)
}

/**
 * Obtiene un subconjunto relevante de atributos para visualización.
 *
 * Se excluyen campos de geometría binaria y metadatos internos no útiles.
 *
 * @param attributes Atributos crudos de un feature.
 * @returns Diccionario limpio de atributos para tabla.
 */
const extractRelevantAttributes = (attributes: Record<string, unknown>) => {
  const excludedPattern = /^(shape|shape_length|shape_area|globalid)$/i
  const entries = Object.entries(attributes)
    .filter(([key]) => !excludedPattern.test(key))
    .map(([key, value]) => [key, toResultCell(value)] as const)

  return Object.fromEntries(entries) as Record<string, ResultCell>
}

/**
 * Deduce tipo de campo ArcGIS para la tabla de resultados.
 *
 * @param value Valor representativo del campo.
 * @returns Tipo de campo compatible con ArcGIS.
 */
const inferFieldType = (value: ResultCell): __esri.FieldProperties['type'] => {
  if (typeof value === 'number') return 'double'
  if (typeof value === 'boolean') return 'small-integer'
  return 'string'
}

/**
 * Construye firma determinística para evitar consultas espaciales duplicadas.
 *
 * @param geometry Geometría base capturada.
 * @param layerUrl URL de capa objetivo.
 * @param distance Distancia usada en el buffer.
 * @param unit Unidad del buffer.
 * @returns Hash de parámetros de consulta.
 */
const buildSpatialRequestKey = (
  geometry: __esri.GeometryUnion,
  layerUrl: string,
  distance: number,
  unit: BufferLinearUnit
) => {
  const geometryJson = typeof geometry.toJSON === 'function' ? geometry.toJSON() : geometry
  return JSON.stringify({ geometry: geometryJson, layerUrl, distance, unit })
}

/**
 * Evalúa si un valor de IDTEMATICAPADRE representa el valor cero.
 *
 * Soporta fuentes donde el identificador llega como número o string.
 *
 * @param parentId Valor de IDTEMATICAPADRE recibido desde TOC.
 * @returns true cuando el valor equivale a cero; en otro caso false.
 */
const isZeroParentId = (parentId: number | string | undefined): boolean => {
  if (typeof parentId === 'number') return parentId === 0
  if (typeof parentId === 'string') return parentId.trim() === '0'
  return false
}

/**
 * Widget Buffer.
 *
 * Carga tematicas para poblar controles de Temas/Subtemas/Capas,
 * agrega la capa seleccionada al mapa y permite dibujar geometria
 * de punto o linea para generar su respectivo buffer.
 *
 * @param props Propiedades estandar de Experience Builder.
 * @returns Vista del widget.
 */
const Widget = (props: AllWidgetProps<any>) => {

  const dataFromTablaDeContenido: TablaDeContenidoPayload | null = useSelector(
      (state: {
        widgetsState?: { [key: string]: {
          fromTablaDeContenido2?: TablaDeContenidoPayload | null
        } | undefined }
      }) =>
          state.widgetsState?.[props.id]?.fromTablaDeContenido2 ?? null
  )

  /** Vista activa del mapa seleccionada en el builder. */
  const [jimuMapView, setJimuMapView] = React.useState<JimuMapView | null>(null)

  /** Identificador de tema seleccionado. */
  const [temaValue, setTemaValue] = React.useState('')
  /** Identificador de subtema seleccionado. */
  const [subtemaValue, setSubtemaValue] = React.useState('')
  /** Identificador de capa seleccionada. */
  const [capaValue, setCapaValue] = React.useState('')
  /** Identificador del grupo seleccionado (solo para Cuenca Río la Vieja). */
  const [grupoValue, setGrupoValue] = React.useState('')

  /** Distancia del buffer en unidad de usuario. */
  const [distancia, setDistancia] = React.useState('500')
  /** Unidad seleccionada para el buffer. */
  const [unidad, setUnidad] = React.useState('Metros')

  /** Modo de dibujo activo sobre el mapa. */
  const [drawMode, setDrawMode] = React.useState<'point' | 'line' | null>(null)
  /** Mensaje de error para la barra de acciones. */
  const [actionError, setActionError] = React.useState('')
  /** Estado de ejecución de buffer + intersección. */
  const [isProcessing, setIsProcessing] = React.useState(false)

  /** Filas normalizadas para tabla local de resultados. */
  const [intersectedFeaturesByBuffer, setIntersectedFeaturesByBuffer] = React.useState<BufferResultRow[]>([])
  /** Definición de columnas para la tabla local. */
  const [resultFields, setResultFields] = React.useState<BufferResultField[]>([])
  /** Mensaje informativo del resultado espacial. */
  const [resultMessage, setResultMessage] = React.useState('')
  /** Historial de buffers ejecutados por el usuario. */
  const [bufferHistory, setBufferHistory] = React.useState<StoredBufferRecord[]>([])
  /** Buffer actualmente seleccionado en la tabla de historial. */
  const [selectedBufferId, setSelectedBufferId] = React.useState<string | null>(null)
  /** Control global para mostrar/ocultar todas las geometrías de buffer. */
  const [showAllBuffers, setShowAllBuffers] = React.useState(true)
  /** Pestaña activa de la interfaz: formulario o historial. */
  const [activeTab, setActiveTab] = React.useState<'formulario' | 'historial'>('formulario')
  /** Estado de carga de la capa de características seleccionada. */
  const [isLayerLoading, setIsLayerLoading] = React.useState(false)

  /** Referencia al GraphicsLayer temporal de dibujo y buffer. */
  const graphicsLayerRef = React.useRef<GraphicsLayer | null>(null)
  /** Referencia al FeatureLayer de la capa seleccionada en el formulario. */
  const activeLayerRef = React.useRef<FeatureLayer | null>(null)
  /** Primer punto capturado para dibujo de linea. */
  const lineStartPointRef = React.useRef<__esri.Point | null>(null)
  /** Instancia estable del GeometryService. */
  const geometryServiceRef = React.useRef<GeometryService | null>(null)
  /** Control de concurrencia para descartar respuestas obsoletas. */
  const executionIdRef = React.useRef(0)
  /** Firma de la última consulta espacial para evitar duplicados. */
  const lastSpatialRequestKeyRef = React.useRef('')
  /** Consecutivo interno para asignar id secuencial por buffer. */
  const nextBufferIdRef = React.useRef(1)
  /** Guarda el último buffer seleccionado para restaurar su foco al reactivar la vista global. */
  const lastSelectedBufferIdRef = React.useRef<string | null>(null)
  /** Extent inicial de la vista para restaurarlo al cerrar el widget. */
  const initialExtentRef = React.useRef<__esri.Extent | null>(null)
  /** Zoom inicial del mapa para restablecer la vista al limpiar. */
  const initialZoomRef = React.useRef<number | null>(null)
  /** Escala inicial del mapa para restablecer la vista al limpiar. */
  const initialScaleRef = React.useRef<number | null>(null)
  /** Estado previo de apertura automática de popups por clic para restaurarlo después. */
  const clickPopupEnabledRef = React.useRef<boolean | null>(null)
  /** Estado previo de highlight automático por clic para restaurarlo después. */
  const clickHighlightEnabledRef = React.useRef<boolean | null>(null)
  /** Referencias DOM de pestañas para navegación por teclado con foco controlado. */
  const tabButtonRefs = React.useRef<Array<HTMLButtonElement | null>>([])

  /**
   * Restaura el comportamiento automático de popups por clic del mapa a su estado previo.
   *
   * @param mapView Vista de mapa activa a restaurar. Si no se entrega, usa la vista activa del widget.
   * @returns {void}
   */
  const restoreClickOpenPopup = React.useCallback((mapView?: JimuMapView | null): void => {
    const targetMapView = mapView ?? jimuMapView

    if (!targetMapView || clickPopupEnabledRef.current === null) return

    if (clickPopupEnabledRef.current) {
      targetMapView.enableClickOpenPopup()
    } else {
      targetMapView.disableClickOpenPopup()
    }

    clickPopupEnabledRef.current = null
  }, [jimuMapView])

  /**
   * Desactiva temporalmente el comportamiento automático de popups por clic del mapa.
   *
   * @param mapView Vista de mapa a proteger durante el flujo Buffer.
   * @returns {void}
   */
  const suppressClickOpenPopup = React.useCallback((mapView?: JimuMapView | null): void => {
    const targetMapView = mapView ?? jimuMapView

    if (!targetMapView) return

    if (clickPopupEnabledRef.current === null) {
      clickPopupEnabledRef.current = targetMapView.isClickOpenPopupEnabled()
    }

    targetMapView.disableClickOpenPopup()
  }, [jimuMapView])

  /**
   * Restaura el resaltado automático de entidades al estado previo al flujo Buffer.
   *
   * @param mapView Vista de mapa activa a restaurar. Si no se entrega, usa la vista activa del widget.
   * @returns {void}
   */
  const restoreClickHighlight = React.useCallback((mapView?: JimuMapView | null): void => {
    const targetMapView = mapView ?? jimuMapView

    if (!targetMapView || clickHighlightEnabledRef.current === null) return

    if (clickHighlightEnabledRef.current) {
      targetMapView.enableClickHighlight()
    } else {
      targetMapView.disableClickHighlight()
    }

    clickHighlightEnabledRef.current = null
  }, [jimuMapView])

  /**
   * Desactiva temporalmente el resaltado automático de entidades clickeadas en el mapa.
   *
   * Evita interferencia visual entre el highlight de capas activas y las geometrías
   * capturadas o procesadas por el flujo Buffer.
   *
   * @param mapView Vista de mapa a proteger durante el flujo Buffer.
   * @returns {void}
   */
  const suppressClickHighlight = React.useCallback((mapView?: JimuMapView | null): void => {
    const targetMapView = mapView ?? jimuMapView

    if (!targetMapView) return

    if (clickHighlightEnabledRef.current === null) {
      clickHighlightEnabledRef.current = targetMapView.isClickHighlightEnabled()
    }

    targetMapView.disableClickHighlight()
  }, [jimuMapView])

  /**
   * Registra la carga útil recibida desde tabla de contenido para depuración local.
   * @returns {void}
   */
  React.useEffect(() => {
    if (!dataFromTablaDeContenido) return
    if (validaLoggerLocalStorage('logger')) {
      console.log('Data recibida en Buffer:', dataFromTablaDeContenido)
    }
  }, [dataFromTablaDeContenido])

  /**
   * Inicializa una sola vez el GeometryService compartido del widget.
   */
  React.useEffect(() => {
    geometryServiceRef.current = getOrCreateGeometryService()
    if(validaLoggerLocalStorage('logger')) console.log('WidgetBuffer ID:', {id:props.id, props, TABLA_DE_CONTENIDO:WIDGET_IDS.TABLA_DE_CONTENIDO})
  }, [])

  /**
   * Captura una única vez el extent inicial cuando la vista de mapa está disponible.
   *
   * @returns {void}
   */
  React.useEffect(() => {
    const view = jimuMapView?.view
    if (!view || initialExtentRef.current) return

    initialExtentRef.current = view.extent?.clone() ?? null
  }, [jimuMapView])

  /**
   * Temas disponibles en el formulario a partir de la carga útil del widget origen.
   */
  const temaOptions = React.useMemo<Array<NodeOption<BufferTemaNode>>>(() => {
    if (!dataFromTablaDeContenido) return []
    const temas = dataFromTablaDeContenido?.temas ?? []
    const TEMA = temas
      .map((item, index) => ({
        value:  item.NOMBRETEMATICA,
        label:  item.NOMBRETEMATICA,
        node: item
      }))
      .filter(option => Boolean(option.label))
    return TEMA
  }, [dataFromTablaDeContenido])

  /**
   * Tema actualmente seleccionado.
   */
  const selectedTema = React.useMemo(() => {
    const TEMAOPTION = temaOptions.find(option => option.value === temaValue)?.node
    if(validaLoggerLocalStorage('logger')) console.log({temaOptions, temaValue, TEMAOPTION})
    return TEMAOPTION ?? null
  }, [temaOptions, temaValue])

  /**
   * Determina si el tema seleccionado debe omitir el campo Subtemas.
   *
   * Regla:
   * 1. selectedTema.IDTEMATICAPADRE === 0
   * 2. Todos los elementos de selectedTema.capasHijas tienen IDTEMATICAPADRE === 0
   *
   * Cuando se cumple, el combo Capas se llena directamente desde
   * selectedTema.capasHijas[n].capasNietas.
   */
  const shouldBypassSubtema = React.useMemo<boolean>(() => {
    if (!selectedTema) return false

    const temaHasZeroParent = isZeroParentId(selectedTema.IDTEMATICAPADRE)
    if (!temaHasZeroParent) return false

    const temaChildren = selectedTema.capasHijas ?? []
    if (temaChildren.length === 0) return false

    return temaChildren.every((child: BufferSubtemaNode) => isZeroParentId(child.IDTEMATICAPADRE))
  }, [selectedTema])

  /**
   * Registra una traza breve cuando se activa el modo sin Subtemas.
   *
   * La salida se limita a modo debug (localStorage logger) para evitar
   * ruido en entornos normales de uso.
   *
   * @returns {void}
   */
  React.useEffect((): void => {
    if (!shouldBypassSubtema) return
    if (!validaLoggerLocalStorage('logger')) return

    const temaChildrenCount = selectedTema?.capasHijas?.length ?? 0
    console.log('Buffer bypass mode activated (Subtemas hidden).', {
      tema: selectedTema?.NOMBRETEMATICA ?? selectedTema?.TITULOCAPA ?? temaValue,
      temaChildrenCount
    })
  }, [shouldBypassSubtema, selectedTema, temaValue])

  /**
   * Subtemas del tema seleccionado para poblar el control Subtemas.
   */
  const subtemaOptions = React.useMemo<Array<NodeOption<BufferSubtemaNode>>>(() => {
    if (!selectedTema || shouldBypassSubtema) return []
    const subtemas = selectedTema?.capasHijas ?? []
    const SUBTEMA = subtemas
      .map((item, index) => ({
        value: item.NOMBRETEMATICA === temaValue ? item.TITULOCAPA : item.NOMBRETEMATICA,
        // label: (selectedTema.NOMBRETEMATICA === 'Educación'|| selectedTema.NOMBRETEMATICA === 'Gestión del riesgo') ? item.TITULOCAPA : item.NOMBRETEMATICA,
        label: item.NOMBRETEMATICA === temaValue ? item.TITULOCAPA : item.NOMBRETEMATICA,
        node: item
      }))
      .filter(option => Boolean(option.label))
    if(validaLoggerLocalStorage('logger')) console.log({selectedTema, subtemas, SUBTEMA})
    return SUBTEMA
  }, [selectedTema, shouldBypassSubtema, temaValue])

  /**
   * Nodo de subtema seleccionado.
   */
  const selectedSubtema = React.useMemo(() => {
    if (shouldBypassSubtema) return null
    if (subtemaOptions.length === 0) return null
    const subtemaOption = subtemaOptions.find(option => option.value === subtemaValue)
    if(validaLoggerLocalStorage('logger')) console.log({subtemaValue, subtemaOption})
    return subtemaOption ?? null
  }, [shouldBypassSubtema, subtemaOptions, subtemaValue])

  /**
   * Indica si el subtema actual requiere mostrar el campo adicional de grupos.
   */
  const shouldShowGrupos = React.useMemo(() => {
    if (shouldBypassSubtema) return false
    if (!selectedSubtema?.label) return false
    const validacion = selectedSubtema.node.capasNietas?.some(grupo => Array.isArray(grupo.capasBisnietos) && grupo.capasBisnietos.length > 0) ?? false
    if(validaLoggerLocalStorage('logger')) console.log({selectedSubtema: selectedSubtema.label, shouldShowGrupos: validacion})
    return validacion
  }, [shouldBypassSubtema, selectedSubtema])

  /**
   * Opciones del campo Grupos derivadas del subtema seleccionado.
   */
  const grupoOptions = React.useMemo<Array<NodeOption<BufferGrupoNode>>>(() => {
    if (!selectedSubtema?.node || !shouldShowGrupos) return []

    const grupoNodes = selectedSubtema.node.capasNietas ?? []
    const GRUPO = grupoNodes
      .map((item, index) => ({
        value: item.NOMBRETEMATICA,
        label: item.NOMBRETEMATICA,
        node: item
      }))
      .filter(option => Boolean(option.label))
    if(validaLoggerLocalStorage('logger')) console.log({selectedSubtema: selectedSubtema.label, grupoNodes, GRUPO})
    return GRUPO
  }, [selectedSubtema, shouldShowGrupos, subtemaValue])

  /**
   * Grupo seleccionado en el formulario cuando aplica Cuenca Río la Vieja.
   */
  const selectedGrupo = React.useMemo(() => {
    if (grupoOptions.length === 0 || grupoValue==='') return null
    const GRUPO = grupoOptions.find(option => option.value === grupoValue)?.node ?? null
    if(validaLoggerLocalStorage('logger')) console.log({grupoValue, selectedGrupo: GRUPO})
    return GRUPO
  }, [grupoOptions, grupoValue])

  /**
   * Opciones del campo Capas derivadas del tema/subtema seleccionado.
   *
   * Flujos soportados:
   * 1. Flujo estándar: usa selectedSubtema (y grupos cuando aplica).
   * 2. Flujo directo sin Subtemas: usa selectedTema.capasHijas[n].capasNietas.
   */
  const capaOptions = React.useMemo<CapaOption[]>(() => {
    let capaNodes: BufferCapaNode[] = []

    if (shouldBypassSubtema) {
      const temaChildren = selectedTema?.capasHijas ?? []
      const flattenedNodes = temaChildren.flatMap((subtema: BufferSubtemaNode) => subtema.capasNietas ?? [])
      capaNodes = flattenedNodes as BufferCapaNode[]

      if (validaLoggerLocalStorage('logger')) {
        console.log('Buffer bypass derived Capas count from capasHijas[].capasNietas:', {
          derivedCapasCount: capaNodes.length,
          temaChildrenCount: temaChildren.length
        })
      }
    } else {
      if (!selectedSubtema || (shouldShowGrupos && !selectedGrupo)) return []
      capaNodes = shouldShowGrupos
        ? selectedGrupo?.capasBisnietos ?? []
        : (selectedSubtema.node.capasNietas ?? []) as BufferCapaNode[]
    }

    const CAPAS = capaNodes
      .map((item, index) => {
        const layerUrl = buildLayerUrl(item)
        return {
          value: item.TITULOCAPA,
          label: item.TITULOCAPA,
          node: item,
          layerUrl
        }
      })
      .filter(option => Boolean(option.layerUrl || option.node.capasBisnietos || option.node.capasNietas))
    if(validaLoggerLocalStorage('logger')) console.log({selectedSubtema, shouldShowGrupos, selectedGrupo, capaNodes, CAPAS,grupoValue,subtemaValue,subtemaOptions,selectedTema, shouldBypassSubtema})
    return CAPAS
  }, [selectedSubtema, shouldShowGrupos, selectedGrupo, grupoValue, subtemaValue, subtemaOptions, selectedTema, shouldBypassSubtema])

  /**
   * Opcion de capa seleccionada.
   */
  const selectedCapa = React.useMemo(() => {
    if (capaOptions.length === 0) return null
    const CAPAOPTION = capaOptions.find(option => option.value === capaValue)
    if(validaLoggerLocalStorage('logger')) console.log({capaValue, CAPAOPTION})
    return CAPAOPTION ?? null
  }, [capaValue, capaOptions])

  const requestDataFromDOT = () => {
    // Envia mensaje al widget de tabla de contenido para solicitar datos de la TOC.
    getAppStore().dispatch(
        appActions.widgetStatePropChange(
            WIDGET_IDS.TABLA_DE_CONTENIDO, // ID del widget destino, debe ser un widget que esté abierto en el layout para recibir los datos
            'fromBuffer', // Nombre de la propiedad que se va a crear/actualizar en el estado del widget
            {
                task: 'TOC_DATA_REQUEST', // Identificador de la tarea o acción que se va a realizar, para que el widget destino sepa cómo manejar los datos
            }
        )
    )
  }


  /**
   * Crea (si es necesario) la capa temporal donde se dibujan geometria y buffer.
   */
  React.useEffect(() => {
    const view = jimuMapView?.view
    if (!view) return

    const existing = view.map.findLayerById('buffer-graphics-layer') as GraphicsLayer | null
    if (existing) {
      graphicsLayerRef.current = existing
      return
    }

    requestDataFromDOT()

    const graphicsLayer = new GraphicsLayer({
      id: 'buffer-graphics-layer',
      title: 'Buffer temporal'
    })

    view.map.add(graphicsLayer)
    graphicsLayerRef.current = graphicsLayer

    return () => {
      restoreClickOpenPopup(jimuMapView)
      restoreClickHighlight(jimuMapView)

      if (view.map.findLayerById(graphicsLayer.id)) {
        view.map.remove(graphicsLayer)
      }
      graphicsLayerRef.current = null
    }
  }, [jimuMapView, restoreClickOpenPopup, restoreClickHighlight])

  /**
   * Controla la apertura automática de popups y el resaltado automático de entidades
   * durante el flujo Buffer.
   *
   * Mientras el usuario dibuja geometrías (punto/línea) o el análisis espacial está
   * en curso, se desactivan ambos comportamientos para evitar interferencias visuales
   * con las geometrías capturadas y procesadas por el widget. Al salir del flujo se
   * restauran los estados previos registrados al momento de la primera supresión.
   */
  React.useEffect(() => {
    if (!jimuMapView) return

    const shouldSuppress = Boolean(drawMode && selectedCapa?.layerUrl) || isProcessing

    if (shouldSuppress) {
      suppressClickOpenPopup(jimuMapView)
      suppressClickHighlight(jimuMapView)
      return () => {
        restoreClickOpenPopup(jimuMapView)
        restoreClickHighlight(jimuMapView)
      }
    }

    restoreClickOpenPopup(jimuMapView)
    restoreClickHighlight(jimuMapView)
    return () => {
      restoreClickOpenPopup(jimuMapView)
      restoreClickHighlight(jimuMapView)
    }
  }, [
    drawMode,
    isProcessing,
    jimuMapView,
    restoreClickOpenPopup,
    suppressClickOpenPopup,
    restoreClickHighlight,
    suppressClickHighlight,
    selectedCapa?.layerUrl
  ])

  /**
   * Asegura que la capa de gráficos (buffer) siempre esté en la posición superior del mapa.
   * 
   * Esto garantiza que las geometrías de buffer y sus intersecciones se rendericen
   * por encima de todas las demás capas del mapa.
   * 
   * @returns {void}
   * @internal
   */
  const ensureGraphicsLayerOnTop = React.useCallback((): void => {
    const view = jimuMapView?.view
    const graphicsLayer = graphicsLayerRef.current

    if (!view || !graphicsLayer) return

    const isGraphicsLayerInMap = view.map.findLayerById(graphicsLayer.id) !== undefined

    if (isGraphicsLayerInMap) {
      // Reordena la capa de gráficos al final (índice más alto = más arriba en el renderizado)
      const layersCount = view.map.layers.length
      if (layersCount > 1) {
        view.map.reorder(graphicsLayer, layersCount - 1)
      }
    }
  }, [jimuMapView])

  /**
   * Agrega/remueve la capa seleccionada al mapa para gestión visual del usuario.
   * 
   * Después de agregar la capa de características (FeatureLayer), garantiza que
   * la capa de gráficos permanezca en la parte superior para renderizado correcto.
   * 
   * Además, monitorea el estado de carga de la capa para mostrar un indicador
   * visual de carga mediante el componente OurLoading.
   */
  React.useEffect(() => {
    const view = jimuMapView?.view
    if (!view) return

    if (activeLayerRef.current && view.map.findLayerById(activeLayerRef.current.id)) {
      view.map.remove(activeLayerRef.current)
      activeLayerRef.current = null
    }

    const layerUrl = selectedCapa?.layerUrl/*  || selectedCapa?.node?.capasNietas[0]?.URL */
    if (!layerUrl) return
    // Crea un nuevo FeatureLayer para la capa seleccionada y lo agrega al mapa.
    try {
      setIsLayerLoading(true)
      
      const layer = new FeatureLayer({
        id: 'buffer-active-layer',
        title: `Capa activa: ${selectedCapa.label}`,
        url: layerUrl,
        visible: true
      })

      view.map.add(layer)
      activeLayerRef.current = layer

      /**
       * Monitorea el estado de carga de la capa usando layer.when(),
       * que retorna una promesa que se resuelve cuando la capa ha terminado
       * de cargar completamente. Cuando se resuelve, ocultamos el indicador
       * de carga (OurLoading).
       * 
       * @param {FeatureLayer} layer Capa de características cargada.
       * @returns {void}
       */
      layer.when(() => {
        setTimeout(() => {
          setIsLayerLoading(false)          
        }, 8000);
        if (validaLoggerLocalStorage('logger')) {
          console.log('Buffer: Capa activa cargada completamente', {
            layerId: layer.id,
            title: layer.title,
            url: layer.url
          })
        }
      }).catch((error) => {
        setIsLayerLoading(false)
        console.error('Error al cargar la capa en Buffer:', error)
      })

      /**
       * Después de agregar la capa de características, asegura que la capa
       * de gráficos esté en la posición superior del mapa para que el buffer
       * sea visible encima de la capa de características.
       */
      ensureGraphicsLayerOnTop()
    } catch (error) {
      setIsLayerLoading(false)
      console.error('No fue posible cargar la capa seleccionada en Buffer:', error)
    }

    return () => {
      if (activeLayerRef.current && view.map.findLayerById(activeLayerRef.current.id)) {
        view.map.remove(activeLayerRef.current)
      }
      activeLayerRef.current = null
      setIsLayerLoading(false)
    }
  }, [jimuMapView, selectedCapa, ensureGraphicsLayerOnTop])

  /**
   * Reinicia los controles dependientes cuando cambia Tema.
   */
  const onTemaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTemaValue(event.target.value)
    setSubtemaValue('')
    setGrupoValue('')
    setCapaValue('')
    setActionError('')
    clearDrawings()
    void restoreInitialExtent()
    limpiarYCerrarWidgetResultados(WIDGET_IDS.RESULT)
  }

  /**
   * Reinicia el control de capas cuando cambia Subtema.
   */
  const onSubtemaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSubtemaValue(event.target.value)
    setGrupoValue('')
    setCapaValue('')
    setActionError('')
    limpiarYCerrarWidgetResultados(WIDGET_IDS.RESULT)
  }

  /**
   * Almacena el grupo seleccionado y reinicia la capa para evitar inconsistencias.
   *
   * @param {React.ChangeEvent<HTMLSelectElement>} event Evento de cambio del select de grupos.
   * @returns {void}
   */
  const onGrupoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setGrupoValue(event.target.value)
    setCapaValue('')
    setActionError('')
    limpiarYCerrarWidgetResultados(WIDGET_IDS.RESULT)
  }

  /**
   * Almacena la capa seleccionada.
   */
  const onCapaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value
    setCapaValue(selectedValue)
    nameCapa = selectedValue
    if(validaLoggerLocalStorage('logger')) console.log('Buffer - OnCapaChange:', selectedValue)
    setActionError('')
  }

  /**
   * Activa/desactiva el modo de dibujo seleccionado desde el formulario.
   */
  const onDrawModeSelect = (nextMode: 'point' | 'line') => {
    setDrawMode(currentMode => currentMode === nextMode ? null : nextMode)
    setActionError('')
  }

  /**
   * Limpia geometrias dibujadas y estado temporal de interaccion.
   */
  const clearDrawings = React.useCallback((): void => {
    if (validaLoggerLocalStorage('logger')) console.log('Buffer - clearDrawings', { bufferHistory,intersectedFeaturesByBuffer })
    lineStartPointRef.current = null
    graphicsLayerRef.current?.removeAll()
    setIntersectedFeaturesByBuffer([])
    setResultFields([])
    setResultMessage('')
    // setBufferHistory([])
    setSelectedBufferId(null)
    setShowAllBuffers(true)
    nextBufferIdRef.current = 1
    lastSpatialRequestKeyRef.current = ''
    limpiarYCerrarWidgetResultados(WIDGET_IDS.RESULT)
  }, [])

  /**
   * Restaura el extent inicial del mapa cuando existe una referencia válida.
   *
   * @returns {Promise<void>}
   */
  const restoreInitialExtent = React.useCallback(async (): Promise<void> => {
    const view = jimuMapView?.view
    const initialExtent = initialExtentRef.current

    if (!view || !initialExtent) return

    try {
      goToInitialExtent(jimuMapView, initialExtent)      
    } catch (error: unknown) {
      console.error('No fue posible restaurar el extent inicial de Buffer:', error)
    }
  }, [jimuMapView])

  /**
   * Limpia el estado espacial al cerrar el widget:
   * 1. Elimina geometrías y buffer temporal.
   * 2. Reinicia estados de interacción.
   * 3. Remueve la capa activa temporal del mapa.
   * 4. Restaura el extent inicial.
   *
   * @returns {void}
   */
  React.useEffect(() => {
    if (props.state !== WidgetState.Closed) return
    resetWidget()  
  }, [props.state, jimuMapView, clearDrawings, restoreInitialExtent])

  const resetWidget = () => {
    setDrawMode(null)
    setIsProcessing(false)
    setActionError('')
    clearDrawings()
    setTemaValue('')
    setSubtemaValue('')
    setGrupoValue('')
    setCapaValue('')
    setActiveTab('formulario')
     const view = jimuMapView?.view
    if (view && activeLayerRef.current && view.map.findLayerById(activeLayerRef.current.id)) {
      view.map.remove(activeLayerRef.current)
    }
    activeLayerRef.current = null

    restoreClickOpenPopup(jimuMapView)
    restoreClickHighlight(jimuMapView)

    void restoreInitialExtent()   
  }

  /**
   * Normaliza y simplifica geometría para construcción de buffer estable.
   *
   * Flujo:
   * 1. Normalización por meridiano central.
   * 2. Simplificación cuando la entrada es polyline no simple.
   *
   * @param geometry Geometría capturada en el mapa.
   * @returns Geometría preparada para GeometryService.buffer.
   */
  const prepareGeometryForBuffer = React.useCallback(async (geometry: __esri.GeometryUnion) => {
    const normalizedList = await normalizeUtils.normalizeCentralMeridian([geometry]) as __esri.GeometryUnion[]
    const normalizedGeometry = normalizedList?.[0] ?? geometry

    if (normalizedGeometry.type !== 'polyline') {
      return normalizedGeometry
    }

    const isSimpleLine = geometryEngine.isSimple(normalizedGeometry)
    if (isSimpleLine) {
      return normalizedGeometry
    }

    const simplifiedLine = geometryEngine.simplify(normalizedGeometry) as __esri.Polyline | null
    return simplifiedLine ?? normalizedGeometry
  }, [])

  /**
   * Construye un buffer geodésico usando GeometryService.buffer + BufferParameters.
   *
   * @param geometry Geometría de entrada normalizada/simplificada.
   * @param distanceValue Distancia positiva del buffer.
   * @param unitCode Unidad lineal ArcGIS.
   * @param outSpatialReference Referencia espacial de salida.
   * @returns Polígono de buffer o null si el servicio no retorna geometría.
   */
  const buildBufferGeometry = React.useCallback(async (
    geometry: __esri.GeometryUnion,
    distanceValue: number,
    unitCode: BufferLinearUnit,
    outSpatialReference: __esri.SpatialReference
  ) => {
    const service = geometryServiceRef.current ?? getOrCreateGeometryService()

    const bufferParams = new BufferParameters({
      geometries: [geometry],
      distances: [distanceValue],
      unit: unitCode,
      geodesic: true,
      unionResults: true,
      bufferSpatialReference: geometry.spatialReference,
      outSpatialReference
    })

    const bufferedGeometries = await service.buffer(bufferParams) as __esri.Geometry[]
    return (bufferedGeometries?.[0] ?? null) as __esri.Polygon | null
  }, [])

  /**
   * Dibuja geometrías intersectadas sobre la capa temporal del widget.
   *
   * @param features Features resultantes de intersección espacial.
   */
  const drawIntersectedGeometries = React.useCallback((features: __esri.Graphic[]) => {
    const graphicsLayer = graphicsLayerRef.current
    if (!graphicsLayer || features.length === 0) return

    const intersectionGraphics = features
      .filter(feature => Boolean(feature.geometry))
      .map(feature => {
        const geometry = feature.geometry as __esri.Geometry
        const symbol: __esri.GraphicProperties['symbol'] = geometry.type === 'polygon'
          ? {
              type: 'simple-fill',
              color: [0, 179, 136, 0.22],
              outline: { type: 'simple-line', color: [0, 128, 96, 1], width: 1.5 }
            }
          : geometry.type === 'polyline'
            ? {
                type: 'simple-line',
                color: [0, 128, 96, 1],
                width: 2.5
              }
            : {
                type: 'simple-marker',
                color: [0, 128, 96, 1],
                size: 7,
                outline: { color: [255, 255, 255, 1], width: 1 }
              }

        return new Graphic({
          geometry,
          attributes: feature.attributes,
          symbol
        })
      })

    if (intersectionGraphics.length > 0) {
      graphicsLayer.addMany(intersectionGraphics)
    }
  }, [])

  /**
   * Mapea features intersectados a estructura tipada para UI y widget-result.
   *
   * @param features Features retornados por query espacial.
   * @returns Paquete normalizado de filas y campos.
   */
  const mapQueryResults = React.useCallback((features: __esri.Graphic[]) => {
    const rows = features.map((feature, index) => ({
      rowId: index + 1,
      attributes: extractRelevantAttributes(feature.attributes as Record<string, unknown>),
      geometry: feature.geometry?.toJSON?.() as __esri.GeometryProperties | undefined
    }))

    const fieldMap = new Map<string, BufferResultField>()
    rows.forEach(row => {
      Object.entries(row.attributes).forEach(([name, value]) => {
        if (!fieldMap.has(name)) {
          fieldMap.set(name, {
            name,
            alias: name,
            type: inferFieldType(value)
          })
        }
      })
    })

    return {
      rows,
      fields: Array.from(fieldMap.values())
    }
  }, [])

  /**
   * Construye y dibuja el graphic de la geometría fuente (punto o línea).
   * 
   * @param geometry Geometría normalizada y simplificada (punto o línea).
   * @returns Graphic del símbolo de origen.
   * @internal
   */
  const createSourceGraphic = (geometry: __esri.GeometryUnion): Graphic => {
    return new Graphic({
      geometry,
      symbol: geometry.type === 'point'
        ? {
            type: 'simple-marker' as const,
            color: [220, 40, 40, 1] as [number, number, number, number],
            size: 9,
            outline: { color: [255, 255, 255, 1] as [number, number, number, number], width: 1 }
          }
        : {
            type: 'simple-line' as const,
            color: [220, 40, 40, 1] as [number, number, number, number],
            width: 2
          }
    })
  }

  /**
   * Construye el graphic del buffer con símbolo de relleno semitransparente.
   * 
   * @param geometry Polígono de buffer generado.
   * @returns Graphic del buffer.
   * @internal
   */
  const createBufferGraphic = (geometry: __esri.Polygon): Graphic => {
    return new Graphic({
      geometry,
      symbol: {
        type: 'simple-fill' as const,
        color: [255, 128, 0, 0.25] as [number, number, number, number],
        outline: {
          type: 'simple-line' as const,
          color: [255, 128, 0, 1] as [number, number, number, number],
          width: 2
        }
      }
    })
  }

  /**
   * Publica en widget-result la información asociada a un buffer almacenado.
   *
   * @param buffer Registro de buffer seleccionado.
   */
  const openResultsForStoredBuffer = React.useCallback((buffer: StoredBufferRecord) => {
    if(validaLoggerLocalStorage('logger')) {
      console.log('Buffer - openResultsForStoredBuffer:', {buffer})
    }
    if (!buffer.bufferChecked || buffer.intersectedFeaturesByBuffer.length === 0) {
      limpiarYCerrarWidgetResultados(WIDGET_IDS.RESULT)
      return
    }

    const featuresForResultWidget = buffer.intersectedFeaturesByBuffer.map(row => ({
      attributes: row.attributes,
      geometry: row.geometry
    }))

    if (buffer.bufferChecked) {
      abrirTablaResultados(
        false,
        featuresForResultWidget,
        buffer.resultFields,
        props,
        WIDGET_IDS.RESULT,
        buffer.spatialReference,
        `Buffer sobre ${buffer.idBuffer}`,
        {
          showGraphic: false
        }
      )      
    }
  }, [props])

  /**
   * Marca todos los buffers como visibles o invisibles de una sola vez.
   *
   * @param checked Estado de visibilidad a aplicar a todo el historial.
   * @returns {void}
   */
  const setAllBufferChecks = React.useCallback((checked: boolean): void => {
    if(validaLoggerLocalStorage('logger')) {
      console.log('Buffer - setAllBufferChecks:', { checked, bufferHistory })
    }
    setBufferHistory(prev => prev.map(buffer => ({
      ...buffer,
      bufferChecked: checked
    })))
  }, [bufferHistory])

  /**
   * Redibuja todos los buffers visibles en el GraphicsLayer temporal.
   *
   * Respeta check global e individual para visibilidad de geometrías.
   */
  const redrawBufferHistory = React.useCallback(() => {
    if(validaLoggerLocalStorage('logger')) {
      console.log('Buffer - redrawBufferHistory:', {        
        showAllBuffers,
        bufferHistory
      })
    }
    if (bufferHistory.length === 0 || props.state === 'CLOSED') return
    const graphicsLayer = graphicsLayerRef.current
    if (!graphicsLayer) return

    graphicsLayer.removeAll() // Limpiamos la capa antes de redibujar para evitar duplicados o residuos de geometrías no visibles.

    if (!showAllBuffers) { // Si no se deben mostrar los buffers, simplemente limpiamos el GraphicsLayer y salimos.
      return
    }

    const visibleBuffers = bufferHistory.filter(buffer => buffer.bufferChecked)

    visibleBuffers.forEach(buffer => {
      const sourceGeometry = geometryJsonUtils.fromJSON(buffer.sourceGeometry) as __esri.GeometryUnion | null
      if (sourceGeometry) {
        graphicsLayer.add(createSourceGraphic(sourceGeometry))
      }

      const intersectedGraphics = buffer.intersectedFeatures
        .filter(feature => Boolean(feature.geometry))
        .map(feature => {
          const geometry = geometryJsonUtils.fromJSON(feature.geometry as __esri.GeometryProperties) as __esri.Geometry | null
          if (!geometry) return null

          const symbol: __esri.GraphicProperties['symbol'] = geometry.type === 'polygon'
            ? {
                type: 'simple-fill',
                color: [0, 179, 136, 0.22],
                outline: { type: 'simple-line', color: [0, 128, 96, 1], width: 1.5 }
              }
            : geometry.type === 'polyline'
              ? {
                  type: 'simple-line',
                  color: [0, 128, 96, 1],
                  width: 2.5
                }
              : {
                  type: 'simple-marker',
                  color: [0, 128, 96, 1],
                  size: 7,
                  outline: { color: [255, 255, 255, 1], width: 1 }
                }

          return new Graphic({
            geometry,
            attributes: feature.attributes,
            symbol
          })
        })
        .filter((graphic): graphic is Graphic => Boolean(graphic))

      if (intersectedGraphics.length > 0) {
        graphicsLayer.addMany(intersectedGraphics)
      }

      const bufferGeometry = geometryJsonUtils.fromJSON(buffer.bufferGeometry) as __esri.Polygon | null
      if (bufferGeometry) {
        const bufferGraphic = createBufferGraphic(bufferGeometry)
        graphicsLayer.add(bufferGraphic) // El buffer se dibuja al final para que quede por encima de la geometría fuente e intersectada.        
      }
    })

    ensureGraphicsLayerOnTop()
  }, [bufferHistory, createBufferGraphic, ensureGraphicsLayerOnTop, showAllBuffers])

  /**
   * Selecciona un buffer del historial, centra mapa y abre widget-result.
   *
   * @param buffer Buffer objetivo.
   * @param shouldZoom Define si debe ejecutar goTo al extent del buffer.
   */
  const focusStoredBuffer = React.useCallback(async (buffer: StoredBufferRecord, shouldZoom = true) => {
    if(validaLoggerLocalStorage('logger')) {
      console.log('Buffer - focusStoredBuffer:', {buffer, shouldZoom })
    }
    setSelectedBufferId(buffer.idBuffer)
    lastSelectedBufferIdRef.current = buffer.idBuffer // Actualizamos la referencia del último buffer seleccionado para mantener el seguimiento correcto del estado de selección, especialmente en casos donde el usuario pueda interactuar rápidamente con múltiples entradas del historial o cuando se apliquen filtros de visibilidad que oculten temporalmente algunos buffers.

    if (shouldZoom && buffer.extent && jimuMapView?.view) {
      const extentGeometry = geometryJsonUtils.fromJSON({
        ...buffer.extent,
        type: 'extent'
      } as __esri.ExtentProperties & { type: 'extent' }) as __esri.Extent | null

      if (extentGeometry) {
        await jimuMapView.view.goTo(extentGeometry.expand(1.2))
      }
    }

    openResultsForStoredBuffer(buffer)
  }, [jimuMapView, openResultsForStoredBuffer])

  /**
   * Sincroniza render de gráficos cuando cambia el historial o la visibilidad.
   */
  React.useEffect(() => {
    redrawBufferHistory()
  }, [redrawBufferHistory])

  /**
   * Dibuja la geometría base, sus intersecciones y el buffer en el GraphicsLayer temporal.
   * 
   * Orden de renderizado (z-order):
   * 1. Geometría fuente (punto o línea)
   * 2. Geometrías intersectadas desde la capa objetivo
   * 3. Buffer de polígono (dibujado al final para aparecer encima de todo)
   *
   * @param geometry Geometría base (punto o línea) capturada sobre el mapa.
   * @returns {Promise<void>}
   */
  const drawBuffer = React.useCallback(async (geometry: __esri.GeometryUnion): Promise<void> => {
    if(validaLoggerLocalStorage('logger')) {
      console.log('Buffer - drawBuffer invoked with geometry:', {
        geometry,
        jimuMapView,
        distancia,
        unidad,
        capaValue
      })
    }
    const view = jimuMapView?.view
    const graphicsLayer = graphicsLayerRef.current
    const targetLayer = activeLayerRef.current
    const distanceValue = toPositiveDistance(distancia)
    const unitCode = UNIT_TO_ARCGIS[unidad] || 'meters'

    if (!view || !graphicsLayer) return
    if (!targetLayer) {
      setActionError('Seleccione una capa objetivo antes de dibujar el buffer.')
      return
    }

    if (distanceValue <= 0) {
      setActionError('Ingrese una distancia mayor a 0 para generar el buffer.')
      return
    }

    const executionId = ++executionIdRef.current
    setIsProcessing(true)
    setActionError('')
    setResultMessage('Procesando buffer e intersección espacial...')

    try {
      const preparedGeometry = await prepareGeometryForBuffer(geometry) // Prepara la geometría para buffer, asegurando estabilidad en la generación del buffer incluso con geometrías complejas o cercanas al meridiano central.
      const bufferGeometry = await buildBufferGeometry(preparedGeometry, distanceValue, unitCode, view.spatialReference) // Asegura que el buffer se genere en la misma referencia espacial que la vista para evitar reproyecciones innecesarias y posibles errores de geometría.

      if (!bufferGeometry) {
        setResultMessage('No fue posible construir el buffer con el GeometryService.')
        return
      }

      if (executionId !== executionIdRef.current) return

      if (validaLoggerLocalStorage('logger')) {
        console.log('Buffer - preparedGeometry:', preparedGeometry)
        console.log(`Buffer - bufferGeometry with distance ${distanceValue} ${unitCode}:`, bufferGeometry)
      }

      // Consulta y prepara las geometrías intersectadas
      const query = targetLayer.createQuery()
      query.geometry = bufferGeometry
      query.spatialRelationship = 'intersects'
      query.returnGeometry = true
      query.outFields = ['*']

      const queryResult = await targetLayer.queryFeatures(query)
      if (executionId !== executionIdRef.current) return

      const intersectedFeatures = queryResult.features ?? []

      const mappedResults = mapQueryResults(intersectedFeatures)
      setIntersectedFeaturesByBuffer(mappedResults.rows)
      setResultFields(mappedResults.fields)

      /**
       * Identificador compuesto para distinguir buffers por capa origen.
       *
       * Ejemplo: "Predios Urbanos #3".
       */
      const bufferId = `${nameCapa} #${nextBufferIdRef.current++}`

      const storedBuffer: StoredBufferRecord = {
        idBuffer: bufferId,
        extent: bufferGeometry.extent?.toJSON?.(),
        sourceGeometry: preparedGeometry.toJSON() as __esri.GeometryProperties,
        bufferGeometry: bufferGeometry.toJSON() as __esri.GeometryProperties,
        intersectedFeatures: mappedResults.rows.map(row => ({
          attributes: row.attributes,
          geometry: row.geometry
        })),
        resultFields: mappedResults.fields,
        intersectedFeaturesByBuffer: mappedResults.rows,
        spatialReference: view.spatialReference,
        bufferChecked: true // Por defecto, el nuevo buffer se agrega como visible en el historial para que el usuario pueda verlo inmediatamente después de la generación, mejorando la experiencia de interacción al no requerir pasos adicionales para mostrar el buffer recién creado.
      }

      setBufferHistory(prev => [...prev, storedBuffer])
      setShowAllBuffers(true)
      setSelectedBufferId(storedBuffer.idBuffer)

      if (mappedResults.rows.length === 0) {
        setResultMessage('No se encontraron entidades intersectadas por el buffer.')
        limpiarYCerrarWidgetResultados(WIDGET_IDS.RESULT)
      } else {
        setResultMessage(`Se encontraron ${mappedResults.rows.length} entidades intersectadas.`)
        openResultsForStoredBuffer(storedBuffer)
      }
      
      if (bufferGeometry.extent) {
        await view.goTo(bufferGeometry.extent.expand(1.2)) // Centra el mapa en el buffer generado, expandiendo el extent para asegurar que el buffer completo sea visible.
      }
    } catch (error) {
      console.error('Error en el flujo de buffer/intersección:', error)
      setActionError('Ocurrió un error al generar el buffer o consultar intersecciones.')
      setResultMessage('No fue posible completar el análisis espacial.')
      setIntersectedFeaturesByBuffer([])
      setResultFields([])
    } finally {
      if (executionId === executionIdRef.current) {
        setIsProcessing(false)
      }
    }
  }, [
    jimuMapView,
    distancia,
    unidad,
    mapQueryResults,
    prepareGeometryForBuffer,
    buildBufferGeometry,
    openResultsForStoredBuffer
  ])

  /**
   * Gestiona capturas de clic sobre el mapa segun el modo de dibujo activo.
   */
  React.useEffect(() => {
    const view = jimuMapView?.view
    if (!view || !drawMode) return

    view.container.style.cursor = 'crosshair'

    const handle = view.on('click', (event: { mapPoint: __esri.Point }) => {
      if (drawMode === 'point') {
        void drawBuffer(event.mapPoint)
        return
      }

      if (drawMode === 'line') {
        if (!lineStartPointRef.current) {
          lineStartPointRef.current = event.mapPoint
          return
        }

        const lineGeometry = new Polyline({
          paths: [[
            [lineStartPointRef.current.x, lineStartPointRef.current.y],
            [event.mapPoint.x, event.mapPoint.y]
          ]],
          spatialReference: lineStartPointRef.current.spatialReference
        })

        void drawBuffer(lineGeometry)
        lineStartPointRef.current = null
      }
    })

    return () => {
      handle.remove()
      lineStartPointRef.current = null
      view.container.style.cursor = 'default'
    }
  }, [drawMode, drawBuffer, jimuMapView])

  /**
   * Captura la vista activa del mapa.
   *
   * @param view Vista de mapa activa proveniente de JimuMapViewComponent.
   */
  const activeViewChangeHandler = (view: JimuMapView) => {
    if (!view) return
    setJimuMapView(view)
    if (!initialExtentRef.current) {
      initialExtentRef.current = view.view.extent?.clone() ?? null
      initialZoomRef.current = typeof view.view.zoom === 'number' ? view.view.zoom : null
      initialScaleRef.current = typeof view.view.scale === 'number' ? view.view.scale : null
    }
  }

  /**
   * Verifica si las opciones de temas ya están cargadas antes de solicitar datos a DOT.
   * 
   * Esto evita solicitudes innecesarias a DOT si los datos ya están disponibles en el estado del widget.
   */
  const checkifDOTexist = () => {
    if (temaOptions.length === 0) {
      requestDataFromDOT()
    }
  }

  /**
   * Gestiona el check global de visualización de buffers.
   *
   * Cuando está inactivo oculta todas las geometrías y cierra resultados.
   * Al activarlo restaura todos los checks y reabre el último buffer seleccionado.
   */
  const onToggleShowAllBuffers = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(validaLoggerLocalStorage('logger')) {
      console.log('Buffer - onToggleShowAllBuffers:', {
        checked: event.target.checked
      })
    }
    const checked = event.target.checked
    setShowAllBuffers(checked) // Actualizamos el estado de visibilidad global de buffers, lo que a su vez desencadenará un redibujo de las geometrías en el mapa según el nuevo estado. Esto permite al usuario controlar rápidamente la visualización de todos los buffers generados sin perder el contexto de su historial o selección individual.

    if (!checked) {
      setAllBufferChecks(false) // Desactivamos todos los checks individuales de buffers cuando se desactiva la visualización global, asegurando que ningún buffer permanezca visible de manera inconsistente.
      setSelectedBufferId(null)
      limpiarYCerrarWidgetResultados(WIDGET_IDS.RESULT)
      return
    }

    setAllBufferChecks(true) // Activamos todos los checks individuales de buffers cuando se activa la visualización global, asegurando que todos los buffers sean visibles de manera consistente.

    if (bufferHistory.length === 0 || bufferHistory.length > 1) return

    const targetBufferId = lastSelectedBufferIdRef.current || bufferHistory[0].idBuffer // Intentamos mantener el foco en el último buffer seleccionado por el usuario para mejorar la experiencia de navegación al mostrar nuevamente los buffers. Si no existe un buffer previamente seleccionado, no se enfocará ningún buffer específico, permitiendo al usuario elegir manualmente cuál revisar primero desde el historial.
    if (targetBufferId == null) return

    const targetBuffer = bufferHistory.find(item => item.idBuffer === targetBufferId) // Buscamos el registro del último buffer seleccionado para restaurar su visualización y resultados asociados al reactivar la vista de buffers. Esto mejora la continuidad de la experiencia del usuario al mantener el contexto del último análisis revisado, especialmente en casos donde se hayan aplicado filtros de visibilidad que ocultaron temporalmente los buffers.
    if (targetBuffer) {
      void focusStoredBuffer({ ...targetBuffer, bufferChecked: true }, true) // Al reactivar la visualización global de buffers, enfocamos el último buffer seleccionado para restaurar su contexto visual y resultados asociados, mejorando la experiencia del usuario al mantener el seguimiento de su última interacción con los análisis de buffer realizados.
    }
  }

  /**
   * Alterna visibilidad individual y ejecuta foco/tabla al activar un registro.
   *
   * @param bufferId Identificador del buffer a actualizar.
   * @param checked Estado de visibilidad solicitado.
   */
  const onToggleBufferCheck = (bufferId: string, checked: boolean) => {
    if(validaLoggerLocalStorage('logger')) {
      console.log('Buffer - onToggleBufferCheck:', {
        bufferId,
        checked
      })
    }
    setBufferHistory(prev => prev.map(buffer => {
      const isTargetBuffer = buffer.idBuffer === bufferId
        ? { ...buffer, bufferChecked: checked }
        : buffer
      return isTargetBuffer
    }))

    if (!checked) {
      if (selectedBufferId === bufferId) {
        setSelectedBufferId(null)
        const resetInitialExtent = false // Al cerrar un buffer individual, mantenemos el extent actual para evitar cambios bruscos en la vista del mapa, permitiendo al usuario seguir explorando otros buffers o áreas del mapa sin perder su contexto visual actual. Esto mejora la experiencia de navegación al no forzar una restauración del extent inicial cada vez que se oculta un buffer específico.
        limpiarYCerrarWidgetResultados(WIDGET_IDS.RESULT, resetInitialExtent) 
      }
      return
    }

    const targetBuffer = bufferHistory.find(item => item.idBuffer === bufferId)
    if (targetBuffer) {
      lastSelectedBufferIdRef.current = bufferId // Actualizamos la referencia del último buffer seleccionado para mantener el seguimiento correcto del estado de selección, especialmente en casos donde el usuario pueda interactuar rápidamente con múltiples entradas del historial o cuando se apliquen filtros de visibilidad que oculten temporalmente algunos buffers. Esto asegura que al activar un buffer específico, el sistema recuerde esta selección como la más reciente para futuras interacciones relacionadas con la visualización de buffers.
      void focusStoredBuffer({ ...targetBuffer, bufferChecked: checked }, true)
    }
  }

  /**
   * Selecciona un buffer desde la tabla del historial.
   *
   * @param buffer Registro seleccionado.
   */
  const onSelectBufferRow = (buffer: StoredBufferRecord) => {
    if(validaLoggerLocalStorage('logger')) {
      console.log('Buffer - onSelectBufferRow:', {buffer})
    }
    if (!buffer.bufferChecked || !showAllBuffers) return
    lastSelectedBufferIdRef.current = buffer.idBuffer
    void focusStoredBuffer(buffer, true)
  }

  /**
   * Etiqueta del control global de buffers según el estado actual.
   *
   * Cuando el checkbox está activo, la acción resultante será ocultar.
   * Cuando está inactivo, la acción será mostrar.
   */
  const showAllBuffersLabel = showAllBuffers ? 'Ocultar todos los buffers' : 'Mostrar todos los buffers'

  /**
   * Cambia la pestaña activa del widget.
   *
   * @param tab Identificador de la pestaña a mostrar.
   */
  const onTabChange = (tab: 'formulario' | 'historial') => {
    setActiveTab(tab)
  }

  /**
   * Orden fijo de pestañas para navegación con flechas y teclas Home/End.
   */
  const tabOrder: Array<'formulario' | 'historial'> = ['formulario', 'historial']

  /**
   * Enfoca programáticamente una pestaña por índice seguro.
   *
   * @param index Índice de la pestaña dentro de tabOrder.
   */
  const focusTabByIndex = (index: number): void => {
    const safeIndex = Math.max(0, Math.min(index, tabOrder.length - 1))
    const target = tabOrder[safeIndex]
    setActiveTab(target)
    tabButtonRefs.current[safeIndex]?.focus()
  }

  /**
   * Gestiona accesibilidad avanzada por teclado para tabs.
   *
   * Reglas implementadas (WAI-ARIA Tabs):
   * - ArrowRight: siguiente pestaña
   * - ArrowLeft: pestaña anterior
   * - Home: primera pestaña
   * - End: última pestaña
   *
   * @param event Evento de teclado sobre el tab activo/inactivo.
   * @param currentTab Pestaña desde la cual se dispara el evento.
   */
  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, currentTab: 'formulario' | 'historial'): void => {
    const currentIndex = tabOrder.indexOf(currentTab)

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusTabByIndex((currentIndex + 1) % tabOrder.length)
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusTabByIndex((currentIndex - 1 + tabOrder.length) % tabOrder.length)
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      focusTabByIndex(0)
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      focusTabByIndex(tabOrder.length - 1)
    }
  }



  return (
    <div style={{ height: '100%', padding: '5px', boxSizing: 'border-box' }}>
      {props.useMapWidgetIds && props.useMapWidgetIds.length === 1 && (
        <JimuMapViewComponent
          useMapWidgetId={props.useMapWidgetIds?.[0]}
          onActiveViewChange={activeViewChangeHandler}
        />
      )}

      <div className='consulta-widget loading-host'>
        {/* Navegación principal por pestañas para separar captura (Formulario) e histórico de resultados (Historial). */}
        <div className='buffer-widget-tabs' role='tablist' aria-label='Secciones del widget Buffer'>
          <button
            type='button'
            role='tab'
            id='buffer-tab-formulario'
            aria-selected={activeTab === 'formulario'}
            aria-controls='buffer-tabpanel-formulario'
            tabIndex={activeTab === 'formulario' ? 0 : -1}
            className={`buffer-widget-tab ${activeTab === 'formulario' ? 'is-active' : ''}`}
            ref={(element) => { tabButtonRefs.current[0] = element }}
            onKeyDown={(event) => { onTabKeyDown(event, 'formulario') }}
            onClick={() => { onTabChange('formulario') }}
          >
            Formulario
          </button>
          <button
            type='button'
            role='tab'
            id='buffer-tab-historial'
            aria-selected={activeTab === 'historial'}
            aria-controls='buffer-tabpanel-historial'
            tabIndex={activeTab === 'historial' ? 0 : -1}
            className={`buffer-widget-tab ${activeTab === 'historial' ? 'is-active' : ''}`}
            ref={(element) => { tabButtonRefs.current[1] = element }}
            onKeyDown={(event) => { onTabKeyDown(event, 'historial') }}
            onClick={() => { onTabChange('historial') }}
          >
            Historial ({bufferHistory.length})
          </button>
        </div>

        {/* Contenedor de paneles con altura controlada para habilitar desplazamiento vertical interno. */}
        <div className='buffer-widget-panels'>
        {/* Panel de captura y configuración del análisis espacial por buffer. */}
        <section
          id='buffer-tabpanel-formulario'
          role='tabpanel'
          aria-labelledby='buffer-tab-formulario'
          className={`buffer-widget-panel ${activeTab === 'formulario' ? 'is-active' : ''}`}
        >
          <Label>Temas:</Label>
          <Select value={temaValue} onChange={onTemaChange} onClick={checkifDOTexist}>
            <Option value=''>Seleccione...</Option>
            {temaOptions.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>

          {!shouldBypassSubtema && (
            <>
              <Label>Subtemas:</Label>
              <Select value={subtemaValue} onChange={onSubtemaChange}>
                <Option value=''>Seleccione...</Option>
                {subtemaOptions.map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            </>
          )}

          {shouldShowGrupos && (
            <>
              <Label>Grupos:</Label>
              <Select value={grupoValue} onChange={onGrupoChange}>
                <Option value=''>Seleccione...</Option>
                {grupoOptions.map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            </>
          )}

          <Label>Capas:</Label>
          <Select value={capaValue} onChange={onCapaChange} disabled={shouldShowGrupos && !grupoValue}>
            <Option value=''>Seleccione...</Option>
            {capaOptions.map(option => (
              <Option key={`${option.value}-${option.layerUrl}`} value={option.value}>{option.label}</Option>
            ))}
          </Select>

          {
              capaValue!=="" && (
                <>
                  <Label>Distancia:</Label>
                  <TextInput
                    type='text'
                    min='1'
                    value={distancia}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setDistancia(event.target.value) }}
                  />

                  <Label>Unidad:</Label>
                  <Select value={unidad} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => { setUnidad(event.target.value) }}>
                    <Option value='Metros'>Metros</Option>
                    <Option value='Kilometros'>Kilometros</Option>
                  </Select>
                  <Label>Modo de dibujo:</Label>
                  <div
                    role='group'
                    aria-label='Modo de dibujo'
                    style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}
                  >
                    <Button
                      type={drawMode === 'point' ? 'primary' : 'default'}
                      aria-pressed={drawMode === 'point'}
                      title='Punto'
                      onClick={() => { onDrawModeSelect('point') }}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <SelectPointOutlined width={16} height={16} />
                      <span>Punto</span>
                    </Button>
                    <Button
                      type={drawMode === 'line' ? 'primary' : 'default'}
                      aria-pressed={drawMode === 'line'}
                      title='Linea'
                      onClick={() => { onDrawModeSelect('line') }}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <DataLineOutlined width={16} height={16} />
                      <span>Linea</span>
                    </Button>
                  </div>
                  {drawMode === 'line' && (
                    <p className='buffer-widget__hint'>Para linea: haga clic en dos puntos del mapa.</p>
                  )}
                </>
              )
          }

          <SearchActionBar
            onSearch={() => {
              if (!selectedCapa?.layerUrl) {
                setActionError('Seleccione una capa para ejecutar la intersección espacial.')
                return
              }
              if (!drawMode) {
                setActionError('Seleccione un modo de dibujo antes de activar.')
                return
              }
              setActionError('')
            }}
            onClear={resetWidget}
            disableSearch={!drawMode || !selectedCapa?.layerUrl || isProcessing}
            helpText='Seleccione un modo de dibujo para habilitar la captura en el mapa, y haga clic sobre el mapa en donde desea realizar el buffer.'
            error={actionError}
            searchLabel='Buscar'
            clearLabel='Limpiar'
            hideSearch={true}
          />

          {isProcessing && (
            <p className='buffer-widget__hint'>Procesando buffer e intersección espacial...</p>
          )}

          {!isProcessing && resultMessage && (
            <p className='buffer-widget__hint'>{resultMessage}</p>
          )}
        </section>

        {/* Panel de revisión del historial de buffers, visibilidad y selección de resultados. */}
        <section
          id='buffer-tabpanel-historial'
          role='tabpanel'
          aria-labelledby='buffer-tab-historial'
          className={`buffer-widget-panel ${activeTab === 'historial' ? 'is-active' : ''}`}
        >
          {bufferHistory.length > 0 && (
            <div style={{ marginTop: '10px' }}>
             {/*  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <input
                  type='checkbox'
                  checked={showAllBuffers}
                  onChange={onToggleShowAllBuffers}
                />
                <span>{showAllBuffersLabel}</span>
              </label> */}

              <div className='widget-result-table-container' style={{ maxHeight: '240px', overflow: 'auto' }}>
                <table className='table table-sm table-striped' style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #d9d9d9', padding: '4px' }}>Ver</th>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #d9d9d9', padding: '4px' }}>Buffer</th>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #d9d9d9', padding: '4px' }}>Intersecciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bufferHistory.map(buffer => (
                      <tr
                        key={buffer.idBuffer}
                        // onClick={() => { onSelectBufferRow(buffer) }}
                        style={{
                          cursor: buffer.bufferChecked && showAllBuffers ? 'pointer' : 'default',
                          backgroundColor: selectedBufferId === buffer.idBuffer ? 'rgba(0, 128, 255, 0.08)' : 'transparent'
                        }}
                      >
                        <td style={{ borderBottom: '1px solid #efefef', padding: '4px' }}>
                          <input
                            type='checkbox'
                            checked={buffer.bufferChecked}
                            onChange={(event) => {
                              event.stopPropagation()
                              onToggleBufferCheck(buffer.idBuffer, event.target.checked)
                            }}
                          />
                        </td>
                        <td style={{ borderBottom: '1px solid #efefef', padding: '4px' }}>#{buffer.idBuffer}</td>
                        <td style={{ borderBottom: '1px solid #efefef', padding: '4px' }}>{buffer.intersectedFeaturesByBuffer.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {bufferHistory.length === 0 && (
            <p className='buffer-widget__hint'>Aún no hay buffers generados. Realice un análisis desde la pestaña Formulario.</p>
          )}
        </section>
        </div>

        {isLayerLoading && <OurLoading />}
      </div>
    </div>
  )
}

export default Widget
