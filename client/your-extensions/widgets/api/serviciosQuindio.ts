const urls = {

  SERVICIO_GEOMETRIA      : "https://sigquindio.gov.co/arcgis/rest/services/Utilities/Geometry/GeometryServer",
  //SERVICIO_GEOMETRIA      : "https://sigquindio.gov.co/arcgis/rest/services/Utilities/Geometry/GeometryServer",
  SERVICIO_SOCIOECONOMICO : "https://sigquindio.gov.co/arcgis/rest/services/QUINDIO_III/Socioeconomico_T/MapServer",
  SERVICIO_AMBIENTAL  : "https://pruebassig.igac.gov.co/server/rest/services/SIG_QUINDIO/Ambiental/MapServer",
  SERVICIO_AMBIENTAL_ALFANUMERICO : "https://pruebassig.igac.gov.co/server/rest/services/SIG_QUINDIO/Ambiental_Alfanumerico/MapServer",
  // SERVICIO_EDUCACION              : "https://sigquindio.gov.co/arcgis/rest/services/QUINDIO_III/Educacion_T/MapServer",
  SERVICIO_EDUCACION              : "https://pruebassig.igac.gov.co/server/rest/services/SIG_QUINDIO/Eduacion/MapServer",
  SERVICIO_EDUCACION_ALFANUMERICO : "https://pruebassig.igac.gov.co/server/rest/services/SIG_QUINDIO/Educacion_Alfanumerico/MapServer",
  SERVICIO_SALUD                  : "https://pruebassig.igac.gov.co/server/rest/services/SIG_QUINDIO/Salud/MapServer",
  SERVICIO_GENERAL_SALUD          : "https://sigquindio.gov.co/arcgis/rest/services/QUINDIO_III/Salud_T/MapServer",
  SERVICIO_SALUD_ALFANUMERICO     : "https://pruebassig.igac.gov.co/server/rest/services/SIG_QUINDIO/Salud_Alfanumerico/MapServer",
  SERVICIO_CULTURA_TURISMO        : "https://pruebassig.igac.gov.co/server/rest/services/SIG_QUINDIO/Cultura_y_turismo/MapServer",
  SERVICIO_CULTURA_TURISMO_ALFANUMERICO : "https://pruebassig.igac.gov.co/server/rest/services/SIG_QUINDIO/Cultura_y_Turismo_Alfanumerico/MapServer/0",
  SERVICIO_ORDENAMIENTO_TERRITORIAL : "https://pruebassig.igac.gov.co/server/rest/services/SIG_QUINDIO/Ordenamiento_territorial/MapServer",
  SERVICIO_INDUSTRIA_COMERCIO     : "https://pruebassig.igac.gov.co/server/rest/services/SIG_QUINDIO/Industria_y_comercio_Alfanumerico/MapServer",

  // URLs deprecadas, se mantienen para casos de emergencia
  OLD_SERVICIO_SALUD              : "https://sigquindio.gov.co/arcgis/rest/services/QUINDIO_III/Salud_T/MapServer",
  OLD_SERVICIO_SALUD_ALFANUMERICO : "https://sigquindio.gov.co/arcgis/rest/services/QUINDIO_III/SaludAlfanumerico/MapServer",

  //SERVICIO_RIESGO :> SERVICIO_RIESGO_CONSULTA en ambiente productivo

  // ** Falla y se desconoce su uso (Octubre2019)
  //URL_ARCHIVOS_QUINDIO : "http://181.57.208.251/ArchivosQuindioII/",
  //URL_ARCHIVOS_QUINDIO : "http://181.57.208.251/ArchivosQuindioII/",
  URL_ARCHIVOS_QUINDIO : "https://sigquindio.gov.co/ArchivosQuindioIII/",
  SERVICIO_CONSULTA_AVANZADA_ALFANUMERICA : "https://sigquindio.gov.co/arcgis/rest/services/QUINDIO_III/Consulta_Avanzada_Alfanumerica/MapServer",
  SERVICIO_RIESGO_CONSULTA : "https://pruebassig.igac.gov.co/server/rest/services/SIG_QUINDIO/Gestion_del_riesgo/MapServer",
  SERVICIO_OTA_ALFANUMERICO   : "https://sigquindio.gov.co/arcgis/rest/services/QUINDIO_III/OTAlfanumerico/MapServer",
  SERVICIO_CATASTRO_NUEVO     : "https://sigquindio.gov.co/arcgis/rest/services/QUINDIO_III/Catastro_Nuevo1/MapServer",
  SERVICIO_TABLA_CONTENIDO_RIESGOS : "https://sigquindio.gov.co:8443/ADMINSERV/AdminGeoApplication/AdminGeoWebServices/getTablaContenidoJsTree/riesgos",
  SERVICIO_AGROPECUARIO       : "https://sigquindio.gov.co/arcgis/rest/services/QUINDIO_III/AgropecuarioAlfanumerico/MapServer",
  SERVICIO_CUENCALAVIEJA      : "https://sigquindio.gov.co/arcgis/rest/services/QUINDIO_III/CuencaLaVieja/MapServer",
  SERVICIO_TABLA_CONTENIDO    : "https://sigquindio.gov.co:8443/ADMINSERV/AdminGeoApplication/AdminGeoWebServices/getTablaContenidoJsTree/public",
  SERVICIO_PIA                : "https://sigquindio.gov.co/arcgis/rest/services/QUINDIO_III/IndicadoresInfanciayAdolescencia/MapServer",
  SERVICIO_MDE                : "https://sigquindio.gov.co/arcgis/rest/services/QUINDIO_III/MDE/ImageServer",
  //OJO: IP desconocida (IP Publica Pruebas en su momento)
  SERVICIO_MDS                : "http://132.255.20.184:6080/arcgis/rest/services/QUINDIO_III/hilshade/ImageServer",
  SERVICIO_BANCO_SERVICIOS    : "https://sigquindio.gov.co:8443/ADMINSERV/AdminGeoApplication/AdminGeoWebServices/getDirectorioWFS",
  SERVICIO_SHAPEFILE : "https://sigquindio.gov.co/arcgis/rest/services/QUINDIO_III/ExportJsonToShape/GPServer/ExportJsonToShape/submitJob",
  AmbientalAlfanumerico: {
    BASE: 'https://pruebassig.igac.gov.co/server/rest/services/SIG_QUINDIO/Ambiental_Alfanumerico/MapServer',
    TRAMITESAMBPUNTO: 10, // Tramites ambientales
    TRAMITESCATASTRO: 8, // Tramites ambientales predios
    V_CALAIREESTMUN: 4,// Calidad del aire - Estacion - Municipio
    V_CALAAGUAAFLUMUN: 0, // Calidad del agua -
    V_PREDIOREFORESTACION: 7 // Predios de reforestación
  },
  Ambiental_T2025: {
    BASE: 'https://sigquindio.gov.co/arcgis/rest/services/QUINDIO_III/Ambiental_T2025/MapServer',
    Estaciones_climaticas: 69
  },
  Ambiental_T_Ajustado: {
    BASE: 'https://sigquindio.gov.co/arcgis/rest/services/QUINDIO_III/Ambiental_T_Ajustado/MapServer',
    Estaciones_limnigraficas: 68
  },
  CARTOGRAFIA: {
    BASE: 'https://sigquindio.gov.co/arcgis/rest/services/QUINDIO_III/CartografiaBasica/MapServer',
    // BASE: 'https://pruebassig.igac.gov.co/server/rest/services/SIG_QUINDIO/Cartografia_basica/MapServer',
    MUNICIPIOS: 75,
  },
  /*
  * Instrumentos de monitoreo ambiental
  * 20260320
  */
  Ambiental: {
    BASE: 'https://pruebassig.igac.gov.co/server/rest/services/SIG_QUINDIO/Ambiental/MapServer',
    Estaciones_limnigraficas: 34,
    Estaciones_climaticas: 35,
    Monitoreo_calidad_aire: 36,
    Monitoreo_calidad_agua: 37,
  },
  CuencaLaVieja:{
    BASE: 'https://sigquindio.gov.co/arcgis/rest/services/QUINDIO_III/CuencaLaVieja/MapServer',
    Cuenca_hidrografica: 45,
    Suelos: 54
  },
  DemandaRecursosNaturales: {
    BASE: 'https://pruebassig.igac.gov.co/server/rest/services/SIG_QUINDIO/Ambiental/MapServer',
    _LAYERS: 'https://pruebassig.igac.gov.co/server/rest/services/SIG_QUINDIO/Ambiental/MapServer/layers?f=pjson',
    PARENT_ID: 10,
  }
}

export {
  urls
}