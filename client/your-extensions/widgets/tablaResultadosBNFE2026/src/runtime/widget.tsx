
/** 
 * Seccion importación
 * @date 2025-06-04
 * @dateUpdated 2025-06-09
 * @changes Adaptación componente TablaResultSrcSIEC como widget
 * @dateUpdated 2025-06-10
 * @changes Adaptación componente TablaResultSrcSIEC como widget
 * @dateUpdated 2025-06-11
 * @changes Importación componente PopupTemplate
 * @dateUpdated 2025-07-18
 * @changes Importación estilos del componente tablaResultados
 * @changes Importación objeto getToken para obtener token de seguridad en el consumo del API
 * @dateUpdated 2025-07-21
 * @changes Importación objeto Table para implementar sección Firmas, en opción Detalles
 * @changes Exclusión componente pathDataGridSIEC
 * @dateUpdated 2025-07-22
 * @changes Adicionar opción Descargar metadato, sección metadatos.
 * @changes Alineamiento tabla, sección firmas.
 * @dateUpdated 2025-07-23
 * @changes Importación objeto js2xmlparser
 * @dateUpdated 2025-08-14
 * @changes Importación useRef
 * @dateUpdated 2025-08-22
 * @changes Importación objeto entorno
 * @changes Inclusión componente TextArea desde jimu-ui
 * @dateUpdated 2025-08-25
 * @changes Importación objeto tValidators
 * @changes Importación objeto sortPaises
 * @dateUpdated 2025-08-26
 * @changes Importación objeto sortOcupa
 * @dateUpdated 2025-08-27
 * @changes Importación objeto urlsPost
 * @dateUpdated 2025-08-29
 * @changes Importación objeto InterfaceMensajeModal (Interfaces), uso validador formulario   
 * @changes Importación objeto typeMSM (Interfaces), uso validador formulario   
 * @changes Importación Componente DialogsSrcSIEC
 * @changes Importación objeto timeExpires, que fija tiempo de expiración sesión.
 * @dateUpdated 2025-09-01
 * @changes Importación objeto timeDownLoad, que fija tiempo antes de autorizar la descarga de archivo al usuario
 * @dateUpdated 2025-09-16
 * @changes Importación objeto numPosiciones
 * @dateUpdated 2025-09-18
 * @changes Importación objeto numPageDG
 * @dateUpdated 2025-10-07
 * @changes Importación objeto tolerFactorSrcP
 * @dateUpdated 2025-10-08
 * @changes Importación objeto useGridApiRef, desde la libreria x-data-grid
 * @remarks widget independiente asociado al componente tablaResultSrcSIEC, para despliegue en sección SideBar de la plantilla "plantilla Visor Geográfico_RRH_03062025"
*/

import { React, type AllWidgetProps } from 'jimu-core'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis' // The map object can be accessed using the JimuMapViewComponent
import { useEffect, useState, useRef } from 'react'
import { Button, Modal, ModalBody, ModalHeader, CollapsablePanel, Table, Select, TextArea } from "jimu-ui";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";

//Importaciones para mapa base
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import PopupTemplate from "@arcgis/core/PopupTemplate";

//2025-07-25
import { loadModules } from 'esri-loader';  

//Utilidades
import * as webMercatorUtils from '@arcgis/core/geometry/support/webMercatorUtils';
//Utilitario js2xmlparser - 2025-07-24
import { parse } from 'js2xmlparser';

//Estilos
// import '@mui/x-data-grid/lib/style.css';
//@ts-expect-error
import '../styles/style.css';

//Imagenes - Path del sistema acceso (2025-05-19)
//Métodos para consumo servicios API
import { generarFileStand, getDominioValor, getFileNameByIdFile, getInstrumDetailsByNomInstrum, getProjDetailsByIdProj, getToken, getTokenAlt, sortPaises, sortOcupa, getTimeInfo, timeDownLoad } from '../../../searchSIEC2026/src/types/dataDG';
//Objetos independientes
import { entorno, tValidators, timeExpires, numPosiciones, numPageDG, tolerFactorSrcP } from '../../../searchSIEC2026/src/types/dataDG';
//Objetos desde servicios
import { urls, urlsPost  } from '../../../api/serviciosFirmasEspectrales';

//Objeto para definir el lenguaje asociado al componente DataGrid
import { dataGridLang } from '../../../searchSIEC2026/src/types/dataDG';

//Importación interfaces
import { InterfaceMensajeModal, typeMSM } from "../../../searchSIEC2026/src/types/InterfaceResponseBusquedaFirmas";

//Componente DialogsSrcSIEC
import DialogsSrcSIEC from "../../../searchSIEC2026/src/runtime/components/dialogsSrcSIEC";
import { InterfaceModalBody } from '../types/InterfaceGraphSIEC';
import { validaLoggerLocalStorage } from '../../../shared/utils/export.utils';


/**
 * widget independiente TablaResultados => Resultados asociados al widget BuscarFirma en un Data Grid
 * @date 2025-06-04
 * @author IGAC - DIP
 * @author RRH
 * @dateUpdated 2025-06-09
 * @changes Cargue parámetro setRows
 * @changes Cargue parámetro setJimuMapView
 * @dateUpdated 2025-06-12
 * @changes Generación states para manejo del componente PopUpTemplate
 * @dateUpdated 2025-06-20
 * @changes Asignación estilo p-3 al componente DataGrid
 * @dateUpdated 2025-06-25
 * @changes Supresión sección Datos de la Muestra {Tipo => tMues, Altura promedio de la cobertura => altCover, Instrumento => instrum}
 * @changes Supresión sección Ubicación de la firma (Coordenadas decimales) {Altura de la vegetación => altCover}
 * @changes Reacomodación Información Proyecto y Campaña (Título sector izquierdo, contenido sector derecho del modal)
 * @dateUpdated 2025-06-27
 * @changes Cambio atributo clase estilo p-3 => p-1
 * @dateUpdated 2025-07-01
 * @changes Implementación states para la opción Descarga del componente DataGrid
 * @dateUpdated 2025-07-18
 * @changes Implementación states para actualizar opción Detalles, implementando secciones colapsables
 * @dateUpdated 2025-07-21
 * @changes Implementación states para realizar consumo desde API, y obtener las firmas por puntos de muestreo
 * @dateUpdated 2025-07-22
 * @changes Ocultamiento columna ObjectId del componente TablaResultados
 * @changes Ocultamiento columna IdArchivo de la sección Firmas, opción Detalles
 * @dateUpdated 2025-07-23
 * @changes Listado de columnas por sección, según reunión con cliente. 
 * Sección Metadatos => Proyecto, campaña, ubicación, tipo muestra (OJO, no existe en servicio), total firmas, accesorio; sección firmas => Tipo cobertura, instrumento 
 * @dateUpdated 2025-07-25
 * @changes Corrección término MetaDatos => Metadatos
 * @changes Corrección Imagenes => Imágenes
 * @changes Implementación state para actualizar opción Detalles, incluyendo sección imágenes en un colapsable
 * @changes Implementación método zoomPointSelected(), el cual permite ampliar en mapa, el punto seleccionado en el componente Tabla Resultados.
 * @dateUpdated 2025-08-06
 * @changes Borrado columna Boxcar, sección Firmas
 * @changes Actualización columna Accesorio, aplicación clases estilos row, projLab
 * @changes Actualización columna Número firmas, aplicación clases estilos row, projLab
 * @changes Visualizar sección metadatos al seleccionar opción Detalles, del componente TablaResultados
 * @dateUpdated 2025-08-12
 * @changes Inclusión states estado Cargando
 * @changes Inclusión clase estilo modalDetails al modal que visualiza la información, según opción Detalles del componente TablaResultados
 * @changes Visualizar en el componente el estado de consulta, en el cual, cuando no existan registros en el servicio, se visualice el estado "No hay resultados asociados a la búsqueda!"
 * @changes Visualizar en el componente el paginador en idioma español
 * @changes Implementar estado "Cargando" en la sección Metadatos, empleando el state isLoad
 * @dateUpdated 2025-08-13
 * @changes Implementar estado "Cargando" en la sección firmas, empleando el state isLoad
 * @changes Implementar estado "Cargando" en la sección imágenes, empleando el state isLoad
 * @changes Actualizar la visualización de la sección imágenes pasando de 4 x 1 => 2 x 2
 * @dateUpdated 2025-08-14
 * @changes Implementar estados para autenticación usuario a opción Descarga, componente TablaResultados
 * @changes Cambios del cliente: Actualización término Altura snm => Altura msnm
 * @changes Cambios del cliente: Actualización término Integración => Tiempo de integración
 * @changes Cambios del cliente: Actualización término Promedio búsqueda => Escaneos promedios
 * @changes Cambios del cliente: Actualización término Muestra desde piso => Distancia a la muestra
 * @dateUpdated 2025-08-19
 * @changes Inclusión clase estilo rowImage
 * @changes Corrección términos Integración => integración 
 * @changes Corrección términos Firma => firma
 * @changes Corrección términos Archivo => archivo
 * @changes Corrección términos Muestra => muestra
 * @changes Aplicación clase estilo imgSIECSpanEmpty, para la sección Imágenes en los cuatro tipos desplegados
 * @dateUpdated 2025-08-22
 * @changes Aplicación condicionada de estilos, según objeto entorno
 * @changes Implementación formulario modal, para despliegue en opción Descarga (En curso)
 * @changes Generación states para visualización formulario en componente Modal
 * @dateUpdated 2025-08-25
 * @changes Inclusión valores campo País {'Brasil', 'Colombia', 'Cuba', 'Ecuador', 'Estados Unidos'} (Pruebas) 
 * @changes Aplicación estilo campo País
 * @changes Consumo lista paises, a partir del objeto countryUsrDownSigLst
 * @changes Inclusión valores campo Ocupación {'Abogado', 'Analista financiera', 'Ingeniero', 'Periodista'} (Pruebas)
 * @changes Aplicación estilo campo Ocupación
 * @changes Generación states formulario "Información usuario descarga firma"
 * @dateUpdated 2025-08-27
 * @changes Adición atributo files al state formUsrDownSigData
 * @dateUpdated 2025-08-29
 * @changes Implementación states para componente Alert
 * @changes Inclusión clase estilo reqUsrDownSigDataValidator
 * @changes Borrado opción Continuar descarga
 * @dateUpdated 2025-09-03
 * @changes Inclusión clase estilo ubicCamp_prod, el cual aplica campo Campaña en entorno productivo
 * @dateUpdated 2025-09-12
 * @changes Resolución incidencias => "La separación entre secciones de la información de detalle no es clara para firmas e imágenes, por lo que se recomendaría emplear un marco/frame o divisor más claro entre las secciones...", P5
 * @dateUpdated 2025-09-15
 * @changes Fix incidencia => "La separación entre secciones de la información de detalle no es clara para firmas e imágenes, por lo que se recomendaría emplear un marco/frame o divisor más claro entre las secciones...", P5. Desactivación bordes títulos secciones. * 
 * @changes Fix incidencia => "Ventana emergente control usuario para descarga", P1
 * @dateUpdated 2025-09-16
 * @changes Fix incidencia => "Ventana emergente control usuario para descarga", P1
 * @dateUpdated 2025-09-22
 * @changes Actualización validador "textSigle" sobre campo Empresa / Organización
 * @changes Mapeo clases estilos entornos desarrollo (dev) y productivo (prod) al formulario "Información usuario descarga firma"
 * @dateUpdated 2025-09-24
 * @changes Aplicación estilos formulario "Información usuario descarga firma" =>
 * @changes Aplicación estilo titleUsrDownSigDataLbl_prod => Título
 * @changes Aplicación estilo paisSpanCls_prod => Campo País
 * @changes Aplicación estilo ocupaLblCls_prod => Campo Ocupación (Título)
 * @changes Aplicación estilo ocupaSpanCls_prod => Campo Ocupación
 * @changes Aplicación estilo purpDataLblCls_prod => Campo Describa el interés en los datos(Título)
 * @changes Aplicación estilo purpDataCls_prod => Campo Describa el interés en los datos
 * @dateUpdated 2025-10-07
 * @changes Creación estados para selección de registros, en componente DataGrid.
 * @changes Implementación selección registro componente DataGrid, según punto seleccionado del mapa base
 * @remarks FUENTE consulta: Claude AI => https://claude.ai/chat/4628dc36-e352-4068-94f3-579f6ca7c8b3
 * @remarks FUENTE consulta paises: https://www.dian.gov.co/atencionciudadano/formulariosinstructivos/Formularios/2009/Paises_2009.pdf 
 * @remarks FUENTE consulta Clasificación única de ocupaciones para Col (CUOC): https://www.dane.gov.co/files/sen/nomenclatura/cuoc/documento-clasificacion-unica-ocupaciones-colombia-CUOC.pdf 
 */
const tablaResultados = function (props: AllWidgetProps<any>){
    if(validaLoggerLocalStorage('logger')) console.log('WidgetResult ID:', {id:props.id, props})
    if(validaLoggerLocalStorage('logger')) console.log('MapWidgetIds:', props.useMapWidgetIds)
    //Estados locales
    const [utilsModule, setUtilsModule] = useState(null)
    const [jimuMapView, setJimuMapView] = useState<JimuMapView>()
    const [initialExtent, setInitialExtent] = useState(null)
    
    //Estado para manejo Modales
    const [modalDetail, setModalDetail]         = useState(false);
    const [modalBody, setModalBody]             = useState<InterfaceModalBody>({})
    const [modalHead, setModalHead]             = useState("")
    //Interface Modal
    const [mensModal, setMensModal]           = useState<InterfaceMensajeModal>({
        deployed: false,
        type: typeMSM.info,
        tittle:'',
        body:'',
        subBody:''
      })
    
    //Alert - 2025-08-29
    const [alertDial, setAlertDial]           = useState(false);

    //Modal opción Descarga - registro usuario - 2025-08-22
    const [modalUsrDataDetail, setModalUsrDataDetail]=useState(false);
    
    //Estados para formulario registro usuario - 2025-08-25
    const [emailUsrDownSig, setEmailUsrDownSig] =   useState <string>("");
    const [countryUsrDownSig, setCountryUsrDownSig]=useState <string>("");
    const [countryUsrDownSigLst, setCountryUsrDownSigLst]=useState ([]);
    const [occupUsrDownSig, setOccupUsrDownSig] =   useState <string>("");
    const [occupUsrDownSigLst, setOccupUsrDownSigLst]=useState ([]);
    const [workUsrDownSig, setWorkUsrDownSig]   =   useState <string>("");
    const [disRegUsrDownSig, setDisRegUsrDownSig]=  useState <boolean> (false);

    //Estados para uso del validador en formulario registro usuario - 2025-08-25
    const [formUsrDownSigData, setFormUsrDownSigData]=useState ({
        nameLastName: '',
        email: '',
        pais: '',
        ocupa: '',
        emprWork: '',
        purpData: '',
        files: ''
    });
    
   //Estados para manejo de tiempo de sesión usuario - 2025-08-29
   const [sesStartTime, setSesStartTime]       =   useState(null);
   const [sesCurrTime, setSesCurrTime]         =   useState(Date.now());
   const [sessExpires, setSessExpires]         =   useState(timeExpires);  //24 hr duración

   //Estado que define pagination model controlado
   const [paginationModel, setPaginationModel]=useState({
        pageSize: 5,
        page: 0
    })

    //Estado para manejo filas en DataGrid
    const [rows, setRows]                       =   useState([]);
    //2025-10-07 => Estado para selección registro en Data Grid
    const [selecRow, setSelecRow]               =   useState([]);
    
    //Estado para manejo de popUp
    const [popUp, setPopUp]                     =   useState<PopupTemplate>();

    //Estados para manejo columnas componente Tabla Resultados - 2025-07-22
    //Ocultamiento columnas proj y camp - 2025-08-04
    const [columnVisibilityModel, setColumnVisibilityModel] = useState({
        id: false,
        proj: false,
        camp: false
    });
    
    //Estados para opción descarga - 2025-07-01
    const [downloadStatus, setDownloadStatus]   =   useState('');
    const [isDownloading, setIsDownloading]     =   useState(false);

    //Estados para implementar Collapsible en componente TablaResultados - 2025-07-18    
    const [panelStates, setPanelStates]         =   useState({
        metaDataSign: true,
        signData: false,
        filesMetaData: false
    });

    //Estados para obtener las imágenes asociadas a las firmas, según puntos de muestreo - 2025-07-22
    const [phCover, setPhotoCover]              =   useState <string>('');
    const [phContext, setPhotoContext]          =   useState <string>('');
    const [phSky, setPhotoSky]                  =   useState <string>('');
    const [phSpecGraph, setPhotoSpecGraph]      =   useState <string>('');

    //Estado que maneja el estado cargando
    const [isLoad, setIsLoadState]              =   useState(false);

    //Ref para manejo intervalo contador tiempo
    const intervRef                             =   useRef (null);

    //Ref para control Interés sobre los datos - 2025-08-26
    const purpDataRef                           =   useRef <HTMLTextAreaElement>(null);

    //Ref controlador de selección punto sobre mapa base - 2025-10-07
    const clickHandlerRef                       =   useRef (null);

    //Ref controlador de selección registro sobre DataGrid - 2025-10-09
    const pendingSelectionDGRef                 =   useRef (null);

    //Ref para controlar el contenedor del DataGrid - 2025-10-09
    const gridContainerDGRef                    =   useRef (null);
    /** 
     * Evento asociado al cambio de vista sobre el componente JimuMapViewComponent
     * @date 2025-06-09
     * @author Ing.RRH
     * @dateUpdated 2025-06-10
     * @changes Suprimir registro extent inicial del mapa, ya que se realiza en componente ppal (widget en searchSIEC)
     * @remarks método traido del componente ppal widget (searchSIEC)
     */ 
    const activeViewChangeHandler = async (jmv: JimuMapView) => {
        if (utilsModule?.logger()) console.log('Ingresando al evento objeto JimuMapView...')
        if (jmv) {
            setJimuMapView(jmv);
        }
    }

    /**
     * regUserDownloadZip => Formulario para registro de usuario, cuando selecciona opción Descarga
     * @date 2025-08-22
     * @author IGAC - DIP
     * @param {string} usr
     * @param {string} pass 
     * @param {object} files
     * @param {string} zipName
     * @dateUpdated 2025-08-25
     * @changes Actualización validador, para existencia del usuario, asociado al Correo electrónico de la sesión activa
     * @changes Cargue valores listado de paises, asociado al campo País.
     * @dateUpdated 2025-08-27
     * @changes Actualización param usr => files
     * @dateUpdated 2025-08-29
     * @changes Inclusión control de tiempo sesión para campo correo electrónico
     * @changes Fix validador sesión y control de tiempo
     * @dateUpdated 2025-09-02
     * @changes Fix validador sesión campo correo electrónico
     * @dateUpdated 2025-09-03
     * @changes Actualizar control de errores, asociado al retorno de la petición desde el servidor
     * @remarks PopUp de registro Usuario
     * @remarks Uso de variable de sesión asociada al campo Correo electrónico (2025-08-25)
     * @remarks @param files => nomFile + . + ext
     * @remarks FUENTE consulta control de tiempo sesión: Claude, AI => https://claude.ai/chat/1524c133-89ab-4f4c-a923-c5a6b3f5cf4e
     */
   
    const regUserDownloadZip = function (usr:string = '', pass:string = '', files, zipName:string = 'filesZip.zip') {
        //Objetos locales
        var emailSes, urlServicioSIEC, tokenSeg: string    =   "";
        
        //Validar que el usuario existe. Si existe, permitir la descarga
        //De lo contrario, lanzar PopUp y solicitar información y realizar consumo API
        emailSes    =   emailUsrDownSig;
        
        //Tiempo sesión
        const elaps =   getTimeInfo (sesStartTime, sesCurrTime, sessExpires);

        console.log ("Email ses =>",emailSes);
        console.log ("Control tiempos Inicio ses =>",elaps["elapsTime"])
        console.log ("Control tiempos Restante ses =>" ,elaps["remainTime"]);
        console.log ("Control tiempos Estado sesión expirada T / F =>", elaps["expired"]);
        
        //Validación para autorizar descarga o solicitar información del usuario
        if ((typeof emailSes !== 'undefined' || emailSes === ' ') && (typeof elaps["expired"] !== 'undefined' && !elaps["expired"] && typeof elaps["remainTime"] !== 'undefined' && elaps["remainTime"] > 0)){
            downloadZipFile('','',files, generarFileStand (files) + '.zip');
        }
        //Despliegue popUp de registro usuario
        else{
            //Consumo API para campos País y Ocupación
            urlServicioSIEC =   urls.api_host + urls.api_getToken;
            getToken (urlServicioSIEC).then ((tokSegObj) => {
                //Se obtiene token seguridad
                tokenSeg    =   tokSegObj["data"].access_token;
                //Consumo API Listado de Paises
                urlServicioSIEC =   urls.api_host + urls.api_getPaises;
                try{
                    fetch (urlServicioSIEC, {
                        "method": "GET",
                        "headers": {
                            "Accept": "application/json",
                            "Content-type": "application/json",
                            "Authorization": "Bearer"+" "+tokenSeg
                        }
                    })
                    .then ((paisServState) => {
                        var jsonErr: any = {};
                        if (!paisServState.ok){
                            jsonErr = {
								"error": paisServState.status,
								"errorMsg": paisServState.statusText
							  }
                              throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["error"];
							return jsonErr;
                        }
                        //Validador consumo por error del server (cód http <> 200 )
                        else if (typeof (paisServState["error"]) !== 'undefined'){
                            jsonErr = {
                                "errorCode": paisServState["error"].code,
                                "errorMsg": paisServState["error"].message
                            }
                            console.error("Error Obteniendo lista paises del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                        }  
                        return paisServState.json();
                    })
                    .then ((paisDataLst) => {
                        var jsonErr: any	=	{};
                        //Validador consumo por error del server (cód http <> 200 )
                        if (typeof (paisDataLst["error"]) !== 'undefined'){
                            jsonErr = {
                                "errorCode": paisDataLst["error"].code,
                                "errorMsg": paisDataLst["error"].message,
                                "errorMsgDet": paisDataLst["error"].details[0]
                            }
                            console.error("Error obteniendo data del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                        }
                        console.log("Lista paises =>",sortPaises (paisDataLst["data"]));
                        //Asignación del state para la lista de paises
                        setCountryUsrDownSigLst (sortPaises (paisDataLst["data"]));
                    })
                }
                catch (error){
                    var jsonErr: any = {};
                    jsonErr = {
                        "error" : error
                    }
                    console.error ("Problema para obtener listado de paises en servidor remoto!. Error asociado =>",jsonErr["error"]);
                }
                //Consumo API Listado ocupaciones - 2025-08-26
                urlServicioSIEC =   urls.api_host + urls.api_getOcupa;
                try{
                    fetch (urlServicioSIEC, {
                        "method": "GET",
                        "headers": {
                            "Accept": "application/json",
                            "Content-type": "application/json",
                            "Authorization": "Bearer" + " " + tokenSeg
                        }
                    })
                    .then ((ocupaState) => {
                        var jsonErrorObj: any = {};
                        if (!ocupaState.ok){
                            jsonErrorObj = {
                                "error": ocupaState.status,
                                "errorMsg": ocupaState.statusText
                            }
                            throw jsonErrorObj["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["error"]+")";
                            return jsonErrorObj;
                        }
                        //Validador consumo por error del server (cód http <> 200 )
                        else if (typeof (ocupaState["error"]) !== 'undefined'){
                            jsonErr = {
                                "errorCode": ocupaState["error"].code,
                                "errorMsg": ocupaState["error"].message
                            }
                            console.error("Error Obteniendo lista ocupaciones del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                        }
                        return ocupaState.json();
                    })
                    .then ((ocupaData) => {
                        var jsonErr: any	=	{};
                        //Validador consumo por error del server (cód http <> 200 )
                        if (typeof (ocupaData["error"]) !== 'undefined'){
                            jsonErr = {
                                "errorCode": ocupaData["error"].code,
                                "errorMsg": ocupaData["error"].message,
                                "errorMsgDet": ocupaData["error"].details[0]
                            }
                            console.error("Error obteniendo data del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                        }
                        console.log ("Listado ocupaciones ordenadas =>",sortOcupa (ocupaData.data));
                        //Actualización state del control Ocupación
                        setOccupUsrDownSigLst (sortOcupa (ocupaData.data));
                    })
                }
                catch (error){
                    var jsonErr: any = {};
                    jsonErr = {
                        "error" : error
                    }
                    console.error ("Problema para obtener listado de profesiones en servidor remoto!. Error asociado =>",jsonErr["error"]);
                }
            })
            //openCloseModalUsrDetail(usr);
            openCloseModalUsrDetail (files);
        }
    }
    /**
     * downloadZipFile => Método para descargar múltiples archivos en formato ZIP
     * @date 2025-07-01
     * @author IGAC - DIP
     * @param files
     * @param zipName
     * @param usr
     * @param pass 
     * @dateUpdated 2025-07-22
     * @changes Implementación opción Descarga, mediante consumo API api_getMetaDatoIdMetaByPhSig,  api_getFileCompressByIdMeta, api_getCompressByIdFile
     * @dateUpdated 2025-07-24
     * @changes corrección parámetro Content-Type en encabezado (Head), consumo api_getCompressByIdFile => x-zip-compressed
     * @dateUpdated 2025-08-12
     * @changes Inclusión @param usr => email del usuario que se autentica
     * @changes Inclusión @param pass => contraseña del usuario texto plano que se autentica
     * @dateUpdated 2025-09-03
     * @changes Inclusión validador de existencia Metadatos asociados a punto de muestreo (En pruebas)
     * @changes Actualizar control de errores, asociado al retorno de la petición desde el servidor
     * @remarks Fuente de consulta AI: http://claude.ai/chat/921c2de8-6819-4279-91af-648d022bba97
     * @remarks optimizar desarrollo método
     * @remarks Adicionar validador control errores, operaciones al servidor remoto (tipo fetch)
     */

    const downloadZipFile = async function (usr:string = '', pass:string = '', files, zipName:string = 'filesZip.zip'){
        //Objetos locales
        var tokenSeg, urlServicioSIEC: string = ""; 
        
        //Rutina para generar comprimido
        setIsDownloading(true);
        setDownloadStatus("Comprimiendo archivos...");
        //en param zipName => row.phSig +'.zip'
        try{
            //Consumo de la sección metadatos, a través del API
            getToken (urls.api_host + urls.api_getToken).then((datToken) => {
                tokenSeg  = datToken.data.access_token;
                console.log("Token seg para consulta de metadatos Descarga Comprim =>", tokenSeg);
                urlServicioSIEC =   urls.api_host + urls.api_getMetaDatoIdMetaByPhSig + files.split(".")[0];
                console.log("Petición asociada a Metadatos =>",urlServicioSIEC);
                try{
                    fetch(urlServicioSIEC,{
                        method:"GET",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer'+' '+tokenSeg
                        }
                    })
                    .then((rows) => {
                        var jsonErr: any = {};
                        if (!rows.ok)
                        {
                            jsonErr = {
                                "error": rows.status,
                                "errorMsg": rows.statusText
                            }
                            //throw new Error(`HTTP error! status: ${rows.status}`);
                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["error"];
                            return jsonErr;
                        }
                        //Validador consumo por error del server (cód http <> 200 )
                        else if (typeof (rows["error"]) !== 'undefined'){
                            jsonErr = {
                                "errorCode": rows["error"].code,
                                "errorMsg": rows["error"].message
                            }
                            console.error("Error Obteniendo lista de metadatos del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                        }   
                        return rows.json();
                    })
                    .then((metaDataFirma) => {
                        var jsonErr: any	=	{};
                        //Validador consumo por error del server (cód http <> 200 )
                        if (typeof (metaDataFirma["error"]) !== 'undefined'){
                            jsonErr = {
                                "errorCode": metaDataFirma["error"].code,
                                "errorMsg": metaDataFirma["error"].message,
                                "errorMsgDet": metaDataFirma["error"].details[0]
                            }
                            console.error("Error obteniendo lista de metadatos del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                        }
                        console.log("consulta metadato para descarga =>",metaDataFirma);
                        //Validador para existencia de metadatos asociados al punto de muestreo - 2025-09-03
                        if (metaDataFirma["data"].length > 0){
                            //Consumo servicio para obtener Id File por metadato
                            getToken (urls.api_host + urls.api_getToken).then((datToken) => {
                                tokenSeg  = datToken.data.access_token;
                                console.log("Token seg para consulta File Comprim por metadato =>", tokenSeg);                            
                                //Petición consumo API obtener Id File por metadato
                                urlServicioSIEC = urls.api_host + urls.api_getFileCompressByIdMeta + metaDataFirma.data[0].Id_Metadato;
                                try{
                                    fetch(urlServicioSIEC,{
                                        method:"GET",
                                        headers: {
                                            'Accept': 'application/json',
                                            'Content-Type': 'application/json',
                                            'Authorization': 'Bearer'+' '+tokenSeg
                                        }
                                    })
                                    .then((rows) => {
                                        var jsonErr: any = {};
                                        if (!rows.ok)
                                        {
                                            jsonErr = {
                                                "error": rows.status,
                                                "errorMsg": rows.statusText
                                            }
                                            //throw new Error(`HTTP error! status: ${rows.status}`);
                                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["error"];
				                            return jsonErr;
                                        }
                                        //Validador consumo por error del server (cód http <> 200 )
                                        else if (typeof (rows["error"]) !== 'undefined'){
                                            jsonErr = {
                                                "errorCode": rows["error"].code,
                                                "errorMsg": rows["error"].message
                                            }
                                            console.error("Error Obteniendo Identificador de archivo desde los metadatos =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                                        }  
                                        return rows.json();
                                    })
                                    .then((fileCompressId) => {
                                        var jsonErr: any	=	{};
                                        //Validador consumo por error del server (cód http <> 200 )
                                        if (typeof (fileCompressId["error"]) !== 'undefined'){
                                            jsonErr = {
                                                "errorCode": fileCompressId["error"].code,
                                                "errorMsg": fileCompressId["error"].message,
                                                "errorMsgDet": fileCompressId["error"].details[0]
                                            }
                                            console.error("Error obteniendo data del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                                        }
                                        console.log("Consulta id files compress =>",fileCompressId.data);
                                        
                                        //Consumo servicio para obtener archivo comprimido
                                        getToken (urls.api_host + urls.api_getToken).then((datToken) => {
                                            tokenSeg  = datToken.data.access_token;
                                            console.log("Token seg para generación archivo comprimido =>",tokenSeg);
                                            //Petición consumo API obtener archivo comprimido 
                                            //api_getCompressByIdFile
                                            urlServicioSIEC = urls.api_host + urls.api_getCompressByIdFile + fileCompressId.data[0].directus_files_id;
                                            try{
                                                fetch(urlServicioSIEC,{
                                                    method:"GET",
                                                    headers: {
                                                        'Accept': 'application/x-zip-compressed',
                                                        'Content-Type': 'application/x-zip-compressed',
                                                        'Authorization': 'Bearer'+' '+tokenSeg
                                                    }
                                                })
                                                .then((file) => {
                                                    var jsonErr: any = {};
                                                    if (!file.ok)
                                                    {
                                                        jsonErr = {
                                                            "error": file.status,
                                                            "errorMsg": file.statusText
                                                        }
                                                        //throw new Error(`HTTP error! status: ${file.status}`);
                                                        throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["error"];
                                                        return jsonErr;
                                                    }
                                                    //Validador consumo por error del server (cód http <> 200 )
                                                    else if (typeof (file["error"]) !== 'undefined'){
                                                        jsonErr = {
                                                            "errorCode": file["error"].code,
                                                            "errorMsg": file["error"].message
                                                        }
                                                        console.error("Error Obteniendo archivo del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                                                        throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                                                    } 
                                                    return file.blob();
                                                })
                                                .then((resFile) => {
                                                    var jsonErr: any	=	{};
                                                    //Validador consumo por error del server (cód http <> 200 )
                                                    if (typeof (resFile["error"]) !== 'undefined'){
                                                        jsonErr = {
                                                            "errorCode": resFile["error"].code,
                                                            "errorMsg": resFile["error"].message,
                                                            "errorMsgDet": resFile["error"].details[0]
                                                        }
                                                        console.error("Error obteniendo data del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                                                        throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                                                    }
                                                    //Actualización del state de descarga
                                                    setDownloadStatus("Preparando descarga asociada a files!");

                                                    const fileUrl = URL.createObjectURL(resFile);
                                                    
                                                //Creación vinculos descarga, bajo DOM => creación objeto anchor <a>
                                                    const link      =   document.createElement('a');
                                                    //Asignación atributos al anchor y ejecución del evento click
                                                    link.href       =   fileUrl;
                                                    link.download   =   zipName;
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                    
                                                    //Liberación del objeto URL
                                                    URL.revokeObjectURL(fileUrl);
                                                    
                                                    //Actualización del state de descarga
                                                    setDownloadStatus("Objeto comprimido descargado correctamente!");
                                                })
                                            }
                                            catch (error)
                                            {
                                                console.log("Error generando achivo del server =>", error);
                                                throw error;
                                            }

                                        })

                                    })
                                }
                                catch (error)
                                {
                                    console.log("Error obteniendo archivo comprimido del server =>", error);
                                    throw error;
                                }
                            })
                        }
                        //Notificar error de la opción Descarga no disponible, en un modal - 2025-09-03
                        else{
                            console.error ("NO existe metadato asociado!");
                        }
                    });
                }
                catch (error)
                {
                    console.log("Error obteniendo metadatos del server =>", error);
                    throw error;
                }
            })
        }
        catch (error) {
            console.error('Error al crear paquete ZIP =>', error);
            setDownloadStatus('Error al crear paquete ZIP!');
        }
        finally{
            setIsDownloading(false);
            setTimeout(() => setDownloadStatus(''), 3000);
        }
    }


    /**
     * setHeadModal => Método para asignar el encabezado del modal opción Detalles
     * @date 2025-05-16
     * @author IGAC - DIP
     * @param row 
     * @dateUpdated 2025-06-25
     * @changes actualización atributo codSig => objectId
     * @dateUpdated 2025-07-21
     * @changes Actualización título encabezado "Firma asociada con identificador xx" => "Detalles del punto de muestreo xx"
     * @dateUpdated 2025-07-22
     * @changes Actualización punto muestreo id => obj_id
     */
    const setHeadModal = function(row){
      var headJSON = {
          "objectId": row.obj_id
      }
      var headHTMLModal = "Detalles del punto de muestreo"+" "+headJSON.objectId;
      setModalHead(headHTMLModal);
  }

   /**
    * setBodyModal => método para generar el cuerpo del modal, basado en la información del servicio en objeto row
    * @date 2025-05-16
    * @author IGAC - DIP
    * @param metaDataFirma
    * @dateUpdated 2025-06-25
    * @changes Desactivación desde objeto bodyJSONm, atributo tMues ("tMues": row.type,)(cambio temporal), por no existir en el servicio
    * @changes Supresión desde objeto bodyJSONm, atributo altCover
    * @changes Supresión desde objeto bodyJSONm, atributo instrum
    * @dateUpdated 2025-07-18
    * @changes Inclusión atributos asociados a la consulta del objeto Metadatos_Firmas
    * @changes Inclusión @param metaDataSign
    * @dateUpdated 2025-07-21
    * @changes Actualización param metaDataSign => @param metaDataFirma
    * @changes Supresión param @param row
    */
    const setBodyModal = function (metaDataFirma){
        setModalBody(metaDataFirma);
  }
   /**
    * Método openCloseModalDetail => abre / cierra modal asociado a la opción Detalles
    * @date 2025-04-15
    * @author IGAC - DIP
    * @param row
    * @dateUpdated 2025-05-16
    * @changes Adición parámetro row, que contiene la información del dataGrid en la fila seleccionada
    * @dateUpdated 2025-07-18
    * @changes Llamado WServ para obtener la información de metadato, asociado al atributo row.phsig
    * @changes Actualización llamado método setBodyModal
    * @dateUpdated 2025-07-21
    * @changes Realizar consumo API, para obtener la información de firmas (puntos de muestreo), asociado a su identificador row.id => row.obj_id
    * @dateUpdated 2025-07-22
    * @changes Realizar consumo API, para obtener las imágenes de los metadatos asociados a phocover, ptocontext, photosky y spectraGraph
    * @dateUpdated 2025-07-23
    * @changes Detección bug al cerrar el modal, se obtiene petición incorrecta => se adiciona validación que se realice la petición de consumo, apenas se abra el modal.
    * @dateUpdated 2025-07-24
    * @changes Implementar borrado de imágenes de la vista, cuando se cierre el modal.
    * @changes Obtener valores dominio sección firmas
    * @changes Obtener valores dominio sección metadatos
    * @changes Inclusión atributo Id_Metadato en la construcción del objeto Metadatos
    * @dateUpdated 2025-08-06
    * @changes Adición validación al cargue de imágenes {Photo Cover, Photo Context, Photo Sky y Photo Spectrum Graph}, de tal manera, que si no existe desde el Servicio, se visualiza 'Sin imágen asociada'
    * @dateUpdated 2025-08-08
    * @changes Actualización state de los panels para toma de valores iniciales, al cerrar al modal
    * @dateUpdated 2025-08-12
    * @changes Fix bug visualización datos sección metadatos los cuales, mientras se están obteniendo desde el servidor (consumo vía API), se despliega estado Cargando...  
    * @dateUpdated 2025-09-03
    * @changes Actualizar control de errores, asociado al retorno de la petición desde el servidor
    * @remarks Fuente consulta https://www.youtube.com/watch?v=XAAl8IDwMiw&t=775s
    * @remarks Fuente consulta req 2025-07-22 => https://medium.com/@ansarimazhar7353/heres-how-to-handle-image-api-response-in-react-29b0b614051e
    * @remarks Fuente consulta req 2025-07-24 (Obtener valores dominio) => https://stackoverflow.com/questions/47604040/how-to-get-data-returned-from-fetch-promise (@Senthil Balaji)
    */
    const openCloseModalDetail = async function(row){
        var tokenSeg: string;
        var urlServicioSIEC: string;
        var domVal: any;
        console.log("Invocación Modal...",modalDetail);
        console.log("Row =>",row);

        setModalDetail(!modalDetail);
        
        //Head
        setHeadModal(row);
        //Validación de cargue de imágenes, al abrir la opción Detalles (apertura modal)
        if (!modalDetail){
            //Consumo de la sección metadatos, a través del API
            getToken (urls.api_host + urls.api_getToken).then((datToken) => {
                tokenSeg  = datToken.data.access_token;
                console.log("Token seg para consulta de metadatos =>", tokenSeg);
                //Petición consumo API incluyendo el parámetro phSig
                urlServicioSIEC = urls.api_host + urls.api_getMetaDatoByPhSig + row.phSig;
                
                //Activar estado cargando sección metadatos
                setIsLoadState(true);
                //Actualización paneles colapsables
                setPanelStates({
                    metaDataSign: true,
                    signData: false,
                    filesMetaData: false
                });
                try{
                    fetch(urlServicioSIEC,{
                        method:"GET",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer'+' '+tokenSeg
                        }
                    })
                    .then((rows) => {
                        var jsonErr: any = {};
                        if (!rows.ok)
                        {
                            jsonErr = {
                                "error": rows.status,
                                "errorMsg": rows.statusText
                            }
                            //throw new Error(`HTTP error! status: ${rows.status}`);
                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["error"];
                            return jsonErr;
                        }
                        //Validador consumo por error del server (cód http <> 200 )
                        else if (typeof (rows["error"]) !== 'undefined'){
                            jsonErr = {
                                "errorCode": rows["error"].code,
                                "errorMsg": rows["error"].message
                            }
                            console.error("Error Obteniendo información de sección metadatos del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                        }   
                        return rows.json();
                    })
                    .then((metaDataFirma) => {
                        var jsonErr: any	=	{};
                        //Validador consumo por error del server (cód http <> 200 )
                        if (typeof (metaDataFirma["error"]) !== 'undefined'){
                            jsonErr = {
                                "errorCode": metaDataFirma["error"].code,
                                "errorMsg": metaDataFirma["error"].message,
                                "errorMsgDet": metaDataFirma["error"].details[0]
                            }
                            console.error("Error obteniendo data del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                        }
                        console.log("Contenido json metadatos asociados =>", metaDataFirma.data);
                        console.log("Contenido longitud =>",metaDataFirma.data.length);
                        
                        //Consumo de la sección firmas, a través del API
                        getToken (urls.api_host + urls.api_getToken).then((datToken) => {
                            tokenSeg  = datToken.data.access_token;
                            console.log("Token seg para consulta de firmas =>", tokenSeg);
                            
                            //Petición consumo API incluyendo el parámetro ObjectId
                            urlServicioSIEC = urls.api_host + urls.api_getFirmasByObjectId + row.obj_id;
                            try{
                                fetch(urlServicioSIEC,{
                                    method:"GET",
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json',
                                        'Authorization': 'Bearer'+' '+tokenSeg
                                    }
                                })
                                .then((rows) => {
                                    var jsonErr: any = {};
                                    if (!rows.ok)
                                    {
                                        jsonErr = {
                                            "error": rows.status,
                                            "errorMsg": rows.statusText
                                        }                                        
                                        //throw new Error(`HTTP error! status: ${rows.status}`);
                                        throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["error"];
                                        return jsonErr;
                                    }
                                    //Validador consumo por error del server (cód http <> 200 )
                                    else if (typeof (rows["error"]) !== 'undefined'){
                                        jsonErr = {
                                            "errorCode": rows["error"].code,
                                            "errorMsg": rows["error"].message
                                        }
                                        console.error("Error Obteniendo la sección firmas del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                                        throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                                    }       
                                    return rows.json();
                                })
                                .then((firma) => {
                                    var jsonErr: any	=	{};
                                    //Validador consumo por error del server (cód http <> 200 )
                                    if (typeof (firma["error"]) !== 'undefined'){
                                        jsonErr = {
                                            "errorCode": firma["error"].code,
                                            "errorMsg": firma["error"].message,
                                            "errorMsgDet": firma["error"].details[0]
                                        }
                                        console.error("Error obteniendo data del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                                        throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                                    }
                                    console.log("Contenido json firmas (ptos muestreo) asociados =>", firma.data);
                                    console.log("Contenido longitud =>",firma.data.length);
                                    
                                    //Procesamiento metadatos y firmas
                                    //Conversión geometría del servicio rectangulares => decimales (Latitud, Longitud)
                                    var geomLatLon = webMercatorUtils.xyToLngLat(row.pointX, row.pointY);
                                    var bodyJSON: any = [];
                                    var firmaObj: any = [];
                                    var firmaJSON: any = "";
                                    //Firmas
                                    //Consumo objetos tipo dominio {Id_CoverType}
                                    getToken (urls.api_host + urls.api_getToken).then(async (datToken) => { 
                                        tokenSeg        = datToken.data.access_token;
                                        
                                        //Recorrido firmas
                                        for (var contFirm = 0; contFirm < firma.data.length; contFirm++){
                                            //console.log("Indice asociado =>",contFirm);
                                            //Consumo llamando método getDominioValor
                                            domVal = await getDominioValor (tokenSeg, urls.api_host + urls.api_getValDominioByIdVal + firma.data[contFirm].Id_CoverType);
                                            console.log("Valor dom =>",domVal);
                                            //Asignación valor dominio
                                            firma.data[contFirm].Id_CoverType = domVal.data[0].Descripcion_Valor;

                                            //Construcción objeto firma
                                            firmaJSON = {
                                                "SignatureIdentifier": firma.data[contFirm].SignatureIdentifier,
                                                "FileIdentifier":firma.data[contFirm].FileIdentifier,
                                                "InstrumentName":firma.data[contFirm].InstrumentName,
                                                "Id_CoverType":firma.data[contFirm].Id_CoverType,
                                                "SeaLevelAltitude":firma.data[contFirm].SeaLevelAltitude,
                                                "IntegrationTime":firma.data[contFirm].IntegrationTime,
                                                "Boxcar_Width":firma.data[contFirm].Boxcar_Width,
                                                "Scan_Average":firma.data[contFirm].Scan_Average,
                                                "MeasurementHeight":firma.data[contFirm].MeasurementHeight,
                                                "ObjectId":firma.data[contFirm].ObjectId
                                            }
                                            firmaObj.push(firmaJSON);
                                        }
                                        console.log("Objeto firmas =>",firmaObj);

                                        //Metadatos
                                        //Consumo para obtener valor dominio correspondiente
                                        //Id_SignalType
                                        if (metaDataFirma.data[0].Id_SignalType !== null) 
                                        {
                                            domVal = await getDominioValor (tokenSeg, urls.api_host + urls.api_getValDominioByIdVal + metaDataFirma.data[0].Id_SignalType);
                                            metaDataFirma.data[0].Id_SignalType = domVal.data[0].Descripcion_Valor;
                                        }
                                        //Id_AdaptedOptics
                                        if (metaDataFirma.data[0].Id_AdaptedOptics !== null) 
                                        {
                                            domVal = await getDominioValor (tokenSeg, urls.api_host + urls.api_getValDominioByIdVal + metaDataFirma.data[0].Id_AdaptedOptics);
                                            metaDataFirma.data[0].Id_AdaptedOptics  =  domVal.data[0].Descripcion_Valor; 
                                        }
                                        //Id_CoverState
                                        if (metaDataFirma.data[0].Id_CoverState !== null) 
                                        {
                                            domVal = await getDominioValor (tokenSeg, urls.api_host + urls.api_getValDominioByIdVal + metaDataFirma.data[0].Id_CoverState);
                                            metaDataFirma.data[0].Id_CoverState =  domVal.data[0].Descripcion_Valor; 
                                        }
                                        //Id_RoofState
                                        if (metaDataFirma.data[0].Id_RoofState !== null) 
                                        {
                                            domVal    =  await getDominioValor (tokenSeg, urls.api_host + urls.api_getValDominioByIdVal + metaDataFirma.data[0].Id_RoofState); 
                                            metaDataFirma.data[0].Id_RoofState  = domVal.data[0].Descripcion_Valor;  
                                        }
                                        //Id_RoofDescription
                                        if (metaDataFirma.data[0].Id_RoofDescription !== null) 
                                        {
                                            domVal  =   await getDominioValor (tokenSeg, urls.api_host + urls.api_getValDominioByIdVal + metaDataFirma.data[0].Id_RoofDescription); 
                                            metaDataFirma.data[0].Id_RoofDescription    = domVal.data[0].Descripcion_Valor;  
                                        }
                                        //Id_WaterType
                                        if (metaDataFirma.data[0].Id_WaterType !== null) 
                                        {
                                            domVal    =   await getDominioValor (tokenSeg, urls.api_host + urls.api_getValDominioByIdVal + metaDataFirma.data[0].Id_RoofDescription); 
                                            metaDataFirma.data[0].Id_WaterType  =  domVal.data[0].Descripcion_Valor; 
                                        }
                                        //Id_PhenoState
                                        if (metaDataFirma.data[0].Id_PhenoState !== null)
                                        {
                                            domVal   =   await getDominioValor (tokenSeg, urls.api_host + urls.api_getValDominioByIdVal + metaDataFirma.data[0].Id_PhenoState);
                                            metaDataFirma.data[0].Id_PhenoState =  domVal.data[0].Descripcion_Valor;  
                                        }
                                        //Id_SoilType
                                        if (metaDataFirma.data[0].Id_SoilType !== null)
                                        {
                                            domVal =   await getDominioValor (tokenSeg, urls.api_host + urls.api_getValDominioByIdVal + metaDataFirma.data[0].Id_SoilType);
                                            metaDataFirma.data[0].Id_SoilType   =  domVal.data[0].Descripcion_Valor; 
                                        }
                                        //Id_SoilColor
                                        if (metaDataFirma.data[0].Id_SoilColor !== null)
                                        {
                                            domVal    =   await getDominioValor (tokenSeg, urls.api_host + urls.api_getValDominioByIdVal + metaDataFirma.data[0].Id_SoilColor);
                                            metaDataFirma.data[0].Id_SoilColor  =   domVal.data[0].Descripcion_Valor;
                                        }
                                        //Id_SoilDitail
                                        if (metaDataFirma.data[0].Id_SoilDitail !== null) 
                                        {
                                            domVal   =   await getDominioValor (tokenSeg, urls.api_host + urls.api_getValDominioByIdVal + metaDataFirma.data[0].Id_SoilDitail);
                                            metaDataFirma.data[0].Id_SoilDitail =   domVal.data[0].Descripcion_Valor;
                                        }
                                        //Id_SoilProblem
                                        if (metaDataFirma.data[0].Id_SoilProblem !== null) 
                                        {
                                            domVal  =   await getDominioValor (tokenSeg, urls.api_host + urls.api_getValDominioByIdVal + metaDataFirma.data[0].Id_SoilProblem);
                                            metaDataFirma.data[0].Id_SoilProblem    = domVal.data[0].Descripcion_Valor;  
                                        }
                                        //Id_RoofAppearance
                                        if (metaDataFirma.data[0].Id_RoofAppearance !== null) 
                                        {
                                            domVal   =   await getDominioValor (tokenSeg, urls.api_host + urls.api_getValDominioByIdVal + metaDataFirma.data[0].Id_RoofAppearance);
                                            metaDataFirma.data[0].Id_RoofAppearance =  domVal.data[0].Descripcion_Valor; 
                                        }
                                        //Id_RoofColor
                                        if (metaDataFirma.data[0].Id_RoofColor !== null)
                                        {
                                            domVal    =  await getDominioValor (tokenSeg, urls.api_host + urls.api_getValDominioByIdVal + metaDataFirma.data[0].Id_RoofColor); 
                                            metaDataFirma.data[0].Id_RoofColor  =  domVal.data[0].Descripcion_Valor; 
                                        }
                                        //Id_SpectrlaHomogeneityRoof
                                        if (metaDataFirma.data[0].Id_SpectrlaHomogeneityRoof !== null)
                                        {
                                            domVal  =  await getDominioValor (tokenSeg, urls.api_host + urls.api_getValDominioByIdVal + metaDataFirma.data[0].Id_SpectrlaHomogeneityRoof);  
                                            metaDataFirma.data[0].Id_SpectrlaHomogeneityRoof    =  domVal.data[0].Descripcion_Valor; 
                                        }
                                        //Construcción objeto metadatos, incluido objeto firma
                                        bodyJSON = {
                                            "campa_a": row.camp,
                                            "ubic": row.locat,
                                            "proj": row.proj,
                                            "ubicLat": geomLatLon[0].toFixed(3),
                                            "ubicLon": geomLatLon[1].toFixed(3),
                                            "fileSig": row.phSig,
                                            "Id_MetaDato": metaDataFirma.data[0].Id_Metadato,
                                            "Summary": metaDataFirma.data[0].Summary,
                                            "Credits": metaDataFirma.data[0].Credits,
                                            "Topics_Keywords":metaDataFirma.data[0].Topics_Keywords,
                                            "Citation":metaDataFirma.data[0].Citation,
                                            "Citeinfo_Origin":metaDataFirma.data[0].Citeinfo_Origin,
                                            "Citeinfo_Pubdate":metaDataFirma.data[0].Citeinfo_Pubdate,
                                            "Citeinfo_Title":metaDataFirma.data[0].Citeinfo_Title,
                                            "Pubinfo_Pubplace":metaDataFirma.data[0].Pubinfo_Pubplace,
                                            "Pubinfo_Publish":metaDataFirma.data[0].Pubinfo_Publish,
                                            "Onlink":metaDataFirma.data[0].Onlink,
                                            "Lworkcit_Origin":metaDataFirma.data[0].Lworkcit_Origin,
                                            "Lworkcit_Title":metaDataFirma.data[0].Lworkcit_Title,
                                            "Lworkcit_Publish":metaDataFirma.data[0].Lworkcit_Publish,
                                            "Lworkcit_Department":metaDataFirma.data[0].Lworkcit_Department,
                                            "Lworkcit_Laboratory":metaDataFirma.data[0].Lworkcit_Laboratory,
                                            "Lworkcit_Onlink_Based":metaDataFirma.data[0].Lworkcit_Onlink_Based,
                                            "Lworkcit_Address_Type":metaDataFirma.data[0].Lworkcit_Address_Type,
                                            "Lworkcit_Delivery_Point":metaDataFirma.data[0].Lworkcit_Delivery_Point,
                                            "Lworkcit_Address_City":metaDataFirma.data[0].Lworkcit_Address_City,
                                            "Lworkcit_Administrative_Area":metaDataFirma.data[0].Lworkcit_Administrative_Area,
                                            "Lworkcit_Postal_Code":metaDataFirma.data[0].Lworkcit_Postal_Code,
                                            "Lworkcit_Email_Address":metaDataFirma.data[0].Lworkcit_Email_Address,
                                            "Lworkcit_Name":metaDataFirma.data[0].Lworkcit_Name,
                                            "Lworkcit_Version":metaDataFirma.data[0].Lworkcit_Version,
                                            "StandardName":metaDataFirma.data[0].StandardName,
                                            "StandardManufacturer":metaDataFirma.data[0].StandardManufacturer,
                                            "Id_SignalType":metaDataFirma.data[0].Id_SignalType,
                                            "SpectralRange":metaDataFirma.data[0].SpectralRange,
                                            "SpectralResolution":metaDataFirma.data[0].SpectralResolution,
                                            "LightSource":metaDataFirma.data[0].LightSource,
                                            "LightingAngle":metaDataFirma.data[0].LightingAngle,
                                            "FieldOfView":metaDataFirma.data[0].FieldOfView,
                                            "GroundDistance":metaDataFirma.data[0].GroundDistance,
                                            "FiberTilt":metaDataFirma.data[0].FiberTilt,
                                            "Id_AdaptedOptics":metaDataFirma.data[0].Id_AdaptedOptics,
                                            "CloudcoverPercentage":metaDataFirma.data[0].CloudcoverPercentage,
                                            "ReferenceSystem":metaDataFirma.data[0].ReferenceSystem,
                                            "SamplingDate":metaDataFirma.data[0].SamplingDate,
                                            "SamplingTime":metaDataFirma.data[0].SamplingTime,
                                            "Id_PhotoCover":metaDataFirma.data[0].Id_PhotoCover,
                                            "Id_PhotoContext":metaDataFirma.data[0].Id_PhotoContext,
                                            "Id_PhotoSky":metaDataFirma.data[0].Id_PhotoSky,
                                            "Id_Proyecto":metaDataFirma.data[0].Id_Proyecto,
                                            "NumSignatures":metaDataFirma.data[0].NumSignatures,
                                            "Id_CoverState":metaDataFirma.data[0].Id_CoverState,
                                            "Id_RoofState":metaDataFirma.data[0].Id_RoofState,
                                            "Id_RoofDescription":metaDataFirma.data[0].Id_RoofDescription,
                                            "Id_WaterType":metaDataFirma.data[0].Id_WaterType,
                                            "WaterDescription":metaDataFirma.data[0].WaterDescription,
                                            "Id_PhenoState":metaDataFirma.data[0].Id_PhenoState,
                                            "Id_SoilType":metaDataFirma.data[0].Id_SoilType,
                                            "Id_SoilColor":metaDataFirma.data[0].Id_SoilColor,
                                            "Id_SoilDetail":metaDataFirma.data[0].Id_SoilDitail,
                                            "Id_SoilProblem":metaDataFirma.data[0].Id_SoilProblem,
                                            "Id_RoofAppearance":metaDataFirma.data[0].Id_RoofAppearance,
                                            "Id_RoofColor":metaDataFirma.data[0].Id_RoofColor,
                                            "Id_SpectrlaHomogeneityRoof":metaDataFirma.data[0].Id_SpectrlaHomogeneityRoof,
                                            "Iluminance":metaDataFirma.data[0].Iluminance,
                                            "ChlorophyllIndex":metaDataFirma.data[0].ChlorophyllIndex,
                                            "IdSpectraGraph":metaDataFirma.data[0].IdSpectraGraph,
                                            "AmbientTemperature":metaDataFirma.data[0].AmbientTemperature,
                                            "RelativeHumidity":metaDataFirma.data[0].RelativeHumidity,
                                            "WindSpeed":metaDataFirma.data[0].WindSpeed,
                                            "ZenithAngle":metaDataFirma.data[0].ZenithAngle,
                                            "AzimuthAngle":metaDataFirma.data[0].AzimuthAngle,
                                            "Lworkcit_Voice":metaDataFirma.data[0].Lworkcit_Voice,
                                            "Lworkcit_Address_Country":metaDataFirma.data[0].Lworkcit_Address_Country,
                                            "Id_Archivo_Zip":metaDataFirma.data[0].Id_Archivo_Zip,
                                            "firma": firmaObj
                                        }//Obj Metadatos + firmas 
                                        
                                        //Actualización paneles colapsables
                                        setPanelStates({
                                            metaDataSign: true,
                                            signData: false,
                                            filesMetaData: false
                                        });
                                        console.log("Objeto metadato + firmas =>",bodyJSON);
                                        //Desactivar estado cargando sección metadatos
                                        setIsLoadState(false);
                                        //Seteo de los datos asociados desde el consumo del Web service al Body
                                        setBodyModal(bodyJSON);
                                    });
                                })
                            }
                            catch (error)
                            {
                                console.log("Error cargando data sección firmas del server =>", error);
                                throw error;    
                            }
                        })
                        
                        //Consumo servicios para despliegue Imagenes - 2025-07-22                
                        getToken (urls.api_host + urls.api_getToken).then((datToken) => {
                            tokenSeg        = datToken.data.access_token;
                            if (metaDataFirma.data[0].Id_PhotoCover === null){
                                console.log("Estado photocover...");
                                console.log("Sin imágen asociada!");
                                setPhotoCover (null);
                            }
                            else{
                                urlServicioSIEC = urls.api_host + urls.api_getFotoByIdFile + metaDataFirma.data[0].Id_PhotoCover;
                                console.log("URL consumo photocover =>",urlServicioSIEC);
                                //Imágen atributo PhotoCover
                                try{
                                    const res = fetch(urlServicioSIEC, {
                                        method: "GET",
                                        headers: {
                                            'Accept': 'image/jpeg',
                                            'Content-Type': 'image/jpeg',
                                            'Authorization': 'Bearer'+' '+tokenSeg
                                        }
                                    })
                                    .then((fileBin) => {
                                        var jsonErr: any = {};
                                        if (!fileBin.ok)
                                        {
                                            jsonErr = {
                                                "error": fileBin.status,
                                                "errorMsg": fileBin.statusText
                                              }

                                            //throw new Error(`HTTP error! status: ${fileBin.status}`);
                                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["error"];
			                                return jsonErr;
                                        }
                                        //Validador consumo por error del server (cód http <> 200 )
                                        else if (typeof (fileBin["error"]) !== 'undefined'){
                                            jsonErr = {
                                                "errorCode": fileBin["error"].code,
                                                "errorMsg": fileBin["error"].message
                                            }
                                            console.error("Error Obteniendo sección Photo Cover =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                                        }     
                                        return fileBin.blob();
                                    })
                                    .then((resImg) => {
                                        var jsonErr: any	=	{};
                                        //Validador consumo por error del server (cód http <> 200 )
                                        if (typeof (resImg["error"]) !== 'undefined'){
                                            jsonErr = {
                                                "errorCode": resImg["error"].code,
                                                "errorMsg": resImg["error"].message,
                                                "errorMsgDet": resImg["error"].details[0]
                                            }
                                            console.error("Error obteniendo sección Photo Cover =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                                        }
                                        const imgUrl = URL.createObjectURL(resImg);

                                        //State de renderización de imagen
                                        console.log("REspuesta Img photocover =>",imgUrl);
                                        setPhotoCover (imgUrl);
                                    })

                                }
                                catch (error)
                                {
                                    console.log("Error obteniendo imágen photocover del server =>", error);
                                    throw error;    
                                }
                            }
                            //Imágen atributo PhotoContext
                            if (metaDataFirma.data[0].Id_PhotoContext === null){
                                console.log("Estado photocontext...");
                                console.log("Sin imágen asociada!");
                                setPhotoContext (null);
                            }
                            else{
                                urlServicioSIEC = urls.api_host + urls.api_getFotoByIdFile + metaDataFirma.data[0].Id_PhotoContext;
                                console.log("URL consumo PhotoContext =>",urlServicioSIEC);
                                try{
                                    const res = fetch(urlServicioSIEC, {
                                        method: "GET",
                                        headers: {
                                            'Accept': 'image/jpeg',
                                            'Content-Type': 'image/jpeg',
                                            'Authorization': 'Bearer'+' '+tokenSeg
                                        }
                                    })
                                    .then((fileBin) => {
                                        var jsonErr: any = {};
                                        if (!fileBin.ok)
                                        {
                                            jsonErr = {
                                                "error": fileBin.status,
                                                "errorMsg": fileBin.statusText
                                            }
                                            //throw new Error(`HTTP error! status: ${fileBin.status}`);
                                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["error"];
			                                return jsonErr;
                                        }
                                        //Validador consumo por error del server (cód http <> 200 )
                                        else if (typeof (fileBin["error"]) !== 'undefined'){
                                            jsonErr = {
                                                "errorCode": fileBin["error"].code,
                                                "errorMsg": fileBin["error"].message
                                            }
                                            console.error("Error Obteniendo sección Photo Context del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                                        }  
                                        return fileBin.blob();
                                    })
                                    .then((resImg) => {
                                        var jsonErr: any	=	{};
                                        //Validador consumo por error del server (cód http <> 200 )
                                        if (typeof (resImg["error"]) !== 'undefined'){
                                            jsonErr = {
                                                "errorCode": resImg["error"].code,
                                                "errorMsg": resImg["error"].message,
                                                "errorMsgDet": resImg["error"].details[0]
                                            }
                                            console.error("Error obteniendo sección Photo Context del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                                        }
                                        const imgUrl = URL.createObjectURL(resImg);
                                        console.log("REspuesta Img PhotoContext =>",imgUrl);
                                        //Seteo de los datos asociados desde el consumo del Web service
                                        setPhotoContext (imgUrl);
                                    })
                                }
                                catch (error)
                                {
                                    console.log("Error obteniendo imágen PhotoContext del server =>", error);
                                    throw error;    
                                }
                            }
                            //Imágen atributo PhotoSky
                            if (metaDataFirma.data[0].Id_PhotoSky === null){
                                console.log("Estado photosky...");
                                console.log("Sin imágen asociada!");
                                setPhotoSky (null);
                            }
                            else{
                                urlServicioSIEC = urls.api_host + urls.api_getFotoByIdFile + metaDataFirma.data[0].Id_PhotoSky;
                                console.log("URL consumo PhotoSky =>",urlServicioSIEC);
                                try{
                                    const res = fetch(urlServicioSIEC, {
                                        method: "GET",
                                        headers: {
                                            'Accept': 'image/jpeg',
                                            'Content-Type': 'image/jpeg',
                                            'Authorization': 'Bearer'+' '+tokenSeg
                                        }
                                    })
                                    .then((fileBin) => {
                                        var jsonErr: any = {};
                                        if (!fileBin.ok)
                                        {
                                            jsonErr = {
                                                "error": fileBin.status,
                                                "errorMsg": fileBin.statusText
                                            }
                                            //throw new Error(`HTTP error! status: ${fileBin.status}`);
                                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["error"];
                                            return jsonErr;
                                        }
                                        //Validador consumo por error del server (cód http <> 200 )
                                        else if (typeof (fileBin["error"]) !== 'undefined'){
                                            jsonErr = {
                                                "errorCode": fileBin["error"].code,
                                                "errorMsg": fileBin["error"].message
                                            }
                                            console.error("Error Obteniendo sección Photo Sky del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                                        }  
                                        return fileBin.blob();
                                    })
                                    .then((resImg) => {
                                        var jsonErr: any	=	{};
                                        //Validador consumo por error del server (cód http <> 200 )
                                        if (typeof (resImg["error"]) !== 'undefined'){
                                            jsonErr = {
                                                "errorCode": resImg["error"].code,
                                                "errorMsg": resImg["error"].message,
                                                "errorMsgDet": resImg["error"].details[0]
                                            }
                                            console.error("Error obteniendo sección Photo Sky del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                                        }
                                        const imgUrl = URL.createObjectURL(resImg);
                                        console.log("REspuesta Img PhotoSky =>",imgUrl);
                                        
                                        //Seteo de los datos asociados desde el consumo del Web service
                                        setPhotoSky (imgUrl);
                                    })
                                }
                                catch (error)
                                {
                                    console.log("Error obteniendo imágen PhotoSky del server =>", error);
                                    throw error;    
                                }
                            }
                            //Imágen Spectra Graph, atributo IdSpectraGraph
                            if (metaDataFirma.data[0].IdSpectraGraph === null){
                                console.log("Estado Photo Spectrum Graph...");
                                console.log("Sin imágen asociada!");
                                setPhotoSpecGraph (null);
                            }
                            else{
                                urlServicioSIEC = urls.api_host + urls.api_getFotoByIdFile + metaDataFirma.data[0].IdSpectraGraph;
                                console.log("URL consumo Spectra Graph =>",urlServicioSIEC);
                                try{
                                    const res = fetch(urlServicioSIEC, {
                                        method: "GET",
                                        headers: {
                                            'Accept': 'image/jpeg',
                                            'Content-Type': 'image/jpeg',
                                            'Authorization': 'Bearer'+' '+tokenSeg
                                        }
                                    })
                                    .then((fileBin) => {
                                        var jsonErr: any = {};
                                        if (!fileBin.ok)
                                        {
                                            jsonErr = {
                                                "error": fileBin.status,
                                                "errorMsg": fileBin.statusText
                                            }
                                            //throw new Error(`HTTP error! status: ${fileBin.status}`);
                                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["error"];
			                                return jsonErr;
                                        }
                                        //Validador consumo por error del server (cód http <> 200 )
                                        else if (typeof (fileBin["error"]) !== 'undefined'){
                                            jsonErr = {
                                                "errorCode": fileBin["error"].code,
                                                "errorMsg": fileBin["error"].message
                                            }
                                            console.error("Error Obteniendo sección Spectra graph del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                                        }  
                                        return fileBin.blob();
                                    })
                                    .then((resImg) => {
                                        var jsonErr: any	=	{};
                                        //Validador consumo por error del server (cód http <> 200 )
                                        if (typeof (resImg["error"]) !== 'undefined'){
                                            jsonErr = {
                                                "errorCode": resImg["error"].code,
                                                "errorMsg": resImg["error"].message,
                                                "errorMsgDet": resImg["error"].details[0]
                                            }
                                            console.error("Error obteniendo sección Spectra graph del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                                        }
                                        const imgUrl = URL.createObjectURL(resImg);
                                        console.log("REspuesta Img Spectra Graph =>",imgUrl);

                                        //Seteo de los datos asociados desde el consumo del Web service
                                        setPhotoSpecGraph (imgUrl);
                                    })
                                }
                                catch (error)
                                {
                                    console.log("Error obteniendo imágen (Spectra Graph) del server =>", error);
                                    throw error;    
                                }
                            }
                        })
                        
                    })
                }
                catch (error)
                {
                    console.log("Error cargando data del server, sección metadato =>", error);
                    throw error;
                }
            })
        }
        //Cuando se cierre el modal, se limpian las imágenes 
        else
        {
            //Limpieza imágenes (2025-07-24)
            setPhotoCover(null);
            setPhotoContext(null);
            setPhotoSky(null);
            setPhotoSpecGraph(null);
            
            //Limpieza objetos metadatos, firmas (2025-08-12)
            setBodyModal('');

            //Actualización paneles colapsables
            setPanelStates({
                metaDataSign: false,
                signData: false,
                filesMetaData: false
            });
        }
    }
    /**
     * Visualización modal para registro información usuario que descarga archivo de firma. 
     * @date 2025-08-22
     * @author IGAC - DIP 
     * @param {string} files
     * @dateUpdated 2025-08-27
     * @changes Cambio @param usr => @param files
     * @dateUpdated 2025-08-29
     * @changes Fix limpieza campos Pais, Ocuptación y Empresa
     * @changes Fix limpieza validadores
     */
    const openCloseModalUsrDetail = function (files: string){
        console.log("Invocación Modal...",modalUsrDataDetail);
        //console.log("Persona / usuario asociado =>", usr);
        console.log("Archivo asociado para descarga =>",files);
        //AL cerrar el modal, se limpian los campos del formulario, y sus correspondientes validadores
        if (modalUsrDataDetail){
            //Limpieza campos formulario
            //Campo Nombres y apellidos
            formUsrDownSigData.nameLastName = "";            
            //Campo Correo electrónico
            formUsrDownSigData.email = "";
            //Campo País
            setCountryUsrDownSig (undefined);
            setFormUsrDownSigData (prevState => ({
                ...prevState,
                ["pais"]: ""
            }))
            formUsrDownSigData.pais     = "";
            countryUsrDownSigLst.length = 0;
            setCountryUsrDownSigLst ([]);
            //Campo Ocupación
            setOccupUsrDownSig (undefined);
            setFormUsrDownSigData (prevState => ({
                ...prevState,
                ["ocupa"]: ""
            }))
            formUsrDownSigData.ocupa    = "";
            occupUsrDownSigLst.length   = 0;
            setOccupUsrDownSigLst ([]);
            //Campo Empresa / Org            
            formUsrDownSigData.emprWork = "";
            setWorkUsrDownSig ("");
            //Campo Describa el interés en los datos
            formUsrDownSigData.purpData = "";

            //Limpieza validadores
            clearError ("nameLastName");
            clearError ("email");
            clearError ("pais");
            clearError ("ocupa");
            clearError ("emprWork");
            clearError ("purpData");
        }
        //Registro del archivo de descarga
        else{
            setFormUsrDownSigData (prevState => ({
                ...prevState,
                ["files"]: files
            }));
        }
        //Cierre modal respectivo
        setModalUsrDataDetail (!modalUsrDataDetail);
    }
    /**
     * Columnas del componente DataGrid, invocado desde el componente TablaResultSrcSIEC
     * @date 2025-04-09
     * @author IGAC - DIP
     * @dateUpdated 2025-04-10
     * @changes Adaptación del atributo width a todas las columnas
     * @changes Adaptación columna Operaciones, para adicionar botón Descarga
     * @dateUpdated 2025-05-09
     * @changes Incluir columnas según el consumo del servicio
     * @dateUpdated 2025-05-12
     * @changes Actualizar ancho (width) a campo Código Firma 180 => 240  
     * @changes Actualizar ancho (width) a campo Instrumento 220 => 270 
     * @changes Actualizar ancho (width) a campo Proyecto 210 => 240  
     * @changes Actualizar ancho (width) a campo Archivo firma 220 => 270
     * @dateUpdated 2025-05-16
     * @changes Unificación opción Detalles
     * @changes Actualización invocación método openCloseModalDetail
     * @changes Actualizar ancho (width) a campo Operaciones 106 => 220
     * @changes Actualizar ancho (width) a campo Instrumento 270 => 340
     * @changes Actualizar ancho (width) a campo Archivo firma 270 => 450 (320 Opt)
     * @dateUpdated 2025-05-23
     * @changes Actualizar ancho (width) a campo Ubicación 90 => 340
     * @dateUpdated 2025-06-19
     * @changes Especificar columna Operaciones antes de columna Object Id
     * @dateUpdated 2025-06-25
     * @changes Desactivar atributo type dado por {field:"type", headerName:"Cobertura", width: 150}, por no existir en el servicio (cambio temporal)
     * @changes Suprimir columna Código Firma dado por atributo codSig {field:"codSig", headerName:"Código Firma", width: 240}
     * @changes Suprimir columna Instrumento dado por atributo ins{field:"ins", headerName:"Instrumento", width: 340}
     * @changes Suprimir columna Altura snm dado por atributo alsnm {field:"alsnm", headerName:"Altura snm",width: 100} 
     * @changes Suprimir columna % pureza dado por atributo speInteg {field:"speInteg", headerName:"% pureza", width: 90}
     * @dateUpdated 2025-06-27
     * @changes Actualizar ancho (width) a campo Proyecto 240 => 500
     * @changes Actualizar ancho (width) a campo Campaña 160 => 305
     * @dateUpdated 2025-07-01
     * @changes Invocar método downloadZipFile(), bajo opción Descarga
     * @dateUpdated 2025-07-22
     * @changes Ocultamiento campo id => Object Id
     * @dateUpdated 2025-08-13
     * @changes Actualización invocación método downloadZipFile, pasando los params {emailUsr, passUsr, string param phSig (photo signature), string nomFile + ext}
     * @dateUpdated 2025-09-02
     * @changes Actualizar ancho (width) a campo Ubicación 340 => 270
     * @changes Actualizar ancho (width) a campo Operaciones 220 => 208
     * @changes Actualizar ancho (width) a campo Archivo firma 450 => 300
     * @remarks Fuente consulta https://stackoverflow.com/questions/64331095/how-to-add-a-button-to-every-row-in-mui-x-data-grid
     * @remarks Medidas campos Tabla Resultados en unidades px (pixels)
     */
    const columnsSrcSIEC = [
        {field:"oper", headerName:"Operaciones", width: 208,
            sortable: false, 
            renderCell: ({ row }) => 
            <>
                <Button type="primary" onClick={() => regUserDownloadZip('','',row.phSig + '.zip', generarFileStand(row.phSig) + '.zip')} disabled={isDownloading}>Descarga</Button>&nbsp;&nbsp;
                <Button type="primary" onClick={() => openCloseModalDetail(row)}>Detalles</Button>
            </>
        },
        {field:"id", headerName:"Object Id", width: 78},
        {field:"proj", headerName:"Proyecto", width: 500},
        {field:"camp", headerName:"Campaña", width: 305},
        {field:"locat", headerName:"Ubicación", width: 270},
        {field:"phSig", headerName:"Archivo firma", width: 300}
    ]

    /**
     * togglePanel => Método para controlar el estado de los paneles Metadatos y firma
     * @date 2025-07-18
     * @author IGAC - DIP
     * @remarks FUENTE consulta: Claude AI => https://claude.ai/chat/ed738d40-4823-4e17-b083-37219a422714 
     */
    
    const togglePanel = function (panelName: string) {
        setPanelStates (prev => ({
            ...prev,
            [panelName]: !prev[panelName]
        }));
    }

    /**
     * Método para expandir / contraer el collapsable en todas secciones => {metadatos,firmas,imágenes}
     * @date 2025-09-12
     * @author IGAC - DIP
     * @param {string} secc
     * @remarks FUENTE consulta: Claude AI => https://claude.ai/chat/40d5ca55-213a-46ef-a7db-f0cc3b581a98
     */
    const handleRowCollapClick = function (secc) {
        togglePanel (secc);
    }

    /**
     * Sección procesamiento archivos en formato XML
     */

    /**
     * getXmlMetadato => Método para obtener información de los metadatos firmas, en archivo formato xml.
     * @date 2025-07-24
     * @author IGAC - DIP
     * @param obj
     * @dateUpdated 2025-07-28
     * @changes Asignación objeto rootXml
     * @changes Construcción estructura XML, según modelo cliente
     * @dateUpdated 2025-07-29
     * @changes Actualización estructura XML, según modelo cliente, dado en comunicado "RE: Validación de campos faltantes en metadato XML",  29/07/2025, 12:23
     * @changes Estructuración método por secciones: root xml, optimizaciones tags, consumo servicios API, descarga archivo xml
     * @dateUpdated 2025-07-30
     * @changes Consumo API para obtener los nombres de archivos asociados a los objetos {PhotoCover, PhotoContext, PhotoSky, SpectraGraph}
     * @changes Implementación Array de objetos para asociar los objetos {PhotoCover, PhotoContext, PhotoSky, SpectraGraph}
     * @return {file}
     * @remarks Fuente consulta: Claude AI => https://claude.ai/chat/4e4e2115-69ec-4631-beb9-c68754643de3
     */
    const getXmlMetadato = async function (obj){
        //Sección inicialización objetos locales
        //Objeto Metadato
        var xmlObj, xmlObjOptim, xmlNewOptim: Object    =   {};
        var insObj, projObj                             =   {};
        var coverFileObj, contextFileObj: Object        =   {};
        var skyFileObj, spectraGrFileObj: Object        =   {};
        var filesArrObj: any                            =   [];
        var rootXml, rootAttrib, tokenSeg: string       =   "";
        
        //Objeto xml root
        rootXml     = 'gmd:MD_Metadata';
        rootAttrib  = 'xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco"';

        //Procesamiento tags con data nula (null)
        //Optimización de valores null
        xmlObjOptim   =   removeValNulos (obj.modalBody);

        //Opciones de configuración convertidor
        const defOpt    = {
            declaration: { encoding: 'UTF-8' },
            format: { pretty: true, indent: '  ' },
            wrapArray: { enabled: false }
        }
        console.log("Objeto metadato asociado al id =>",obj.modalBody.Id_MetaDato);
        
        //Sección consumo servicios del API
        //Consumo objeto api_getProyectosByIdProy => Detalles proyectos
        tokenSeg        =   await getTokenAlt (urls.api_host + urls.api_getToken);
        projObj         =   await getProjDetailsByIdProj (tokenSeg["data"].access_token, urls.api_host + urls.api_getProyectosByIdProy + xmlObjOptim.Id_Proyecto);
        console.log("Proj Details =>",projObj["data"]);
        
        //Consumo objeto api_getInstrumentosByNomInstrum => Detalles instrumentos
        tokenSeg        =   await getTokenAlt (urls.api_host + urls.api_getToken);
        console.log("Token Seg en generateXml... ",tokenSeg["data"]);
        insObj          =   await getInstrumDetailsByNomInstrum (tokenSeg["data"].access_token, urls.api_host + urls.api_getInstrumentosByNomInstrum + (xmlObjOptim.firma[0].InstrumentName + "%20"));  //OJO, instrumento en campo InstrumenName tiene un espacio asociado al Id_Instrumento=8
        console.log("Instrum Details =>",insObj);
        
        //Consumo objeto api_getFileNameByIdFile => Nombres archivo asociado a las imágenes
        //PhotoCover
        tokenSeg        =   await getTokenAlt (urls.api_host + urls.api_getToken);
        coverFileObj    =   await getFileNameByIdFile (tokenSeg["data"].access_token, urls.api_host + urls.api_getFileNameByIdFile + xmlObjOptim.Id_PhotoCover + urls.api_getFileNameByIdFileFlds);
        console.log("File name asociado Cover =>",coverFileObj);
        filesArrObj.push (coverFileObj);
        //PhotoContext
        tokenSeg        =   await getTokenAlt (urls.api_host + urls.api_getToken);
        contextFileObj  =   await getFileNameByIdFile (tokenSeg["data"].access_token, urls.api_host + urls.api_getFileNameByIdFile + xmlObjOptim.Id_PhotoContext + urls.api_getFileNameByIdFileFlds);
        console.log("File name asociado Context =>",contextFileObj);
        filesArrObj.push (contextFileObj);
        //PhotoSky
        tokenSeg        =   await getTokenAlt (urls.api_host + urls.api_getToken);
        skyFileObj      =   await getFileNameByIdFile (tokenSeg["data"].access_token, urls.api_host + urls.api_getFileNameByIdFile + xmlObjOptim.Id_PhotoSky + urls.api_getFileNameByIdFileFlds);
        filesArrObj.push (skyFileObj);
        //SpectraGraph
        tokenSeg        =   await getTokenAlt (urls.api_host + urls.api_getToken);
        spectraGrFileObj=   await getFileNameByIdFile (tokenSeg["data"].access_token, urls.api_host + urls.api_getFileNameByIdFile + xmlObjOptim.IdSpectraGraph + urls.api_getFileNameByIdFileFlds);        
        filesArrObj.push (spectraGrFileObj);
        console.log("Array File names asociado =>",filesArrObj);   //[coverFileObj, contextFileObj, skyFileObj, spectraGrFileObj]
        
        //Sección generación estructura XML
        xmlNewOptim     =   getXMLStruct (xmlObjOptim, projObj, insObj, filesArrObj)
        
        //Exportación objeto XML => root, estructura y configuraciones al parser
        xmlObj          =   parse (rootXml, xmlNewOptim, defOpt);
        
        //Generar tags xml completos <b/> => <b></b>
        xmlObj          =   expandXmlTags (xmlObj);
        console.log("Testing XML obj =>",expandXmlTags (xmlObj));
        xmlObj          =   addRootAttrib (xmlObj, rootXml, rootAttrib);
        
        //Descarga archivo generado en objeto xmlObj
        downloadXmlMetadato (xmlObj, generarFileStand (obj.modalBody.fileSig) + '.xml');
    }

    /**
     * removeValNulos => Método para reemplazar valores null en los atributos por vacío
     * @date 2025-07-25
     * @author IGAC - DIP
     * @param objXml 
     * @remarks FUENTE consulta: claude AI => https://claude.ai/chat/4e4e2115-69ec-4631-beb9-c68754643de3
     */
    const removeValNulos = function (objXml){
        if (objXml === null || typeof objXml === 'undefined'){
            return '';
        }

        if (Array.isArray (objXml)){
            return objXml.map (elem => removeValNulos (elem));
        }

        if (typeof objXml === 'object'){
            const objOptimXml    =   {};
            for (const [id, value] of Object.entries (objXml)) {
                objOptimXml [id] =   removeValNulos (value);
            }
            return objOptimXml;
        }
        return objXml;
    }

    /**
     * expandXmlTags => método para generar los tags XML completos de la forma <attr></attr>
     * @date 2025-07-25
     * @author IGAC - DIP
     * @param xmlObj 
     * @remarks FUENTE consulta: Claude AI => https://claude.ai/chat/4e4e2115-69ec-4631-beb9-c68754643de3
     */
    const expandXmlTags = function (xmlObj) {
        return xmlObj.replace (/<(\w+)\s*\/>/g, '<$1></$1>');
    }

    /**
     * getXMLStruct => Método para construir la estructura jerárquica del objeto XML
     * @date 2025-07-29
     * @author IGAC - DIP
     * @param xmlObjOptim 
     * @param projObj 
     * @param insObj
     * @param filesArr
     * @dateUpdated 2025-07-30
     * @changes Inclusión @param filesArr, el cual contiene los objetos de la sección photoImages
     * @returns {object}
     * @remarks filesArrObj = {PhotoCover, PhotoContext, PhotoSky, SpectraGraph}
     */
    const getXMLStruct = function (xmlObjOptim, projObj, insObj, filesArrObj) {
        //Definición objetos locales
        var xmlNewOptim: Object = {};
        //Construcción estructura
        xmlNewOptim = {
            abstract: {
                HTMLmetadata: xmlObjOptim.Summary
            },
            citation: {
                citeinfo: {
                    origin: xmlObjOptim.Citeinfo_Origin,
                    pubdate: xmlObjOptim.Citeinfo_Pubdate,
                    title: xmlObjOptim.Citeinfo_Title,
                    pubinfo: {
                        pubplace: xmlObjOptim.Pubinfo_Pubplace,
                        publish: xmlObjOptim.Pubinfo_Publish
                    },
                    onlink: xmlObjOptim.Onlink,
                    lworkcit: {
                        citeinfo: {
                            origin: xmlObjOptim.Lworkcit_Origin,
                            title: xmlObjOptim.Lworkcit_Title,                            
                            pubinfo: {
                                publish: xmlObjOptim.Lworkcit_Publish,
                                laboratory: xmlObjOptim.Lworkcit_Laboratory,
                                onlink: xmlObjOptim.Lworkcit_Onlink_Based
                            }
                        }
                    }
                }
            },
            fileIdentifier: {
                characterString: xmlObjOptim.fileSig
            },
            projectInfo: {
                projectName: projObj["data"][0].ProjectName,
                projectDescription: projObj["data"][0].ProjectDescription,
                projectInstitution: projObj["data"][0].ProjectInstitution
            },
            instrument: {
                instrumentName: xmlObjOptim.firma[0].InstrumentName,
                instrumentManufacturer: insObj["data"][0].InstrumentManufacturer,
                instrumentModel: insObj["data"][0].InstrumentModel,
                spectralRange: insObj["data"][0].SpectralRange,
                metrologicNumber: insObj["data"][0].MetrologicNumber
            },
            referenceStandard: {
                standardName: xmlObjOptim.StandardName,
                standardManufacturer: xmlObjOptim.StandardManufacturer
            },
            signalProperties: {
                signalType: xmlObjOptim.Id_SignalType,
                spectralRange: xmlObjOptim.SpectralRange,
                spectralResolution: xmlObjOptim.SpectralResolution
            },
            lightingInfo: {
                lightSource: xmlObjOptim.LightSource,
                lightingAngle: xmlObjOptim.LightingAngle
            },
            observationGeometry: {
                fieldOfView: xmlObjOptim.FieldOfView,
                measurementHeight: xmlObjOptim.firma[0].MeasurementHeight,
                groundDistance: xmlObjOptim.GroundDistance,
                fiberTilt: xmlObjOptim.FiberTilt,
                adaptedOptics: xmlObjOptim.Id_AdaptedOptics
            },
            atmosphericConditions: {
                ambientTemperature: xmlObjOptim.AmbientTemperature,
                relativeHumidity: xmlObjOptim.RelativeHumidity,
                zenithAngle: xmlObjOptim.ZenithAngle,
                azimuthAngle: xmlObjOptim.AzimuthAngle,
                cloudcoverPercentage: xmlObjOptim.CloudcoverPercentage,
                sealevelAltitude: xmlObjOptim.firma[0].SeaLevelAltitude
            },
            samplingInfo: {
                geographicLocation: xmlObjOptim.ubicLat + " " + xmlObjOptim.ubicLon,
                referenceSystem: xmlObjOptim.ReferenceSystem,
                sealevelAltitude: xmlObjOptim.firma[0].SeaLevelAltitude,
                samplingDate: xmlObjOptim.SamplingDate,
                samplingTime: xmlObjOptim.SamplingTime
            },
            photoImages: {
                photoCover: filesArrObj[0]["data"].filename_download,
                photoContext: filesArrObj[1]["data"].filename_download,
                photoSpectraGr:filesArrObj[3]["data"].filename_download
            },
            signatureHeader: {
                IntegrationTime: xmlObjOptim.firma[0].IntegrationTime,
                boxcar_width: xmlObjOptim.firma[0].Boxcar_Width,
                scan_Average: xmlObjOptim.firma[0].Scan_Average
            }

        };
        return xmlNewOptim;
    }

    /**
     * downloadXmlMetadato => Descarga del contenido en formato xml, archivo local
     * @date 2025-07-25
     * @author IGAC - DIP
     * @param content
     * @param fileXml
     * @returns {file}
     * @remarks Fuente consulta: Claude AI => https://claude.ai/chat/4e4e2115-69ec-4631-beb9-c68754643de3
     */

    const downloadXmlMetadato = function (content, fileXml = 'xmlData.xml'){
        //Construcción objeto Blob
        const blobFile  =   new Blob ([content], {
            type: 'application/xml;charset=utf-8'
        });
        //Construcción objeto URL para generación de la operación descarga en el browser
        const urlFile   =   URL.createObjectURL (blobFile);
        //Construcción objeto anchor <a>
        const aObject   =   document.createElement ('a');
        //Asignación de propiedades href y download
        aObject.href    =   urlFile;
        aObject.download=   fileXml;
        //Creación objeto <a> en el DOM
        document.body.appendChild (aObject);
        //Simulación evento click sobre el objeto
        aObject.click();
        //Para descarga exitosa, limpieza de objetos temporales
        document.body.removeChild (aObject);
        URL.revokeObjectURL (urlFile);
    }

    /**
     * addRootAttrib => Método para adicionar atributos a los nodos XML
     * @date 2025-07-28
     * @author IGAC - DIP
     * @param xmlObj 
     * @param rootName 
     * @param atribs
     * @returns {string} XML con atributos
     * @remarks FUENTE consulta: Claude AI => https://claude.ai/chat/4e4e2115-69ec-4631-beb9-c68754643de3
     */
    const addRootAttrib = function (xmlObj, rootName, atribs) {
        if (!atribs.trim())
            return xmlObj;
        const rootOpenT         =   `<${rootName}>`;
        const rootWithAttrib    =   `<${rootName} ${atribs}>`;

        return xmlObj.replace (rootOpenT, rootWithAttrib);
    }

    /**
     * Sección validadores de formulario Información usuario por descarga     * 
     */

    /**
     * Método para realizar ajuste a la altura del control de manera automática
     * @date 2025-08-26
     * @author IGAC - DIP
     * @param evtCtrl 
     * @remarks FUENTE consulta: Claude AI => https://claude.ai/chat/4d8fd538-d03d-4afa-98d5-356587a8064a
     */
    const autoResizeCtrl  = function (evtCtrl: HTMLTextAreaElement){
        evtCtrl.style.height    =   'auto';
        evtCtrl.style.height    =   `${evtCtrl.scrollHeight}px`;
    }

    /**
     * handleTxtNomApeChange => Evento para detectar cambio sobre control Nombre y apellido
     * @date 20025-08-25
     * @author IGAC - DIP
     * @param {string} fld 
     * @param {string} value 
     * @remarks FUENTE consulta: Claude, AI => https://claude.ai/chat/5b18640b-67bd-4e3d-9658-dbc103456392
     */
    const handleTxtNomApeChange = function (fld, value){
        setFormUsrDownSigData (prevState => ({
            ...prevState,
            [fld]: value
        }));
        //Limpieza de error, cuando se inicia diligencimiento sobre campo
        if (errors [fld]){
            clearError (fld);
        }
    }

    /**
     * handleTxtNomApeBlur => Evento para detectar salida del cursor cuando se encuentra sobre el campo Nombre y apellido
     * @date 2025-08-25
     * @param {string} fld 
     * @param {string} value 
     * @param {object} tValid 
     * @remarks FUENTE consulta: Claude, AI => https://claude.ai/chat/5b18640b-67bd-4e3d-9658-dbc103456392
     */
    const handleTxtNomApeBlur = function (fld, value, tValid){
        validateField (fld, value, tValid);
    }

    /**
     * handleTxtEmailChange => Evento para detectar cambio sobre control Email
     * @date 20025-08-25
     * @author IGAC - DIP
     * @param {string} fld 
     * @param {string} value 
     * @remarks Basado en método handleTxtNomApeChange()
     * @remarks FUENTE consulta: Claude, AI => https://claude.ai/chat/5b18640b-67bd-4e3d-9658-dbc103456392     
     */
    const handleTxtEmailChange = function (fld, value){
        handleTxtNomApeChange (fld, value);
    }

    /**
     * handleTxtEmailBlur => Evento para detectar salida del cursor cuando se encuentra sobre el campo Correo electrónico
     * @date 20025-08-25
     * @author IGAC - DIP
     * @param {string} fld 
     * @param {string} value  
     * @param {object} tValid 
     * @remarks Basado en método handleTxtNomApeBlur()
     * @remarks FUENTE consulta: Claude, AI => https://claude.ai/chat/5b18640b-67bd-4e3d-9658-dbc103456392     
     */
    const handleTxtEmailBlur = function (fld, value, tValid){
        handleTxtNomApeBlur (fld, value, tValid);
    }

    /**
     * handleTxtEmprWorkChange => Evento para detectar cambio sobre control Empresa / Org
     * @date 20025-08-25
     * @author IGAC - DIP
     * @param {string} fld 
     * @param {string} value
     * @remarks Basado en método handleTxtNomApeChange()
     * @remarks FUENTE consulta: Claude, AI => https://claude.ai/chat/5b18640b-67bd-4e3d-9658-dbc103456392      
     */
    const handleTxtEmprWorkChange = function (fld, value) {
        handleTxtNomApeChange (fld, value)   
    }

    /**
     * handleTxtEmprWorkBlur => Evento para detectar salida del cursor cuando se encuentra sobre el campo Empresa / Organización
     * @date 20025-08-25
     * @author IGAC - DIP
     * @param {string} fld 
     * @param {string} value  
     * @param {object} tValid 
     * @remarks Basado en método handleTxtNomApeBlur()
     * @remarks FUENTE consulta: Claude, AI => https://claude.ai/chat/5b18640b-67bd-4e3d-9658-dbc103456392     
     */
    const handleTxtEmprWorkBlur = function (fld, value, tValid) {
        handleTxtNomApeBlur (fld, value, tValid);
    }

    /**
     * handleTxtPurpDataChange => Evento para detectar cambio sobre control "Interés en los datos" 
     * @date 20025-08-25
     * @author IGAC - DIP
     * @param {string} fld 
     * @param {string} value 
     * @remarks Basado en método handleTxtNomApeChange()
     * @remarks FUENTE consulta: Claude, AI => https://claude.ai/chat/5b18640b-67bd-4e3d-9658-dbc103456392     
     */
    const handleTxtPurpDataChange = function (fld, value){
        //Invocación validador
        handleTxtNomApeChange (fld, value);
    }

    /**
     * handleTxtPurpDataBlur => Evento para detectar salida del cursor cuando se encuentra sobre el campo Describa el interés sobre los datos.
     * @date 20025-08-25
     * @author IGAC - DIP
     * @param {string} fld 
     * @param {string} value  
     * @remarks Basado en método handleTxtNomApeBlur()
     * @remarks FUENTE consulta: Claude, AI => https://claude.ai/chat/5b18640b-67bd-4e3d-9658-dbc103456392     
     */
    const handleTxtPurpDataBlur = function (fld, value, tValid){
        //console.log("Verificando validador Describa el interés...=>",tValid);
        handleTxtNomApeBlur (fld, value, tValid);
    }

    /**
     * handleTxtPurpDataInput => Evento que controla el ingreso de información al campo "Interés sobre los datos"
     * @date 2025-08-26
     * @author IGAC - DIP
     * @param {Event} evt
     * @remarks FUENTE consulta: Claude AI =>  https://claude.ai/chat/4d8fd538-d03d-4afa-98d5-356587a8064a
     */
    const handleTxtPurpDataInput = function (evt: React.ChangeEvent<HTMLTextAreaElement>){
        autoResizeCtrl (evt.target);
    }

    /**
     * handleSelCountryChange => Evento para detectar cambio sobre control País
     * @date 20025-08-25
     * @author IGAC - DIP
     * @param {string} fld 
     * @param {string} value
     * @remarks Basado en método handleTxtNomApeChange()
     * @remarks FUENTE consulta: Claude, AI => https://claude.ai/chat/5b18640b-67bd-4e3d-9658-dbc103456392
     */
    const handleSelCountryChange = function (fld, evt){
        //Objetos locales
        const value = evt.target.value;
        //Invocación validador
        handleTxtNomApeChange (fld, value);
    }

    /**
     * handleSelCountryBlur => Validador campo país, al salir del control
     * @date 2025-09-16
     * @author IGAC - DIP
     * @param {string} fld 
     * @param {Event} evt 
     * @param {function} tValid
     * @remarks Invocación método handleTxtNomApeBlur() 
     * @remarks Asociado a incidencia => "Ventana emergente control usuario para descarga", P1
     */
    const handleSelCountryBlur = function (fld, evt, tValid){
        //Objetos locales
        const value =   formUsrDownSigData.pais;
        //Invocación validador asociado
        handleTxtNomApeBlur (fld, value, tValid);
    }

    /**
     * handleSelOcupProfChange => Evento para detectar cambio sobre control Ocupación
     * @date 20025-08-25
     * @author IGAC - DIP
     * @param {string} fld 
     * @param {object} evt 
     * @dateUpdated 2025-09-16
     * @changes cambio nombre método handleSelOcupProf => handleSelOcupProfChange
     * @remarks Basado en método handleTxtNomApeChange()
     * @remarks FUENTE consulta: Claude, AI => https://claude.ai/chat/5b18640b-67bd-4e3d-9658-dbc103456392
     */
    const handleSelOcupProfChange = function (fld, evt){
         //Objetos locales
        const value = evt.target.value;
        //Invocación validador
        handleTxtNomApeChange (fld, value);
    }

    /**
     * handleSelOcupProfBlur => Evento al salir del campo Ocupación, se analice la existencia del dato, con sus respectivos validadores
     * @date 2025-09-16
     * @author IGAC - DIP
     * @param {string} fld 
     * @param {object} evt 
     * @param {function} tValid 
     * @remarks Invocación método handleSelCountryBlur
     * @remarks Asociado a incidencia => "Ventana emergente control usuario para descarga", P1
     */
    const handleSelOcupProfBlur = function (fld, evt, tValid){
        //Objetos locales
        const value =  formUsrDownSigData.ocupa;
        //Invocación validador asociado
        handleTxtNomApeBlur (fld, value, tValid);
    }

    /**
     * validateForm => Método para realizar validación al formulario Información Usuario Descarga Firma, cuando se selecciona la opción Registrar Usuario
     * @date 2025-08-25
     * @author IGAC - DIP
     * @dateUpdated 2025-09-15
     * @changes Act invocación método validateField 3 param func => text
     * @dateUpdated 2025-09-16
     * @changes Act invocación campo purpDataValid
     * @dateUpdated 2025-09-22
     * @changes Actualización validador objeto nameApeUsrValid tValidators.required => tValidators.text 
     * @changes Actualización validador objeto emprWorkUsrValid tValidators.required => tValidators.textSigle
     * @returns {boolean}
     * @remarks  FUENTE consulta: Claude, AI => https://claude.ai/chat/5b18640b-67bd-4e3d-9658-dbc103456392
     * @remarks Asociado a incidencia => "Ventana emergente control usuario para descarga", P1
     */
    const validateForm = function (){
        const nameApeUsrValid   =   validateField ('nameLastName', formUsrDownSigData.nameLastName, tValidators.text);
        const emailUsrValid     =   validateField ('email', formUsrDownSigData.email, tValidators.email);
        const paisUsrValid      =   validateField ('pais', formUsrDownSigData.pais, tValidators.required);
        const ocupaProfUsrValid =   validateField ('ocupa', formUsrDownSigData.ocupa, tValidators.required);
        const emprWorkUsrValid  =   validateField ('emprWork', formUsrDownSigData.emprWork, tValidators.textSigle);
        const purpDataValid     =   validateField ('purpData', formUsrDownSigData.purpData+ ";" + numPosiciones, tValidators.textMinLength);
        /* console.log ("Validator nameApeUsrValid =>",nameApeUsrValid);
        console.log ("Validator emailUsrValid =>",emailUsrValid);
        console.log ("Validator paisUsrValid =>", paisUsrValid);
        console.log ("Validator ocupaProfUsrValid =>",ocupaProfUsrValid);
        console.log ("Validator emprWorkUsrValid =>", emprWorkUsrValid);
        console.log ("Validator purpDataValid =>",purpDataValid);
        console.log ("Validator Boolean=>",nameApeUsrValid && emailUsrValid && paisUsrValid && ocupaProfUsrValid && 
        emprWorkUsrValid && purpDataValid); */
        return nameApeUsrValid && emailUsrValid && paisUsrValid && ocupaProfUsrValid && 
    emprWorkUsrValid && purpDataValid;
    }
    
    /**
     * processForm => Método para devolver valores de los campos formulario Información Usuario Descarga Firma
     * @date 2025-08-27
     * @author IGAC - DIP
     * @returns {object}
     */
    const processForm = async function () {        
        return await formUsrDownSigData;
    }
    
    /**
     * handleBtnFormUsrSubmit => Evento sobre la opción "Registrar Usuario" con el fin de registrar en BD al usuario que descargará la firma
     * @date 2025-08-25
     * @author IGAC - DIP
     * @param {object} evt
     * @dateUpdated 2025-08-27
     * @changes Implementación objeto JSON asociado a la información de los campos formulario Información Usuario Descarga Firma
     * @changes Implementación consumo operación API desde objeto api_postUsrDownSig
     * @dateUpdated 2025-08-29
     * @changes Implementación validación de registro al API, cuando el campo Correo electrónico es único. Adicionalmente, se cierra el modal y se procede a autorizar la descarga del archivo asociado a la firma seleccionada.
     * @changes Ejecución cronometro de tiempos, para validación de expiración en milisegundos (ms) del tiempo de sesión asociado al campo Correo electrónico.
     * @dateUpdated 2025-09-01
     * @changes Actualización validador categoria  error => warning.
     * @changes Implementación autorización descarga del validador a tiempo dado por el objeto timeDownLoad
     * @dateUpdated 2025-09-02
     * @changes Fix Bug tiempo sesión => actualizar sesión campo Correo electrónico
     * @changes Fix Bug tiempo sesión => Inicio cuenta de tiempo sesión en método downLoadFileUsr()
     * @dateUpdated 2025-09-03
     * @changes Actualizar control de errores, lanzando un throw al retorno de la petición desde el servidor
     * @remarks Implementación cronometro de tiempos se toma la fuente de consulta: Claude, AI => https://claude.ai/chat/1524c133-89ab-4f4c-a923-c5a6b3f5cf4e
     */
    const handleBtnFormUsrSubmit    = async function (evt: {preventDefault: () => void}){
        //Objetos locales
        var msg, urlServicioSIEC, tokenSeg  :string =   "";
        var usrDownSigData, jsonUsrForm     :any     =   {};
        
        //Evento para prevenir refrescar la página
        evt.preventDefault();

        //Validador información requerida diligenciada es completa
        if (validateForm ()){
            msg             =   "Formulario correcto!";
            usrDownSigData  =   await processForm();
            
            //console.log("Verif file from download =>",usrDownSigData["files"]);
            //Validación registro generado en el API, mediante la llave email            
            //Obtener Token seguridad
            urlServicioSIEC =   urls.api_host + urls.api_getToken;
            getToken (urlServicioSIEC).then ((tokenSegObj) => {
                tokenSeg    =   tokenSegObj["data"].access_token;
                //Consumo API registro usuario
                urlServicioSIEC =   urls.api_host + urls.api_getUsrDownSig + usrDownSigData["email"];
                console.log("Token acceso =>",tokenSeg);
                console.log("Petición validac reg usr API =>",urlServicioSIEC);
                try{
                    fetch (urlServicioSIEC, {
                        method: "GET",
                        headers: {
                            "Content-type": "application/json",
                            "Accept": "application/json",
                            "Authorization": "Bearer"+" "+tokenSeg
                        }
                    })
                    .then((usrDataState) => {
                        var jsonErr: any = {}
                        if (!usrDataState.ok){
                            jsonErr = {
                                "errorCode": usrDataState.status,
                                "errorMsg": usrDataState.statusText
                            }
                            console.error ("Error obteniendo usuario de la BD =>",jsonErr["errorMsg"]+" "+ "(" +"código http =>"+jsonErr["errorCode"]+ ")");
                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                            return jsonErr;
                        }
                        //Validador consumo por error del server (cód http <> 200 )
                        else if (typeof (usrDataState["error"]) !== 'undefined'){
                            jsonErr = {
                              "errorCode": usrDataState["error"].code,
                              "errorMsg": usrDataState["error"].message,
                              "errorMsgDet": usrDataState["error"].details[0]
                            }
                            console.error("Error Obteniendo usuario de la BD =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                          }
                          console.log("Consultando state valida usr =>",usrDataState);
                          return usrDataState.json();
                    })
                    .then ((usrData) => {
                        var jsonErr: any = {}
                        //Validador consumo por error del server (cód http <> 200 )
                        if (typeof (usrData["error"]) !== 'undefined'){
                            jsonErr = {
                                "errorCode": usrData["error"].code,
                                "errorMsg": usrData["error"].message,
                                "errorMsgDet": usrData["error"].details[0]
                            }
                            console.error("Error Obteniendo información usuario del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                        }
                        console.log ("Existe usuario en sistema =>",usrData["data"].length);
                        
                        //Validación para registro del usuario en API, por ser único su correo electrónico => registro a BD
                        if (usrData["data"].length === 0){
                            //objeto JSON para el API
                            jsonUsrForm = {
                                "Nombre_Completo": usrDownSigData["nameLastName"],
                                "Correo_Electronico": usrDownSigData["email"],
                                "Pais": usrDownSigData["pais"],
                                "Ocupacion": usrDownSigData["ocupa"],
                                "Empresa_Organizacion": usrDownSigData["emprWork"],
                                "Descripcion": usrDownSigData["purpData"]
                            }
                            msg += "\nObjeto JSON para API =>";
                            
                            //Consumo al API de autenticación para consulta del token de seguridad
                            urlServicioSIEC =   urls.api_host + urls.api_getToken;
                            getToken (urlServicioSIEC).then ((tokSegObj) => {
                                tokenSeg    =   tokSegObj["data"].access_token;
                                //Consumo al API de persistencia
                                urlServicioSIEC =   urls.api_host + urlsPost.api_postUsrDownSig;
                                console.log("Petición consumo operac POST =>",urlServicioSIEC);
                                try{
                                    fetch (urlServicioSIEC,{
                                        "method": "POST",
                                        "headers": {
                                            "Accept": "application/json",
                                            "Content-Type": "application/json",
                                            "Authorization": "Bearer" + " " + tokenSeg
                                        },
                                        "body": JSON.stringify (jsonUsrForm, null, 2)
                                    })
                                    .then ((operState)=> {
                                        var jsonErr: any = {};
                                        if (!operState.ok){
                                            jsonErr = {
                                                "error": operState.status,
                                                "errorMsg": operState.statusText
                                            }
                                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["error"];
                                            return jsonErr;
                                        }
                                        return operState.json();
                                    })
                                    .then ((regBDServer) => {
                                        //Validador registro no exitoso por error del server (cód http <> 200 )
                                        if (typeof (regBDServer["error"]) !== 'undefined'){
                                            jsonErr = {
                                                "errorCode": regBDServer["error"].code,
                                                "errorMsg": regBDServer["error"].message,
                                                "errorMsgDet": regBDServer["error"].details[0]
                                            }
                                            console.error("Error Obteniendo información usuario del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                                            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
                                        }
                                        //console.log ("Objeto procesado en BD Server =>", regBDServer["data"]);
                                        //Validación de registro exitoso
                                        if (regBDServer["data"].length > 0 || regBDServer["data"].Correo_Electronico !== ""){
                                            //Seteo en la variable state que controla la sesión 
                                            setEmailUsrDownSig (regBDServer["data"].Correo_Electronico);
                                           
                                            console.log ("Usuario con email =>",regBDServer["data"].Correo_Electronico," ","fue aprobado para la descarga!");
                                            
                                            //Deshabilitación opciones, cierre modal y descarga autorizada
                                            downLoadFileUsr ();
                                        }
                                    })
                                }
                                catch (error) {
                                    var jsonErrorObj=   {};
                                    jsonErrorObj = {
                                        "error": error,
                                        "message": "Error obteniendo token del server =>"
                                    }
                                    return jsonErrorObj;
                                    //throw error;
                                }
                            })
                        }
                        //Validación cuando el correo electrónico existe en la BD del servidor
                        else{
                            console.log ("Usuario existente en la BD, asociado al correo electrónico"+" " + usrDownSigData["email"]);
                            
                            //Invocar modal de usuario existente
                            setAlertDial(true);          
                            setMensModal({
                              deployed: true,
                              type: typeMSM.warning,
                              tittle: 'Usuario existente en el sistema',
                              body: 'Ya existe el usuario asociado al correo electrónico'+' '+ usrDownSigData["email"]
                            }); 
                           
                            //Actualización sesión campo correo electrónico
                            setEmailUsrDownSig (usrDownSigData["email"]); 
                            //Timeout para continuar con el proceso cierre modal y descarga autorizada
                            setTimeout(() => downLoadFileUsr(), timeDownLoad);
                        }

                    })
                }
                catch (error){
                    console.error ("Error al obtener usuario de la BD =>",error);
                }
            })
            
        }
        //Información requerida sin diligenciar
        else{
            msg         =   "Formulario con datos requeridos!";
            jsonUsrForm = {};
        }        
        console.log (msg,JSON.stringify (jsonUsrForm, null, 2));
    }
    /**
     * downLoadFileUsr => Evento sobre la opción Continuar descarga, el cual permite continuar el proceso de descarga del archivo, después de registrar la información del formulario "Información Usuario Descarga Firma"
     * @date 2025-08-27
     * @author IGAC - DIP
     * @dateUpdated 2025-08-28
     * @changes Solucionar bugs:
     * @changes Bug 1. Limpiar controles formulario por encontrarse procesados
     * @changes Bug 2. Limpiar validadores
     * @changes Bug 3. Reasignar states opciones Registrar usuario y continuar descarga
     * @dateUpdated 2025-09-01
     * @changes Cerrar validador de usuario existente si y solo si, se encuentra activo
     * @dateUpdated 2025-09-02
     * @changes Fix Bug tiempo sesión => iniciar tiempo de sesión para usuario nuevo, como para usuario existente
     */
    const downLoadFileUsr = function (){
        //Objetos locales
        var filesArr    = [];

        //Para usuarios existentes en BD, cerrar validador si y solo si, el validador está activo
        if (alertDial){
            setAlertDial (false);
        }
        if (!alertDial){
            setMensModal({
                deployed: false,
                type: typeMSM.warning,
                tittle: 'Usuario existente en el sistema',
                body: 'Ya existe el usuario asociado al correo electrónico'+' '+ formUsrDownSigData["email"]
            }); 
        }
        
        //Borrar objetos del formulario, por encontrarse procesados
        setFormUsrDownSigData (prevState => ({
            ...prevState,
            ["nameLastName"]: "",
            ["email"]: "",
            ["pais"]: "",
            ["ocupa"]: "",
            ["emprWork"]: "",
            ["purpData"]: ""
        }))
        //Borrar validadores
        clearError ("nameLastName");
        clearError ("email");
        clearError ("pais");
        clearError ("ocupa");
        clearError ("emprWork");
        clearError ("purpData");
        //Actualizar States opción "Registrar Usuario"
        setDisRegUsrDownSig (false);
        
        //Control de sesión por tiempo
        //Establecimiento tiempo de inicio a sesión activa
        setSesStartTime (Date.now());
        //Establecimiento tiempo actual
        setSesCurrTime (Date.now()); 
        //Establecimiento tiempo sesión campo correo electrónico
        setSessExpires (timeExpires);

        //Realizar descarga archivo
        //Array para procesar nombre archivo (pos 0), y extensión (pos 1)
        filesArr    =   formUsrDownSigData["files"].split('.');
        //Cierre modal
        openCloseModalUsrDetail (filesArr[0]);
        //Descarga archivo desde consumo API
        downloadZipFile('','',filesArr[0], generarFileStand (filesArr[0]) + '.zip');
    }
    /**
     * Sección procesamiento información sobre mapa base
     */

    /**
     * markerMapDataGrid => Método generación markers en mapa, según geometría.
     * @date 2025-05-13
     * @author IGAC - DIP
     * @param rows 
     * @dateUpdated 2025-05-14
     * @changes Implementar markers para varios puntos, asociados al data Grid
     * @dateUpdated 2025-05-15
     * @changes Fix validación eError al crear paquete ZIPxistencia geometría brindada por el servicio, para generar los correspondientes markers
     * @dateUpdated 2025-06-11
     * @changes Implementación componente popUpTemplate, para visualización de información detallada de firma, asociado al marker sobre mapa
     * @dateUpdated 2025-06-25
     * @changes Suprimir desde objeto popupTemplateObj, atributo "Firma asociada"
     * @changes Suprimir desde objeto popupTemplateObj, atributo "Cobertura" (<li>Cobertura: ${rows[cont].type} </li>), por no existir atributo en servicio (cambio temporal)
     * @changes Suprimir desde objeto popupTemplateObj, atributo Altura snm
     * @changes Suprimir desde objeto popupTemplateObj, atributo Instrumento
     * @changes Suprimir desde objeto popupTemplateObj, atributo Porcentaje pureza
     */
    function markerMapDataGrid(rows)
    {
        var LatLonArr = [];
        if (rows && rows.length > 0){
            if (typeof rows[0].pointX !== 'undefined' && typeof rows[0].pointY !== 'undefined'){
                console.log("Geometry =>",rows);
                console.log("x=>",rows[0].pointX);
                console.log("y=>",rows[0].pointY);
            }
            console.log("Data rows =>",rows);
            //Recorrido del array asociado a las filas del datagrid (rows), para obtener la geometria de los resultados
            for (var cont = 0; cont < rows.length; cont++){
                //Validación existencia atributo PointX y PointY
                if (typeof rows[cont].pointX !== 'undefined' && typeof rows[cont].pointY !== 'undefined'){
                    //Transformar a latitud y longitud
                    LatLonArr = webMercatorUtils.xyToLngLat(rows[cont].pointX, rows[cont].pointY);
                    
                    //Simbolo
                    const markerSymb = new SimpleMarkerSymbol({                
                        color: [12, 70, 96], //Azul oscuro Título
                        size: 10,
                        outline: {
                            color: [255, 255, 255], //Negro borde
                            width: 2
                        }
                    });
                    //Punto alusivo a la geometría
                    const pointMap = new Point({
                        x: LatLonArr[0],
                        y: LatLonArr[1]
                    }); 
                    //Detalles del punto asociado - 2025-06-11
                    const popupTemplateObj = new PopupTemplate({
                        title: 'Información de la firma',
                        content: `
                        <ul>
                            <li>Latitud: ${LatLonArr[0].toFixed(3)}</li>
                            <li>Longitud: ${LatLonArr[1].toFixed(3)}</li>
                            <li>Ubicación: ${rows[cont].locat}</li>
                            <li>Proyecto: ${rows[cont].proj}</li>
                            <li>Campaña: ${rows[cont].camp}</li>
                        </ul>
                        `
                    });
                    //Gráfico usando punto, marcador y template del popUp 
                    const pointGraphMap = new Graphic({
                        geometry: pointMap,
                        symbol: markerSymb,
                        popupTemplate: popupTemplateObj
                    });
                    //Gestión de Capa
                    const layerPointGraphMap = new GraphicsLayer({
                        graphics: [pointGraphMap]
                    })            
                    //Adición al mapa
                    if (jimuMapView){
                        console.log("Point al mapa =>",pointMap);
                        console.log("Layer al mapa =>",layerPointGraphMap);
                        jimuMapView.view.map.add(layerPointGraphMap);
                        console.log("Punto adicionado correctamente!");
                        console.log("Verificación objeto PopUp =>",popupTemplateObj);
                        setPopUp(popupTemplateObj);
                    }
                    else
                    {
                        console.log("Revisar adición punto al mapa!");
                    }
                }
            }
        }
    }
    /**
     * zoomPointSelected => Método para resaltar punto en el mapa, según el visualizado en Tabla Resultados
     * @date 2025-07-25
     * @author IGAC - DIP
     * @param {object} gridRow
     * @dateUpdated 2025-07-28
     * @changes Actualización factor zoom 15 => 21
     * @dateUpdated 2025-10-09
     * @changes Inclusión validaciones, para determinar cargue de coordenadas X y Y, si se llama a través de la selección de un punto en mapabase, o bien, desde la selección sobre el registro del Data Grid.
     * @remarks tomado del método zoomToDataGridSelected, componente tablaResultCS asociado al widget Consulta simple
     * @remarks Fuente de consulta complementaria: Claude AI => https://claude.ai/chat/334b3a36-54a2-48b3-accb-4c97ffcf99bd
     */
    const zoomPointSelected = async function (gridRow){
        //Objetos locales
        var pointDG: object =   {};
        //Limpieza resaltados anteriores
        jimuMapView.view.graphics.removeAll();
        //Sección importación componentes locales
        const [Graphic, SimpleMarkerSymbol, Point] = await loadModules([
            'esri/Graphic', 'esri/symbols/SimpleMarkerSymbol', 'esri/geometry/Point'
          ]);
        
        console.log("Row DG para ampliar punto =>",gridRow);
        
        //Validaciones según se cargue las coordenadas (desde mapa base o desde Data Grid)
        if (typeof gridRow.row === 'undefined'){
            pointDG = new Point({
                x:  gridRow.pointX,
                y:  gridRow.pointY,
                spatialReference: jimuMapView.view.spatialReference
            });

        }
        else{
            pointDG = new Point({
                x:  gridRow.row.pointX,
                y:  gridRow.row.pointY,
                spatialReference: jimuMapView.view.spatialReference
            });
        }
          console.log("Point to Zoom =>",pointDG);
          //Ubicación del punto en mapa
          jimuMapView.view.goTo({
            target: pointDG,
            zoom: 21
          }).then (() => {
            //Crear símbolo para resaltar
            const highlightSymbol = new SimpleMarkerSymbol({
                color: [255, 255, 255], // blanco
                size: 12,
                outline: {
                    color: [12, 70, 96], // borde azul oscuro
                    width: 2
                }
            });

            //Crear graphic para establecer la geometría del punto y el símbolo
            const highlightGraphic = new Graphic({
                geometry: pointDG,
                symbol: highlightSymbol
            });

            // Agregar al mapa
            jimuMapView.view.graphics.add(highlightGraphic);
          })
    }
    /**
     * convCoord => Objeto asociado al hook para manejo de clics...
     * @date 2025-10-07
     * @author IGAC - DIP
     * @remarks Activar y usar, cuando los sistemas de coordenadas sean distintos entre si (orig:EPSG 4326 Dest:EPSG 9377)
     */
    /* const convCoord = function (){
        var found: boolean  =   null;
        var minDist         =   Infinity;
        const viewMap       =   jimuMapView.view;
        //Cuando se requiera transformar coordenadas entre EPSG: 4326 a EPSG:9377
        //Definición del Sistema de Referencia destino (EPSG:9377 - Colombia)
        const targetSystRef =   new SpatialReference ({ wkid: 9377});
        clickHandlerRef.current =   viewMap.on ('click', async (evt) => {
            const mapBasePnt  =   evt.mapPoint;
            //Coordenadas originales EPSG: 4326
            console.log ("Test Coordenadas Obj =>", mapBasePnt);
            console.log ("Test Coordenadas Long X =>", mapBasePnt.longitude);
            console.log ("Test Coordenadas Lat Y =>", mapBasePnt.latitude);

            // Conversón del punto a EPSG:9377
            const projPoint =   projection.project (mapBasePnt, targetSystRef) || 'undefined';
            if (!projPoint){
                console.warn ("No se puede proyectar punto!");
                return;
            }
            console.log ("Test Coordenadas rect X=>", projPoint["x"]);
            console.log ("Test Coordenadas rect Y=>", projPoint["y"]);
            
            console.log('Test Coordenadas projected (client)=>', projPoint && { x: projPoint["x"], y: projPoint["y"], wkid: projPoint["spatialReference"]?.wkid});

            //Proyección del punto seleccionado en el mapa base
            const px    =   projPoint["x"];
            const py    =   projPoint["y"];

            //Búsqueda del registro más cercano al clic sobre mapa base
            //Según escala (metros)
            const tolerFactor   =   500;
            console.log ("Test Object rows =>",rows);
            //Recorrido de los puntos
            rows.forEach ((r) => {
                //Coordenadas del objeto asociado al DataGrid
                const rx    =   Number (r.pointLon);
                const ry    =   Number (r.pointLat);

                //Conversón del punto a EPSG:9377
                const objJSONPoint = {
                    pRectX: rx,
                    pREctY: ry
                }
                const dgPnt =   projection.project (objJSONPoint, targetSystRef );
                const dx    =   rx - px;
                const dy    =   ry - py;
                const dist  =   Math.sqrt (dx * dx + dy * dy);
                //console.log (`Test Distancia a ${r.phSig}: ${dist.toFixed(2)} m (X:${rx}, Y:${ry})`);
                console.log (`Test Punto proyectado X => ${px} , Y => ${py}`);
                console.log (`Test Punto original X => ${rx} , Y => ${ry}`);

                if (dist < tolerFactor && dist < minDist){
                    minDist =   dist;
                    found   =   r;
                }
            });
        });
    } */
    
    /**
     * Método para centrado del registro en Data Grid, según punto del mapa base
     * @date 2025-10-09
     * @author IGAC - DIP
     * @remarks Fuente de consulta: AI, ChatGPT => https://chatgpt.com/c/68e55098-ada0-8332-9717-1c287d96fc6f
     */
    const scrollDGToRow = function (idRow) {
        const el = document.querySelector(`[data-id="${idRow}"]`);
        if (el && gridContainerDGRef.current) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('row-highlight');
            setTimeout(() => el.classList.remove('row-highlight'), 600);
        }
    }
    
    /**
     * Sección Hooks del sistema
     */

    /**
     * Hook para realizar Ajuste de altura inicial al control Interés sobre los datos (TextArea)
     * @date 2025-08-26
     * @author IGAC - DIP
     * @remarks FUENTE Consulta: Claude AI => https://claude.ai/chat/4d8fd538-d03d-4afa-98d5-356587a8064a
     */
    useEffect (() => {
        if (purpDataRef.current){
            autoResizeCtrl (purpDataRef.current);
        }
    }, []);
    /**
	* Hook para ejecución del Data Grid, con análisis state asociado al objeto props, donde se realiza recepción del data dispatch, desde componente ppal searchSIEC (widget)
	* @date 2025-06-09
	* @author Ing.RRH
    * @dateUpdated 2025-06-10
    * @changes Recepción parámetro iniExtent
    * @dateUpdated 2025-06-12
    * @changes Adicionar validación, para borrar la información detallada, asociada a cada punto (marker) sobre el mapa.
    * @remarks Recepción del data dispatch, desde componente ppal searchSIEC (widget)
    */
    useEffect(() => {
        if (props.hasOwnProperty('stateProps')) {
            const dataFromDispatch = JSON.parse(props.stateProps.dataFromDispatchWidget_searchSIEC)
            console.log("Lista de data desde props =>", dataFromDispatch)
            setRows(dataFromDispatch.dataToRows)
            //Verificación cuando dataToRows es cero (0) - 2025-06-12
            console.log("Rows DG en tablaResultados =>",dataFromDispatch.dataToRows);
            //Validación borrado PopUps asociados a los markers
            if (dataFromDispatch.dataToRows.length === 0)
            {
                if (typeof popUp !== 'undefined')
                {
                    jimuMapView.view.closePopup();
                }
            }
        }
        console.log("props locales en TablaResultados =>",props);
    
        return () => { }
        
    }, [props])

	/**
 	 * Hook para Visualizar los markers sobre el mapa, de acuerdo al state de rows en componente Data Grid
	 * @date 2025-06-10
	 * @author IGAC - DIP
     * @remarks Traido desde el método componentDidUpdate asociado al componente TablaResultSrcSIEC
	*/

    useEffect(() => {
        //Inserción de markers
        if (rows)
        {
            markerMapDataGrid(rows);
        }
        
        console.log("Rows para DG en TR... =>",rows);

    },[rows]);

    /**
     * Hook para manejo de clics sobre botón izquierdo del mouse, dados sobre mapa base
     * @date 2025-10-07
     * @author IGAC - DIP
     * @dateUpdated 2025-10-08
     * @changes Incluir salto de página al registro seleccionado, de acuerdo al punto sobre mapa base seleccionado.
     * @dateUpdated 2025-10-09
     * @changes Revisión salto registro, cuando se encuentra en página distinta a la actual
     * @remarks FUENTE consulta chatGPT (AI) => https://chatgpt.com/c/68e55098-ada0-8332-9717-1c287d96fc6f
     * @remarks States asociados al objeto jimuMapView,  al objeto rows y al objeto paginationModel
     */
    useEffect (() => {
        var found               : boolean       =   null;        
        var indexRegDG, targPage: number        =   -1;
        var minDist         =   Infinity;
        if (!jimuMapView || !jimuMapView.view){
            return;
        }

        const viewMap       =   jimuMapView.view;
        
        //Sección para suprimir cualquier listener anterior
        if (clickHandlerRef.current){
            clickHandlerRef.current.remove ();
            clickHandlerRef.current =   null;
        }

        //Procesamiento de evento botón izq mouse
        clickHandlerRef.current =   viewMap.on ('click', async (evt) => {
            try{
                const mapBasePnt  =   evt.mapPoint;
                /*
                    Usar objeto convCoord, cuando las coordenadas sean de dos sistemas distintos
                */

                //Coordenadas originales tanto del punto, como del Data Grid (TablaResultados) (EPSG: 4326)
                console.log ("Test Coordenadas Long X en mapa =>", mapBasePnt.longitude.toPrecision(8));
                console.log ("Test Coordenadas Lat Y en mapa =>", mapBasePnt.latitude.toPrecision(8));


                //Búsqueda del registro más cercano al clic sobre mapa base
                //Según escala (metros)
                const tolerFactor   =   tolerFactorSrcP;
                //console.log ("Test Object rows =>",rows);
                //Recorrido de los puntos asociados al Data Grid
                rows.forEach ((r) => {
                    //Coordenadas del objeto asociado al DataGrid
                    const rx    =   Number (r.pointLon);
                    const ry    =   Number (r.pointLat);

                    const dx    =   rx - Number (mapBasePnt.longitude.toPrecision (8));
                    const dy    =   ry - Number (mapBasePnt.latitude.toPrecision(8));
                    const dist  =   Math.hypot (dx, dy);
                    
                    console.log (`Test Punto original Long => ${rx}`);
                    console.log (`Test Punto original Lat => ${ry}`);

                    if (dist < tolerFactor && dist < minDist){
                        minDist =   dist;
                        found   =   r;
                    }
                });
                if (found){
                    console.log (`Test Punto original Long => `,found["pointLon"]);
                    console.log (`Test Punto original Lat => `, found["pointLat"]);
                    console.log ("Test Id encontrado según mapa =>", found["id"]);
                    console.log ("Test Id 2 encontrado según mapa =>", found["obj_id"]);
                    //setSelecRow ([found["id"]]);

                     //Ampliar el punto encontrado - 2025-10-09 (en pruebas)
                    zoomPointSelected (found);
                    
                    //Búsqueda del punto base en el arreglo del DataGrid
                    indexRegDG  =   rows.findIndex ((r) => r["id"] === found["id"]);
                    
                    //Calcular la página donde está el registro
                    targPage    =   Math.floor (indexRegDG / paginationModel.pageSize);
                    console.log ("Test Target página calculada =>",targPage + 1);
                    if (indexRegDG === -1){
                        console.log ("Test NO encontró registro!");
                        return;
                    }

                    //Guardado de acción pendiente como Ref
                    pendingSelectionDGRef.current = found["id"];

                    //Validación para cambio de página ANTES de seleccionar registro
                    if (paginationModel.page !== targPage){
                        setPaginationModel ((prevState) => ({
                            ...prevState, page: targPage
                        }));
                    }
                    //Selección registro
                    else {
                        setSelecRow ([found["id"]]);
                        scrollDGToRow (found["id"]);
                    }
                }
                else{
                    console.warn ("Test Ningún punto dentro de la tolerancia!");
                    setSelecRow ([]);
                    return;
                }
            }
            catch (err){
                console.error('Test Error en mapa click handler =>', err);
            }
        });

        //Limpieza
        return () => {
            if (clickHandlerRef.current){
                try{
                    clickHandlerRef.current.remove ();
                }
                catch (e) {
                    console.warn ("Test Error en Limpieza!");
                }
                clickHandlerRef.current =   null;
                
            }
        };
    }, [jimuMapView, rows, paginationModel.pageSize, paginationModel.page]);

    /**
     * Hook para desplazar el DataGrid a la página, según la selección del punto base
     * @date 2025-10-09
     * @author IGAC - DIP
     * @remarks Fuente de consulta: AI ChatGPT => https://chatgpt.com/c/68e55098-ada0-8332-9717-1c287d96fc6f 
     * @remarks Estado analizado page
     */

    useEffect (() => {
        if (pendingSelectionDGRef.current !== null){
            const  idRegDG                  =   pendingSelectionDGRef.current;
            
            const waitSelectDG = function () {
                const el    =   document.querySelector (`[data-id="${idRegDG}"]`);
                if (el){
                    setSelecRow ([idRegDG]);
                    scrollDGToRow (idRegDG);
                    pendingSelectionDGRef.current   =   null;
                }
                else{
                    //Reintento hasta que se visualice el row
                    setTimeout (waitSelectDG,  100);
                }
            };

            waitSelectDG ();            
        }
    }, [paginationModel.page]);

    /**
     * Hook aplicación del registro de selección pendiente almacenado en hook desplazamiento página
     * @date 2025-10-09
     * @author IGAC - DIP
     * @remarks Fuente de consulta: AI ChatGPT => https://chatgpt.com/c/68e55098-ada0-8332-9717-1c287d96fc6f 
     */

    /* useEffect (() => {
        if (!pendingSelectionDG){
            return;
        }
        const { idSeleccDG, targPagSelecc } =   pendingSelectionDG;

        if (paginationModel.page === targPagSelecc){
            setSelecRow ([idSeleccDG]);
            const el    =   document.querySelector (`[data-id="${idSeleccDG}"]`);
            if (el){
                el.scrollIntoView ({
                    behavior: 'smooth',
                    block: 'center'
                });
                setPendingSelectionDG (null);
            }
        }
    }, [paginationModel.page]); */

    /**
     * Hook para manejo contador de tiempo
     * @date 2025-08-14
     * @author IGAC - DIP
     * @dateUpdated 2025-08-29
     * @changes Actualización state usrDat => emailUsrDownSig
     * @changes Actualización state expiresTok => sessExpires
     * @remarks Fuente consulta: Claude AI => https://claude.ai/chat/1524c133-89ab-4f4c-a923-c5a6b3f5cf4e
     */
    useEffect ( () => {
        if (emailUsrDownSig && sesStartTime){
            //Inicio contador cada 200ms
            intervRef.current = setInterval (() => {
                const timeNow   =   Date.now ();
                setSesCurrTime (timeNow);

                //Verificación expiración sesión
                const elapTimeSess  =   timeNow - sesStartTime;
                if (elapTimeSess >= sessExpires){
                    console.log("Sesión expirada!");
                    setEmailUsrDownSig (undefined);
                }
            }, 200);
        }
        else{
            //Limpieza del intervavo si no hay sesión activa
            if (intervRef.current){
                clearInterval (intervRef.current);
                intervRef.current   =   null;
            }
        }

        //Realizar labores de limpieza durante el desmontaje del componente
        return () => {
            if (intervRef.current){
                clearInterval (intervRef.current);
            }
        };
    }, [emailUsrDownSig, sesStartTime, sessExpires]);

    /**
     * Hook para verificación del state asociado al campo País.
     * @date 2025-08-25
     * @author IGAC - DIP
     */
    useEffect (() => {
        console.log("State del pais =>",countryUsrDownSig)
    }, [countryUsrDownSigLst])

    /**
     * Hook para validaciones
     * @date 2025-08-25
     * @author IGAC - DIP
     * @returns {object, string, object}
     * @remarks Fuente consulta: Claude AI => https://claude.ai/chat/5b18640b-67bd-4e3d-9658-dbc103456392
     */

    const useSimpleValidation = function () {
        //Estados asociados al error del validador
        const [errors, setErrors] = useState<{ [key: string]: string }>({});

        /**
         * validateField => Validador de campo
         * @date 2025-08-25
         * @author IGAC - DIP
         * @param {string} fieldName 
         * @param {string} value 
         * @param {any} validationFunction 
         * @dateUpdated 2025-09-15
         * @changes Mantenimiento validador
         * @dateUpdated 2025-09-16
         * @changes Mantenimiento validador verificando tipos compuestos del mismo (P.Ej.Campo Describa el interés en los datos)
         * @returns {boolean} Estado de error true o false
         * @remarks FUENTE consulta: AI Claude => https://claude.ai/chat/5b18640b-67bd-4e3d-9658-dbc103456392
         * @remarks Asociado a incidencia => "Ventana emergente control usuario para descarga", P1
         */
        const validateField = function (fieldName, value, validationFunction) {
            //Objetos locales   
            var errorMessage: string = "";
            //Validación para campos que requieran required y número mínimo de posiciones
            if (fieldName === 'purpData'){
                errorMessage    =   validationFunction(value.split(';')[1],value.split(';')[0]);
                console.log ("Verif error =>", errorMessage);
            }
            //Validadores para campos con un tipo de validador 
            else{
                //console.log ("Verif validationFunc =>",validationFunction(value));
                console.log ("Valor asociado al campo"+" "+fieldName+"=>",value);
                errorMessage    =   validationFunction(value);
            }
            
            setErrors (prevState => ({
                ...prevState,
                [fieldName]: errorMessage
            }));
            return errorMessage  === '';
        };
        /**
         * clearError => Método para limpiar error anterior
         * @date 2025-08-25
         * @param fieldName 
         * @remarks FUENTE consulta: AI Claude => https://claude.ai/chat/5b18640b-67bd-4e3d-9658-dbc103456392
         */
        const clearError = function (fieldName) {
            setErrors (prevState => ({
                ...prevState,
                [fieldName]: ''
            }));
        };
        return {errors, validateField, clearError};
    };

  const { errors, validateField, clearError}  =   useSimpleValidation ();
  return (
    <div className='w-100 p-1 bg-primary'>
		<JimuMapViewComponent useMapWidgetId={props.useMapWidgetIds?.[0]} onActiveViewChange={activeViewChangeHandler} />
        
         {/*Sección diálogo cuando en el formulario registro usuario ya existe un correo electrónico*/}
            {alertDial
                //? showDialog("No se cumplen los criterios!")
                ? <DialogsSrcSIEC
                    setAlertDial={setAlertDial}
                    mensModal={mensModal}
                    setMensModal={setMensModal}
                    classCss={'reqUsrDownSigDataValidator'}
                ></DialogsSrcSIEC>
                : null
            }
        <>
            <Button size="sm" className="mb-1" type="primary" onClick={()=>console.log("retornarFormulario")}>
                Tabla Resultados</Button>                   
            <DataGrid 
                sx={{'.MuiTablePagination-root':
                    {color: '#126a92', backgroundColor: '#ffff'},
                    '.css-yseucu-MuiDataGrid-columnHeaderRow':
                    {color: '#126a92', backgroundColor: '#ffff'},
                    '.css-11dqcl8-MuiDataGrid-virtualScrollerRenderZone':
                    {color: '#126a92', backgroundColor: '#ffff'},
                    '& .row-highlight': {
                        backgroundColor: 'red !important',
                        transition: 'background-color 0.6s ease'
                    }
                }}
                className="css-1hr2sou-MuiTablePagination-root MuiTablePagination-root p-1"
                columns={columnsSrcSIEC}
                localeText={dataGridLang}
                columnVisibilityModel={columnVisibilityModel}                
                rows={rows}
                pagination
                paginationMode='client'
                pageSizeOptions={numPageDG}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                onCellClick={zoomPointSelected}
                rowSelectionModel={selecRow}
                onRowSelectionModelChange={(ids) => setSelecRow (ids)}
                slotProps={
                    {
                        pagination: {
                            labelRowsPerPage: 'Filas por página:',
                            labelDisplayedRows: ({ from, to, count }) =>
                                `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`,
                        },
                    }
                }
            />
            {/* Modal correspondiente a la opción Detalles*/ }
            <Modal
                    isOpen={modalDetail}            
                    unmountOnClose
                    className={entorno === 'dev' ? 'modalDetails':'modalDetails_prod'}
                >
                    <ModalHeader className="closeDet header" id="headerDet">
                        <label className="label">{modalHead}</label>
                        <Button className="closeBtn app-root-emotion-cache-ltr-xg0zwy" onClick={openCloseModalDetail}>x</Button>
                    </ModalHeader>
                    <ModalBody>
                        <div>
                            <div id='metaDataSignDiv' className='metaDataSignCls'
                                onClick={() => handleRowCollapClick ("metaDataSign")} 
                            >
                                <span>&nbsp; </span>
                            </div> 
                            <div className='ubicaSignDiv'>
                                <CollapsablePanel
                                    label="Metadatos"
                                    isOpen={panelStates.metaDataSign}
                                    onRequestOpen={() => togglePanel ("metaDataSign")}
                                    onRequestClose={() => togglePanel ("metaDataSign")}
                                    className="ubicaSignDiv"
                                >
                                    {
                                        isLoad ? (
                                            <div className="row">
                                                <div className="ubicaImgFile">
                                                    <span className="ubicProj">Cargando información. Espere por favor...</span>
                                                </div>
                                            </div>
                                        ):
                                        (
                                            <div className='MetadatoSeccDiv'>
                                                <div className="row">
                                                    <label className="projLab">Proyecto</label> 
                                                    <span className="ubicProj">{modalBody.proj}</span>
                                                </div>
                                                <div className="row">
                                                <label className="projLab">Campaña</label> 
                                                    {
                                                        entorno === 'dev' ?
                                                        <span className="ubicCamp">{modalBody.campa_a}</span>:
                                                        <span className="ubicCamp_prod">{modalBody.campa_a}</span>
                                                    }
                                                </div>
                                                <div className="row">
                                                    <label className="projLab">Ubicación</label>
                                                    {
                                                        entorno === 'dev' ?
                                                        <span id="ubicSpan">{modalBody.ubic}</span>:
                                                        <span id="ubicSpan_prod">{modalBody.ubic}</span>
                                                    }      
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Cita</label>
                                                    <span id="citaSpan">{modalBody.Citation}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Créditos</label>
                                                    <span className="ubicSpan">{modalBody.Credits}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Resumen</label>
                                                    <span className="ubicSpan">{modalBody.Summary}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Palabras clave</label>
                                                    <span className="ubicSpan">{modalBody.Topics_Keywords}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Ciudad</label>
                                                    <span id="ciudadSpan">{modalBody.Citeinfo_Origin}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Fecha</label>
                                                    <span id="fechaSpan">{modalBody.Citeinfo_Pubdate}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Título</label>
                                                    <span className="ubicSpan">{modalBody.Citeinfo_Title}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Sitio publicación</label>
                                                    <span id="sitePubSpan">{modalBody.Pubinfo_Pubplace}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Publicación</label>
                                                    <span className="ubicSpan">{modalBody.Pubinfo_Publish}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Vínculo</label>
                                                    <span id="lnkPubSpan">{modalBody.Onlink}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Sitio origen publicación</label>
                                                    <span className="ubicSpan">{modalBody.Lworkcit_Origin}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Título dado en sitio orígen</label>
                                                    <span className="ubicSpan">{modalBody.Lworkcit_Title}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Publicación dado en sitio orígen</label>
                                                    <span className="ubicSpan">{modalBody.Lworkcit_Publish}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Departamento publicación</label>
                                                    <span className="ubicSpan">{modalBody.Lworkcit_Department}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Laboratorio asociado</label>
                                                    <span className="ubicSpan">{modalBody.Lworkcit_Laboratory}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Fuente referencia</label>
                                                    <span id="fuRefSpan">{modalBody.Lworkcit_Onlink_Based}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Dirección</label>
                                                    <span id="dirAddrSpan">{modalBody.Lworkcit_Address_Type}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Punto de referencia trabajo local</label>
                                                    <span className="ubicSpan">{modalBody.Lworkcit_Delivery_Point}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Ciudad</label>
                                                    <span id="ciuSpan">{modalBody.Lworkcit_Address_City}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Área de trabajo</label>
                                                    <span id="adminArSpan">{modalBody.Lworkcit_Administrative_Area}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Código postal</label>
                                                    <span id="codPosSpan">{modalBody.Lworkcit_Postal_Code}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Correo electrónico</label>
                                                    <span className="ubicSpan">{modalBody.Lworkcit_Email_Address}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Nombre</label>
                                                    <span id="nomTypeSpan">{modalBody.Lworkcit_Name}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Versión</label>
                                                    <span id="verTypeSpan">{modalBody.Lworkcit_Version}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Nombre según estándar</label>
                                                    <span id="nomEstSpan">{modalBody.StandardName}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Compañía</label>
                                                    <span id="siteWrkSpan">{modalBody.StandardManufacturer}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Tipo de señal</label>
                                                    <span id="tSignalSpan">{modalBody.Id_SignalType}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Rango espectral</label>
                                                    <span id="spectRaSpan">{modalBody.SpectralRange}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Resolución espectral</label>
                                                    <span id="spectReSpan">{modalBody.SpectralResolution}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Fuente de iluminación</label>
                                                    <span className="ubicSpan" id="ligSrcSpan">{modalBody.LightSource}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Ángulo de iluminación</label>
                                                    <span id="ligSpan">{modalBody.LightingAngle}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Línea de vista</label>
                                                    <span id="fldSpan">{modalBody.FieldOfView}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Distancia desde nivel suelo</label>
                                                    <span id="grndSpan">{modalBody.GroundDistance !== null ? modalBody.GroundDistance: 'N/A'}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Fibra</label>
                                                    <span id="fibSpan">{modalBody.FiberTilt}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Línea de vista</label>
                                                    <span id="fldOfVSpan">{modalBody.FieldOfView}</span>
                                                </div>
                                                <div className='row'>
                                                    <label class="projLab">Accesorio</label>
                                                    {
                                                        entorno === 'dev' ?
                                                        <span id="adOptSpan">{modalBody.Id_AdaptedOptics}</span>:
                                                        <span id="adOptSpan_prod">{modalBody.Id_AdaptedOptics}</span>
                                                    }
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>% nubosidad</label>
                                                    <span id="clCovSpan">{modalBody.CloudcoverPercentage}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Sistema de referencia</label>
                                                    <span id="refSysSpan">{modalBody.ReferenceSystem}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Fecha muestra</label>
                                                    <span id="samDateSpan">{modalBody.SamplingDate}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Hora muestra</label>
                                                    <span id="samTimeSpan">{modalBody.SamplingTime}</span>
                                                </div>
                                                <div className='row'>
                                                    <label className='projLab'>Número firmas</label>
                                                    {
                                                        entorno === 'dev' ?
                                                        <span id="numSigSpan">{modalBody.NumSignatures}</span>
                                                        :
                                                        <span id="numSigSpan_prod">{modalBody.NumSignatures}</span>
                                                    }
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Iden estado cubrimiento</label>
                                                    <span id="covStaSpan">{modalBody.Id_CoverState !== null ? modalBody.Id_CoverState : 'N/A'}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Iden estado línea vista</label>
                                                    <span id="rofStaSpan">{modalBody.Id_RoofState !== null ? modalBody.Id_RoofState: 'N/A'}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Descripción estado línea vista</label>
                                                    <span>{modalBody.Id_RoofDescription !== null ? modalBody.Id_RoofDescription: 'N/A'}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Tipo muestra agua</label>
                                                    <span id="wTypSpan">{modalBody.Id_WaterType !== null ? modalBody.Id_WaterType : 'N/A'}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Descripción muestra</label>
                                                    <span id="wDesSpan">{modalBody.WaterDescription !== null ? modalBody.WaterDescription : 'N/A'}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Iden estado Pheno</label>
                                                    <span id="phStSpan">{modalBody.Id_PhenoState !== null ? modalBody.Id_PhenoState : 'N/A'}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Iden tipo muestra</label>
                                                    <span id="soTySpan">{modalBody.Id_SoilType !== null ? modalBody.Id_SoilType : 'N/A'}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Iden color tipo muestra </label>
                                                    <span id="soColSpan">{modalBody.Id_SoilColor !== null ? modalBody.Id_SoilColor : 'N/A'}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Iden detalle tipo muestra</label>
                                                    <span id="soDetSpan">{modalBody.Id_SoilDetail !== null ? modalBody.Id_SoilDetail : 'N/A'}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Iden apariencia línea de vista</label>
                                                    <span >{modalBody.Id_RoofAppearance !== null ? modalBody.Id_RoofAppearance : 'N/A'}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Iden apariencia color de línea de vista</label>
                                                    <span >{modalBody.Id_RoofColor !== null ? modalBody.Id_RoofColor : 'N/A'}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Iden muestra homogena del espectro</label>
                                                    <span >{modalBody.Id_SpectrlaHomogeneityRoof !== null ? modalBody.Id_SpectrlaHomogeneityRoof : 'N/A'}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Iluminación</label>
                                                    <span id="ilumSpan">{modalBody.Iluminance}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Índice Muestra de Ch</label>
                                                    <span id="chIndSpan">{modalBody.ChlorophyllIndex !== null ? modalBody.ChlorophyllIndex : 'N/A'}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Iden Gráfico espectral</label>
                                                    <span id="idSpecSpan">{modalBody.IdSpectraGraph}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Temperatura ambiental</label>
                                                    <span id="ambTempSpan">{modalBody.AmbientTemperature}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Humedad relativa</label>
                                                    <span id="relHumSpan">{modalBody.RelativeHumidity}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Velocidad del viento</label>
                                                    <span id="winSpSpan">{modalBody.WindSpeed}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Ángulo Zenith</label>
                                                    <span id="zenAngSpan">{modalBody.ZenithAngle}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Ángulo Azimuth</label>
                                                    <span id="azAngSpan">{modalBody.AzimuthAngle}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Télefono voz local</label>
                                                    <span id="telVoiSpan">{modalBody.Lworkcit_Voice}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>País local</label>
                                                    <span id="counLocSpan">{modalBody.Lworkcit_Address_Country}</span>
                                                </div>
                                                <div className='ubicaSignDiv' style={{display:'none'}}>
                                                    <label>Iden asociado archivo comprimido</label>
                                                    <span >{modalBody.Id_Archivo_Zip}</span>
                                                </div>
                                                { /*Opción Descargar metadato - 2025-07-24*/ }
                                                <div className="column ubicaImgFile">
                                                    <button className="app-root-emotion-cache-ltr-xlh1eq btnVw" onClick={() => getXmlMetadato ({modalBody})}>Descargar Metadato</button>
                                                </div>
                                            </div>
                                        )
                                    }
                                </CollapsablePanel>
                            </div>
                            <div id='firmasSeccDiv' className='signDataCls'
                                onClick={() => handleRowCollapClick ("signData")}
                            >
                                <span>&nbsp; </span>
                            </div>
                            <div className='ubicaSignDiv'>
                                <CollapsablePanel
                                    label="Firmas"
                                    isOpen={panelStates.signData}
                                    onRequestOpen={() => togglePanel ("signData")}
                                    onRequestClose={() => togglePanel ("signData")}
                                    className="ubicaSignDiv"
                                    >
                                        {
                                             isLoad ? (
                                                <div className="row">
                                                    <div className="ubicaImgFile">
                                                        <span className="ubicProj">Cargando información. Espere por favor...</span>
                                                    </div>
                                                </div>
                                            ): 
                                            (   
                                                <div>
                                                    <Table responsive className='tblAlign'>
                                                        <thead>
                                                            <tr>
                                                                <th className='w-100table'>
                                                                    Id firma
                                                                </th>
                                                                <th className='w-100table' id="idFile">
                                                                    Id archivo
                                                                </th>
                                                                <th className='w-50table'>
                                                                    Cobertura
                                                                </th>
                                                                <th className='w-50table'>
                                                                    Instrumento
                                                                </th>
                                                                <th className='w-50table'>
                                                                    Altura msnm
                                                                </th>
                                                                <th className='w-100table'>
                                                                    Tiempo de integración
                                                                </th>
                                                                <th className='w-50table' style={{display: 'none'}}>
                                                                    Boxcar
                                                                </th>
                                                                <th className='w-50table'>
                                                                    Escaneos promedios
                                                                </th>
                                                                <th className='w-50table'>
                                                                    Distancia a la muestra
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            { 
                                                                typeof modalBody.firma != 'undefined' && modalBody.firma.length> 0 && modalBody.firma.map(firmaItem => ( 
                                                                    <>
                                                                        <tr>
                                                                            <td>
                                                                                <span key={firmaItem.id}>{firmaItem.SignatureIdentifier}</span>
                                                                            </td>
                                                                            <td>
                                                                                <span key={firmaItem.id}>{firmaItem.Id_CoverType}</span>
                                                                            </td>
                                                                            <td>
                                                                                <span key={firmaItem.id}>{firmaItem.InstrumentName}</span>
                                                                            </td>
                                                                            <td>
                                                                                <span key={firmaItem.id}>{firmaItem.SeaLevelAltitude}</span>
                                                                            </td>
                                                                            <td>
                                                                                <span key={firmaItem.id}>{firmaItem.IntegrationTime}</span>
                                                                            </td>
                                                                            <td style={{display: 'none'}}>
                                                                                <span key={firmaItem.id}>{firmaItem.Boxcar_Width}</span>
                                                                            </td>
                                                                            <td>
                                                                                <span key={firmaItem.id}>{firmaItem.Scan_Average}</span>
                                                                            </td>
                                                                            <td>
                                                                                <span key={firmaItem.id}>{firmaItem.MeasurementHeight}</span>
                                                                            </td>
                                                                        </tr>
                                                                    </>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                </div>
                                            )
                                        }
                                </CollapsablePanel>
                            </div>
                            <div className="ubicaSignDiv" style={{'display': 'none'}}>
                                <label>Ubicación de la firma (Coordenadas decimales)</label>
                            </div>
                            <div style={{'display': 'none'}}>
                                <label>Latitud</label>
                                <span className="latSpan">{modalBody.ubicLat}</span><br/>
                                <label>Longitud</label>
                                <span className="lonSpan">{modalBody.ubicLon}</span>
                            </div>
                            <div id='filesMetaDataSeccDiv' className='filesMetaDataCls'
                                onClick={() => handleRowCollapClick ("filesMetaData")}
                            >
                                <span>&nbsp; </span>
                            </div>
                            <div className='ubicaSignDiv'>
                                <CollapsablePanel
                                    label="Imágenes"
                                    isOpen={panelStates.filesMetaData}
                                    onRequestOpen={() => togglePanel ("filesMetaData")}
                                    onRequestClose={() => togglePanel ("filesMetaData")}
                                    className="ubicaSignDiv"
                                >
                                    {
                                        isLoad ? (
                                            <div className="row">
                                                <div className="ubicaImgFile">
                                                    <span className="ubicProj">Cargando información. Espere por favor...</span>
                                                </div>
                                            </div>
                                        ):
                                        (
                                            <>
                                                <div className='row rowImage'>
                                                    <div className="column ubicaImgFile">
                                                        <label>Photo Cover</label>
                                                    </div>
                                                    <div className="column ubicaImgFile">
                                                        {phCover !== null ?
                                                            <span className="imgSIECSpan">
                                                                <a href={phCover} target="_blank" title="Para visualizar imagen"><img className="imgSIEC" src={phCover} alt="Img prueba"></img></a>
                                                            </span>: 
                                                            <span className="imgSIECSpanEmpty">
                                                                "Sin imágen asociada!"
                                                            </span>
                                                        }
                                                        
                                                    </div>
                                                    <div className="column ubicaImgFile">
                                                        <label>Photo Context</label>
                                                    </div>
                                                    <div className="column ubicaImgFile">
                                                        {phContext !== null ? 
                                                            <span className="imgSIECSpan">
                                                                <a href={phContext} target="_blank" title="Para visualizar imagen"><img className="imgSIEC" src={phContext}></img></a>
                                                            </span>:
                                                            <span className="imgSIECSpanEmpty">
                                                            "Sin imágen asociada!"
                                                            </span>
                                                        }
                                                    </div>
                                                </div>
                                                <div className='row rowImage'>
                                                    <div className="column ubicaImgFile">
                                                        <label>Photo Sky</label>
                                                    </div>
                                                    <div className="column ubicaImgFile">
                                                        {phSky !== null ?
                                                            <span className="imgSIECSpan">
                                                                <a href={phSky} target="_blank" title="Para visualizar imagen"><img className="imgSIEC" src={phSky}></img></a>
                                                            </span>:
                                                            <span className="imgSIECSpanEmpty">
                                                            "Sin imágen asociada!"
                                                            </span>
                                                        }
                                                    </div>
                                                    <div className="column ubicaImgFile">
                                                        <label>Photo Spectrum Graph</label>
                                                    </div>
                                                    <div className="column ubicaImgFile">
                                                        {phSpecGraph !== null ?
                                                            <span className="imgSIECSpan">
                                                                <a href={phSpecGraph} target="_blank" title="Para visualizar imagen"><img className="imgSIEC" src={phSpecGraph}></img></a>
                                                            </span>: 
                                                            <span className="imgSIECSpanEmpty">
                                                            "Sin imágen asociada!"
                                                            </span>
                                                        }
                                                    </div>
                                                </div>
                                            </>
                                        )
                                    }
                                </CollapsablePanel>
                            </div>
                        </div>
                    </ModalBody>
            </Modal>
            {/* Modal correspondiente a la opción Descarga, para realizar registro del usuario en el sistema - 2025-08-22*/}
            <Modal
                isOpen={modalUsrDataDetail}
                unmountOnClose
                className='modalUsrDownSigData'
            >
                <ModalHeader>
                    {
                        entorno === 'dev' ?
                        <label>Información usuario descarga firma</label>:
                        <label className='titleUsrDownSigDataLbl_prod'>Información usuario descarga firma</label>
                    }
                    <Button className="closeBtn app-root-emotion-cache-ltr-xg0zwy" onClick={openCloseModalUsrDetail}>x</Button> 
                </ModalHeader> 
                <ModalBody>
                    <form onSubmit={handleBtnFormUsrSubmit}>
                        <div>
                            <div className="row">
                                <label className={entorno === 'dev' ? "projLab": "projLab nomApeLbl_prod"}>Nombre y apellido (*)</label>
                                    <span className={entorno === 'dev' ? "nomApeSpanCls": "nomApeSpanCls_prod"}>
                                        <>
                                            <input 
                                                type="text"
                                                value={formUsrDownSigData.nameLastName}
                                                onChange={(evt) => handleTxtNomApeChange ('nameLastName', evt.target.value)}
                                                onBlur={(evt) => handleTxtNomApeBlur ('nameLastName', evt.target.value, tValidators.text)}
                                                maxLength={350} 
                                                placeholder="Especifique usuario"
                                            />
                                            {
                                                entorno === 'dev' ?
                                                <label className={errors.nameLastName && errors.nameLastName.length <= 23 ? "nameLastNameErrLbl": "nameLastNameErrExtLbl"}>{errors.nameLastName}</label>:
                                                <label className={errors.nameLastName && errors.nameLastName.length <= 23 ? "nameLastNameErrLbl_prod": "nameLastNameErrExtLbl"}>{errors.nameLastName}</label>
                                            }
                                        </>
                                    </span>
                            </div>
                            <div className="row">
                                <label className={entorno === 'dev' ? "projLab" : "projLab emailLbl_prod"}>Correo electr&oacute;nico (*)</label>
                                <span className={entorno === 'dev' ? "emailSpanCls": "emailSpanCls_prod"}>
                                    <>
                                        <input 
                                            type="text" 
                                            value={formUsrDownSigData.email}
                                            onChange={(evt) => handleTxtEmailChange('email',  evt.target.value)}
                                            onBlur={(evt) => handleTxtEmailBlur ('email', evt.target.value, tValidators.email)}
                                            placeholder="Especifique correo electrónico"
                                            maxLength={350}
                                        />
                                        {
                                            entorno === 'dev' ?
                                            <label className={errors.email && errors.email.length <= 23 ? "emailErrLbl": "emailErrExtLbl"}>{errors.email}</label>: <label className={errors.email && errors.email.length <= 23 ? "emailErrLbl_prod": "emailErrExtLbl"}>{errors.email}</label>
                                        }
                                    </>
                                </span>
                            </div>
                            <div className="row">
                                <label className={entorno === 'dev' ? "paisLblCls": "projLab paisLblCls_prod"}>Pa&iacute;s (*)</label> 
                                <span className={entorno === 'dev' ? "paisSpanCls": "paisSpanCls_prod"}>
                                    <Select placeholder='Seleccione país...'
                                        value={formUsrDownSigData.pais}
                                        onChange={(evt) => handleSelCountryChange ('pais', evt)}
                                        onBlur={(evt) => handleSelCountryBlur ('pais', evt, tValidators.required)}
                                    >
                                        {
                                            countryUsrDownSigLst.map ((paisItem) => (
                                                <option value={paisItem.Id_Valor_Dominio}>{paisItem.Descripcion_Valor}</option>
                                            ))
                                        }
                                    </Select>
                                    <label className={entorno === 'dev' ? "paisErrLbl": "paisErrLbl_prod"}>{errors.pais}</label>
                                </span>
                            </div>
                            <div className="row">
                                <label className={entorno === 'dev' ? "projLab" : "projLab ocupaLblCls_prod"}>Ocupaci&oacute;n (*)</label>
                                <span className={entorno === 'dev' ? "ocupaSpanCls": "ocupaSpanCls_prod"}>
                                    <Select 
                                        placeholder='Seleccione profesión...'
                                        value={formUsrDownSigData.ocupa}
                                        onChange={(evt) => handleSelOcupProfChange ('ocupa', evt)}
                                        onBlur={(evt) => handleSelOcupProfBlur ('ocupa', evt, tValidators.required)}
                                    >
                                        {
                                            occupUsrDownSigLst.map ((ocupaItem) => (
                                                <option value={ocupaItem.Id_Valor_Dominio}>{ocupaItem.Descripcion_Valor}</option>
                                            ))
                                        }
                                    </Select>
                                    <label className='ocupaErrLbl'>{errors.ocupa}</label>
                                </span>
                            </div>
                            <div className="row">
                                <label className={entorno === 'dev' ? "projLab": "projLab orgLblCls_prod"}>Empresa / Organizaci&oacute;n (*)</label>
                                <span className={entorno === 'dev' ? "orgSpanCls": "orgSpanCls_prod"}>
                                    <>
                                        <input 
                                            type="text"
                                            value={formUsrDownSigData.emprWork}
                                            onChange={(evt) => handleTxtEmprWorkChange ('emprWork', evt.target.value)}
                                            onBlur={(evt) => handleTxtEmprWorkBlur ('emprWork', evt.target.value, tValidators.textSigle)} 
                                            placeholder="Especifique Empresa..."
                                            maxLength={350}
                                        />
                                        <label className={errors.emprWork && errors.emprWork.length <= 23 ? "emprWorkErrLbl":"emprWorkErrExtLbl"}>{errors.emprWork}</label>
                                    </>
                                </span>
                            </div>
                            <div className="row">
                                <label className={entorno === 'dev' ? "projLab purpDataLblCls": "projLab purpDataLblCls_prod"}>Describa el inter&eacute;s en los datos (*)</label>
                                <span id={entorno === 'dev' ? "purpDataSpan": "purpDataSpan_prod"}>
                                    <>
                                        <TextArea
                                            value={formUsrDownSigData.purpData} 
                                            onChange={(evt) => handleTxtPurpDataChange ('purpData', evt.target.value)}
                                            onBlur={(evt) => handleTxtPurpDataBlur ('purpData', evt.target.value+';'+numPosiciones, tValidators.textMinLength)}
                                            placeholder='Especifique interés en los datos...'
                                            className={entorno === 'dev' ? "purpDataCls": "purpDataCls_prod"}
                                        >
                                        </TextArea>
                                        <label className='purpDataErrLbl'>{errors.purpData}</label>
                                    </>
                                </span>
                            </div>
                            { /*Opción Registrar usuario - 2025-08-22*/ }
                            <div className="column ubicaImgFile ubicaRegUsr">
                                <Button
                                    className="app-root-emotion-cache-ltr-xlh1eq btnVw"
                                    htmlType="submit"
                                    disabled={disRegUsrDownSig}
                                >Registrar Usuario</Button>
                            </div>
                        </div>
                    </form>
                </ModalBody>
            </Modal>
        </>
    </div>
  )
}

export default tablaResultados;