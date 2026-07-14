

export enum typeMSM {
  success = "success",
  info = "info",
  error = "error",
  warning = "warning",
}

export interface InterfaceConstantes {
  coloresMapaCoropletico: ColoresMapaCoropletico[];
  diccionario: Diccionario;
}

export interface ColoresMapaCoropletico {
  colorRgb: string;
  value: number[];
}

export interface Diccionario {
  indicadores: Indicadores;
}

export interface Indicadores {
  decodigo: string;
  cantidad_predios: string;
  mpcodigo: string;
}

export interface InterfaceDataCoropletico {
  attributes: Attributes;
}

export interface Attributes {
  cod_departamento: string;
  cod_municipio: string;
  mpnombre: string;
  anio: number;
  tipo_predio: string;
  cantidad_predios: number;
  total_area_ha: number;
  ESRI_OID: number;
}

interface StatisticDefinition {
  statisticType: string; // Ej: "sum", "avg", "count", etc.
  onStatisticField: string; // Campo sobre el que se aplica la estadística
  outStatisticFieldName: string; // Nombre del campo resultante
}

// El tipo para `outStatistics` puede ser un array de StatisticDefinition o un string
export type OutStatistics = StatisticDefinition[] | string | undefined;

export interface InterfaceIndiSelected {
  value: number;
  label: string;
  descripcion: string;
  url: string;
  urlNal: string;
  urlDepartal: string;
  urlNalDataAlfanumerica: string;
  fieldlabel: string[];
  fieldlabelNal: string[];
  fieldlabelDepartal: string[];
  leyenda: string[];
  leyendaNal: string[];
  leyendaDepartal: string[];
  fieldValue: string;
  fieldValueNal: string;
  fieldValueDepartal: string;
  quintiles: Array<Array<number | string>>;
}

export interface typeGeometria {
  attributes: { mpcodigo: string };
  geometry: any; // Considera tipar `geometry` con algo más específico si es posible (ej: `Geometry` de GeoJSON)
  [key: string]: any;
}

export interface IndicadorSeleccionado {
  value?: number;
  label?: string;
  descripcion?: string;
  url?: string;
  urlNal?: string;
  urlDepartal?: string;
  urlNalDataAlfanumerica?: string;
  fieldlabel?: string[];
  fieldlabelNal?: string[];
  fieldlabelDepartal?: string[];
  leyenda?: string[];
  leyendaNal?: string[];
  leyendaDepartal?: string[];
  fieldValue?: string;
  fieldValueNal?: string;
  fieldValueDepartal?: string;
  quintiles?: Array<Array<number | string>>;
  deparmetSelected?: string; // Nombre del departamento seleccionado
  municipioSelected?: string; // Nombre del municipio seleccionado
}

export interface Interface_SpatialReference {
  wkid: number; // Well-Known ID del sistema de referencia espacial (4326 = WGS84)
}

export interface GeographicExtent {
  spatialReference: Interface_SpatialReference;
  xmin: number; // Longitud mínima (oeste)
  ymin: number; // Latitud mínima (sur)
  xmax: number; // Longitud máxima (este)
  ymax: number; // Latitud máxima (norte)
}

export interface InitSelectIndicadores {
  urlDepartal: string;
  fieldValueDepartal: string;
  fieldValueNal: string;
  fieldValue: string;
  fieldlabelNal: string[]; // Array de cadenas
  leyendaNal: string[]; // Array de cadenas
  leyenda: string[]; // Array de cadenas
  urlNal: string;
  urlNalDataAlfanumerica: string;
  label: string;
  value: number; // Número
  descripcion: string;
  url: string;
}

// 1. Tipos comunes
export interface SelectionTarget {
  target: {
    value: string | number;
  };
}

export interface interf_APUESTA_ESTRATEGICA {
  value: number;
  label: string;
  descripcion: string;
  CATEGORIA_TEMATICA?: CategoriaTematica[];
}

export interface interf_SUBSISTEMA {
  value: number;
  label: string;
  descripcion?: string;
  APUESTA_ESTRATEGICA?: Array<{
    value: number;
    label: string;
    descripcion: string;
    CATEGORIA_TEMATICA?: CategoriaTematica[];
  }>;
}
export interface CategoriaTematica {
  value: string | number;
  label: string;
  descripcion: string;
  INDICADOR?: Array<{
    descripcion: string;
    fieldValue: string;
    fieldValueDepartal: string;
    fieldValueNal: string;
    fieldlabel: string[];
    fieldlabelDepartal: string[];
    fieldlabelNal: string[];
    label: string
    leyenda: string[];
    leyendaDepartal: string[];
    leyendaNal: string[];
    quintiles: Array<Array<number | string>>;
    url: string;
    urlDepartal: string;
    urlNal: string;
    urlNalDataAlfanumerica: string;
    value: number;
  }>;
}

export interface NuevoFiltroIndicador {
  value: string;
  label: string;
  serviceKey: string;
  layerId: number;
}

export interface NuevoFiltroAreaEstudio {
  value: string;
  label: string;
  INDICADORES: NuevoFiltroIndicador[];
}

export interface NuevoFiltroAreaAdministrativa {
  value: string;
  label: string;
  AREAS_ESTUDIO: NuevoFiltroAreaEstudio[];
}

export interface NuevoFiltroCategoria {
  value: string;
  label: string;
  AREAS_ADMINISTRATIVAS: NuevoFiltroAreaAdministrativa[];
}

export interface HandleIndicadorParams {
  target: {
    value: string | number;
  };
}

export interface IndicatorConfig {
  _esIndicador: string;
  geometrias: any;
  urlIndicadorToGetData: string;
  outStatistics: string;
  fieldValueToSetRangeCoropletico: string;
}

export interface ChartData {
  features: Array<{
    attributes: { [key: string]: any };
  }>;
  fields: Array<{
    name: string;
  }>;
}

export interface ProcessedData {
  labels: string[];
  values: any[];
}

export interface DatasetItem {
  labels: string[];
  datasets: Array<{
    label: string;
    data: any[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }>;
}

export interface AjustarDatasetParams {
  dataToRenderGraphic: ChartData[];
  regionSeleccionada: string;
  indiSelected?: IndicadorSeleccionado;
}

export interface interface_Feature {
  attributes: {
    mpcodigo?: string;
    cod_municipio?: string;
    decodigo?: string;
    mpnombre?: string;
    dataIndicadores?: Array<{ [key: string]: any }>;
    [key: string]: any;
  };
}

export interface PoblarMunicipiosParams {
  features: interface_Feature[];
  targetDepartment: string;
}

// 1. Definir interfaces para los tipos esperados
export interface GraphicFeature {
  attributes: {
    mpcodigo: string;
    [key: string]: any; // Para otras propiedades que puedan existir
  };
  geometry: {
    rings: number[][][]; // Ajusta según la estructura real de tus rings
    spatialReference: {
      wkid: number;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

export interface LayerDeployed {
  graphics: GraphicFeature[];
  [key: string]: any; // Otras propiedades que pueda tener el layer
}

export interface inter_poligonoSeleccionado {
  attributes: object;
  geometry: object;
}

export interface inter_EsriModules {
  FeatureLayer: any;
  Polygon: any;
  Graphic: any;
  GraphicsLayer: any;
  SimpleFillSymbol: any;
  SimpleMarkerSymbol: any;
  SimpleLineSymbol: any;
}

export interface interface_Extent {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  spatialReference: Interface_SpatialReference;
}

export interface interfa_itemSelected {
  mpnombre?: string;
  mpcodigo?: string;
  value: any;
  label?: string;
  denombre?: string;
}

export interface interfa_geometriasDepartamentos {
  features: Array<{
    attributes: Indicadores;
    geometry: any;
  }>;
}
export interface interfa_indicadores {
  value: number;
  label: string;
}


export const initSelectIndicadores = {
  url: "",
  urlDepartal: "",
  fieldValueDepartal: "",
  fieldValueNal: "",
  fieldValue: "",
  fieldlabelNal: [] as string[],
  leyendaNal: [] as string[],
  leyenda: [] as string[],
  urlNal: "",
  urlNalDataAlfanumerica: "",
  label: "",
  value: 0,
  descripcion: "",
}

export const initLastLayerDeployed = {
  graphics: [] as any[],
  graphicsLayers: [] as any[],
}
export const initIndiSelected = {
  value: 0,
  label: "",
  descripcion: "",
  url: "",
  urlNal: "",
  urlDepartal: "",
  urlNalDataAlfanumerica: "",
  fieldlabel: [] as string[],
  fieldlabelNal: [] as string[],
  fieldlabelDepartal: [] as string[],
  leyenda: [] as string[],
  leyendaNal: [] as string[],
  leyendaDepartal: [] as string[],
  fieldValue: "",
  fieldValueNal: "",
  fieldValueDepartal: "",
  quintiles: [] as Array<Array<number | string>>,
}

export const initAreaEstudioNueva = { value: "", label: "", INDICADORES: [] as NuevoFiltroIndicador[] }
export const initNuevoFiltroCategoria = { value: "", label: "", AREAS_ADMINISTRATIVAS: [] as NuevoFiltroAreaAdministrativa[] }
export const initApuestaEstrategica = {value: 0, label: "Seleccione ...", descripcion: "Seleccione una opción"}
