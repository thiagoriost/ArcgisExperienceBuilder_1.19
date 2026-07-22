/** 
 * Widget de búsqueda firmas espectrales
 * @date 2025-04-01
 * @author IGAC - DIP
 * @dateUpdated 2025-05-02
 * @changes Importación widget Sketch
 * @changes Importación componente GraphicsLayer
 * @changes Importación componente Extent
 * @changes Importación utilidades webMercator
 * @dateUpdated 2025-06-03
 * @changes Importación componente TablaResultSrcSIEC bajo objeto TABLARESULTADOS_SIEC desde commonWidgets
 * @dateUpdated 2025-06-09
 * @changes Importación componente appActions
 * @dateUpdated 2025-06-18
 * @changes Deshacer requerimiento 2025-06-03, ya que no se emplea la importación, se realiza bajo hook useEffect importación utilidades para módulos
 * @remarks Tomado del visor geográfico, REFA
 */
console.log(1111111111111111111)
import { React, AllWidgetProps, extensionSpec, appActions } from "jimu-core";
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis'; // The map object can be accessed using the JimuMapViewComponent
import { useEffect, useRef } from "react";

//Componente sketch
//"esri/widgets/Sketch";
import Sketch  from "@arcgis/core/widgets/Sketch";
//Componente GraphicsLayer
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
//Componente Extent
import Extent from "@arcgis/core/geometry/Extent";

//Importación componentes personalizados
//Componente Filters Búsqueda Firmas (FiltersSrcSIEC)
import FiltersSrcSIEC from "./components/FiltersSrcSIEC";

//Componente DialogsSrcSIEC
import DialogsSrcSIEC from "./components/dialogsSrcSIEC";

//Importación estilos
//@ts-expect-error
import '../styles/style.css';

//Importación interfaces
import { InterfaceResponseBusquedaFirmas, InterfaceMensajeModal, typeMSM } from "../types/InterfaceResponseBusquedaFirmas";

//Importación utilidades 
//Utilidades webMercator
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils";
import { IMConfig } from "../config";

//Definición objetos
//Estados
const { useState } = React

/** 
  Sección procesamiento widget => Módulo Widget Búsqueda Firmas Espectrales
  @date 2025-04-01
  @author IGAC - DIP  
  @remarks Procesamiento Widget Principal
*/
const Widget = (props: AllWidgetProps<IMConfig>) => {  
  /** 
    Seccion de declaración del widget principal        
    @date 2025-04-01
    @dateUpdated 2025-04-02
    @changes Incluir coordenadas latitud y longitud desde el mapa, al widget geomerías Punto y Polígono
    @changes Incluir opción para establecimiento coordenadas según Selección de área (Polígono) o Navegar (Punto) (Control modo coordenadas opc radio componente FiltersSrcSIEC (Filtros de la búsqueda)) 
    @dateUpdated 2025-04-03
    @changes Incluir estados para manejo de opciones "Seleccionar area" y "Navegar"
    @dateUpdated 2025-04-08
    @changes Incluir estados para manejo control Cobertura (componente FiltersSrcSIEC (Filtros de la búsqueda))
    @changes Incluir estados para manejo control Proyecto
    @changes Incluir estados para manejo control Campaña
    @dateUpdated 2025-04-09
    @changes Incluir estados para manejo componente dataGrid
    @changes Incluir propiedad pagination para manejo paginación componente dataGrid
    @changes Incluir estados para manejo paginación componente dataGrid
    @dateUpdated 2025-04-11
    @changes Incluir estados para manejo descarga archivos, asociado a la opción Descarga
    @dateUpdated 2025-04-15
    @changes Incluir estados para manejo componente Modal, opción Detalles del Data Grid (componente tablaResultSrcSIEC)
    @dateUpdated 2025-04-22
    @changes Incluir estados para manejo listado de proyectos
    @changes Incluir estados para manejo listado de coberturas
    @changes Incluir estados para manejo listado de campañas
    @dateUpdated 2025-04-23
    @changes Incluir estados para registro del extent inicial sobre el mapa
    @dateUpdated 2025-05-02
    @changes Incluir componente Sketch
    @changes Incluir state asociado al componente Sketch
    @changes Incluir state asociado al jimuMap
    @dateUpdated 2025-05-05
    @changes Optimización params drawing y setDrawing que no se usan
    @changes Incluir Referencia espacial (SpatialReference) al mapa
    @dateUpdated 2025-05-08
    @changes Envío parámetros rows y setRows al componente tablaResultSrcSIEC
    @dateUpdated 2025-05-09
    @changes Incluir state asociado a coordenadas espaciales rectángulares para polígono y punto
    @dateUpdated 2025-05-12
    @changes Envío parámero props al componente tablaResultSrcSIEC    
    @dateUpdated 2025-05-14
    @changes Definición estados para manejo coordenadas extent con geometría polígono medidas  decimales de 3 posiciones longitud (Lon), latitud (Lat)
    @changes Definición estados para manejo coordenadas extent con geometría punto medidas  decimales de 3 posiciones longitud (Lon), latitud (Lat)
    @changes Envío parámero initialExtent al componente tablaResultSrcSIEC
    @changes Envío parámero initialExtent al componente FiltersSrcSIEC
    @dateUpdated 2025-05-15
    @changes Definición estados para manejo componente Modal, asociado a la opción Detalles
    @dateUpdated 2025-05-16
    @changes Definición estados para encabezado (head) y cuerpo (body) del Modal
    @changes Envío parámero rowsModal al componente tablaResultSrcSIEC    
    @changes Envío parámero setRowsModalState al componente tablaResultSrcSIEC
    @dateUpdated 2025-05-22
    @changes Envío parámetro jsonDpto a los componentes FiltersSrcSIEC y tablaResultSrcSIEC 
    @changes Envío parámetro setJsonDpto a los componentes FiltersSrcSIEC y tablaResultSrcSIEC    
    @changes Envío parámetro jsonMpio a los componentes FiltersSrcSIEC y tablaResultSrcSIEC 
    @changes Envío parámetro setJsonMpio a los componentes FiltersSrcSIEC y tablaResultSrcSIEC 
    @dateUpdated 2025-05-29
    @changes Definición estados para implementar estado cargando datos, al consumir peticiones al servidor de datos
    @changes Envío parámetro isLoad al componente FiltersSrcSIEC
    @changes Envío parámetro setIsLoadState al componente FiltersSrcSIEC    
    @dateUpdated 2025-06-04
    @changes Incluir estados para importación de módulos
    @changes Cambio state Control modo coordenadas (radValueNav) valor selArea => navMap
    @dateUpdated 2025-06-09
    @changes Envío parámetro setRows al widget TablaResultados (widget)
    @changes Envío parámetro setJimuMapView al widget TablaResultados (widget)
    @changes Envío parámetro setInitialExtent al widget TablaResultados (widget)
    @dateUpdated 2025-06-16
    @changes Definición estado para implementar opción Ayuda
    @dateUpdated 2025-08-04
    @changes Envío parámetro jsonDpto (depar) al componente FiltersSrcSIEC, que representa valor al control Departamento
    @changes Envío parámetro setJsonDptoState (setDeparState) al componente FiltersSrcSIEC, que representa el setter del parámetro jsonDpto
    @changes Envío parámetro ??
    @dateUpdated 2025-08-12
    @changes Envío parámetro classCss al componente DialogsSrcSIEC
    @dateUpdated 2025-08-13
    @changes Actualizaciones cliente: Adicionar subfiltro 1 asociado a cobertura => Se visualiza al momento de seleccionar registro en campo Cobertura (Inclusión estado showCoberFilt1)
    @changes Actualizaciones cliente: Adicionar subfiltro 2 asociado a cobertura => Se visualiza al momento de seleccionar registro en campo Cobertura (Inclusión estado showCoberFilt2)
    @changes Definición estados para opción Buscar en caálogo
    @dateUpdated 2025-08-20
    @changes Inclusión estados para manejo controles Coberturas 1 (Inclusión estado disCoberFilt1)
    @changes Inclusión estados para manejo controles Coberturas 2 (Inclusión estado disCoberFilt2)
    @remarks FUENTE consulta en: https://developers.arcgis.com/experience-builder/guide/get-map-coordinates/
    @remarks FUENTE consulta sketch widget (2025-05-02) en: https://community.esri.com/t5/arcgis-experience-builder-questions/sketch-widget-api-in-experience-builder-developer/td-p/334312
  */
   
    //States para procesar data desde servidor remoto
    //Para componente FiltersSrcSIEC (Filtros de la búsqueda)
    const [jsonSERV, setJsonSERV]         = useState ([]);
    const [jsonDpto, setJsonDpto]         = useState ([]);
    const [jsonMpio, setJsonMpio]         = useState ([]);

    //Control cobertura componente FiltersSrcSIEC (Filtros de la búsqueda)
    const [selCoberVal, setCober]         = useState <number>();
    //Listado de coberturas para filtro asociado
    const [coberLst, setCoberLst]         = useState ([]);    
    //Controles adicionales cobertura 1 - 2025-08-14
    const [showCoberFilt1, setShowCoberFilt1]=useState <boolean>(false);
    //2025-08-19
    const [disCoberFilt1, setDisCoberFilt1] = useState <boolean>(false);

    const [selCoberFilt1Val, setSelCoberFilt1Val]= useState <number>(); 
    const [coberFilt1Lst, setCoberFilt1Lst]= useState ([]);
    //Controles adicionales cobertura 2 - 2025-08-14
    const [showCoberFilt2, setShowCoberFilt2]=useState <boolean>(false);
    //2025-08-19
    const [disCoberFilt2, setDisCoberFilt2]  =useState <boolean>(false);

    const [selCoberFilt2Val, setSelCoberFilt2Val]=useState <number>();     
    const [coberFilt2Lst, setCoberFilt2Lst]= useState ([]);

    //Control Departamento - 2025-08-04
    const [dptoVal, setDptoVal]           = useState <number>();

    //Control Municipio - 2025-08-04
    const [municDisab, setMunicDisab]     = useState (true);
    const [municLst, setMunicLst]         = useState ([]);
    const [mpioVal, setMpioVal]           = useState <number>();
    
    //Control modo coordenadas opc radio componente FiltersSrcSIEC (Filtros de la búsqueda) 
    const [radValueNav, setValueNav]      = useState <string>("navMap");
    const [chkValueHelp, setChkValueHelp] = useState <boolean>(false);
    
    //Coordenadas latitud, longitud (Toda precisión cálculo)      
    //Pto
    const [txtValorLat, setValorLat]  = useState <string>("");  
    const [txtValorLon, setValorLon]  = useState <string>("");  
    
    //Polígono
    const [txtValorLatSupIzq, setValorLatSupIzq] = useState <string>("");
    const [txtValorLatInfDer, setValorLatInfDer] = useState <string>("");
    const [txtValorLonSupIzq, setValorLonSupIzq] = useState <string>("");
    const [txtValorLonInfDer, setValorLonInfDer] = useState <string>("");

    //Coordenadas extent con polígono medidas como decimales de 3 posiciones (Lon,Lat)
    //Polígono
    //Esquina superior izquierda
    const [lonSupIzqFilter, setLonSupIzqFilter] = useState <string>("");
    const [latSupIzqFilter, setLatSupIzqFilter] = useState <string>("");
    //Esquina inferior derecha
    const [lonInfDerFilter, setLonInfDerFilter] = useState <string>("");
    const [latInfDerFilter, setLatInfDerFilter] = useState <string>("");
    
    //Coordenadas extent geometría punto como decimales de 3 posiciones (Lon,Lat)
    //Pto
    const [lonPtoFilter, setLonPtoFilter]       = useState <string>("");
    const [latPtoFilter, setLatPtoFilter]       = useState <string>("");
    
    //Control Proyecto componente FiltersSrcSIEC (Filtros de la búsqueda)
    const [selProyVal, setProy]                 = useState<number>();
    
    // Listado de proyectos para filtro asociado
    const [proyLst, setProyLst]                 = useState([]);
    
    //Control Campaña componente FiltersSrcSIEC (Filtros de la búsqueda)
    const [selCampaVal, setCampa]               = useState<number>();
    
    //Listado de campañas para filtro asociado
    const [campaLst, setCampaLst]               = useState([]);

    //Botones
    //Opción Buscar en catálogo -- 2025-08-12
    const [catalBtnDis, setCatalBtnDis]         = useState<boolean> (false);

    //Para componente DataGrid
    const [rows, setRows]                       = useState([]);
    const [columns, setColumns]                 = useState([]);
    const [paginationModel, setPaginationModel] = useState({
      pageSize: 5,
      page: 0
    });

    //Cargue de archivos asociados al data Grid
    const [files, setFiles]                   = useState([]);

    //Modal asociado a la opción Detalles del data Grid
    const [modalDetail, setModalDetail]       = useState(false);
    // Encabezado modal
    const [modalHead, setModalHead]           = useState([]);
    //Cuerpo modal
    const [modalBody, setModalBody]           = useState([]);

    //Mapa
    const [jimuMapView, setJimuMapView]       = useState<JimuMapView>(); 
    
    //Extent Map
    const [view, setView]                     = useState(null);
    
    const [ResponseBusquedaFirma, setResponseBusquedaFirma] = useState<InterfaceResponseBusquedaFirmas>();

    const [controlForms, setControlForms]     = useState(false);

    //Tipo de gráfico en mapa
    const [typeGraphMap, setTypeGraphMap]     = useState<string>();

    //Objeto que maneja el estado cargando
    const [isLoading, setIsLoading]           = useState(false);

    //Alert
    const [alertDial, setAlertDial]           = useState(false);

    //Modal
    const [mensModal, setMensModal]           = useState<InterfaceMensajeModal>({
      deployed: false,
      type: typeMSM.info,
      tittle:'',
      body:'',
      subBody:''
    })

    //Objeto que registra el extent inicial
    const [initialExtent, setInitialExtent]   = useState(null);

    //Objeto Sketch
    const [sketchSt, setSketch]               = useState <Sketch>();
    
    //Utilidades de los módulos
    const [utilsModule, setUtilsModule]       = useState(null);
    const [widgetModules, setWidgetModules]   = useState(null);

    const mapDiv = useRef(null);

    const clickHandlerRef = useRef(null); // reference for event cleanup
    
    /**
     * Hook para visualizar el data Grid, incluyendo la información sobre el mismo
     * @date 2025-04-09
     * @author IGAC - DIP
     * @dateUpdated 2025-05-29
     * @changes Establecer estado cargando en false
     */
    useEffect(() => {
      console.log("Iniciando Widget...",props.state);  
      console.log("Hook tst =>",ResponseBusquedaFirma);
      if (!ResponseBusquedaFirma)
        return;
      const {features} = ResponseBusquedaFirma;
      
      //Data Grid
      //Seteo del atributo controlForms, para visualizar el componente DataGrid
      setControlForms(true);
      
      setTimeout(() => {
        setControlForms(true);
      },10);

      //Establecer atributo cargando en falso
      setIsLoading(false);
      //Importación componente ourLoading
      import('../../../commonWidgets/widgetsModule').then(modulo => { setWidgetModules(modulo) })

    },[ResponseBusquedaFirma]);
    
    /**
     * Hook de depuración al cambio del state radValueNav
     * @date 2025-05-30
     * @author IGAC - DIP
     * @dateUpdated 2025-06-03
     * @changes invocar método activeViewChangeHandler(). Se desactiva por duplicidad del widget.
     * @dateUpdated 2025-06-05
     * @changes Rehacer requerimiento 2025-06-03, analizando el estado del objeto radValueNav
     */
    /* useEffect(() => {
      console.log("Valor radio ppal =>",radValueNav);
      //Método para interactuar widget con mapa
      activeViewChangeHandler(jimuMapView);
    },[radValueNav]) */

    /**
     * Hook de depuración al cambio del state controlForms
     * @date 2025-05-30
     * @author IGAC - DIP
     */
    useEffect(() => {
      console.log("controlForms (Filter y DG) =>",controlForms);
      console.log("Props locales widget ppal =>",props);
    }, [controlForms])

    /**
     * Hook de importación utilidades para módulos
     * @date 2025-06-04
     * @author IGAC - DIP
     * @author Ing.RRH
     */
    useEffect(() => {
      import('../../../utils/module').then(modulo => { setUtilsModule(modulo) })
    }, [])
    /**
     * Hook de envío información al Widget TablaResultados, analizando el state rows
     * @date 2025-06-09
     * @author Ing.RRH
     * @dateUpdated 2025-06-11
     * @changes Montar widget Gráficos e integrar con widget TablaResultados, llamando método enviarDispatchs()
     * @dateUpdated 2025-08-26
     * @changes Deshabilitar estado Cargando, al pintar los puntos sobre el mapa base
    */
    useEffect(() => {
          if (rows.length !=0) {
            enviarDispatchs(rows);
          }
          //Deshabilitar estado cargando, según consumo en MapServer existan o no registros asociados
          setIsLoading(false);
          //Limpieza de recursos
          return () => {} 
      }, [rows])


    /** 
     * Evento asociado al cambio de vista sobre el componente JimuMapViewComponent
     * @date 2025-04-02
     * @author IGAC - DIP 
     * @param jmv
     * @dateUpdated 2025-04-02
     * @changes Crear el evento para capturar la coordenada latitud, longitud
     * @dateUpdated 2025-04-23
     * @changes Guardar extent inicial
     * @dateUpdated 2025-05-02
     * @changes Referenciar el componente Sketch
     * @changes Obtener coordenadas geográficas en m con el componente Sketch
     * @changes Invocar convertidor a coordenadas decimales
     * @dateUpdated 2025-05-05
     * @changes Establecer visualización Widget sketch, para realizar un polígono - rectángulo en el mapa
     * @dateUpdated 2025-05-06
     * @changes Corrección condicional, para seleccionar un punto, estando la opción Navegar seleccionada
     * @dateUpdated 2025-05-07
     * @changes Actualización atributo creationMode "update" => "single" 
     * @changes Realización de borrado rectángulo de coordenadas al dibujar y obtener las coordenadas en los controles Esquina superior izquierda, Esquina inferior derecha
     * @dateUpdated 2025-05-13
     * @changes Actualización States coordenadas latitud, longitud ajustada a toda la precisión entera - decimal en geometría punto
     * @changes Actualización States coordenadas geográficas  empleando toda la precisión entera y decimal en geometría rectángulo
     * @dateUpdated 2025-06-05
     * @changes Inclusión validación para visualizar o ocultar el widget sketch al seleccionar las opciones Seleccionar Area o Navegar, teniendo como opción Navegar por defecto
     * @dateUpdated 2025-06-10     
     * @changes Validación para registrar extent inicial al iniciar el widget
     * @dateUpdated 2025-06-13
     * @changes Confioguración visibilidad elementos widget Sketch => Herramienta rectángulo
     * @remarks Fuente consulta https://epsg.io/transform
     * @remarks Fuente consulta convertidor API en Transformada a lat, long (https://developers.arcgis.com/javascript/latest/api-reference/esri-geometry-support-webMercatorUtils.html#xyToLngLat)
     * @remarks Fuente consulta atributo creationMode widget Sketch en https://community.esri.com/t5/arcgis-javascript-maps-sdk-questions/how-do-i-disable-sketch-widget-from-oncreate/td-p/1356497 
     * @remarks para implementación borrado polígono al obtener coordenadas geográficas de manera correcta
     * @remarks https://developers.arcgis.com/experience-builder/guide/add-layers-to-a-map/
     * @remarks Evento asociado onactiveViewChange
    **/
    const activeViewChangeHandler = (jmv: JimuMapView) => {
      let selGraphic = null;
      let sketchWeb: Sketch;
      let objJSON: any = "";
      console.log("Ingresando al evento objeto JimuMapView...");
      if (jmv) {
        setJimuMapView(jmv);
        if (initialExtent === null)
        {
          setInitialExtent(jmv.view.extent);  //Guarda el extent inicial
          console.log("Estableciendo extent inicial...");
        }
        
        //Creación capa gráficos - 2025-05-02
        const layerWeb = new GraphicsLayer();
        jmv.view.map.add(layerWeb);
        
        //Atributos del widget Sketch configurados con el objeto definido - 2025-06-13
        objJSON = {
          createTools: {
            point: false, 
            polyline: false, 
            polygon: false, 
            circle: false,
            rectangle: true,
            multipoint: false
          },
          selectionTools: {
            "custom-selection": false,
            "lasso-selection": false,
            "rectangle-selection": false
          },
          settingsMenu: false,
          undoRedoMenu: false
        }
        //Instanciación objeto sketch - 2025-05-02
        if (typeof sketchWeb === 'undefined'){
           sketchWeb = new Sketch({
            layer: layerWeb,
            view: jmv.view,
            creationMode: "single",
            availableCreateTools: ["rectangle"],
            visibleElements: objJSON          
          });
        }
        // console.log("GraphicsLayer length =>",layerWeb.graphics.length);
        //Invocación widget en mapa ubicación inferior derecha, solo cuando se selecciona la opción Seleccionar Area
        console.log("Opc de sel area o navegar =>",radValueNav);
        console.log("Componente sketch =>",sketchWeb);
        //Al state
        setSketch(sketchWeb);
        //Opción Seleccionar Area, habilita el widget Sketch
        if (radValueNav === 'selArea')
        {
          console.log("Estado sketch =>",sketchWeb.visible);
          if (sketchWeb.visible){          
            //Al mapa
            jmv.view.ui.add(sketchWeb, "bottom-left");
          }
          console.log("Componente sketch adicionado! =>",sketchWeb.visible);
          
          //Evento que se genera al finalizar dibujo
          sketchWeb.on("create", function(event){
            if (event.state === "complete"){
              const geometry = event.graphic.geometry;
              let ext: Extent;

              //Obtener gráfico del sketch
              selGraphic = sketchWeb.updateGraphics;
              
              //Validaciones de la geometria
              if (geometry.type === "polygon"){
                ext = geometry.extent;
              }
              else if (geometry.type === "extent"){
                ext = geometry as Extent;
              }
              //Cálculo de los límites asociados al Extent del polígono, obtenido con el widget Sketch
              if (ext){
                //Visualizar objeto ext, con las propiedades xmin, ymin, xmax, ymax
                /* console.log("Extent es =>",ext);
                console.log("Long, Latitud Top Left (min) =>",webMercatorUtils.xyToLngLat(ext.xmin, ext.ymin));
                console.log("Long, Latitud Bot Right (max) =>",webMercatorUtils.xyToLngLat(ext.xmax, ext.ymax));
                //Coord Rectangulares
                console.log("Coord X Sup Izq =>",ext.xmin);
                console.log("Coord Y Sup Izq =>",ext.ymax);
                console.log("Coord X Inf Der =>",ext.xmax);
                console.log("Coord Y Inf Der =>",ext.ymin); */
                
                //Lat, Long
                //Coordenadas Sup Izq
                const coordTopLeft = webMercatorUtils.xyToLngLat(ext.xmin, ext.ymax);
                //Al state Latitud                
                setValorLatSupIzq(coordTopLeft[1].toString());
                //Al state Longitud                
                setValorLonSupIzq(coordTopLeft[0].toString());
                //Al state Latitud filtro
                setLatSupIzqFilter(coordTopLeft[1].toFixed(3));
                //Al state Longitud filtro
                setLonSupIzqFilter(coordTopLeft[0].toFixed(3));
                //Coordenadas Inf, Der
                const coordBotRight = webMercatorUtils.xyToLngLat(ext.xmax, ext.ymin);
                //Al state Latitud                
                setValorLatInfDer(coordBotRight[1].toString());
                //Al state Longitud
                setValorLonInfDer(coordBotRight[0].toString());
                //Al state Latitud filtro
                setLatInfDerFilter(coordBotRight[1].toFixed(3));
                //Al state Longitud filtro
                setLonInfDerFilter(coordBotRight[0].toFixed(3));

                //Borrado del polígono
                console.log("Objeto gráfico =>",selGraphic);
                if (selGraphic)
                {
                  try{
                    sketchWeb.complete();
                    jmv.view.map.layers.remove (sketchWeb.layer);
                    console.log("Borrado ejecutado!");
                  }
                  catch (error)
                  {
                    if (error.name === 'AbortError')
                    {
                      console.warn("Abort error!!!");
                    }
                    else
                    {
                      console.warn(error);                      
                    }
                  }
                }
              }
            }
          });
        } 
      }
    };

    /**
     * método enviarDispatchs => realiza envío de parámetros para los widgets TablaResultados y Bar-Chart
     * @date 2025-06-11
     * @author Ing.RRH
     * @param rows
     * @dateUpdated 2025-06-27
     * @changes Desactivación gráficos Cantidad por Instrumento
     * @changes Desactivación gráficos Cantidad por type
     * @dateUpdated 2025-08-21     
     * @changes Activación gráficos Cantidad por type
     * @changes Actualización término type => covertype
     * @changes Actualización término Cantidad por type => Cantidad por cobertura
     * @changes Actualización término Registros por tipo => Registros por cobertura
     * @remarks Requerimiento 2025-08-21 consultado a través del servicio Mapserver en objeto firmasEspTCober
     */
    const enviarDispatchs = function (rows) {
      //Envío al widget TablaResultados
      const dataToRenderTablaResultados = JSON.stringify({ dataToRows: rows })
      props.dispatch(appActions.widgetStatePropChange('widget_7', 'dataFromDispatchWidget_searchSIEC', dataToRenderTablaResultados))
      
      //Gráficos
      //logica para la barra de graficos
      const labels: LabelItem[] = [
      {
        label: "locat",
        description: "Cantidad por Ubicación (locat)",
        color: "rgba(255, 99, 132, 0.6)",
        tituloGrafico: "Concentración Geográfica por Localidad"
      },
      {
        label: "proj",
        description: "Cantidad por Proyecto (proj)",
        color: "rgba(54, 162, 235, 0.6)",
        tituloGrafico: "Registros por Proyecto"
      },
      /* {
        label: "ins",
        description: "Cantidad por Instrumento (ins)",
        color: "rgba(75, 192, 192, 0.6)",
        tituloGrafico: "Distribución de Registros por Instrumento"
      }, */
      {
        label: "covertype",
        description: "Cantidad por cobertura",
        color: "rgba(75, 192, 85, 0.6)",
        tituloGrafico: "Distribución de Registros por cobertura"
      }]

      //Envío al widget Bar-Chart
      const dataToRenderBarChart = JSON.stringify({ dataToRows: rows, labels})
      props.dispatch(appActions.widgetStatePropChange('widget_82', 'dataFromDispatchWidget_searchSIEC', dataToRenderBarChart))   
    }
    
    return (
      <div
        className="w-100 p-3 bg-primary text-white div-padre-scroll-complemento"
        
      >
       <JimuMapViewComponent useMapWidgetId={props.useMapWidgetIds?.[0]} onActiveViewChange={activeViewChangeHandler} />          
        
        
        {/*Sección diálogo cuando no se cumplan los criterios del widget*/}
        {alertDial
          //? showDialog("No se cumplen los criterios!")
          ? <DialogsSrcSIEC
              setAlertDial={setAlertDial}
              mensModal={mensModal}
              setMensModal={setMensModal}
              classCss={'reqValidator'}
          ></DialogsSrcSIEC>
          : null
        }
        {false /* controlForms*/  && widgetModules?.TABLARESULTADOS_SIEC({rows, columns, view, setControlForms, jimuMapView, setResponseBusquedaFirma, typeGraphMap, setAlertDial, setMensModal, pagination:true, paginationModel, setPaginationModel, files, setFiles, modalDetail, setModalDetail, props, initialExtent, modalHead, setModalHead, modalBody, setModalBody, jsonDpto, setJsonDpto, jsonMpio, setJsonMpio})}
        <div className="div-scroll" style={{ flex: '1 1 auto', minHeight: 0 }}>
          {
            jimuMapView &&
              <FiltersSrcSIEC          
                jsonSERV={jsonSERV} 
                setJsonSERV={setJsonSERV}
                selCoberVal={selCoberVal}
                setCoberState={setCober}
                coberLst={coberLst}
                setCoberLst={setCoberLst}
                showCoberFilt1={showCoberFilt1}
                setShowCoberFilt1State={setShowCoberFilt1}
                disCoberFilt1={disCoberFilt1}
                setDisCoberFilt1State={setDisCoberFilt1}
                showCoberFilt2={showCoberFilt2}
                setShowCoberFilt2State={setShowCoberFilt2}
                disCoberFilt2={disCoberFilt2}
                setDisCoberFilt2State={setDisCoberFilt2}
                selCoberFilt1Val={selCoberFilt1Val}
                setSelCoberFilt1ValState={setSelCoberFilt1Val}
                selCoberFilt2Val={selCoberFilt2Val}
                setSelCoberFilt2ValState={setSelCoberFilt2Val}
                coberFilt1Lst={coberFilt1Lst}
                setCoberFilt1LstState={setCoberFilt1Lst}
                coberFilt2Lst={coberFilt2Lst}
                setCoberFilt2LstState={setCoberFilt2Lst}
                radValueNav={radValueNav}
                setValueNav={setValueNav}
                txtValorLat={txtValorLat}
                setValorLatState={setValorLat}
                txtValorLatSuIz={txtValorLatSupIzq} 
                setValorLatSuIzState={setValorLatSupIzq}
                txtValorLatInDe={txtValorLatInfDer}
                setValorLatInDeState={setValorLatInfDer}
                txtValorLon={txtValorLon}
                setValorLonState={setValorLon}
                txtValorLonSuIz={txtValorLonSupIzq}
                setValorLonSuIzState={setValorLonSupIzq}
                txtValorLonInDe={txtValorLonInfDer}
                setValorLonInDeState={setValorLonInfDer}
                lonPto={lonPtoFilter}
                setLonPtoState={setLonPtoFilter}
                latPto={latPtoFilter}
                setLatPtoState={setLatPtoFilter}
                lonSuIz={lonSupIzqFilter}
                setLonSuIzState={setLonSupIzqFilter}
                latSuIz={latSupIzqFilter}
                setLatSuIzState={setLatSupIzqFilter}
                lonInDe={lonInfDerFilter}
                setLonInDeState={setLonInfDerFilter}
                latInDe={latInfDerFilter}
                setLatInDeState={setLatInfDerFilter}
                selProyVal={selProyVal}
                setProyState={setProy}
                proyLst={proyLst}
                setProyLst={setProyLst}
                selCampaVal={selCampaVal}
                setCampaState={setCampa}
                campaLst={campaLst}
                setCampaLst={setCampaLst}
                ResponseBusquedaFirma={ResponseBusquedaFirma}
                setResponseBusquedaFirma={setResponseBusquedaFirma}
                view={view}
                setView={setView}
                jimuMapView={jimuMapView}          
                setAlertDial={setAlertDial}
                mensModal={mensModal}
                setMensModal={setMensModal}
                setControlForms={setControlForms}
                controlForms={controlForms}          
                props={props}
                sketchWeb={sketchSt}
                setRows={setRows}
                initialExtent={initialExtent}
                jsonDpto={jsonDpto}
                setJsonDptoState={setJsonDpto}
                jsonMpio={jsonMpio}
                setJsonMpioState={setJsonMpio}
                dptoSel={dptoVal}
                setDptoSelState={setDptoVal}
                mpioLst={municLst}
                setMpioLstState={setMunicLst}
                mpioSel={mpioVal}
                setMpioSelState={setMpioVal}
                municDisab={municDisab}
                setMunicDisabState={setMunicDisab}
                isLoad={isLoading}
                setIsLoadState={setIsLoading}
                setWidgetModules={setWidgetModules}
                chkValueHelp={chkValueHelp}
                setChkValueHelpState={setChkValueHelp}
                catalBtnDis={catalBtnDis}
                setCatalBtnState={setCatalBtnDis}
                ></FiltersSrcSIEC>
          }
        </div>
        {
	        isLoading && widgetModules?.OUR_LOADING()
        }
      </div>
    );
  };

  export default Widget;

  /**
   * Interface LabelItem => Definición de la estructura de datos del objeto LabelItem
   * @date 2025-06-11
   * @author Ing.RRH
   */
  export interface LabelItem {
    label: string;
    description: string;
    color: `rgba(${number}, ${number}, ${number}, ${number})` | string;
    tituloGrafico: string;
  }