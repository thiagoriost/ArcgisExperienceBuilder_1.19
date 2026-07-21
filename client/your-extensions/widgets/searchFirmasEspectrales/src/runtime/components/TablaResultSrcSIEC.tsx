/** 
    Sección de importación
    @date 2025-04-08
    @changes Importar componente DataGrid desde la extensión mui/x-data-grid
    @dateUpdated 2025-05-12
    @changes Importar componente appActions, para realizar acciones asociadas al widget
    @dateUpdated 2025-05-13    
    @changes Importar componente Graphic, para definir marcador sobre mapa
    @changes Importar componente Point, para definir marcador sobre mapa 
    @changes Importar componente SimpleMarkerSymbol, para definir marcador sobre mapa
    @changes Importar componente webMercatorUtils (utilidades del sistema)
    @dateUpdated 2025-05-19
    @changes Importar objeto pathDataGridSIEC desde dataDG
    @dateUpdated 2025-05-30
    @changes Importar objeto useEffect
*/
import React, { useEffect } from "react";

import { DataGrid } from "@mui/x-data-grid";

import { Button, Modal, ModalBody, ModalHeader } from "jimu-ui";

import { appActions } from 'jimu-core';

//Importaciones para mapa base
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";

//Utilidades
import webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils";

//Estilos
import '@mui/x-data-grid/lib/style.css';

//Imagenes - Path del sistema acceso (2025-05-19)
import { pathDataGridSIEC } from '../../types/dataDG';

/**
 * Componente tablaResultSrcSIEC => Visualiza la tabla de búsqueda firma, asociado a un Data Grid
 * @date 2025-04-01
 * @author IGAC - DIP
 * @param rows
 * @param columns
 * @param view
 * @param setControlForms 
 * @param setResponseBusquedaFirma 
 * @param typeGraphMap (NU)
 * @param spatialRefer
 * @param setAlertDial
 * @param setMensModal
 * @param pagination
 * @param paginationModel
 * @param setPaginationModel
 * @param files
 * @param setFiles
 * @param modalDetail
 * @param setModalDetail
 * @param props
 * @param initialExtent
 * @param modalHead
 * @param setModalHeadState
 * @param modalBody
 * @param setModalBodyState
 * @param jsonDpto
 * @param setJsonDptoState
 * @param jsonMpio
 * @param setJsonMpioState
 * @dateUpdated 2025-04-09
 * @changes Adición param (prop) pagination para paginar data grid 
 * @changes Adición param (prop) paginationModel para paginar data grid 
 * @changes Adición param (prop) setPaginationModel para paginar data grid 
 * @dateUpdated 2025-04-10
 * @changes Actualización atributos color, y background-color, para presentación del componente DataGrid.
 * @dateUpdated 2025-04-11
 * @changes Adición estados para implementar opción Descargar, pasados al componente DataGrid
 * @dateUpdated 2025-04-15
 * @changes Importar componente Modal, para implementar opción Detalles
 * @changes Adición param (prop) modalDetail, para implementar opción Detalles
 * @changes Adición param (prop) setModalDetail, para implementar opción Detalles
 * @dateUpdated 2025-05-08
 * @changes Uso del parámetro rows
 * @dateUpdated 2025-05-12
 * @changes Uso del parámetro props
 * @dateUpdated 2025-05-14
 * @changes Uso del parámetro initialExtent
 * @dateUpdated 2025-05-16
 * @changes Uso del parámetro modalHead
 * @changes Uso del parámetro setModalHeadState
 * @changes Uso del parámetro modalBody
 * @changes Uso del parámetro setModalBodyState
 * @dateUpdated 2025-05-20
 * @changes Nombre del archivo en la parte inferior de la imagen
 * @changes Visualización imagen en ventana nueva, seleccionando la imagen del modal (thumbail)
 * @dateUpdated 2025-05-22
 * @changes Uso del parámetro jsonDpto
 * @changes Uso del parámetro setJsonDptoState
 * @changes Uso del parámetro jsonMpio
 * @changes Uso del parámetro setJsonMpioState
 * @Remarks componente datatable en https://primereact.org/datatable/
 */
const TablaResultSrcSIEC = function({rows, view, setControlForms, jimuMapView, setResponseBusquedaFirma, paginationModel, setPaginationModel, files, setFiles, modalDetail, setModalDetail, props, initialExtent, modalHead, setModalHeadState, modalBody, setModalBodyState, jsonDpto, jsonMpio}){

    
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
     * @remarks Fuente consulta https://stackoverflow.com/questions/64331095/how-to-add-a-button-to-every-row-in-mui-x-data-grid
     */
    const columnsSrcSIEC = [
        {field:"id", headerName:"Object Id", width: 78},    
        {field:"type", headerName:"Cobertura", width: 150},
        {field:"codSig", headerName:"Código Firma", width: 240},
        {field:"ins", headerName:"Instrumento", width: 340},
        {field:"alsnm", headerName:"Altura snm",width: 100},
        {field:"proj", headerName:"Proyecto", width: 240},
        {field:"camp", headerName:"Campaña", width: 160},
        {field:"locat", headerName:"Ubicación", width: 340},
        {field:"phSig", headerName:"Archivo firma", width: 450},
        {field:"speInteg", headerName:"% pureza", width: 90},
        {field:"oper", headerName:"Operaciones", width: 220,
            sortable: false, 
            renderCell: ({ row }) => 
            <>
                <Button type="primary" onClick={() => downZipFirma(row)}>Descarga</Button>&nbsp;&nbsp;
                <Button type="primary" onClick={() => openCloseModalDetail(row)}>Detalles</Button>
            </>
        }
    ]
    /**
     * Método para conversión de un archivo a base 64
     * @date 2025-04-11
     * @param file 
     * @returns (String)
     * @remarks Método obtenido desde la fuente https://www.youtube.com/watch?v=qmr9NCYjueM
     * @remarks Proceso de consumo, por medio de un API (por definir)
     */
    const convertBase64 = function(file){
        //Objeto de prueba -- 2025-04-11
        file = {
            path:"C:\\SIGSIEC24\\firmas\\93_1",
            name:"FE_Campo_4_txtFirmaTEST_20240923_0920.txt"
        }
        var arrayFiles = [];
        return new Promise ((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);

            fileReader.onload = function() {
                resolve(fileReader.result);
                var base64Str = fileReader.result;
                arrayFiles.push({base64: base64Str, nombre: file.name});
            };

            fileReader.onerror = function(error){
                reject(error);
            }
        });
        //Se setea el state de archivos
        setFiles([...files, arrayFiles]);
    };
    /**
     * Método downZipFirma => Descarga un grupo de archivos asociados a la firma con su identificador.
     * @date 2025-04-11
     * @author IGAC - DIP
     * @param row 
     * @remarks Proceso de consumo, por medio de un API (por definir)
     */
    const downZipFirma = function(row){
        console.log("Prueba de ingreso a descarga...");
        convertBase64("FE_Campo_4_txtFirmaTEST_20240923_0920.txt");
        console.log("Files =>",files);
    }
    /**
     * método limpiarCapaMapa() => quita capa del mapa asociada al filtro consulta simple. Centra el mapa con un nivel de ampliación a 6 unidades
     * @date 2024-06-17
     * @author IGAC - DIP
     * @dateUpdated 2024-06-20
     * @changes remover la capa ampliada, obtenida desde el DataGrid al procesar la consulta del widget
     * @returns JimuMapView
     */
    function limpiarCapaMapa()
    {
        setResponseBusquedaFirma(null);      
        console.log("Obj Geometria =>",view);      
        if (view){
            jimuMapView.view.map.remove(view);
        }
    }

    /**
     * Método generación markers en mapa, según geometría.
     * @date 2025-05-13
     * @author IGAC - DIP
     * @dateUpdated 2025-05-14
     * @changes Implementar markers para varios puntos, asociados al data Grid
     * @dateUpdated 2025-05-15
     * @changes Fix validación existencia geometría brindada por el servicio, para generar los correspondientes markers
     * @param rows 
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
                    //Gráfico usando punto y marcador
                    const pointGraphMap = new Graphic({
                        geometry: pointMap,
                        symbol: markerSymb
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
     * Método retornarFormulario => Visualiza los criterios de selección del widget, estando en el componente DataGrid
     * @date 2024-06-18
     * @author IGAC - DIP     
     * @remarks método obtenido del widget consulta Avanzada (widgets/consulta-avanzada/src/runtime/widget.tsx)
     */
    const retornarFormulario = function() {
        if (view){
          limpiarCapaMapa();
        }
        setControlForms(false);
      }
   
    /**
     * Método openCloseModalDetail => abre / cierra modal asociado a la opción Detalles
     * @date 2025-04-15
     * @author IGAC - DIP
     * @param row
     * @dateUpdated 2025-05-16
     * @changes Adición parámetro row, que contiene la información del dataGrid en la fila seleccionada
     * @remarks Fuente consulta https://www.youtube.com/watch?v=XAAl8IDwMiw&t=775s
     */

    const openCloseModalDetail = function(row){
        console.log("Invocación Modal...",modalDetail);
        console.log("Row =>",row);
        setModalDetail(!modalDetail);
        
        //Head
        setHeadModal(row);
        
        //Body
        setBodyModal(row);
    }

    /**
     * setHeadModal => Método para asignar el encabezado del modal opción Detalles
     * @date 2025-05-16
     * @author IGAC - DIP
     * @param row 
     */
    const setHeadModal = function(row){
        var headJSON = {
            "codSig": row.codSig
        }
        var headHTMLModal = "Firma asociada"+" "+headJSON.codSig;
        setModalHeadState(headHTMLModal);
    }
    /**
     * Contenido encabezado Modal
     * @date 2025-04-15
     * @dateUpdated 2025-04-16
     * @changes Actualización label componente Button
     * @dateUpdated 2025-05-16
     * @changes Actualización label en prueba (traer título del dataGrid) => rows
     * @author IGAC - DIP
     */
    /* const headSIECDetail = (
       
            <ModalHeader className="closeDet header" id="headerDet">
                <label>Detalles firma Prueba</label>
                <label>Test</label>
                <Button className="closeBtn app-root-emotion-cache-ltr-xg0zwy" onClick={openCloseModalDetail}>x</Button>
            </ModalHeader>        
       
    ) */
    
    /**
     * setBodyModal => método para generar el cuerpo del modal, basado en la información del servicio en objeto row
     * @date 2025-05-16
     * @author IGAC - DIP
     * @param row
     */
    const setBodyModal = function (row){
        //Conversión geometría del servicio rectangulares => decimales (Latitud, Longitud)
        var geomLatLon = webMercatorUtils.xyToLngLat(row.pointX, row.pointY);
        var bodyJSON = {
            "campa_a": row.camp,
            "ubic": row.locat,
            "proj": row.proj,
            "tMues": row.type,
            "altCover": row.alsnm,
            "instrum": row.ins,
            "ubicLat": geomLatLon[0].toFixed(3),
            "ubicLon": geomLatLon[1].toFixed(3),
            "fileSig": row.phSig
        }
        setModalBodyState(bodyJSON);
    }
    /**
     * Contenido del modal asociado a la opción Detalles
     * @date 2025-04-15
     * @author IGAC - DIP
     */
    /* const bodySIECDetail = (
        <ModalBody>
            <div>
                <div className="row">
                    <label>Campaña #93</label>
                </div>
                <div>
                    <label>Fecha:</label>
                    <span>2010-06-11</span>
                </div>
                <div>
                    <label>Ubicación:</label>
                    <span>Aguadas
                        (Caldas)</span>
                </div>
                <div>
                    <label>Responsable:</label>
                    <span>IGAC</span>
                </div>            
                <div>
                    <label>Proyecto:</label>
                    <span>Cob 1</span>
                </div>
                <div>
                    <label>Muestra #1</label>                
                </div>
                <div>
                    <label>Tipo:</label>
                    <span>Vegetación</span>
                </div>
                <div>
                    <label>Clase:</label>
                    <span>Cultivo</span>
                </div>
                <div>
                    <label>Subclase:</label>
                    <span>Soja (Glycine max)</span>
                </div>
                <div>
                    <label>Fenología:</label>
                    <span>Semilla verde de tamaño máximo del nudo</span>
                </div>
                <div>
                    <label>Altura promedio de la cobertura:</label>
                    <span>0.8 metros</span>
                </div>
                <div>
                    <label>Técnica de muestreo:</label>
                    <span>Obtención de espectros a lo largo de una transrecta</span>
                </div>
                <div>
                    <label>Procesamiento:</label>
                    <span>La firma representa la mediana de las firmas espectrales de los espectros de reflecancia obtenidos en cada puno de la transrecta</span>
                </div>
                <div>
                    <label>Instrumento:</label>
                    <span>ASD FieldSpec FR1</span>
                </div>
                <div>
                    <label>Punto #1</label>
                </div>
                <div>
                    <label>Ubicación:</label>
                    <span>(Lat: 4.251, Long: -71.013)</span>
                </div>
                <div>
                    <label>Fecha y hora:</label>
                    <span>2017-05-15 18:35 hs.</span>
                </div>
                <div>
                    <label>Altura de la vegetación:</label>
                    <span>0.5 m</span>
                </div>
                <div>
                    <label>Cobertura:</label>
                    <span>90%</span>
                </div>
                <div>
                    <label>Imagenes</label>
                </div>
            </div>
        </ModalBody>
    ) */

/**
   * Método ciclo vida componentDidUpdate => implementación de cierre del widget Buscar Firma, incluyendo la operación "reset" en cada uno de los controles del filtro.
   * @dateUpdated 2025-05-13
   * @changes Implementar Markers del dataGrid en mapa
   * @dateUpdated 2025-05-14
   * @changes Incluir llamado al método goToInitialExtent(), para reasignar el mapa a su estado inicial
   * @changes Mantenimiento método, para llamado del borrado de markers anteriores, al reprocesar consulta
   * @dateUpdated 2025-05-29
   * @changes Fix bug borrado de markers, al no existir alguno
   * @remarks método obtenido del componente FiltersSrcSIEC*/

    function componentDidUpdate ()
    {
        //Borrado de markers anteriores
        if (jimuMapView){
            jimuMapView.view.map.removeAll();
            console.log("Punto borrado correctamente al reprocesar consulta");
        }
        if (props.state === 'CLOSED'){
            console.log("Cerrado...");
            retornarFormulario();
            goToInitialExtent(jimuMapView, initialExtent);
            props.dispatch(appActions.closeWidget(props.widgetId));
        }
        else
        {
            console.log("En pruebas widget abierto...");
            console.log("Inserción de Markers...");
            //console.log("Rows DG =>",rows);
            //Inserción de markers
            markerMapDataGrid(rows);

            //PRuebas
            console.log("JSON DPTO =>",jsonDpto);
            console.log("JSON MPIO =>",jsonMpio);
        }
    }
    /**
     * goToInitialExtent() => Método para obtener el extent inicial del país Colombia
     * @author IGAC - DIP
     * @date 2025-05-14
     * @param jimuMapView 
     * @param initialExtent 
     * @remarks DRA asociado al Widget Consulta Avanzada (RRH)
     */
    const goToInitialExtent = (jimuMapView, initialExtent: any) => {
        if (jimuMapView && initialExtent) {
          jimuMapView.view.goTo(initialExtent, { duration: 1000 })
        }
      }
    
    /**
     * Hook para ejecución del Data Grid
     * @date 2025-05-13
     * @author IGAC - DIP
     * @dateupdated 2025-05-30
     * @changes Habilitación hook con análisis state sobre objeto rows
     */
    
    useEffect(() => {
        componentDidUpdate();
    },
    [rows]);
     
  return (
    <>
        <Button size="sm" className="mb-1" type="primary" onClick={retornarFormulario}>
            Filtros consulta</Button>                   
        <DataGrid 
            sx={{'.MuiTablePagination-root':
                {color: '#126a92', backgroundColor: '#ffff'},
                '.css-yseucu-MuiDataGrid-columnHeaderRow':
                {color: '#126a92', backgroundColor: '#ffff'},
                '.css-11dqcl8-MuiDataGrid-virtualScrollerRenderZone':
                {color: '#126a92', backgroundColor: '#ffff'},
            }}
            className="css-1hr2sou-MuiTablePagination-root MuiTablePagination-root"
            columns={columnsSrcSIEC} 
            rows={rows}
            pagination
            pageSizeOptions={[2,5,8,10]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}            
        />
        <Modal
            isOpen={modalDetail}            
            unmountOnClose            
        >
            <ModalHeader className="closeDet header" id="headerDet">
                <label className="label">{modalHead}</label>
                <Button className="closeBtn app-root-emotion-cache-ltr-xg0zwy" onClick={openCloseModalDetail}>x</Button>
            </ModalHeader>
            <ModalBody>
                <div>
                    <div className="row">
                        <label className="projLab">Proyecto {modalBody.proj}</label>
                        <label className="campLab">Campaña {modalBody.campa_a}</label>
                    </div>
                    <div>
                        <label>Ubicación:</label>
                        <span className="ubicSpan">{modalBody.ubic}</span>
                    </div>
                    <div className="ubicaDataMues">
                        <label>Datos de la Muestra</label>                
                    </div>
                    <div>
                        <label>Tipo:</label>
                        <span className="tMuesSpan">{modalBody.tMues}</span>
                    </div>
                    <div>
                        <label>Altura promedio de la cobertura:</label>
                        <span className="altCoverSpan">{modalBody.altCover} m</span>                    
                    </div>
                    <div className="column">
                        <label>Instrumento:</label>
                        <span className="insSpan">{modalBody.instrum}</span>
                    </div>
                    <div className="ubicaSignDiv">
                        <label>Ubicación de la firma (Coordenadas decimales)</label>
                    </div>
                    <div>
                        <label>Latitud:</label>
                        <span className="latSpan">{modalBody.ubicLat}</span><br/>
                        <label>Longitud:</label>
                        <span className="lonSpan">{modalBody.ubicLon}</span>
                    </div>
                    <div>
                        <label>Altura de la vegetación:</label>
                        <span className="altCovSpan">{modalBody.altCover} m</span> 
                    </div>
                    <div className="column ubicaImgFile">
                        <label>Imagenes</label>
                    </div>
                    <div className="column">
                        <label>Archivo asociado</label>
                    </div>
                    <div className="column ubicaImgFile">
                        <span className="imgSIECSpan">
                            <a href={`${pathDataGridSIEC.path}/images/${pathDataGridSIEC.folder}/${modalBody.fileSig}`} target="_blank" title="Para visualizar imagen" ><img className="imgSIEC" src={`${pathDataGridSIEC.path}/images/${pathDataGridSIEC.folder}/${modalBody.fileSig}`} alt="Img prueba"></img></a>
                        </span>
                        <span className="fileSpan"> {modalBody.fileSig}</span>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    </>    
    )
};

export default TablaResultSrcSIEC;