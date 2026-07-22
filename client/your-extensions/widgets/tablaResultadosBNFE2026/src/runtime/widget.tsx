
import { React, type AllWidgetProps } from 'jimu-core'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis' // The map object can be accessed using the JimuMapViewComponent
import { Button, Modal, ModalBody, ModalHeader, CollapsablePanel, Table, Select, TextArea } from "jimu-ui";
import TablaResultadosTable, { type PaginationModelTR, type TablaResultadosRow } from './components/TablaResultadosTable';

const { useEffect, useState, useRef } = React;

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

//Importación interfaces
import { InterfaceMensajeModal, typeMSM } from "../../../searchSIEC2026/src/types/InterfaceResponseBusquedaFirmas";

//Componente DialogsSrcSIEC
import DialogsSrcSIEC from "../../../searchSIEC2026/src/runtime/components/dialogsSrcSIEC";
import { InterfaceModalBody } from '../types/InterfaceGraphSIEC';
import { validaLoggerLocalStorage } from '../../../shared/utils/export.utils';


const tablaResultados = function (props: AllWidgetProps<any>){
    if(validaLoggerLocalStorage('logger')) console.log('WidgetResult ID:', {id:props.id, props})
    if(validaLoggerLocalStorage('logger')) console.log('MapWidgetIds:', props.useMapWidgetIds)
    //Estados locales
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
   const [paginationModel, setPaginationModel]=useState<PaginationModelTR>({
        pageSize: 5,
        page: 0
    })

    //Estado para manejo filas en tabla de resultados
    const [rows, setRows]                       =   useState<TablaResultadosRow[]>([]);
    //2025-10-07 => Estado para selección registro en Data Grid
    const [selecRow, setSelecRow]               =   useState<Array<string | number>>([]);
    
    //Estado para manejo de popUp
    const [popUp, setPopUp]                     =   useState<PopupTemplate>();

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

    //Ref controlador de selección registro sobre tabla de resultados - 2025-10-09
    const pendingSelectionDGRef                 =   useRef<string | number | null>(null);

    //Ref para controlar el contenedor de la tabla de resultados - 2025-10-09
    const gridContainerDGRef                    =   useRef<HTMLDivElement>(null);
   
    const activeViewChangeHandler = async (jmv: JimuMapView) => {
        
        if (jmv) {
            setJimuMapView(jmv);
        }
    }

   
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


    const setHeadModal = function(row){
      var headJSON = {
          "objectId": row.obj_id
      }
      var headHTMLModal = "Detalles del punto de muestreo"+" "+headJSON.objectId;
      setModalHead(headHTMLModal);
  }

   
    const setBodyModal = function (metaDataFirma){
        setModalBody(metaDataFirma);
  }
  
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
     * Cierra el modal de registro de usuario desde el encabezado.
     */
    const handleCloseUsrModal = function () {
        openCloseModalUsrDetail('');
    }
    
    /**
     * Actualiza el modelo de paginacion usado por la tabla nativa.
     *
     * @param model Estado de pagina y cantidad de filas por pagina.
     */
    const handlePaginationModelChange = function (model: PaginationModelTR) {
        setPaginationModel(model);
    }

    /**
     * Procesa el click de una fila en la tabla y aplica zoom en el mapa.
     *
     * @param row Registro asociado a la fila seleccionada.
     */
    const handleTableRowClick = function (row: TablaResultadosRow) {
        setSelecRow([row.id]);
        zoomPointSelected(row);
    }

    /**
     * Mantiene sincronizado el estado de seleccion de filas.
     *
     * @param ids Identificadores de filas seleccionadas.
     */
    const handleTableRowSelectionChange = function (ids: Array<string | number>) {
        setSelecRow(ids);
    }

    /**
     * Dispara la accion de descarga para una fila de resultados.
     *
     * @param row Registro con el archivo de firma asociado.
     */
    const handleTableDownloadClick = function (row: TablaResultadosRow) {
        regUserDownloadZip('', '', row.phSig + '.zip', generarFileStand(row.phSig) + '.zip');
    }

    /**
     * Abre el modal de detalle para la fila seleccionada.
     *
     * @param row Registro del punto de muestreo a consultar.
     */
    const handleTableDetailsClick = function (row: TablaResultadosRow) {
        openCloseModalDetail(row);
    }

    
    const togglePanel = function (panelName: string) {
        setPanelStates (prev => ({
            ...prev,
            [panelName]: !prev[panelName]
        }));
    }

    const handleRowCollapClick = function (secc) {
        togglePanel (secc);
    }

   
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

   
    const expandXmlTags = function (xmlObj) {
        return xmlObj.replace (/<(\w+)\s*\/>/g, '<$1></$1>');
    }

   
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

  
    const addRootAttrib = function (xmlObj, rootName, atribs) {
        if (!atribs.trim())
            return xmlObj;
        const rootOpenT         =   `<${rootName}>`;
        const rootWithAttrib    =   `<${rootName} ${atribs}>`;

        return xmlObj.replace (rootOpenT, rootWithAttrib);
    }

  
    const autoResizeCtrl  = function (evtCtrl: HTMLTextAreaElement){
        evtCtrl.style.height    =   'auto';
        evtCtrl.style.height    =   `${evtCtrl.scrollHeight}px`;
    }

 
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

  
    const handleTxtNomApeBlur = function (fld, value, tValid){
        validateField (fld, value, tValid);
    }

   
    const handleTxtEmailChange = function (fld, value){
        handleTxtNomApeChange (fld, value);
    }

    const handleTxtEmailBlur = function (fld, value, tValid){
        handleTxtNomApeBlur (fld, value, tValid);
    }

 
    const handleTxtEmprWorkChange = function (fld, value) {
        handleTxtNomApeChange (fld, value)   
    }

  
    const handleTxtEmprWorkBlur = function (fld, value, tValid) {
        handleTxtNomApeBlur (fld, value, tValid);
    }

    const handleTxtPurpDataChange = function (fld, value){
        //Invocación validador
        handleTxtNomApeChange (fld, value);
    }

   
    const handleTxtPurpDataBlur = function (fld, value, tValid){
        //console.log("Verificando validador Describa el interés...=>",tValid);
        handleTxtNomApeBlur (fld, value, tValid);
    }

   
    const handleTxtPurpDataInput = function (evt: React.ChangeEvent<HTMLTextAreaElement>){
        autoResizeCtrl (evt.target);
    }

  
    const handleSelCountryChange = function (fld, evt){
        //Objetos locales
        const value = evt.target.value;
        //Invocación validador
        handleTxtNomApeChange (fld, value);
    }

   
    const handleSelCountryBlur = function (fld, evt, tValid){
        //Objetos locales
        const value =   formUsrDownSigData.pais;
        //Invocación validador asociado
        handleTxtNomApeBlur (fld, value, tValid);
    }

  
    const handleSelOcupProfChange = function (fld, evt){
         //Objetos locales
        const value = evt.target.value;
        //Invocación validador
        handleTxtNomApeChange (fld, value);
    }

    
    const handleSelOcupProfBlur = function (fld, evt, tValid){
        //Objetos locales
        const value =  formUsrDownSigData.ocupa;
        //Invocación validador asociado
        handleTxtNomApeBlur (fld, value, tValid);
    }

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
    
    const processForm = async function () {        
        return await formUsrDownSigData;
    }
    
   
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
     * Desplaza el contenedor de la tabla hasta una fila especifica.
     *
     * @param idRow Identificador de fila a enfocar visualmente.
     */
    const scrollDGToRow = function (idRow: string | number) {
        const root = gridContainerDGRef.current;
        const el = root ? root.querySelector(`[data-id="${idRow}"]`) : null;
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('row-highlight');
            setTimeout(() => el.classList.remove('row-highlight'), 600);
        }
    }
    
  
    useEffect (() => {
        if (purpDataRef.current){
            autoResizeCtrl (purpDataRef.current);
        }
    }, []);
  
    useEffect(() => {
        if (props.hasOwnProperty('stateProps') && props.stateProps.dataFromDispatchWidget_searchSIEC) {
            const dataFromDispatch = JSON.parse(props.stateProps.dataFromDispatchWidget_searchSIEC)
            console.log("dataFromDispatch =>", {
                props,
                dataFromDispatch,
                rows,
                selecRow,
                numPageDG
            })
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

	
    useEffect(() => {
        //Inserción de markers
        if (rows)
        {
            markerMapDataGrid(rows);
        }
        
        console.log("Rows para DG en TR... =>",rows);

    },[rows]);

    useEffect (() => {
        var found               : TablaResultadosRow | null   =   null;
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

    useEffect (() => {
        if (pendingSelectionDGRef.current !== null){
            const  idRegDG                  =   pendingSelectionDGRef.current;
            
            const waitSelectDG = function () {
                const root  =   gridContainerDGRef.current;
                const el    =   root ? root.querySelector (`[data-id="${idRegDG}"]`) : null;
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

   
    useEffect (() => {
        console.log("State del pais =>",countryUsrDownSig)
    }, [countryUsrDownSigLst])

    const useSimpleValidation = function () {
        //Estados asociados al error del validador
        const [errors, setErrors] = useState<{ [key: string]: string }>({});

      
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
            {/* <Button size="sm" className="mb-1" type="primary" onClick={()=>console.log("retornarFormulario")}>
                Tabla Resultados</Button> */}   
            <h3>Tabla Resultados</h3>
            <TablaResultadosTable
                rows={rows}
                paginationModel={paginationModel}
                pageSizeOptions={numPageDG}
                selectedRowIds={selecRow}
                isDownloading={isDownloading}
                containerRef={gridContainerDGRef}
                onPaginationModelChange={handlePaginationModelChange}
                onRowSelectionChange={handleTableRowSelectionChange}
                onRowClick={handleTableRowClick}
                onDownloadClick={handleTableDownloadClick}
                onDetailsClick={handleTableDetailsClick}
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
                                                    <label className="projLab">Accesorio</label>
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
                    <Button className="closeBtn app-root-emotion-cache-ltr-xg0zwy" onClick={handleCloseUsrModal}>x</Button> 
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