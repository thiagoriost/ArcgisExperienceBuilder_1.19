/**
   * Interface LabelItem => Definición de la estructura de datos del objeto LabelItem
   * @date 2025-06-11
   * @author Ing.RRH
   * @dateUpdated 2025-06-18
   * @changes Traslado desde widget ppal (searchSIEC)
   */ 
   
  export interface LabelItem {
    label: string;
    description: string;
    color: `rgba(${number}, ${number}, ${number}, ${number})` | string;
    tituloGrafico: string;
  }