import { React, appActions } from "jimu-core";
import { Button } from "jimu-ui";

// @ts-expect-error
import "./style.css";
import {
  dataFuenteIndicadores,
  dataFuenteIndicadoresObjeto3Nuevos,
} from "./dataFormularioIndicadores";
import { loadModules } from "esri-loader";
import { validaLoggerLocalStorage } from "../../shared/utils/export.utils";
const { useEffect, useState } = React;

const widgetIdIndicadores = "widget_48"; // se genera al ingresar al widget objetivo y generarlo en el effect de inicio con props.id

const initSelectIndicadores = {
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
};

const initLastLayerDeployed = {
  graphics: [] as any[],
  graphicsLayers: [] as any[],
};
const initIndiSelected = {
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
};

/**
 * @dateUpdated 2025-10-16
 * @changes Asignación estado para conservar la URL del servicio Nacional.
 * @dateUpdated 2025-10-23
 * @changes Asignación estado para conservar criterio de selección asociado a los indicadores 3.1.5, 3.1.6 y 3.1.7
 * @param {object} dispatch
 * @param {Array} departamentos
 * @param {object} jimuMapView
 * @remarks Widget del proyecto REFA
 */
const TabIndicadores: React.FC<any> = ({
  dispatch,
  departamentos,
  jimuMapView,
}) => {
  const [constantes, setConstantes] = useState<InterfaceConstantes | null>(
    null,
  );
  const [widgetModules, setWidgetModules] = useState(undefined);
  const [servicios, setServicios] = useState(undefined);
  const [utilsModule, setUtilsModule] = useState(undefined);
  const [lastLayerDeployed, setLastLayerDeployed] = useState(
    initLastLayerDeployed,
  );
  const [mensajeModal, setMensajeModal] = useState({
    deployed: false,
    type: typeMSM.info,
    tittle: "",
    body: "",
    subBody: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [clickHandler, setClickHandler] = useState(null); // Estado para almacenar el manejador del evento click y capturar las geometrias seleccionadas con un click
  const [poligonoSeleccionado, setPoligonoSeleccionado] = useState<inter_poligonoSeleccionado | undefined>(undefined);
  const [geometriaMunicipios, setGeometriaMunicipios] = useState<{ features: typeGeometria[] } | undefined>(undefined);
  const [geometriasDepartamentos, setGeometriasDepartamentos] = useState<interfa_geometriasDepartamentos | undefined>(undefined);
  const [apuestaEstrategica, setApuestaEstrategica] = useState<interf_SUBSISTEMA | undefined>(undefined);
  const [selectApuestaEstategica, setSelectApuestaEstategica] = useState<interf_APUESTA_ESTRATEGICA | undefined>(undefined);
  const [selectCategoriaTematica, setSelectCategoriaTematica] = useState<CategoriaTematica | undefined>(undefined);
  const [indicadores, setIndicadores] = useState<interfa_indicadores[] | null>(null);
  const [selectIndicadores, setSelectIndicadores] = useState<InitSelectIndicadores | InterfaceIndiSelected>(initSelectIndicadores);
  const [departmentSelect, setDepartmentSelect] = useState<interfa_itemSelected | undefined>(undefined);
  const [municipios, setMunicipios] = useState<Array<{ value: any; [key: string]: any }>>([]);
  const [municipioSelect, setMunicipioSelect] = useState<{ [key: string]: any; value: any } | undefined>(undefined);
  const [rangosLeyenda, setRangosLeyenda] = useState([]);
  const [esriModules, setEsriModules] = useState<inter_EsriModules | undefined>(undefined);
  const [esIndicador, setEsIndicador] = useState("");
  //Estado para conservar la URL del servicio Nacional
  const [urlIndGetData, setUrlIndGetData] = useState(undefined);
  //Estado para conservar el criterio where, para los indicadores 3.1.5, 3.1.6 y 3.1.7
  const [whereIndica, setWhereIndica] = useState(undefined);
  //Estados para el flujo de filtros jerárquicos de nuevos indicadores (objeto value=3)
  const [categoriaTematicaNueva, setCategoriaTematicaNueva] = useState<NuevoFiltroCategoria | undefined>(undefined);
  const [areaAdministrativaNueva, setAreaAdministrativaNueva] = useState<NuevoFiltroAreaAdministrativa | undefined>(undefined);
  const [areaEstudioNueva, setAreaEstudioNueva] = useState<NuevoFiltroAreaEstudio | undefined>(undefined);
  const [indicadorNuevoSeleccionado, setIndicadorNuevoSeleccionado] = useState<NuevoFiltroIndicador | undefined>(undefined);

  // 2. Función de utilidad común
  const resetCommonState = () => {
    if (validaLoggerLocalStorage("logger")) console.log("Resetting common state...");
    setMunicipios([]);
    setRangosLeyenda([]);
  };

  /**
   * @description Restablece el estado de selección para el nuevo flujo jerárquico del objeto 3.
   */
  const resetNuevoFlujoIndicadores = () => {
    if (validaLoggerLocalStorage("logger")) console.log("Resetting new flow indicators state...");
    setCategoriaTematicaNueva(undefined);
    setAreaAdministrativaNueva(undefined);
    setAreaEstudioNueva(undefined);
    setIndicadorNuevoSeleccionado(undefined);
  };

  // 3. Función para manejar selección de subsistema
  const handleSubsistemaSelected = ({ target }: SelectionTarget) => {
    if (validaLoggerLocalStorage("logger")) console.log("Handling subsistema selection...", { target });
    clearGraphigs();
    setSelectApuestaEstategica(undefined);
    setSelectCategoriaTematica(undefined);
    setSelectIndicadores(initSelectIndicadores);
    // resetNuevoFlujoIndicadores();

    const findSubSistema = dataFuenteIndicadores.find((e) => e.value === target.value,);
    utilsModule?.logger() && console.log(findSubSistema);

    setApuestaEstrategica(findSubSistema);
    setIndicadores(null);
    resetCommonState();
  };

  // 4. Función para manejar selección de apuesta estratégica
  const handleApuestaEstrategicaSelected = ({ target }: SelectionTarget) => {
    if (validaLoggerLocalStorage("logger")) console.log("Handling apuesta estratégica selection...", { target });
    clearGraphigs();
    setSelectCategoriaTematica(undefined);
    setSelectIndicadores(initSelectIndicadores);
    resetNuevoFlujoIndicadores();
    resetCommonState();

    const APUESTA_ESTRATEGICA = apuestaEstrategica?.APUESTA_ESTRATEGICA.find(
      (e) => e.value === target.value,
    );
    utilsModule?.logger() &&
      console.log("APUESTA_ESTRATEGICA", {
        APUESTA_ESTRATEGICA,
        value: target.value
      });

    setSelectApuestaEstategica(APUESTA_ESTRATEGICA);

    const hasSingleEmptyCategory =
      APUESTA_ESTRATEGICA?.CATEGORIA_TEMATICA.length === 1 &&
      APUESTA_ESTRATEGICA.CATEGORIA_TEMATICA[0].label === "";

    setIndicadores(
      hasSingleEmptyCategory
        ? APUESTA_ESTRATEGICA.CATEGORIA_TEMATICA[0].INDICADOR
        : null
    );
  };

  // 5. Función para manejar selección de categoría temática
  const handleCategoriaTematicaSelected = ({ target }: SelectionTarget) => {
    setSelectIndicadores(initSelectIndicadores);
    // resetNuevoFlujoIndicadores();
    resetCommonState();

    const CATEGORIA_TEMATICA = selectApuestaEstategica?.CATEGORIA_TEMATICA.find((e) => e.value === target.value)
    if (validaLoggerLocalStorage("logger")) console.log({ value: target.value, CATEGORIA_TEMATICA, selectApuestaEstategica });

    setIndicadores(CATEGORIA_TEMATICA?.INDICADOR ?? null);
    setSelectCategoriaTematica(CATEGORIA_TEMATICA);
    setIsLoading(false);
  };

  /**
   * @description Maneja el FILTRO 3 (Categoría temática) del nuevo flujo jerárquico.
   */
  const handleCategoriaTematicaNuevaSelected = ({
    target,
  }: SelectionTarget) => {
    const categoria = dataFuenteIndicadoresObjeto3Nuevos.find((item) => item.value === target.value);
    if (validaLoggerLocalStorage("logger")) console.log("handleCategoriaTematicaNuevaSelected:", {
        categoria,
        target,
        dataFuenteIndicadoresObjeto3Nuevos
      });
    setCategoriaTematicaNueva(categoria);
    setAreaAdministrativaNueva(undefined);
    setAreaEstudioNueva(undefined);
    setIndicadorNuevoSeleccionado(undefined);
    clearGraphigs();
    setSelectIndicadores(initSelectIndicadores);
    resetCommonState();

  };

  /**
   * @description Maneja el FILTRO 4 (Área administrativa) del nuevo flujo jerárquico.
   */
  const handleAreaAdministrativaNuevaSelected = ({
    target,
  }: SelectionTarget) => {
    const areaAdmin = categoriaTematicaNueva?.AREAS_ADMINISTRATIVAS.find((item) => item.value === target.value);
    if (validaLoggerLocalStorage("logger")) console.log("handleAreaAdministrativaNuevaSelected:", {
        areaAdmin,
        target,
        categoriaTematicaNueva
      });
    setAreaAdministrativaNueva(areaAdmin);
    setAreaEstudioNueva(undefined);
    setIndicadorNuevoSeleccionado(undefined);
    clearGraphigs();
    setSelectIndicadores(initSelectIndicadores);
    resetCommonState();
  };

  /**
   * @description Maneja el FILTRO 5 (Área de estudio) del nuevo flujo jerárquico.
   */
  const handleAreaEstudioNuevaSelected = ({ target }: SelectionTarget) => {
    const areaEstudio = areaAdministrativaNueva?.AREAS_ESTUDIO.find((item) => item.value === target.value);
    if (validaLoggerLocalStorage("logger")) console.log("handleAreaEstudioNuevaSelected:", { areaEstudio, target, areaAdministrativaNueva });
    setAreaEstudioNueva(areaEstudio);
    setIndicadorNuevoSeleccionado(undefined);
    clearGraphigs();
    setSelectIndicadores(initSelectIndicadores);
    resetCommonState();
    if (target.value === "distribucion_de_la_tierra") {
      handleCategoriaTematicaSelected({ target: { value: 0 } });
    }
  };

  /**
   * @description Normaliza texto para facilitar comparación entre labels y nombres de campos.
   */
  const normalizarTexto = (texto: string = ""): string => {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  /**
   * @description Detecta de forma heurística el campo de valor a representar en coroplético.
   */
  const resolverCampoValorNuevoIndicador = (
    indicadorLabel: string,
    attributes: Record<string, any>
  ): string => {
    const claves = Object.keys(attributes || {});
    const normalizadas = claves.map((key) => ({
      key,
      norm: normalizarTexto(key)
    }));
    const labelNorm = normalizarTexto(indicadorLabel);

    const reglas: Array<{ include: string[]; keys: string[] }> = [
      { include: ["microfundio"], keys: ["microfundio", "microfundi"] },
      { include: ["minifundio"], keys: ["minifundio"] },
      { include: ["pequena", "pequeña"], keys: ["pequena", "pequena"] },
      { include: ["mediana"], keys: ["mediana"] },
      { include: ["latifundio"], keys: ["latifundio"] },
      { include: ["gini"], keys: ["gini"] },
      { include: ["disparidad"], keys: ["disparidad"] },
      { include: ["copropiedad"], keys: ["coprop", "copropiedad"] },
      { include: ["mujeres"], keys: ["mujer"] },
      { include: ["agropecuario"], keys: ["agropecuario"] },
      {
        include: ["area promedio", "área promedio"],
        keys: ["area", "promedio"]
      },
      {
        include: [
          "vocacion",
          "vocación",
          "conflicto",
          "cobertura",
          "oferta",
          "restricciones",
        ],
        keys: ["area_ha", "areaha"]
      },
    ];
    if (validaLoggerLocalStorage("logger")) console.log("resolverCampoValorNuevoIndicador:", {
        indicadorLabel,
        attributes,
        claves,
        normalizadas,
        labelNorm,
      });

    for (const regla of reglas) {
      if (
        !regla.include.some((token) =>
          labelNorm.includes(normalizarTexto(token)),
        )
      ) {
        continue;
      }
      const match = normalizadas.find((item) =>
        regla.keys.some((candidate) =>
          item.norm.includes(normalizarTexto(candidate)),
        ),
      );
      if (match) return match.key;
    }

    const clavesIgnoradas = [
      "objectid",
      "depto",
      "departamen",
      "cod",
      "codi",
      "codt",
      "codn",
      "mpcodigo",
      "mpnombre",
      "nommun",
      "shape__area",
      "shape__length",
      "area",
      "nombre_mun",
      "nombre_dpto",
      "municipio",
      "cod_dpto",
      "inpoly_fid",
      "maxsimptol",
      "minsimpltol",
      "path",
      "layer",
      "clasifica",
    ];

    const candidatoNumerico = claves.find((key) => {
      const norm = normalizarTexto(key);
      if (clavesIgnoradas.some((ignored) => norm === ignored)) return false;
      const value = attributes[key];
      return typeof value === "number";
    });

    return candidatoNumerico || "";
  };

  /**
   * @description Homologa atributos de código y nombre para facilitar popup y trazado.
   */
  const normalizarAtributosNuevoIndicador = (
    attributes: Record<string, any>,
  ) => {
    const mpcodigo =
      attributes.mpcodigo ||
      attributes.MpCodigo ||
      attributes.CODT ||
      attributes.MUNICIPIO;
    const decodigo =
      attributes.decodigo ||
      attributes.cod_departamento ||
      attributes.COD ||
      attributes.COD_DPTO ||
      attributes.Codi;
    const mpnombre =
      attributes.mpnombre ||
      attributes.MpNombre ||
      attributes.NOMBRE_MUN ||
      attributes.NomMun;
    const departamento =
      attributes.departamento ||
      attributes.Departamento ||
      attributes.DEPARTAMEN ||
      attributes.NOMBRE_DPTO ||
      attributes.Depto;
    if (validaLoggerLocalStorage("logger")) console.log("normalizarAtributosNuevoIndicador:", {
        attributes,
        mpcodigo,
        decodigo,
        mpnombre,
        departamento,
      });
    return {
      ...attributes,
      ...(mpcodigo ? { mpcodigo: `${mpcodigo}` } : {}),
      ...(decodigo ? { decodigo: `${decodigo}` } : {}),
      ...(mpnombre ? { mpnombre } : {}),
      ...(departamento ? { departamento } : {}),
    };
  };

  /**
   * @description Renderiza un nuevo indicador basado en el flujo jerárquico del objeto 3.
   */
  const handleIndicadorNuevoSelected = async ({ target }: SelectionTarget) => {
    if (target.value === "3_1_1_gini_propiedad") {
      target.value = 1
      handleIndicadorSelected({target});
      return;
    }else if (target.value === "3_1_2_ids") {
      target.value = 2
      handleIndicadorSelected({target});
      return;
    }else if (target.value === "3_1_3_predios_uaf_minima") {
      target.value = 3
      handleIndicadorSelected({target});
      return;
    }
    const indicador = areaEstudioNueva?.INDICADORES.find(
      (item) => item.value === target.value,
    );
    if (validaLoggerLocalStorage("logger")) console.log("handleIndicadorNuevoSelected:", {
        indicador,
        areaEstudioNueva,
        target,
      });
    if ( !indicador || !servicios?.urls?.indicadoresObjeto3Nuevos || !utilsModule || !esriModules ) { return; }

    const serviceBase =
      servicios.urls.indicadoresObjeto3Nuevos[indicador.serviceKey];
    if (!serviceBase) {
      setMensajeModal({
        deployed: true,
        type: typeMSM.warning,
        tittle: "Info",
        body: "No se encontró URL para el indicador seleccionado",
        subBody: "",
      });
      return;
    }

    setIndicadorNuevoSeleccionado(indicador);
    setIsLoading(true);
    clearGraphigs();
    setDepartmentSelect(undefined);
    setMunicipioSelect(undefined);
    setMunicipios([]);

    const queryUrl = `${serviceBase}/${indicador.layerId}/query`;
    const responseIndicador = await utilsModule.realizarConsulta({
      url: queryUrl,
      where: "1=1",
      returnGeometry: true,
      outFields: "*",
    });

    if (!responseIndicador?.features?.length) {
      setMensajeModal({
        deployed: true,
        type: typeMSM.warning,
        tittle: "Info",
        body: "Sin información para el indicador seleccionado",
        subBody: "",
      });
      setIsLoading(false);
      return;
    }

    const firstAttributes = responseIndicador.features[0]?.attributes || {};
    const fieldValueToSetRangeCoropletico = resolverCampoValorNuevoIndicador(
      indicador.label,
      firstAttributes,
    );
    if (!fieldValueToSetRangeCoropletico) {
      setMensajeModal({
        deployed: true,
        type: typeMSM.error,
        tittle: "Error",
        body: "No fue posible determinar el campo de valor del indicador",
        subBody: "",
      });
      setIsLoading(false);
      return;
    }

    const featuresNormalizados = responseIndicador.features.map(
      (feature: any) => ({
        ...feature,
        attributes: normalizarAtributosNuevoIndicador(feature.attributes || {}),
      }),
    );

    const indicadorCompat = {
      ...initIndiSelected,
      value: 9999,
      label: indicador.label,
      descripcion: indicador.label,
      fieldValue: fieldValueToSetRangeCoropletico,
      fieldValueNal: fieldValueToSetRangeCoropletico,
      fieldValueDepartal: fieldValueToSetRangeCoropletico,
      quintiles: [] as Array<Array<number | string>>,
    };

    setSelectIndicadores(indicadorCompat);
    setEsIndicador("Nuevo");

    const { SimpleFillSymbol, Polygon, Graphic, GraphicsLayer } = esriModules;
    utilsModule.dibujarPoligono({
      features: featuresNormalizados,
      jimuMapView,
      fieldValueToSetRangeCoropletico,
      lastLayerDeployed,
      Polygon,
      Graphic,
      GraphicsLayer,
      SimpleFillSymbol,
      setPoligonoSeleccionado,
      setClickHandler,
      setRangosLeyenda,
      setLastLayerDeployed,
      setIsLoading,
      indiSelected: indicadorCompat,
    });

    const dataToRender = JSON.stringify({
      nacional: {
        dataAlfanumericaNal: [],
        indiSelected: indicadorCompat,
        regionSeleccionada: areaAdministrativaNueva?.label || "Nacional",
      },
    });
    dispatch(
      appActions.widgetStatePropChange(
        widgetIdIndicadores,
        "dataFromDispatch",
        dataToRender,
      ),
    );
    setIsLoading(false);
  };

  // Maneja el indicadores seleccionado a nivel nacional

  const handleIndicadorSelected = async ({ target }: HandleIndicadorParams) => {
    if (validaLoggerLocalStorage("logger")) console.log("handleIndicadorSelected:", { target, dataFuenteIndicadoresObjeto3Nuevos, selectIndicadores, geometriasDepartamentos, geometriaMunicipios });
    // 1. Inicialización del estado
    resetSelectionState();

    // 2. Obtener indicador seleccionado
    const indiSelected = getSelectedIndicator(target.value);

    // 3. Obtener geometrías departamentales si no existen
    const geometriasDepartamentales = await getDepartamentalGeometries();

    // 4. Determinar configuración basada en el indicador
    const indicatorConfig = getIndicatorConfig(
      indiSelected,
      geometriasDepartamentales,
    );

    // 5. Actualizar estado con la configuración
    updateStateWithConfig(indiSelected, indicatorConfig);

    // 6. Procesar el indicador sin setTimeout
    await handleIndicadorSelectedContinua({
      indiSelected,
      target,
      _esIndicador: indicatorConfig._esIndicador,
      geometrias: indicatorConfig.geometrias,
      urlIndicadorToGetData: indicatorConfig.urlIndicadorToGetData,
      outStatistics: indicatorConfig.outStatistics,
      fieldValueToSetRangeCoropletico:
        indicatorConfig.fieldValueToSetRangeCoropletico,
      regionSeleccionada: "Nacional",
    });
  };

  // Funciones auxiliares handleIndicadorSelected:

  const resetSelectionState = () => {
    setIsLoading(true);
    setDepartmentSelect(undefined);
    setRangosLeyenda([]);
    setMunicipios([]); // Deshabilitar campo municipio
  };

  const getSelectedIndicator = (
    value: string | number,
  ): InterfaceIndiSelected => {
    if (validaLoggerLocalStorage("logger")) console.log("getSelectedIndicator:", { value, indicadores });
    return (
      (indicadores?.find((e) => e.value === value) as InterfaceIndiSelected) ||
      initIndiSelected
    );
  };

  const getDepartamentalGeometries = async () => {
    if (validaLoggerLocalStorage("logger")) console.log("getDepartamentalGeometries:");
    if (!geometriasDepartamentos) {
      const geometrias = await utilsModule?.realizarConsulta({
        url: `${servicios?.urls.Departamentos}/query`,
        returnGeometry: true,
      });
      setGeometriasDepartamentos(geometrias);
      if (validaLoggerLocalStorage("logger")) console.log("Departamental geometries fetched:", { geometrias });
      return geometrias;
    }
    if (validaLoggerLocalStorage("logger")) console.log("Departamental geometries already available:", {
        geometriasDepartamentos,
      });
    return geometriasDepartamentos;
  };

  /**
   * @param indiSelected
   * @param geometriasDepartamentales
   * @dateUpdated 2025-10-15
   * @changes Inclusión validadores alusivos a los indicadores 3.1.5, 3.1.6 y 3.1.7
   * @changes Actualización atributo stasticype "sum" => "avg"
   * @changes Actualización atributo outStatisticFieldName "Total" => "Promedio"
   * @returns {object}
   */
  const getIndicatorConfig = (
    indiSelected: InterfaceIndiSelected,
    geometriasDepartamentales: any,
  ): IndicatorConfig => {
    const baseConfig = {
      _esIndicador: "Nacional",
      geometrias: geometriaMunicipios,
      urlIndicadorToGetData:
        servicios?.urls.indicadoresNaci[indiSelected?.urlNal],
      outStatistics: "",
      fieldValueToSetRangeCoropletico: indiSelected?.fieldValueNal,
    };
    let statisticOper;
    let outStatisticFldTit: string = "";
    if (validaLoggerLocalStorage("logger")) console.log("getIndicatorConfig:", {
        indiSelected,
        geometriasDepartamentales,
        baseConfig,
      });
    //Validadores inclusión indicadores 3.1.5, 3.1.6 y 3.1.7.
    if (
      indiSelected.label.includes("1.7.") ||
      indiSelected?.label.includes("3.1.5") ||
      indiSelected?.label.includes("3.1.6") ||
      indiSelected?.label.includes("3.1.7")
    ) {
      return {
        ...baseConfig,
        _esIndicador: "es=1.7.",
        geometrias: geometriasDepartamentales,
        urlIndicadorToGetData:
          servicios?.urls.indicadoresDepartal[indiSelected.urlDepartal],
        fieldValueToSetRangeCoropletico: indiSelected.fieldValueDepartal,
      };
    }

    if (
      indiSelected.label.includes("3.1.1") ||
      indiSelected.label.includes("3.1.2")
    ) {
      return {
        ...baseConfig,
        urlIndicadorToGetData: servicios?.urls.indicadores[indiSelected.url],
      };
    }

    //Validador para establecer tipo de operación en el gráfico de indicadores (promedio o totalizador)
    if (
      indiSelected?.label.includes("3.1.5") ||
      indiSelected?.label.includes("3.1.6") ||
      indiSelected?.label.includes("3.1.7")
    ) {
      statisticOper = "avg";
      outStatisticFldTit = "Promedio";
    } else {
      statisticOper = "sum";
      outStatisticFldTit = "total";
    }
    return {
      ...baseConfig,
      outStatistics: JSON.stringify([
        {
          statisticType: statisticOper,
          onStatisticField: indiSelected.fieldValueNal,
          outStatisticFieldName: outStatisticFldTit,
        },
      ]),
      fieldValueToSetRangeCoropletico: "total",
    };
  };

  const updateStateWithConfig = (
    indiSelected: InterfaceIndiSelected,
    config: IndicatorConfig,
  ) => {
    if (validaLoggerLocalStorage("logger")) console.log("updateStateWithConfig:", { indiSelected, config });
    setSelectIndicadores(indiSelected);
    setEsIndicador(
      config._esIndicador === "es=1.7." ? "Departamental" : "Nacional",
    );
  };

  // END Funciones auxiliares handleIndicadorSelected:
  /**
   * @dateUpdated 2025-10-15
   * @changes Implementación criterios de selección para indicadores 3.1.5. 3.1.6 y 3.1.7.
   * @dateUpdated 2025-10-16
   * @changes Fix bug despliegue validador "El indicador seleccionado no presenta servicio nacional"
   * @dateUpdated 2025-10-23
   * @changes Asignación al state whereIndica para indicadores 3.1.5. 3.1.6 y 3.1.7.
   * @changes Actualización título widget Indicadores, con el correspondiente a la región seleccionada [Nacional, Departamental]
   * @param param0
   * @returns {object}
   */
  const handleIndicadorSelectedContinua = async ({
    _where = "1=1",
    indiSelected,
    target,
    _esIndicador,
    geometrias,
    urlIndicadorToGetData,
    outStatistics = "",
    fieldValueToSetRangeCoropletico,
    regionSeleccionada = "",
  }: {
    _where?: string;
    indiSelected: IndicadorSeleccionado;
    target: any;
    _esIndicador: string;
    geometrias: any;
    urlIndicadorToGetData: any;
    outStatistics?: string;
    fieldValueToSetRangeCoropletico: string;
    regionSeleccionada?: string;
  }) => {
    if (!esriModules) {
      console.error("Esri modules are not loaded.");
      return;
    }
    const { SimpleFillSymbol, Polygon, Graphic, GraphicsLayer } = esriModules;
    const [geometryEngine] = await loadModules([
      "esri/geometry/geometryEngine",
    ]);
    let responseIndicador: any = null;

    //Indicador 3.1.5.
    if (indiSelected?.label.includes("3.1.5")) {
      if (typeof urlIndicadorToGetData === "undefined") {
        urlIndicadorToGetData = urlIndGetData;
      }
      //Actualización título gráfico, según la región seleccionada
      if (
        regionSeleccionada === "Nacional" &&
        indiSelected.descripcion.includes("departamental")
      ) {
        indiSelected.descripcion = indiSelected.descripcion.replace(
          "departamental",
          regionSeleccionada,
        );
      } else {
        indiSelected.descripcion = indiSelected.descripcion.replace(
          "Nacional",
          regionSeleccionada,
        );
      }
      //Sección depuración
      if (validaLoggerLocalStorage("logger")) console.log("Test => url servicio =>", urlIndicadorToGetData);
      //Procesamiento where
      /*  if (_where.includes ("mpcodigo")){
        _where                = undefined;
      } */
      //Nivel nal
      if (_where === "1=1" || typeof _where === "undefined") {
        _where = "destino='PRP'" + " " + "AND" + " " + "anio_vigencia=2024";
        if (validaLoggerLocalStorage("logger")) console.log("Test => Criterio where =>", _where);
        setWhereIndica(_where);
      }
    }

    //Indicador 3.1.6.
    if (indiSelected?.label.includes("3.1.6")) {
      if (typeof urlIndicadorToGetData === "undefined") {
        urlIndicadorToGetData = urlIndGetData;
      }
      //Actualización título gráfico, según la región seleccionada
      if (
        regionSeleccionada === "Nacional" &&
        indiSelected.descripcion.includes("departamental")
      ) {
        indiSelected.descripcion = indiSelected.descripcion.replace(
          "departamental",
          regionSeleccionada,
        );
      } else {
        indiSelected.descripcion = indiSelected.descripcion.replace(
          "Nacional",
          regionSeleccionada,
        );
      }
      //Sección depuración
      if (validaLoggerLocalStorage("logger")) console.log("Test => url servicio =>", urlIndicadorToGetData);
      //Procesamiento where
      if (typeof _where !== "undefined") {
        if (_where.includes("mpcodigo")) {
          _where = undefined;
        }
      }
      //Nivel nal
      if (_where === "1=1" || typeof _where === "undefined") {
        _where = "destino='PRPFA'" + " " + "AND" + " " + "anio_vigencia=2024";
        outStatistics = "";
        if (validaLoggerLocalStorage("logger")) console.log("Test => Criterio where =>", _where);
        setWhereIndica(_where);
      }
    }

    //Indicador 3.1.7.
    if (indiSelected?.label.includes("3.1.7")) {
      //Sección depuración
      if (validaLoggerLocalStorage("logger")) console.log("Test => url servicio =>", urlIndicadorToGetData);
      if (typeof urlIndicadorToGetData === "undefined") {
        urlIndicadorToGetData = urlIndGetData;
      }
      //Actualización título gráfico, según la región seleccionada
      if (indiSelected.descripcion.includes("departamental")) {
        indiSelected.descripcion = indiSelected.descripcion.replace(
          "departamental",
          regionSeleccionada,
        );
      } else {
        indiSelected.descripcion = indiSelected.descripcion.replace(
          "Nacional",
          regionSeleccionada,
        );
      }
      //Procesamiento where
      if (typeof _where !== "undefined") {
        if (_where.includes("mpcodigo")) {
          _where = undefined;
        }
      }
      //Nivel nal
      if (_where === "1=1" || typeof _where === "undefined") {
        _where = "destino='PRPFADA'" + " " + "AND" + " " + "anio_vigencia=2024";
        outStatistics = "";
        if (validaLoggerLocalStorage("logger")) console.log("Test => Criterio where =>", _where);
        setWhereIndica(_where);
      }
    }

    if (!urlIndicadorToGetData) {
      setIsLoading(false);
      setMensajeModal({
        deployed: true,
        type: typeMSM.warning,
        tittle: "Info",
        body: "El indicador seleccionado no presenta servicio nacional",
        subBody: "",
      });
      if (utilsModule?.logger()) console.error({ urlIndicadorToGetData });
    } else {
      //Agrupamiento a nivel departamental
      //Indicadores 3.1.5., 3.1.6 y 3.1.7
      let groupByFieldsForStatistics = "mpcodigo";
      if (
        indiSelected?.label.includes("3.1.5") ||
        indiSelected?.label.includes("3.1.6") ||
        (indiSelected?.label.includes("3.1.7") && urlIndicadorToGetData !== "")
      ) {
        groupByFieldsForStatistics = "cod_departamento"
      }
      responseIndicador = await utilsModule?.realizarConsulta({
          url: urlIndicadorToGetData,
          where: _where,
          outStatistics: outStatistics,
          groupByFieldsForStatistics: groupByFieldsForStatistics,
        });
      if (
        !responseIndicador.features ||
        responseIndicador?.features.length < 1
      ) {
        if (utilsModule?.logger()) {
          console.error("Sin data en el responseIndicador => ", {
            responseIndicador,
            urlIndicadorToGetData,
            _where,
          });
        }
        setMensajeModal({
          deployed: true,
          type: typeMSM.warning,
          tittle: "Info",
          body: "Sin información nacional para el indicador seleccionado",
          subBody: "",
        });
        setIsLoading(false);
        return;
      }

      if (!geometrias) {
        try {
          geometrias = await obtenerGeometriasUnicas(responseIndicador);
          //console.log('Geometrías obtenidas:', geometrias);
        } catch (error) {
          console.error("Error:", error);
        }
      }

      if (regionSeleccionada !== "Municipal") clearGraphigs(); // Elimina las geometrias dibujadas previamente
      if (geometrias) {
        /** Extrae la geometria del servicio municipal q coinciden con el cod_municipio y fuciona los atributos del servicio de datos con la geometria*/
        const geometriasNoEncontradas: Array<{
          attributes: { mpcodigo: string };
        }> = [];
        responseIndicador = responseIndicador.features.map((RIN: any) => {
          let geom: typeGeometria | undefined | null;
          if (regionSeleccionada === "Municipal") {
            geom = geometrias?.features?.find(
              (GM: { attributes: { mpcodigo: any } }) =>
                GM.attributes.mpcodigo === RIN.attributes.mpcodigo,
            );
          } else if (_esIndicador === "es=1.7.") {
            // las geometrias que vienen desde el servicio departamental, solo traen los rings, mas no el exteny demas, en comparacion con el municipal
            geom = geometrias?.features?.find(
              (GM: { attributes: { decodigo: any } }) =>
                GM.attributes.decodigo === RIN.attributes.cod_departamento,
            );
          } else if (
            _esIndicador === "Nacional" ||
            _esIndicador === "Departamental"
          ) {
            const codMun = RIN.attributes.cod_municipio
              ? RIN.attributes.cod_municipio
              : RIN.attributes.mpcodigo
                ? RIN.attributes.mpcodigo
                : RIN.attributes.cod_departamento;
            if (!codMun) {
              console.error(
                "No se encontró el código del municipio en el atributo",
                { RIN },
              );
            }
            geom = geometrias?.features?.find(
              (GM: { attributes: { mpcodigo: any } }) =>
                GM.attributes.mpcodigo === codMun,
            );
            if (!geom) {
              // le apunta a traer geometria departamental
              geom = geometriasDepartamentos?.features?.find(
                (GM) => GM.attributes.decodigo === codMun,
              );
            }
            if (!geom) {
              console.error("No se encontró geometria", { RIN });
              geometriasNoEncontradas.push({
                attributes: {
                  mpcodigo: RIN.attributes.mpcodigo,
                },
              });
            }
          }
          return {
            attributes: { ...RIN.attributes, ...(geom?.attributes ?? {}) },
            geometry: geom?.geometry ?? null,
          };
        });
        if (geometriasNoEncontradas.length > 0) {
          geometrias = await obtenerGeometriasUnicas({
            features: geometriasNoEncontradas,
          });
          setMensajeModal({
            deployed: true,
            type: typeMSM.error,
            tittle: "GEOMETRIAS NO ENCONTRADAS",
            body: "Intentalo nuevamente",
            subBody: "",
          });
          setIsLoading(false);
          return;
        }
      } else {
        console.error("geometrias no definidas", { geometrias });
        setMensajeModal({
          deployed: true,
          type: typeMSM.error,
          tittle: "GEOMETRIAS NO ENCONTRADAS",
          body: "Recarga el visor o intentalo nuevamente",
          subBody: "",
        });
        setIsLoading(false);
        return;
      }
      if (_esIndicador === "Departamental") {
        await poblarMunicipios({
          features: responseIndicador,
          targetDepartment: target.value,
        });
      }

      if (
        responseIndicador.map((e: { geometry: any }) => e.geometry).length !==
        responseIndicador.length
      ) {
        setMensajeModal({
          deployed: true,
          type: typeMSM.error,
          tittle: "Sin geometrias",
          body: "Recarga el visor o intentalo mas tarde",
          subBody: "",
        });
        setIsLoading(false);
        return;
      }

      setTimeout(async () => {
        if (regionSeleccionada !== "Municipal") {
          utilsModule?.dibujarPoligono({
            features: responseIndicador,
            jimuMapView,
            fieldValueToSetRangeCoropletico,
            lastLayerDeployed,
            Polygon,
            Graphic,
            GraphicsLayer,
            SimpleFillSymbol,
            setPoligonoSeleccionado,
            setClickHandler,
            setRangosLeyenda,
            setLastLayerDeployed,
            setIsLoading,
            indiSelected,
          });
        }
        console.log("Test Criterio Where graph =>", _where);
        const dataToRenderGraphic = await getDataToRenderGraficosEstadisticos({
          indiSelected,
          _where,
          regionSeleccionada,
        }); // realiza las consultas teniendo encuenta el fieldLabel en el Output Statistics

        const DATASET = ajustarDATASET({
          dataToRenderGraphic: dataToRenderGraphic || [],
          regionSeleccionada,
          indiSelected,
        });
        //console.log({DATASET})

        // logica para ajustar el extend al departamento seleccionado
        let extentAjustado: GeographicExtent | undefined = undefined;
        if (
          regionSeleccionada === "Municipal" ||
          (_esIndicador === "Departamental" &&
            responseIndicador[0].geometry?.extent)
        ) {
          if (utilsModule?.logger()) {
            console.log({
              _esIndicador,
              dataToRenderGraphic,
              responseIndicador,
              geometryEngine,
            });
          }
          extentAjustado =
            responseIndicador.length === 1
              ? calculateExtent(responseIndicador[0].geometry.rings)
              : ajustarExtend({
                  dataToRenderGraphic,
                  responseIndicador,
                  geometryEngine,
                });
          //console.log({extentAjustado})
        } else if (
          _esIndicador === "es=1.7." &&
          regionSeleccionada === "Departamental"
        ) {
          extentAjustado = calculateExtent(responseIndicador[0].geometry.rings);
        }

        const dataToRender = JSON.stringify({
          nacional: {
            dataAlfanumericaNal: DATASET,
            indiSelected,
            regionSeleccionada,
            extentAjustado,
          },
        });
        dispatch(
          appActions.widgetStatePropChange(
            widgetIdIndicadores,
            "dataFromDispatch",
            dataToRender,
          ),
        );

        setIsLoading(false);
      }, 5000);
    }
  };

  /**
   * Obtiene geometrías únicas basadas en los mpcodigo de un responseIndicador
   * @param responseIndicador - Objeto con features que contienen atributos mpcodigo
   * @param utilsModule - Módulo con función realizarConsulta
   * @param servicios - Objeto con URLs de servicios
   * @returns Promise con las geometrías obtenidas
   */
  const obtenerGeometriasUnicas = async (
    responseIndicador: any,
  ): Promise<any> => {
    // 1. Extraer y filtrar códigos únicos
    const mpCodigos = responseIndicador.features.map(
      (feature: { attributes: { mpcodigo: any } }) =>
        feature.attributes.mpcodigo,
    );
    const codigosUnicos = [...new Set(mpCodigos)];

    // 2. Construir consulta WHERE optimizada
    // const whereClause = codigosUnicos.map(codigo => `mpcodigo='${codigo}'`).join(' or ');
    const whereClause = `mpcodigo IN (${codigosUnicos
      .map((c) => `'${c}'`)
      .join(",")})`;

    // 3. Realizar consulta
    try {
      const geometrias = await getGeometriasMunicipios({
        url: servicios ? servicios.urls.Municipios : "",
        where: whereClause,
      });

      return geometrias;
    } catch (error) {
      console.error("Error al obtener geometrías:", error);
      throw error;
    }
  };

  /**
   * Ajusta la data que sera enviada por el DATASET para renderizar las graficas de barras
   */

  const ajustarDATASET = ({
    dataToRenderGraphic = [],
    regionSeleccionada,
    indiSelected,
  }: AjustarDatasetParams): DatasetItem[] => {
    // 1. Función optimizada para procesar datos del gráfico
    const processChartData = (
      data: ChartData,
      labelKey: string,
      valueKey: string,
      sortKey?: string,
    ): ProcessedData => {
      const features = data.features || [];

      const sortedData = sortKey
        ? [...features].sort(
            (a, b) => a.attributes[sortKey] - b.attributes[sortKey],
          )
        : features;

      return {
        labels: sortedData.map(({ attributes }) => attributes[labelKey]),
        values: sortedData.map(({ attributes }) => attributes[valueKey]),
      };
    };

    // 2. Determinar la leyenda correcta una sola vez
    const leyenda =
      regionSeleccionada === "Nacional"
        ? indiSelected.leyendaNal
        : regionSeleccionada === "Municipal"
          ? indiSelected.leyenda
          : indiSelected.leyendaDepartal;

    // 3. Procesamiento optimizado con map y reducción de operaciones
    return dataToRenderGraphic.map((respuesta, index) => {
      if (!respuesta?.fields || respuesta.fields.length < 2) {
        console.warn("Datos de gráfico incompletos en el índice:", index);
        return { labels: [], datasets: [] };
      }

      const resp = processChartData(
        respuesta,
        respuesta.fields[0].name,
        respuesta.fields[1].name,
      );

      const colorRGBA = utilsModule?.getRandomRGBA() || {
        rgba: "rgba(100, 100, 100, 0.7)",
        valueRGBA: [100, 100, 100, 0.7],
      };

      return {
        labels: resp.labels,
        datasets: [
          {
            label: leyenda[index] || `Serie ${index + 1}`,
            data: resp.values,
            backgroundColor: colorRGBA.rgba,
            borderColor: `rgba(${colorRGBA.valueRGBA[0]}, ${colorRGBA.valueRGBA[1]}, ${colorRGBA.valueRGBA[2]}, 1)`,
            borderWidth: 2,
          },
        ],
      };
    });
  };

  const ajustarExtend = ({
    dataToRenderGraphic,
    responseIndicador,
    geometryEngine,
  }: {
    dataToRenderGraphic: any;
    responseIndicador: any;
    geometryEngine: any;
  }) => {
    if (!geometryEngine) {
      console.error("geometryEngine no está definido. Verificar importación.");
      return null; // Retorna un valor claro en caso de error
    }

    // Obtiene las geometrías de forma segura
    const geometriaFeatu = dataToRenderGraphic?.features || responseIndicador;
    if (!geometriaFeatu?.length) {
      console.warn("No se encontraron geometrías para procesar.");
      return null;
    }

    const geometriaDepto = geometriaFeatu.map(
      (feature: { geometry: any }) => feature.geometry,
    );
    if (!geometriaDepto.length) {
      console.warn(
        "No se encontraron geometrías válidas en los datos proporcionados.",
      );
      return null;
    }

    // Combina las geometrías en una sola
    //console.log({geometriaDepto}, geometriaDepto.length)
    if (geometriaDepto.length > 9) {
      console.warn(
        `Demasiadas geometrías ${geometriaDepto.length} para unir y generar el extend, por tiempos toma parte de las geometrias para generar extend y aplicarlo`,
      );
      geometriaDepto.splice(9);
      // return null;
    }

    const geometriaUnida = geometryEngine.union(geometriaDepto);
    if (!geometriaUnida) {
      console.warn("No se pudo unir las geometrías.");
      return null;
    }

    // Calcula y retorna el extent ajustado
    const extent = geometriaUnida.extent;
    return extent.expand(1.15); // Expande un 15% el extent
  };

  /**
   * @dateUpdated 2025-10-16
   * @changes Construcción de consolidado de indicador como el promedio del valor "gini", aplicado a los indicadores 3.1.5, 3.1.6 y 3.1.7
   * @param param0
   * @returns {object}
   */
  const getDataToRenderGraficosEstadisticos = async ({
    indiSelected,
    _where = "1=1",
    regionSeleccionada = "",
  }: {
    indiSelected: IndicadorSeleccionado;
    _where: string;
    regionSeleccionada: string;
  }) => {
    let fieldlabel, fieldValue: string, url: any;

    if (regionSeleccionada === "Nacional") {
      fieldlabel = indiSelected?.fieldlabelNal;
      fieldValue = indiSelected.fieldValueNal;
      url = servicios?.urls.indicadoresNaci[indiSelected.urlNal];
    } else if (regionSeleccionada === "Departamental") {
      fieldlabel = indiSelected.fieldlabelDepartal;
      fieldValue = indiSelected.fieldValueDepartal;
      url = servicios?.urls.indicadoresNaci[indiSelected.urlDepartal];
    } else if (regionSeleccionada === "Municipal") {
      fieldlabel = indiSelected.fieldlabel;
      fieldValue = indiSelected.fieldValue;
      url = servicios?.urls.indicadoresNaci[indiSelected.url];
    }

    try {
      // 1. Validación de datos iniciales
      if (!fieldlabel?.length || !fieldValue || !url) {
        console.error("Datos requeridos no están disponibles");
        setIsLoading(false);
        return;
      }

      // 2. Procesamiento en paralelo para mejor rendimiento
      //Validador para generar promedio aplicado para indicadores 3.1.5, 3.1.6 y 3.1.7
      if (
        indiSelected.label.includes("3.1.5") ||
        indiSelected?.label.includes("3.1.6") ||
        indiSelected?.label.includes("3.1.7")
      ) {
        const dataTorenderGraphics = await Promise.all(
          indiSelected.fieldlabelNal.map(async (fln: string) => {
            const outStatistics: OutStatistics = [
              {
                statisticType: "avg",
                onStatisticField: fieldValue,
                outStatisticFieldName: "Promedio",
              },
            ];

            return utilsModule?.realizarConsulta({
              url,
              outStatistics: JSON.stringify(outStatistics),
              groupByFieldsForStatistics: fln,
              where: _where,
            });
          }),
        );
        // 3. Filtrado de respuestas inválidas
        const validResponses = dataTorenderGraphics.filter(Boolean);
        return validResponses;
      }
      //Para los demás indicadores, realiza totalización
      else {
        const dataTorenderGraphics = await Promise.all(
          indiSelected.fieldlabelNal.map(async (fln) => {
            const outStatistics: OutStatistics = [
              {
                statisticType: "sum",
                onStatisticField: fieldValue,
                outStatisticFieldName: "total",
              },
            ];

            return utilsModule?.realizarConsulta({
              url,
              outStatistics: JSON.stringify(outStatistics),
              groupByFieldsForStatistics: fln,
              where: _where,
            });
          }),
        );
        // 3. Filtrado de respuestas inválidas
        const validResponses = dataTorenderGraphics.filter(Boolean);
        return validResponses;
      }
    } catch (error) {
      console.error("Error al renderizar gráficos:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * En este metodo se selecciona el departamento al que se va realizar la consulta de indicadores
   * y genera la consulta
   * @param {event} target
   * @dateUpdated 2025-10-15
   * @changes Implementar consulta nacional y departamental para indicador 3.1.5
   * @changes Implementar consulta nacional y departamental para indicador 3.1.6.
   * @changes Implementar consulta nacional y departamental para indicador 3.1.7.
   * @dateUpdated 2025-10-23
   * @changes Actualización state con la petición asociada a la selección del departamento en el filtro
   * @changes Creación atributo where, el cual contendra el filtro inicial asociado al departamento seleccionado del campo Departamento
   * @changes Construcción filtro asociado a los indicadores 3.1.5 3.1.6 y 3.1.7 con el indicado en el atributo where
   */
  const handleDepartamentoSelected = async ({
    target,
  }: {
    target: { value: any };
  }) => {
    let where: string = "";
    const targetDepartment = target.value;
    const itemSelected: interfa_itemSelected = departamentos.find(
      (departamento: { value: any }) => departamento.value === targetDepartment,
    );
    if (itemSelected.value === 0) return;
    setDepartmentSelect(itemSelected); // se utiliza para sacar el label en la grafica, widget indicadores y control el valor en el campo departamento

    setIsLoading(true);
    let tipoConsulta = "Departamental";
    let _geometrias = geometriaMunicipios;
    where = `cod_departamento='${target.value}'`;

    //Validador para definir tipo consulta asociado a los indicadores 1.7. 3.1.5 3.1.6 y 3.1.7
    if (
      selectIndicadores?.label.includes("1.7.") ||
      selectIndicadores?.label.includes("3.1.5") ||
      selectIndicadores?.label.includes("3.1.6") ||
      selectIndicadores?.label.includes("3.1.7")
    ) {
      tipoConsulta = "es=1.7.";
      _geometrias = geometriasDepartamentos;
    }
    let urlIndicadorToGetData =
      servicios?.urls.indicadoresDepartal[selectIndicadores?.urlDepartal];
    console.log("Test URL serv Nal =>", urlIndicadorToGetData);

    if (
      selectIndicadores?.label.includes("3.1.5") ||
      selectIndicadores?.label.includes("3.1.6") ||
      selectIndicadores?.label.includes("3.1.7")
    ) {
      setUrlIndGetData(urlIndicadorToGetData);

      where += " " + "AND" + " " + whereIndica;
      console.log("Test Criterio Where con Dpto =>", where);
    }
    if (
      selectIndicadores?.label.includes("3.1.1") ||
      selectIndicadores?.label.includes("3.1.2")
    ) {
      urlIndicadorToGetData =
        servicios?.urls.indicadores[selectIndicadores?.url];
      tipoConsulta = "Departamental";
    }

    if (!urlIndicadorToGetData) {
      console.error(
        `urlIndicadorToGetData no encontrado, revisar indicador en dataFormulario y servicios`,
      );
      setIsLoading(false);
      return;
    }

    handleIndicadorSelectedContinua({
      _where: where,
      indiSelected: {
        ...selectIndicadores,
        deparmetSelected: itemSelected.denombre,
      },
      target,
      _esIndicador: tipoConsulta,
      geometrias: _geometrias,
      urlIndicadorToGetData,
      fieldValueToSetRangeCoropletico: selectIndicadores?.fieldValueDepartal,
      regionSeleccionada: "Departamental",
    });
  };

  // Calcular el extent

  const calculateExtent = (rings: number[][][]): interface_Extent => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const ring of rings) {
      for (const [x, y] of ring) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }

    return {
      xmin: minX,
      ymin: minY,
      xmax: maxX,
      ymax: maxY,
      spatialReference: { wkid: 4326 },
    };
  };

  const poblarMunicipios = async ({
    features,
    targetDepartment,
  }: PoblarMunicipiosParams): Promise<interface_Feature[]> => {
    // 1. Ordenar datos y eliminar duplicados
    const dataOrdenada =
      utilsModule?.ajustarDataToRender({ features }, "", "mpnombre") || [];
    const opcionesMunicipios =
      utilsModule?.discriminarRepetidos(dataOrdenada, "label") || [];

    // Agregar opción por defecto de forma inmutable
    const opcionesConDefault = [
      { value: 0, label: "Seleccione ..." },
      ...opcionesMunicipios,
    ];

    setMunicipios(opcionesConDefault);

    // 2. Filtrar features por departamento
    const featuresDepartamento = features.filter(
      (f) => f.attributes.decodigo === targetDepartment,
    );

    // 3. Mapa de códigos para búsqueda rápida
    const codigosMunicipioDepartamento = new Set(
      featuresDepartamento.map((f) => f.attributes.mpcodigo),
    );

    // 4. Procesamiento optimizado
    return dataOrdenada.map((feature: interface_Feature) => {
      const codigoMunicipio =
        feature.attributes.mpcodigo || feature.attributes.cod_municipio;

      if (codigosMunicipioDepartamento.has(codigoMunicipio)) {
        const indicadorValue = featuresDepartamento.find(
          (d) => d.attributes.mpcodigo === codigoMunicipio,
        )?.attributes[selectIndicadores?.fieldValueDepartal ?? ""];

        if (indicadorValue !== undefined) {
          const nuevoIndicador = {
            [selectIndicadores ? selectIndicadores.fieldValueDepartal : ""]:
              indicadorValue,
          };

          feature.attributes.dataIndicadores = feature.attributes
            .dataIndicadores
            ? [...feature.attributes.dataIndicadores, nuevoIndicador]
            : [nuevoIndicador];
        }
      }

      return feature;
    });
  };

  /**
   * captura el municipio seleccionado en el intput, ajusta extend, resalta el poligono seleccionado
   * @param param0
   */
  const handleMunicipioSelected = async ({
    target,
  }: {
    target: { value: any };
  }) => {
    setIsLoading(true);

    try {
      // 1. Eliminar gráficas inmediatamente (sin setTimeout)
      borrarSoloGraficas();

      // 2. Buscar municipio seleccionado de forma más eficiente
      const itemSelected = findSelectedMunicipio(target.value);

      // 3. Actualizar estado del municipio seleccionado
      setMunicipioSelect(itemSelected);

      // 4. Si es la opción por defecto ("Seleccione..."), salir
      if (itemSelected?.value === 0) {
        setIsLoading(false);
        return;
      }

      // 5. Loggeo condicional
      utilsModule?.logger() && console.log({ municipios: itemSelected });

      // 6. Procesar indicador para el municipio seleccionado
      await processMunicipioIndicator(itemSelected);

      // 7. Resaltar polígono del municipio
      if (itemSelected) {
        highlightMunicipioPolygon(itemSelected);
      } else {
        console.log({ itemSelected });
      }
    } catch (error) {
      console.error("Error en handleMunicipioSelected:", error);
      setMensajeModal({
        deployed: true,
        type: typeMSM.error,
        tittle: "Error",
        body: "Ocurrió un error al procesar el municipio",
        subBody: "",
      });
    }
  };

  // Funciones auxiliares handleMunicipioSelected:

  const findSelectedMunicipio = (targetValue: any) => {
    // Buscar por value directo
    let item = municipios.find((m) => m.value === targetValue);

    // Si no se encuentra, buscar por mpcodigo en el slice (excluyendo el primer item)
    if (!item) {
      item = municipios
        .slice(1)
        .find(
          (m) =>
            m.value?.attributes?.mpcodigo === targetValue?.attributes?.mpcodigo,
        );
    }

    return item;
  };

  const processMunicipioIndicator = async (itemSelected: any) => {
    await handleIndicadorSelectedContinua({
      _where: `mpcodigo = '${itemSelected?.mpcodigo}'`,
      indiSelected: {
        ...selectIndicadores,
        municipioSelected: itemSelected?.mpnombre,
        deparmetSelected: departmentSelect?.denombre,
      },
      target: { value: itemSelected?.value },
      _esIndicador: "Municipal",
      geometrias: geometriaMunicipios,
      urlIndicadorToGetData:
        servicios?.urls.indicadores[
          selectIndicadores ? selectIndicadores.url : ""
        ],
      fieldValueToSetRangeCoropletico: selectIndicadores?.fieldValueDepartal,
      regionSeleccionada: "Municipal",
    });
  };

  // 2. Función corregida con tipado explícito
  const highlightMunicipioPolygon = (itemSelected: interfa_itemSelected) => {
    // Asegurar que lastLayerDeployed tenga el tipo correcto
    const layer = lastLayerDeployed as LayerDeployed;

    // Buscar el gráfico con tipado seguro
    const graphicMunicipioSelected = layer.graphics.find(
      (g: GraphicFeature) => g.attributes.mpcodigo === itemSelected?.mpcodigo,
    );

    if (graphicMunicipioSelected) {
      utilsModule?.dibujarPoligonoToResaltar({
        rings: graphicMunicipioSelected.geometry.rings,
        wkid: graphicMunicipioSelected.geometry.spatialReference.wkid,
        attributes: graphicMunicipioSelected.attributes,
        jimuMapView,
        times: 3,
        borrar: true,
      });
    }
  };

  // END Funciones auxiliares handleMunicipioSelected

  // Elimina las geometrias dibujadas previamente
  /**
   * @dateUpdated 2025-10-23
   * @changes Adicionar método cerrarPopUps, el cual realiza cierre de los popUps activos en mapa base
   */
  const clearGraphigs = () => {
    if (utilsModule?.logger()) console.log("clearGraphigs");
    if (lastLayerDeployed.graphicsLayers.length > 0) {
      utilsModule?.removeLayer(jimuMapView, lastLayerDeployed.graphicsLayers);
      borrarSoloGraficas();
      cerrarPopUps();
    }
  };

  const borrarSoloGraficas = () => {
    const dataToWidgetIndicadores = JSON.stringify({ clear: true });
    dispatch(
      appActions.widgetStatePropChange(
        widgetIdIndicadores,
        "dataFromDispatch",
        dataToWidgetIndicadores,
      ),
    );
  };

  const consultar = () => {
    setIsLoading(true);
    if (utilsModule?.logger()) {
      console.log({
        isLoading,
        clickHandler,
        poligonoSeleccionado,
        geometriaMunicipios,
        dataFuenteIndicadores,
        apuestaEstrategica,
        selectApuestaEstategica,
        selectCategoriaTematica,
        indicadores,
        selectIndicadores,
        departmentSelect,
        municipios,
        municipioSelect,
        rangosLeyenda,
        esriModules,
      });
      setIsLoading(false);
    }
  };

  /**
   * cerrarPopUps => Método para cierre de popUps activos en el mapa base
   * @date 2025-10-23
   * @author IGAC - DIP
   * @remarks Fuente consulta: Claude AI => https://claude.ai/chat/0626f6e8-1833-4a1c-bdfa-56d18e7ff638
   */
  const cerrarPopUps = function () {
    if (!jimuMapView) {
      console.warn("Test JimuMapView no está disponible");
      return;
    }

    if (!jimuMapView.view) {
      console.warn("Test View no está disponible");
      return;
    }

    if (!jimuMapView.view.popup) {
      console.warn("Test Popup no está disponible");
      return;
    }

    // Cerrar solo si el popup está visible
    if (jimuMapView.view.popup.visible) {
      jimuMapView.view.popup.close();
    } else {
      console.log("Test El popup ya está cerrado");
    }
  };

  const formularioIndicadores = () => {
    const habilitaNuevosFiltrosObjeto3 =
      apuestaEstrategica?.value === 3 && selectApuestaEstategica?.value === 0;
    const usandoNuevoFlujoIndicadores =
      !!categoriaTematicaNueva ||
      !!areaAdministrativaNueva ||
      !!areaEstudioNueva ||
      !!indicadorNuevoSeleccionado;

    return (
      <>
        {widgetModules?.INPUTSELECT(
          dataFuenteIndicadores,
          handleSubsistemaSelected,
          apuestaEstrategica?.value,
          "Sub Sistema",
          "",
        )}

        {apuestaEstrategica &&
          widgetModules &&
          widgetModules.INPUTSELECT(
            apuestaEstrategica,
            handleApuestaEstrategicaSelected,
            selectApuestaEstategica?.value,
            "Línea estratégica",
            "APUESTA_ESTRATEGICA",
          )}
        {selectApuestaEstategica &&
          widgetModules &&
          selectApuestaEstategica.CATEGORIA_TEMATICA.length >= 1 &&
          selectApuestaEstategica.CATEGORIA_TEMATICA[0].label !== "" &&
          widgetModules.INPUTSELECT(
            selectApuestaEstategica,
            handleCategoriaTematicaSelected,
            selectCategoriaTematica?.value,
            "Categoría Temática",
            "CATEGORIA_TEMATICA",
          )}
        {indicadores &&
          widgetModules &&
          widgetModules.INPUTSELECT(
            indicadores,
            handleIndicadorSelected,
            selectIndicadores?.value,
            "Indicador",
            "INDICADOR",
          )}

        {habilitaNuevosFiltrosObjeto3 && (
          <div className="nuevos-filtros-card">
            <h4>Nuevos Indicadores</h4>
            {widgetModules?.INPUTSELECT(
              dataFuenteIndicadoresObjeto3Nuevos,
              handleCategoriaTematicaNuevaSelected,
              categoriaTematicaNueva?.value,
              "Categoría temática",
              "",
            )}
            {categoriaTematicaNueva &&
              widgetModules?.INPUTSELECT(
                categoriaTematicaNueva,
                handleAreaAdministrativaNuevaSelected,
                areaAdministrativaNueva?.value,
                "Área administrativa",
                "AREAS_ADMINISTRATIVAS",
              )}
            {areaAdministrativaNueva &&
              widgetModules?.INPUTSELECT(
                areaAdministrativaNueva,
                handleAreaEstudioNuevaSelected,
                areaEstudioNueva?.value,
                "Área de estudio",
                "AREAS_ESTUDIO",
              )}
            {areaEstudioNueva &&
              widgetModules?.INPUTSELECT(
                areaEstudioNueva,
                handleIndicadorNuevoSelected,
                indicadorNuevoSeleccionado?.value,
                "Indicador",
                "INDICADORES",
              )}
          </div>
        )}

        {selectIndicadores &&
          !usandoNuevoFlujoIndicadores &&
          widgetModules &&
          departamentos.length > 0 &&
          widgetModules.INPUTSELECT(
            departamentos,
            handleDepartamentoSelected,
            departmentSelect?.value,
            "Departamento",
            "",
          )}
        {!usandoNuevoFlujoIndicadores &&
          (esIndicador === "Departamental" || esIndicador === "Nacional") &&
          departmentSelect?.value &&
          municipios.length > 1 &&
          widgetModules?.INPUTSELECT(
            municipios,
            handleMunicipioSelected,
            municipioSelect?.value,
            "Municipio",
            "",
          )}
        <Button
          size="sm"
          type="default"
          onClick={() => {
            setApuestaEstrategica(undefined);
            setDepartmentSelect(undefined);
            setSelectIndicadores(initSelectIndicadores);
            setIndicadores(null);
            resetNuevoFlujoIndicadores();
            setMunicipios([]);
            clearGraphigs();
            setRangosLeyenda([]);
          }}
          className="mb-4"
        >
          Limpiar
        </Button>
        {utilsModule?.logger() && (
          <Button size="sm" type="default" onClick={consultar} className="mb-4">
            Consultar
          </Button>
        )}

        {rangosLeyenda.length > 0 && constantes && (
          <div className="legend">
            <h3 style={{ color: "white" }}>
              {/* { indicadores.label  } por  */}
              {selectIndicadores.label}{" "}
              {selectIndicadores.fieldValue === "total_area_ha" ? "(ha)" : ""}
            </h3>
            <ul>
              {constantes.coloresMapaCoropletico.map(
                (color, index) =>
                  rangosLeyenda[index] && (
                    <li key={index}>
                      <span style={{ backgroundColor: color.colorRgb }}></span>{" "}
                      {` ${
                        rangosLeyenda[index][2]
                          ? `${rangosLeyenda[index][2]} : `
                          : ""
                      } ${rangosLeyenda[index][0]}     ${
                        index === 0 ? "" : "-"
                      }     ${rangosLeyenda[index][1]}`}
                    </li>
                  ),
              )}
            </ul>
            {/* <p>Quintiles</p> */}
          </div>
        )}
      </>
    );
  };
  const getGeometriasMunicipios = async ({
    url,
    where = "1=1",
  }: {
    url: string;
    where: string;
  }) => {
    setIsLoading(true);
    try {
      if (utilsModule?.logger()) {
        console.info("Consultando geometrias municipios ...");
      }
      const municipiosResponse = await utilsModule?.queryAttributesLayer({
        url: url + "/query",
        definitionExpression: where,
        returnGeometry: true,
        outFields: "*",
      });
      const resumenMunicipios = {
        features: municipiosResponse.features,
        fields: municipiosResponse.fields,
        geometryType: municipiosResponse.geometryType,
        spatialReference: municipiosResponse.spatialReference,
      };
      if (utilsModule?.logger()) {
        console.log({ municipiosResponse, resumenMunicipios });
      }
      resumenMunicipios.features = [
        ...(geometriaMunicipios ? geometriaMunicipios.features : ""),
        ...resumenMunicipios.features,
      ];
      setGeometriaMunicipios(resumenMunicipios);
      setIsLoading(false);
      return resumenMunicipios;
    } catch (error) {
      setIsLoading(false);
      console.error({ error, url });
      setMensajeModal({
        deployed: true,
        type: typeMSM.error,
        tittle: "Fallo comunicación",
        body: "Consulta geometrias municipios",
        subBody:
          "Intentelo nuevamente o comuniquese con el administrador del sistema",
      });
    }
  };

  const cargarModulosEsri = async () => {
    const modulosEsri = await utilsModule?.loadEsriModules();
    setEsriModules(modulosEsri);
  };

  useEffect(() => {
    if (utilsModule) {
      setTimeout(() => {
        getGeometriasMunicipios({
          url: servicios ? servicios.urls.Municipios : "",
          where: "1=1",
        });
      }, 2000);
    }

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jimuMapView]);

  /**
   * al dar un click en uno de los municipios, captura el poligono seleccionado y lo envia al widget indicadores
   * con la data correspondiente para renderizar la grafica de barras estadistica
   * @dateUpdated 2025-10-23
   * @changes Adición validador para realizar exclusión de la formación de gráfico municipal para los indicadores de la línea estratégica 1.7. incluyendo 3.1.5 3.1.6 y 3.1.7
   * @remarks Análisis del state para el objeto poligonoSeleccionado
   */
  useEffect(() => {
    if (!poligonoSeleccionado || !departmentSelect) return;
    /* console.log ("Test Depto Selecc =>",departmentSelect);
    console.log ("Test Indic Selecc =>",selectIndicadores); */

    if (
      !(
        selectIndicadores.label.includes("1.7.") ||
        selectIndicadores?.label.includes("3.1.5") ||
        selectIndicadores?.label.includes("3.1.6") ||
        selectIndicadores?.label.includes("3.1.7")
      )
    ) {
      handleMunicipioSelected({
        target: {
          value: {
            attributes: poligonoSeleccionado.attributes,
            geometry: poligonoSeleccionado.geometry,
          },
        },
      });
    }

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poligonoSeleccionado]);

  useEffect(() => {
    if (!utilsModule) return;
    cargarModulosEsri();

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utilsModule]);

  /**
   * Carga los modulos necesarios a emplear en el widget
   */
  useEffect(() => {
    /*  alert(`
      - Quede en el item 1.5.3, verificar el valor del coropletico a nivel municipal, no me cuadra
      - ajustar extend del item 3.1.1 y 3.1.2
      - sincronizar el borrado del grafico con el del coropletico
      - ajustar extend para cuando el departamento tiene muchos municipios, por lo menos q se ajuste a un municipio y hacer un zoom alto para q enfoque al departamento
      `) */
    import("../widgetsModule").then((modulo) => {
      setWidgetModules(modulo);
    });
    import("../../utils/module").then((modulo) => {
      setUtilsModule(modulo);
    });
    import("../../api/servicios").then((modulo) => {
      setServicios(modulo);
    });
    import("../../utils/constantes").then((modulo) => {
      setConstantes(modulo);
    });
  }, []);

  function resetAllStates(): void {
    setApuestaEstrategica(undefined);
    setSelectApuestaEstategica(undefined);
    setSelectCategoriaTematica(undefined);
    setSelectIndicadores(initSelectIndicadores);
    setDepartmentSelect(undefined);
    // setMunicipios([]);
    setMunicipioSelect(undefined);
    // setRangosLeyenda([]);
    clearGraphigs();
    setIndicadores(null);
    setEsIndicador(undefined);
    setPoligonoSeleccionado(undefined);
    setMensajeModal({
      deployed: false,
      type: typeMSM.info,
      tittle: "",
      body: "",
      subBody: "",
    });
    setUrlIndGetData(undefined);
    setWhereIndica(undefined);
    resetNuevoFlujoIndicadores();
    clearGraphigs();
  }

  function showAllStates(): void {
    console.log(
      {
        constantes,
        servicios,
        lastLayerDeployed,
        mensajeModal,
        isLoading,
        clickHandler,
        poligonoSeleccionado,
        geometriaMunicipios,
        geometriasDepartamentos,
        apuestaEstrategica,
        selectApuestaEstategica,
        selectCategoriaTematica,
        indicadores,
        selectIndicadores,
        departmentSelect,
        municipios,
        municipioSelect,
        rangosLeyenda,
        esIndicador,
        urlIndGetData,
        whereIndica,
        categoriaTematicaNueva,
        areaAdministrativaNueva,
        areaEstudioNueva,
        indicadorNuevoSeleccionado,
        
      }
    )
  }

  return (
    <div className="">
      {formularioIndicadores()}
      {widgetModules?.MODAL(mensajeModal, setMensajeModal)}
      {/* {
          isLoading && widgetModules?.OUR_LOADING()
        } */}
      {
        validaLoggerLocalStorage("logger") && 
          <div>
            <button type="reset" onClick={resetAllStates}>Reset all states</button>
            <button type="reset" onClick={showAllStates}>Show all states</button>
          </div>
        
      }
    </div>
  );
};

export default TabIndicadores;

enum typeMSM {
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

interface typeGeometria {
  attributes: { mpcodigo: string };
  geometry: any; // Considera tipar `geometry` con algo más específico si es posible (ej: `Geometry` de GeoJSON)
  [key: string]: any;
}

interface IndicadorSeleccionado {
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

interface Interface_SpatialReference {
  wkid: number; // Well-Known ID del sistema de referencia espacial (4326 = WGS84)
}

interface GeographicExtent {
  spatialReference: Interface_SpatialReference;
  xmin: number; // Longitud mínima (oeste)
  ymin: number; // Latitud mínima (sur)
  xmax: number; // Longitud máxima (este)
  ymax: number; // Latitud máxima (norte)
}

interface InitSelectIndicadores {
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
interface SelectionTarget {
  target: {
    value: string | number;
  };
}

interface interf_APUESTA_ESTRATEGICA {
  value: number;
  label: string;
  descripcion: string;
  CATEGORIA_TEMATICA: CategoriaTematica[];
}

interface interf_SUBSISTEMA {
  value: number;
  label: string;
  descripcion: string;
  APUESTA_ESTRATEGICA: Array<{
    value: number;
    label: string;
    descripcion: string;
    CATEGORIA_TEMATICA: CategoriaTematica[];
  }>;
}
interface CategoriaTematica {
  value: string | number;
  label: string;
  descripcion: string;
  INDICADOR: Array<{ value: number; label: string }>;
}

interface NuevoFiltroIndicador {
  value: string;
  label: string;
  serviceKey: string;
  layerId: number;
}

interface NuevoFiltroAreaEstudio {
  value: string;
  label: string;
  INDICADORES: NuevoFiltroIndicador[];
}

interface NuevoFiltroAreaAdministrativa {
  value: string;
  label: string;
  AREAS_ESTUDIO: NuevoFiltroAreaEstudio[];
}

interface NuevoFiltroCategoria {
  value: string;
  label: string;
  AREAS_ADMINISTRATIVAS: NuevoFiltroAreaAdministrativa[];
}

interface HandleIndicadorParams {
  target: {
    value: string | number;
  };
}

interface IndicatorConfig {
  _esIndicador: string;
  geometrias: any;
  urlIndicadorToGetData: string;
  outStatistics: string;
  fieldValueToSetRangeCoropletico: string;
}

interface ChartData {
  features: Array<{
    attributes: { [key: string]: any };
  }>;
  fields: Array<{
    name: string;
  }>;
}

interface ProcessedData {
  labels: string[];
  values: any[];
}

interface DatasetItem {
  labels: string[];
  datasets: Array<{
    label: string;
    data: any[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }>;
}

interface AjustarDatasetParams {
  dataToRenderGraphic: ChartData[];
  regionSeleccionada: string;
  indiSelected?: IndicadorSeleccionado;
}

interface interface_Feature {
  attributes: {
    mpcodigo?: string;
    cod_municipio?: string;
    decodigo?: string;
    mpnombre?: string;
    dataIndicadores?: Array<{ [key: string]: any }>;
    [key: string]: any;
  };
}

interface PoblarMunicipiosParams {
  features: interface_Feature[];
  targetDepartment: string;
}

// 1. Definir interfaces para los tipos esperados
interface GraphicFeature {
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

interface LayerDeployed {
  graphics: GraphicFeature[];
  [key: string]: any; // Otras propiedades que pueda tener el layer
}

interface inter_poligonoSeleccionado {
  attributes: {};
  geometry: {};
}

interface inter_EsriModules {
  FeatureLayer: any;
  Polygon: any;
  Graphic: any;
  GraphicsLayer: any;
  SimpleFillSymbol: any;
  SimpleMarkerSymbol: any;
  SimpleLineSymbol: any;
}

interface interface_Extent {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  spatialReference: Interface_SpatialReference;
}

interface interfa_itemSelected {
  mpnombre?: string;
  mpcodigo?: string;
  value: any;
  label?: string;
  denombre?: string;
}

interface interfa_geometriasDepartamentos {
  features: Array<{
    attributes: Indicadores;
    geometry: any;
  }>;
}
interface interfa_indicadores {
  value: number;
  label: string;
}
