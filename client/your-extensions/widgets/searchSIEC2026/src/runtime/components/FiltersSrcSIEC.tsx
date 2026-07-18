/** 
    Componente para definición de filtros asociados a la búsqueda de firmas espectrales
    @date 2025-04-01
    @author IGAC - DIP
    @dateUpdated 2025-05-05
    @changes Inclusión componente GraphicsLayer
    @changes Inclusión componente Sketch
    @dateUpdated 2025-05-08
    @changes Movimiento de la clase Point desde componente ppal (widget)
    @dateUpdated 2025-05-23
    @changes Inclusión componente codDeptoDivip, para uso código divipola casos especiales
    @dateUpdated 2025-06-09
    @changes Inclusión componente MessageManager
    @dateUpdated 2025-06-16
    @changes Inclusión componente Checkbox
    @dateUpdated 2025-06-18
    @changes Inclusión importación path imagenes del sistema
    @dateUpdated 2025-07-18
    @changes Inclusión importación método getToken()
    @dateUpdated 2025-08-14
    @changes Inclusión importación método getDominioValor() para obtener listado del campo Coberturas 1
    @dateUpdated 2025-08-22
    @changes Importación objeto entorno
    @changes Deshacer requerimiento 2025-06-16, por cambio control a icono
    @dateUpdated 2025-08-25
    @changes Importación objetos sortDptos, sortMpios, sortCober
    @changes Importación objetos sortCampa_as, sortProyectos
    @remarks Sección de importación
*/

import React, { useEffect } from 'react';
import { Button, Label, Radio, Select, TextInput } from 'jimu-ui'; // import components
//2025-06-20 => Pruebas popUp
import Graphic from "@arcgis/core/Graphic";

//Importación interfaces
import { typeMSM } from '../../types/InterfaceResponseBusquedaFirmas';

//Importación API
import { urls } from '../../../../api/servicios'; 

//Importaciones Métodos
//Imagenes - Path del sistema acceso (2025-06-18)
//getToken metodo (2025-07-18)
//getDominioValor (2025-08-14)
import { getToken, getTokenAlt, getDominioValor, pathDataGridSIEC, sortCampa_as, sortCober, sortDptos, sortMpios, sortProyectos } from '../../types/dataDG';

//Importaciones varias - Objetos
import { codDeptoDivip, outFieldsService, sketchHelpParams, entorno } from '../../types/dataDG';

import { appActions } from 'jimu-core';

//Componente GraphicsLayer - 2025-05-05
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";

//Componente Sketch - 2025-05-05
import Sketch  from "@arcgis/core/widgets/Sketch";

//Clase punto - 2025-04-02
import Point from "esri/geometry/Point";

/**
 * Componente FiltersSrcSIEC
 * Definición de filtros asociados a búsqueda de firmas
 * @date 2025-04-01
 * @author IGAC - DIP
 * @param jsonSERV
 * @param setJsonSERV
 * @param selCoberVal
 * @param setCoberState 
 * @param setCoberLst
 * @param showCoberFilt1
 * @param setShowCoberFilt1State
 * @param disCoberFilt1
 * @param setDisCoberFilt1State
 * @param showCoberFilt2
 * @param setShowCoberFilt2State
 * @param disCoberFilt2
 * @param setDisCoberFilt2State
 * @param selCoberFilt1Val
 * @param setSelCoberFilt1ValState
 * @param selCoberFilt2Val
 * @param setSelCoberFilt2ValState
 * @param coberFilt1Lst
 * @param setCoberFilt1LstState
 * @param coberFilt2Lst
 * @param setCoberFilt2LstState
 * @param radValueNav
 * @param setValueNav
 * @param txtValorLat
 * @param setValorLatState
 * @param txtValorLon
 * @param setValorLonState
 * @param selProyVal
 * @param setProyState
 * @param selCampaVal
 * @param setCampaState 
 * @param ResponseBusquedaFirma (NU)
 * @param setResponseBusquedaFirma
 * @param view
 * @param setView (NU)
 * @param jimuMapView
 * @param setAlertDial
 * @param mensModal (NU)
 * @param setMensModal (NU)  
 * @param drawing
 * @param setDrawing
 * @param setControlForms
 * @param controlForms 
 * @param props
 * @param coberLst 
 * @param proyLst
 * @param setProyLst
 * @param campaLst
 * @param setCampaLst
 * @param sketchWeb
 * @param txtValorLatSuIz 
 * @param lonPto
 * @param setLonPtoState
 * @param latPto
 * @param setLatRectState
 * @param lonSuIz
 * @param setLonSuIzState
 * @param latSuIz
 * @param setLatSuIzState
 * @param lonInDe
 * @param setLonInDeState
 * @param latInDe
 * @param setLatInDeState
 * @param initialExtent
 * @param jsonDpto
 * @param setJsonDptoState
 * @param jsonMpio
 * @param setJsonMpioState
 * @param dptoSel
 * @param setDptoSelState
 * @param mpioLst
 * @param setMpioLstState
 * @param isLoad
 * @param setIsLoadState
 * @param setWidgetModules
 * @param mpioSel
 * @param setMpioSelState
 * @param municDisab
 * @param setMunicDisabState
 * @param catalBtnDis
 * @dateUpdated 2025-04-03
 * @changes Adicionar las opciones excluyentes "Seleccionar Area" y "Navegar" como radio buttons
 * @dateUpdated 2025-04-07
 * @changes Adicionar atributos selectedLayerId, drawing, setDrawing que controlan el dibujo del rectángulo sobre el mapa
 * @dateUpdated 2025-04-08
 * @changes Adicionar atributos selCoberVal, setCober, selProyVal, setProyState, selCampaVal, setCampaState
 * @dateUpdated 2025-04-09
 * @changes Adicionar atributos setControlForms, para el metodo consultaCatal
 * @dateUpdated 2025-04-14
 * @changes Incluir opción Cerrar Widget. 
 * @changes Cargue parámetro props.
 * @dateUpdated 2025-04-22
 * @changes Cargue parámetro coberLst
 * @changes Cargue parámetro setCoberLst
 * @changes Cargue parámetro proyLst
 * @changes Cargue parámetro setProyLst
 * @changes Cargue parámetro campaLst
 * @changes Cargue parámetro setCampaLst
 * @dateUpdated 2025-05-02
 * @changes Cargue parámetro sketchWeb
 * @changes Cargue parámetro txtValorLatSuIz
 * @changes Cargue parámetro setValorLatSuIzState
 * @changes Cargue parámetro txtValorLatInDe
 * @changes Cargue parámetro setValorLatInDeState
 * @changes Cargue parámetro txtValorLonSuIz
 * @changes Cargue parámetro setValorLonSuIzState
 * @changes Cargue parámetro txtValorLonInDe
 * @changes Cargue parámetro setValorLonInDeState
 * @dateUpdated 2025-05-05
 * @changes Supresión parámetro drawing
 * @changes Supresión parámetro setDrawing
 * @dateUpdated 2025-05-07
 * @changes Mapeo control proyecto donde opción corresponde al proyecto que se visualiza
 * @dateUpdated 2025-05-08
 * @changes Especificación coordenadas geográficas basado en un punto sobre el mapa, bajo opción Navegar
 * @changes Cargue parámetro rows, asociado al data Grid
 * @changes Cargue parámetro setRows, asociado al state parámetro rows (setter)
 * @dateUpdated 2025-05-09
 * @changes Cargue parámetro lonRect
 * @changes Cargue parámetro setLonRectState
 * @changes Cargue parámetro latRect
 * @changes Cargue parámetro setLatRectState
 * @changes Cargue parámetro lonRectSuIz
 * @changes Cargue parámetro setLonRectSuIzState
 * @changes Cargue parámetro latRectSuIz
 * @changes Cargue parámetro setLatRectSuIzState
 * @changes Cargue parámetro lonRectInDe
 * @changes Cargue parámetro setLonRectInDeState
 * @changes Cargue parámetro latRectInDe
 * @changes Cargue parámetro setLatRectInDeState
 * @dateUpdated 2025-05-12
 * @changes Fix validación coordenadas en modo Seleccionar Area o Navegar
 * @dateUpdated 2025-05-13
 * @changes Actualización atributo width en controles latitud, longitud a 7 posiciones
 * @dateUpdated 2025-05-14
 * @changes Cargue parámetro initialExtent
 * @changes Actualización parámetro lonRect => lonPto
 * @changes Actualización parámetro setLonRectState => setLonPtoState
 * @changes Actualización parámetro latRect => latPto
 * @changes Actualización parámetro setLatRectState => setLatPtoState
 * @changes Actualización parámetro lonRectSuIz => lonSuIz
 * @changes Actualización parámetro setLonRectSuIzState => setLonSuIzState
 * @changes Actualización parámetro latRectSuIz => latSuIz
 * @changes Actualización parámetro setLatRectSuIzState => setLatSuIzState
 * @changes Actualización parámetro lonRectInDe => lonInDe
 * @changes Actualización parámetro setLonRectInDeState => setLonInDeState
 * @changes Actualización parámetro latRectInDe => latInDe
 * @changes Actualización parámetro setLatRectInDeState => setLatInDeState
 * @changes Incluir opción "Limpiar filtro / mapa", basado en requerimiento del 2025-04-14
 * @dateUpdated 2025-05-19
 * @changes Cambio término opción Limpiar filtro / mapa => Limpiar
 * @dateUpdated 2025-05-22 
 * @changes Cargue parámetro jsonDpto
 * @changes Cargue parámetro setJsonDptoState
 * @changes Cargue parámetro jsonMpio
 * @changes Cargue parámetro setJsonMpioState
 * @dateUpdated 2025-05-29
 * @changes Cargue parámetro isLoad
 * @changes Cargue parámetro setIsLoadState
 * @changes Cargue parámetro setWidgetModules
 * @dateUpdated 2025-06-16
 * @changes Cargue parámetro chkValueHelp
 * @changes Cargue parámetro setChkValueHelpState
 * @dateUpdated 2025-07-17
 * @changes Desactivación campo Cobertura
 * @changes Ubicación campos Proyecto y Campaña antes de Seleccionar Area
 * @dateUpdated 2025-08-01
 * @changes Deshacer requerimiento 2025-07-17 => Desactivación campo Cobertura
 * @dateUpdated 2025-08-04
 * @changes Incluir campo Departamento
 * @changes Uso parámetro jsonDpto
 * @changes Uso parámetro setJsonDptoState
 * @changes Cargue parámetro dptoSel
 * @changes Cargue parámetro setDptoSelState
 * @changes Incluir campo Municipio
 * @changes Cargue parámetro mpioSel
 * @changes Cargue parámetro setMpioSelState
 * @changes Cargue parámetro municDisab
 * @changes Cargue parámetro setMunicDisabState
 * @dateUpdated 2025-08-12
 * @changes Cargue parámetro catalBtnDis
 * @changes Cargue parámetro setCatalBtnState
 * @dateUpdated 2025-08-13
 * @changes Cambios solicitados por cliente: Ocultamiento sección coordenadas geográficas
 * @changes Cambios solicitados por cliente: Incluir en todos los filtros tengan la opción de TODOS ([Todos])
 * @changes Cambios solicitados por cliente: Incluir dos filtros asociados al campo Cobertura
 * @changes Cargue parámetro showCoberFilt1
 * @changes Cargue parámetro setShowCoberFilt1State
 * @changes Cargue parámetro showCoberFilt2
 * @changes Cargue parámetro setShowCoberFilt2State
 * @changes Cargue parámetro selCoberFilt1Val
 * @changes Cargue parámetro setSelCoberFilt1ValState
 * @changes Cargue parámetro selCoberFilt2Val
 * @changes Cargue parámetro setSelCoberFilt2ValState
 * @changes Cargue parámetro coberFilt1Lst
 * @changes Cargue parámetro setCoberFilt1LstState
 * @changes Cargue parámetro coberFilt2Lst
 * @changes Cargue parámetro setCoberFilt2LstState
 * @changes Reimplementación valores campo Coberura, consumidos a través del API objeto api_getCoberPrim 
 * @changes Mapeo valores campo cobertura {value => option.covertype, text => option.covertype} => {value =>option.objectid , text => option.covertype}
 * @dateUpdated 2025-08-20
 * @changes Cargue parámetro disCoberFilt1
 * @changes Cargue parámetro setDisCoberFilt1State
 * @changes Cargue parámetro showCoberFilt2
 * @changes Cargue parámetro setShowCoberFilt2State
 * @dateUpdated 2025-08-21
 * @changes Actualización término Seleccionar Area => Seleccionar Área 
 * @dateUpdated 2025-08-22
 * @changes Aplicación condicionada de estilos, según objeto entorno => Todos los títulos del filtrl {Cobertura, Coberturas 1, Coberturas 2, Departamento, Municipio, Proyecto, Campaña}
 * @changes Actualización términos asociados al campo Cobertura. 
 * @changes Término Coberturas 1 => Nivel 1
 * @changes Término Coberturas 2 => Nivel 2 
 * @dateUpdated 2025-08-25
 * @changes Actualización términos asociados al campo Cobertura. 
 * @changes Término Nivel 1 => Nivel 2
 * @changes Término Nivel 2 => Nivel 3
 * @dateUpdated 2025-08-27
 * @changes Actualización términos asociados al campo Cobertura. 
 * @changes Término Cobertura => Nivel 1
 * @dateUpdated 2025-10-28
 * @changes Adicionar acceso directo como icono, al proyecto Banco Nal Etiquetas (BNE)
 * @remarks Fuente consulta https://mui.com/material-ui/react-radio-button
 * @returns (HTML)
 */
const FiltersSrcSIEC = function({jsonSERV, setJsonSERV, selCoberVal, setCoberState, coberLst, setCoberLst, showCoberFilt1, setShowCoberFilt1State, disCoberFilt1, setDisCoberFilt1State, showCoberFilt2, setShowCoberFilt2State, disCoberFilt2, setDisCoberFilt2State, selCoberFilt1Val, setSelCoberFilt1ValState, selCoberFilt2Val, setSelCoberFilt2ValState, coberFilt1Lst, setCoberFilt1LstState, coberFilt2Lst, setCoberFilt2LstState, radValueNav, setValueNav, txtValorLat, setValorLatState, txtValorLatSuIz, setValorLatSuIzState, txtValorLatInDe, setValorLatInDeState, txtValorLon, setValorLonState, txtValorLonSuIz, setValorLonSuIzState, txtValorLonInDe, setValorLonInDeState, lonPto, setLonPtoState, latPto, setLatPtoState, lonSuIz, setLonSuIzState, latSuIz, setLatSuIzState, lonInDe, setLonInDeState, latInDe, setLatInDeState,selProyVal, setProyState, proyLst, setProyLst, selCampaVal, setCampaState, campaLst, setCampaLst, ResponseBusquedaFirma, setResponseBusquedaFirma, view, setView, jimuMapView, setAlertDial, mensModal, setMensModal, setControlForms, controlForms, props, sketchWeb, setRows, initialExtent, jsonDpto, setJsonDptoState, jsonMpio, setJsonMpioState, dptoSel, setDptoSelState, mpioLst, setMpioLstState, mpioSel, setMpioSelState, municDisab, setMunicDisabState, isLoad, setIsLoadState, setWidgetModules, chkValueHelp, setChkValueHelpState, catalBtnDis, setCatalBtnState}){
  /*console.log("Verif valor state latitud =>", txtValorLat);
  console.log("Verif valor state longitud =>",txtValorLon);
  console.log("Verif Radio opc =>",radValueNav);
  if (radValueNav === 'selArea' && (txtValorLatSuIz && txtValorLonSuIz && txtValorLatInDe && txtValorLonInDe))
  {
    console.log("Verif coordenada lat Sup Izq =>", txtValorLatSuIz);

    console.log("Verif coordenada long Sup Izq =>", txtValorLonSuIz);

    console.log("Verif coordenada lat Inf Der =>", txtValorLatInDe);

    console.log("Verif coordenada long Inf Der =>", txtValorLonInDe);
  }
  if (radValueNav === 'navMap' && (txtValorLat && txtValorLon))
  {
    console.log("Verif coordenada lat pto =>", txtValorLat);
    console.log("Verif coordenada long pto =>", txtValorLon);
  }*/

  /**
   * Método ciclo vida componentDidUpdate => implementación de cierre del widget Buscar Firma, incluyendo la operación "reset" en cada uno de los controles del filtro.
   * @date 2025-04-15
   * @author IGAC - DIP
   * @dateUpdated 2025-05-02
   * @changes Invocar cierre del widget Sketch al cerrar
   * @dateUpdated 2025-05-05
   * @changes Recrear objeto asociado al widget Sketch, cuando éste no existe
   * @changes Actualizar atributo visible, asociado al objeto widget Sketch
   * @changes Borrar todos los polígonos de selección al cerrar widget
   * @dateUpdated 2025-05-06
   * @changes Implementar opciones radio "Navegar" o "Seleccionar Area"
   * @dateUpdated 2025-05-13
   * @changes Implementar borrado de markers en mapa, al cerrar widget
   * @dateUpdated 2025-05-14
   * @changes Uso del parámetro initialExtent, a través del método goToInitialExtent()
   * @dateUpdated 2025-05-29
   * @changes Al obtener la data del servidor de manera correcta, desactivar estado cargando
   * @dateUpdated 2025-06-13
   * @changes Personalización opciones del widget Sketch => Herramienta rectángulo y selección
   * @remarks FUENTE de consulta: https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Sketch.html   
   * @remarks FUENTE de pruebas: https://codepen.io/kaokao33/pen/rNPXVjR
   * @remarks Método ciclo de vida nativo React
   */
  
  function componentDidUpdate ()
  {
      if (props.state === 'CLOSED'){
        console.log("Cerrado...");
        props.dispatch(appActions.closeWidget(props.widgetId));
        
        //Limpieza controles
        LimpiarControles();
        
        //Cierre widget Sketch
        if (typeof sketchWeb !== "undefined")
        {
          sketchWeb.visible = false;        
        }
        if (jimuMapView){
          jimuMapView.view.ui.remove(sketchWeb);
          jimuMapView.view.map.removeAll();
        }

        //Borrar todos los polígonos de selección
        if (typeof sketchWeb !== "undefined")
        {
          console.log("Sketch Web =>",sketchWeb);
          sketchWeb.layer.removeAll();
        }        

        //Fijar extent original
        goToInitialExtent(jimuMapView, initialExtent);
      }
      else
      {
        console.log("En pruebas widget abierto...");
        /* console.log("Estado del sketch =>",sketchWeb);
        console.log("Estado opción Buscar en catálogo =>", catalBtnDis);
        if (typeof radValueNav !== 'undefined'){
          console.log("Valor radio =>",radValueNav);  
        }
        if (typeof chkValueHelp !== 'undefined'){
          console.log("Valor Ayuda =>",chkValueHelp);
        } */
        //Establecer atributo cargando en falso
        setIsLoadState(false);

        //Validación para recrear objeto asociado al widget Sketch, cuando se selecciona opción "Seleccionar Area"
        if (radValueNav === 'selArea')
        {
          if (typeof sketchWeb === 'undefined')
          {
            //Creación capa gráficos
            const layerWeb = new GraphicsLayer();
            
            //Atributos del widget Sketch configurados con el objeto definido - 2025-06-13
            const objJSON = {
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

            //Instanciación objeto sketch
            const sketchWeb = new Sketch({
              layer: layerWeb,                    
              creationMode: "single",
              availableCreateTools: ["rectangle"],              
              visibleElements: objJSON
            });
            //console.log("Verificación objeto sketchWeb =>",sketchWeb);
            //console.log("Layer Web Graphics length =>",layerWeb.graphics.length);
          }
          //Validación widget Sketch existente y en memoria
          else
          {
            console.log("Visibilidad widget =>",sketchWeb.visible);
            if (!sketchWeb.visible){
              //Widget Sketch al mapa estando oculto el mismo
              jimuMapView.view.ui.add(sketchWeb, "bottom-left");
              //Actualización estado objeto sketch
              sketchWeb.visible = true;
              console.log("Componente sketch adicionado! =>",sketchWeb.visible);
            }
            
          }
          console.log("Verificación objeto sketchWeb =>",sketchWeb.activeTool);
        }
        else if (radValueNav === 'navMap')
        {
            console.log("Especificar punto del mapa!");
            if (jimuMapView) {
              jimuMapView.view.on('click', (evt) => {
                const pointMap: Point = jimuMapView.view.toMap({
                  x: evt.x,
                  y: evt.y
                })
                //Coordenadas decimales
                console.log("Verif coordenada lat =>",pointMap.latitude);
                console.log("Verif coordenada lon =>",pointMap.longitude);
                console.log("Verif coordenada lat filtro =>",pointMap.latitude.toFixed(3));
                console.log("Verif coordenada lon filtro =>",pointMap.longitude.toFixed(3));
                //Seteo en las variables de estado setValorLat y setValorLon las coordenadas latitud, longitud
                //setValorLatState(pointMap.latitude.toFixed(3)); 
                setValorLatState(pointMap.latitude.toString());
                setLatPtoState(pointMap.latitude.toFixed(3));
                //setValorLonState(pointMap.longitude.toFixed(3));
                setValorLonState(pointMap.longitude.toString());
                setLonPtoState(pointMap.longitude.toFixed(3));

                //Coordenadas rectangulares
                console.log("Verif coordenada lon (X) =>",pointMap.x);
                console.log("Verif coordenada lat (Y) =>",pointMap.y);
                
              });
            }
            
            //Actualización estado objeto sketch
            if (typeof sketchWeb !== 'undefined')
            {
              sketchWeb.visible = false;
              console.log("Componente sketch oculto! =>",sketchWeb.visible);
            }
        }
      }
    }
  
  /**
   * sketchHelp => Método para visualizar el uso del widget Sketch, el cual se activa bajo opción Seleccionar Area.
   * Éste resumen básico, se activa bajo opción Ayuda
   * @date 2025-06-17
   * @author IAGC - DIP
   * @dateUpdated 2025-06-19
   * @changes Actualización validación para apertura componente popup
   * @dateUpdated 2025-06-20
   * @changes Adición imágen al popUp (en pruebas)
   * @remarks Verificar y desplegar componente PopUp, para opción Ayuda
   * @dateUpdated 2025-06-25
   * @changes Cargue contenido del popUp, a través del parámetro content, obtenido desde el objeto sketchHelpParams.
   * @remarks Cargue de contenidos, a través del parámetro sketchHelpParams.contenidoFunc desde dataDG
   * @remarks FUENTE de consulta: https://www.alt-codes.net/rectangle-symbols
   * @remarks FUENTE de consulta: https://www.alt-codes.net/latin-cross.php     
   * @remarks Objeto contentHelpObj se importa desde la definición según dataDG (./types)
   */
    const sketchHelp = function(){
      //Sección ayuda
      //Definición PopUpTemplate según opción Ayuda - 2025-06-17
      console.log("Ayuda activada =>",chkValueHelp);
      //console.log("Objeto jimuMapView para ayuda =>",jimuMapView);
      if (jimuMapView && chkValueHelp)
      {
        //Adición del popUp al objeto Graphic
        const graphic = new Graphic({
          popupTemplate: {
            title: sketchHelpParams.titulo,
            content: sketchHelpParams.contenidoFunc
          }
        });
        //console.log("Revisión de items en objeto JimuMapView en ayuda =>",jimuMapView.view.map.layers.items.length);
      
        if (jimuMapView.view.map.layers.items.length >= 0){ 
          jimuMapView.view.openPopup({
            features: [graphic]
          });
        }
        else{
          //view.popup.close(); //Depreciado
          jimuMapView.view.closePopup();
        }
      }
      else if (jimuMapView)
      {
        jimuMapView.view.closePopup();
      }
    }
    /**
      getJSONData => método para cargue inicial del contenido en  servidor remoto
      @date 2025-04-08
      @author IGAC - DIP
      @param (String) jsonSERV => Variable que guarda la data traida del servidor
      @dateUpdated 2025-04-23
      @changes Implementar control de errores en la lógica de solicitud petición al servidor remoto.
      @dateUpdated 2025-04-29
      @changes Actualizar función en modo asincrónico en la operación fetch
      @dateUpdated 2025-05-29
      @changes Al obtener la data del servidor de manera correcta, desactivar estado cargando
      @dateUpdated 2025-06-25
      @changes Actualizar URL entorno pruebas objeto firmasEsp a URL entorno real objeto firmasEspReal
      @dateUpdated 2025-07-17
      @changes Actualizar URL al API según Endpoint ProyectosFieldsEspecificos
      @dateUpdated 2025-08-25
      @changes Actualizar control errores, en el consumo API cuando se tengan problemas en el servidor remoto.
      @dateUpdated 2025-08-26
      @changes Ordenamiento alfabetico listado Proyectos en campo Proyecto
      @dateUpdated 2025-08-28
      @changes Actualizar control de errores, al realizar petición al API, analizando los códigos http de respuesta (si = 200, petición correcta, de lo contrario, es petición errónea)
      @dateUpdated 2025-09-03
      @changes Actualizar control de errores Parte 2, asociado al retorno de la petición desde el servidor
      @return (Object)
      @remarks FUENTE: https://www.freecodecamp.org/news/how-to-fetch-api-data-in-react/
      @remarks URL principal entorno pruebas https://pruebassig.igac.gov.co/server/rest/services/FE_Edicion/MapServer/0/query?where=divipoladepto%3D%2717%27&text=&objectIds=&time=&timeRelation=esriTimeRelationOverlaps&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Kilometer&relationParam=&outFields=*&returnGeometry=false&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&returnExtentOnly=false&sqlFormat=none&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=pjson
      @remarks URL principal datos reales https://pruebassig.igac.gov.co/server/rest/services/FE_Puntos_Muestreo/MapServer/0/query?where=objectid%3D22&text=&objectIds=&time=&timeRelation=esriTimeRelationOverlaps&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=objectid%2Cprojectnam%2Ccampananam%2Ccod_depto%2Ccod_mpio%2Cfileidenti&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&returnExtentOnly=false&sqlFormat=none&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=pjson
      @remarks Obtener respuesta desde una solicitud tipo Promise en: https://stackoverflow.com/questions/47604040/how-to-get-data-returned-from-fetch-promise 
  */
    const getJSONData = async function ()
    {       
      //Objetos locales
      var tokenSeg: string = ""; 
      //Obtener token seguridad
      getToken (urls.api_host + urls.api_getToken).then((datToken) => {
        tokenSeg  = datToken.data.access_token;
        //console.log("Token seg =>",tokenSeg);
        const urlServicioSIEC = urls.api_host + urls.api_getProybyFields;
          //Petición para consumo objeto api_getProybyFields => Listado de proyectos ordenados alfabeticamente en control Proyecto
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
                console.error("Error obteniendo data del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
              }
              return rows.json();
            })
            .then((data) => {
              var jsonErr:any = {};
              //Validador consumo por error del server (cód http <> 200 )
              if (typeof (data["error"]) !== 'undefined'){
                jsonErr = {
                  "errorCode": data["error"].code,
                  "errorMsg": data["error"].message,
                  "errorMsgDet": data["error"].details[0]
                }
                console.error("Error obteniendo data del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
              }
              //Desactivar estado cargando
              setIsLoadState(false);
    
              console.log("Contenido json desde petición =>", sortProyectos (data.data));
              console.log("Contenido longitud =>",data.length);
              //Seteo de los datos asociados desde el consumo del Web service
              setJsonSERV(sortProyectos (data.data));
            })
          }
          catch (error)
          {
            console.error("Error obteniendo data del server =>", error);
            throw error;
          }
        });
        
      
    }

    /**
     * getJSONProyectos => método para cargue del contenido alusivo al listado de proyectos desde el servidor de contenidos
      @date 2025-04-08
      @author IGAC - DIP
      @param (String) jsonSERV => Data traida desde el consumo del servicio
      @dateUpdated 2025-04-22
      @changes Asignación listado de proyectos al state lista proyectos      
      @dateUpdated 2025-04-29
      @changes Adición opción [Todos] a la lista de proyectos
      @dateUpdated 2025-05-30
      @changes Fix bug cargue widget dado por requerimiento 2025-04-29
      @changes Fix bug cargue widget pasando modo async => sync
      @dateUpdated 2025-06-25
      @changes Supresión atributos codigofirma
      @changes Actualización atributos projectname => projectnam
      @dateUpdated 2025-07-17
      @changes Actualización atributos a partir de información desde API con el WS Proyectos FieldsEspecificos
      @return (String)
      @remarks Adición de elementos a un array JSON en https://medium.com/@navneetskahlon/manipulating-immutable-json-arrays-in-javascript-insertion-update-and-deletion-728740af1693
     */

      const getJSONProyectos = function ()
      {
        var jsonSIEC: any           = "";
        var proyectos: Array<string>= [];          
        console.log("Ingresando a proyectos data...=>",jsonSERV);
        
        //Obtener listado de proyectos
        for (var cont = 0; cont < jsonSERV.length; cont++)
        {
          //console.log("Contenido data.features"+" "+cont+" ",jsonSERV[cont].attributes);
            /*proyectos = data.features[cont].projectname;
            console.log("Proyecto "+cont+" =>",proyectos);*/
            //Adicionar item [Todos]
            if (cont === 0)
            {
              jsonSIEC = {
                "objectid": "*",                
                "projectname": "[Todos]"
              };
              proyectos.push(jsonSIEC);
            }

            if (jsonSERV[cont].ProjectName != null)
            {
              jsonSIEC = {
                "objectid": jsonSERV[cont].Id_Proyecto,
                "projectname": jsonSERV[cont].ProjectName
              }
              proyectos.push(jsonSIEC);
              
            }
        }
        proyectos = procesaDuplic (proyectos, 'prj');

        //console.log("Lista proyectos incluyendo todos =>",proyArr);

        //Adicionar item         
        console.log("Lista proyectos FINAL=>",proyectos);
        
        //Seteo sobre el state asociado al listado de proyectos
        setProyLst(proyectos);
        
      }

    /**
     * Método getJSONCober => Obtener listado de coberturas
     * @date 2025-04-22
     * @author IGAC- DIP
     * @dateUpdated 2025-06-25
     * @changes Supresión atributo codigofirma
     * @changes Actualización atributo projectname => projectnam
     * @dateUpdated 2025-08-06
     * @changes Implementación de lista de coberturas, a partir del MapServer dado en objeto firmasEspTCober
     * @dateUpdated 2025-08-12
     * @changes Adición validación cargue información inicial en objeto jsonSERV
     * @dateUpdated 2025-08-14
     * @changes Incluir valor [Todas] en la lista de coberturas.
     * @changes Reingeniería cargue cobertura nivel Abuelo, asociado al API
     * @dateUpdated 2025-08-25
     * @changes Reversar requerimiento 2025-08-14 => Suprimir valor [Todas]
     * @dateUpdated 2025-08-28
     * @changes Actualizar control de errores, al realizar petición al servidor remoto Mapserver, analizando los códigos http de respuesta (si = 200, petición correcta, de lo contrario, es petición errónea)
     * @dateUpdated 2025-09-03
     * @changes Actualizar control de errores Parte 2, asociado al retorno de la petición desde el servidor
     * @returns (String) Listado de cobertura en formato JSON
     * @remarks asociado al método getJSONProyectos
     * @remarks Campo coberType no existe en servicio bajo objeto firmasEspReal (2025-06-25, 15:40)
     */
    const getJSONCober = async function ()
    {
      //Objetos locales
        var coberturaArr = [];
        var urlServicioSIEC, tokenSeg: string = "";        
        //Obtener el token de seguridad
        urlServicioSIEC = urls.api_host + urls.api_getToken;
        getToken (urlServicioSIEC).then ((tokenObj) => {
          //console.log("Token Seg para cobertura =>",tokenObj["data"].access_token);
          tokenSeg  =  tokenObj["data"].access_token;
          //consumo API para obtener lista de coberturas
          urlServicioSIEC = urls.api_host + urls.api_getCoberPrim;
          try{
            fetch (urlServicioSIEC, {
              method : "GET",
              headers: {
                'Accept': 'application/json',
				        'Content-Type': 'application/json',
                'Authorization': 'Bearer'+' '+tokenSeg
              }
            })
            .then((dataRowsCober) => {
              var jsonErr: any = {};
              if (!dataRowsCober.ok){
                jsonErr = {
                  "error": dataRowsCober.status,
                  "errorMsg": dataRowsCober.statusText
                }
                return jsonErr
              }
              //Validador consumo por error del server (cód http <> 200 )
              else if (typeof (dataRowsCober["error"]) !== 'undefined'){
                jsonErr = {
                  "errorCode": dataRowsCober["error"].code,
                  "errorMsg": dataRowsCober["error"].message
                }
                console.error("Error Obteniendo lista departamentos del server =>" ,dataRowsCober["errorMsg"])+" "+"("+"código http =>"+dataRowsCober["errorCode"]+")";
                throw dataRowsCober["errorMsg"]+" "+"("+"código http =>"+" "+dataRowsCober["errorCode"]+")";
              }
              return dataRowsCober.json()
            })
            .then((coberDataPrim) => {
              var jsonSIEC, jsonErr: any = {};
              
              //Validador consumo por error del server (cód http <> 200 )
              if (typeof (coberDataPrim["error"]) !== 'undefined'){
                jsonErr = {
                  "errorCode": coberDataPrim["error"].code,
                  "errorMsg": coberDataPrim["error"].message,
                  "errorMsgDet": coberDataPrim["error"].details[0]
                }
                console.error("Error obteniendo data del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
                throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
              }
              console.log ("Coberturas primarias =>",coberDataPrim.data);

              //Obtener listado de coberturas desde el servidor
              for (var cont = 0; cont < coberDataPrim.data.length; cont++)
              {
                jsonSIEC = {
                  "objectid": coberDataPrim["data"][cont].Id_Valor_Dominio.toString(),
                  "covertype":coberDataPrim["data"][cont].Descripcion_Valor
                };
                coberturaArr.push(jsonSIEC);
              }
              coberturaArr = procesaDuplic (coberturaArr, 'cov');
              //ordenamiento array
              console.log("Lista coberturas =>",sortCober (coberturaArr));
              //Actualización sobre el objeto coberLst
              setCoberLst(sortCober (coberturaArr));
            })
          }
          catch (error){
            console.log ("Error obteniendo coberturas del servidor! =>",error);
          }
        })
    }

    /**
     * getJSONCober1 => Método para obtener los valores del campo Coberturas 1 (Nivel 2) (hijo del campo Cobertura <=> Padre)
     * @date 2025-08-14
     * @author IGAC - DIP
     * @param {string} selCoberVal
     * @param {string} idControl
     * @dateUpdated 2025-08-15
     * @changes Inclusión @param idControl => identificador del control de destino.
     * @changes Adición validación, de acuerdo al parámetro idControl, que indica el control destino para asignar la información obtenida del servidor
     * @changes contenido @param selCoberVal forma la compuesta <id> + ";" + <txt>
     * @dateUpdated 2025-08-20
     * @changes Habilitar / Deshabilitar controles Coberturas 1, cuando se cargan los parámetros del API / cuando no existen valores desde el API
     * @changes Habilitar / Deshabilitar controles Coberturas 2, cuando se cargan los parámetros del API / cuando no existen valores desde el API
     * @dateUpdated 2025-08-22
     * @changes Suprimir opción [Todas] en control Coberturas 1, de acuerdo a reunión seguimiento 2025-08-22 09:00 => 09:30
     * @changes Suprimir opción [Todas] en control Coberturas 2, de acuerdo a Líder Dev 2025-08-22, 12:41 p
     * @dateUpdated 2025-08-27
     * @changes Deshabilitar control Nivel 3 al inicio
     * @dateUpdated 2025-10-28
     * @changes Consulta de registros sobre campo Nivel 2, para los niveles donde presentan subniveles, asociados al campo Nivel 3.
     * @dateUpdated 2025-10-29
     * @changes Inclusión estado cargando, al momento de procesar las coberturas. En el instante que se obtienen en el control, desactivar el estado.
     * @changes Optimización fuente, definiendo atributo addNivel.
     * @changes Optimización fuente, definiendo tipos datos sección Objetos locales
     * @dateUpdated 2025-11-06
     * @changes Consulta de registros sobre campo Nivel 3, para los niveles donde presentan subniveles. 
     */
    const getJSONCober1 = async function (selCoberVal: string, idControl: string = ''){
      //Objetos locales
      var urlServicioSIEC, tokenSeg: string       = "";
      var coberSecData, jsonData: object          = {};
      var coberSec2Arr, selCoberArr: Array<string>= [];
      var coberId: number                         = -1;
      
      switch (idControl){
        //Deshabilitar control Nivel 2
        case "Coberturas1":{
          setDisCoberFilt1State (true);
          break;
        }
        case "Coberturas2":{
          setDisCoberFilt2State (true);
          break;
        }
      }
    
      //Procesamiento del parámetro selCoberVal para realizar consumo del servicio, donde está formado por compuesta <id> + ";" + <txt>, en el cual se transforma a un Array donde la posición 0 => id; en la 1 => text del control.
      selCoberArr = selCoberVal.split (';');
      if (selCoberArr.length > 0 && selCoberArr[1] !== '*'){
        coberSec2Arr  = [];
        coberId       = parseInt (selCoberArr[0]);
      }
      //Consumo para obtener token de seguridad
      try{
        //Definición estado cargando - 2025-10-29
        setIsLoadState (true);
        //Construcción URL token de seguridad
        urlServicioSIEC = urls.api_host + urls.api_getToken;      
        tokenSeg        = await getTokenAlt (urlServicioSIEC);
        //Validación cuando el campo Coberturas 1 / Coberturas 2 sea distinto a [Todas]
        if (selCoberArr[0].toString() !== '*')
        {
          //Consumo API para obtener Coberturas secundarias / terciarias
          urlServicioSIEC = urls.api_host + urls.api_getCoberSecTer + coberId;
          console.log("Petición para control"+" "+idControl+" "+"=>",urlServicioSIEC);
          coberSecData    = await getDominioValor (tokenSeg["data"].access_token, urlServicioSIEC);
        
          //Validación para data existente sean Coberturas 1 / Coberturas 2
          if (coberSecData["data"].length > 0)
          {
            //console.log ("Test Identificador control asociado =>",idControl);
            //Recorrido del arreglo para asignación de valores
            for (var conCoberSec = 0; conCoberSec < coberSecData["data"].length; conCoberSec++){
                //Procesamiento coberturas 1 => Nivel 2  - texto del control - 2025-10-28
                if (idControl === 'Coberturas1'){
                  //Obtener conteo de valor dominio, desde atributo Id_Valor_Dominio, mapeado al campo Id_Valor_Dom_Padre
                  console.log ("Test Num regs asociados al dominio " + coberSecData["data"][conCoberSec].Id_Valor_Dominio + " "+"=>",await getNumRegsCober1 (coberSecData["data"][conCoberSec].Id_Valor_Dominio));
                  //Obtener número registros asociados al campo Nivel 3
                  const numRegs  = await getNumRegsCober1 (coberSecData["data"][conCoberSec].Id_Valor_Dominio);
                  if (numRegs["data"].length > 0){
                    //Armado de la estructura JSON correspondiente 
                    jsonData = {
                      "objectid": coberSecData["data"][conCoberSec].Id_Valor_Dominio.toString(),
                      "covertype":coberSecData["data"][conCoberSec].Descripcion_Valor  
                    }
                    coberSec2Arr.push(jsonData);
                  }
                }
                //Control Nivel 3 (Coberturas 2)
                if (idControl === "Coberturas2"){
                  //Obtener número registros asociados al campo Nivel 3 - 2025-11-06
                  const numRegs = await getNumRegsCoberN3 (coberSecData["data"][conCoberSec].Descripcion_Valor);
                  console.log ("Test Num regs Nivel 3 =>",numRegs);
                  if (parseInt (numRegs) > 0){
                    //Armado de la estructura JSON correspondiente 
                    jsonData = {
                      "objectid": coberSecData["data"][conCoberSec].Id_Valor_Dominio.toString(),
                      "covertype":coberSecData["data"][conCoberSec].Descripcion_Valor  
                    }
                    coberSec2Arr.push(jsonData);
                  }
                }
            } //Fin ciclo for
            
            //Actualizar al state el objeto ordenado - 2025-08-15
            //Control destino => Nivel 2 (Coberturas 1)
            if (idControl === '' || idControl === 'Coberturas1'){
              //Validar duplicados
              coberSec2Arr  = procesaDuplic (coberSec2Arr, 'cov');
              //Ordenamiento array
              console.log ("Coberturas secundarias =>",sortCober (coberSec2Arr));
              //Actualizar al state el objeto ordenado - 2025-08-15
              setCoberFilt1LstState (sortCober (coberSec2Arr));
              //Habilitar control Coberturas 1 - 2025-08-20
              setDisCoberFilt1State (false);
              //Parámetro txt control Coberturas 1 - 2025-08-19
              //En hook useEffect()
            }
            //Control destino => Nivel 3 (Coberturas 2)
            if (idControl === "Coberturas2"){
              //Validador para construcción valores control Nivel 3
              if (coberSec2Arr.length > 0){
                //Validar duplicados
                coberSec2Arr  = procesaDuplic (coberSec2Arr, 'cov');
                //ordenamiento array
                console.log ("Coberturas terciarias =>",sortCober (coberSec2Arr));
                
                //Actualizar al state el objeto ordenado 
                setCoberFilt2LstState (sortCober (coberSec2Arr)); 
                //Habilitar control Coberturas 2 - 2025-08-20
                setDisCoberFilt2State (false);
                //Desactivación estado cargando - 2025-10-29
                setIsLoadState (false);
                //Parámetro txt control Coberturas 2 - 2025-08-19
                //En hook useEffect()
              }
              //En caso de no existir valores, se oculta el control
              else{
                //console.log ("Test Ocultar Nivel 3");
                setShowCoberFilt2State (false);
              }
            }
          }
          //Validación cuando el control Coberturas1 se encuentra vacío (solo con la opción [Todas])
          else if (idControl === "Coberturas1"){
           //Asignación al estado del control Cobertura
           //Evt OnChange control Cobertura  => handleSelCoberChange()
           setCoberState (selCoberVal);
           //Actualizar state asociado al control Coberturas 1 con valor undefined
           setSelCoberFilt1ValState (undefined);
           //Deshabilitar control Coberturas 1
           setDisCoberFilt1State (true);
          }
          //Validación cuando el control Coberturas2 se encuentra vacío (solo con la opción [Todas])
          else if (idControl === "Coberturas2"){
            //Actualizar state asociado al control Coberturas 2 con valor undefined
            setSelCoberFilt2ValState (undefined);
            //Asignación al estado del control Coberturas 1
            //Evt OnChange control Coberturas 1 => handleSelCober1Change()
            setSelCoberFilt1ValState (selCoberVal);
          }
          //Desactivación estado cargando - 2025-10-29
          setIsLoadState (false);
        }
      }
      catch (error) {
        console.log("Error obteniendo coberturas secundarias del server =>", error);
        throw error;    
      }
     
    }

    /**
     * getNumRegsCober1 => Obtener número de registros asociados al campo Nivel 3, tal que, los que presentan registros seleccionan los niveles para campo Nivel 2
     * @date 2025-10-28
     * @param {string} selCoberVal 
     * @returns {number} getNumRegsCober1 
     * @remarks Número registros según atributo selCoberVal
     */
    const getNumRegsCober1 = async function (selCoberVal: string) {
      //Objetos locales
      var urlServicioSIEC: string = "";
      //Obtener token seguridad
      var urlApiServicioSIEC= urls.api_host + urls.api_getToken;
      const tokSegObj       = await getTokenAlt (urlApiServicioSIEC);
      const tokenSeg        = tokSegObj["data"].access_token;
      urlServicioSIEC       = urls.api_host + urls.api_getCoberSecTer + parseInt (selCoberVal);
      return await getDominioValor (tokenSeg, urlServicioSIEC);
    }

    /**
     * getNumRegsCoberN3 => Método para obtener consulta de registro sobre MapServer a través del atributo tipo_cobertura, asociado a los candidatos sobre control Nivel 3
     * @date 2025-11-06
     * @author IGAC - DIP
     * @param {string} selCoberTxt 
     * @returns {number}
     * @remarks Consulta al servicio sobre Mapserver en URL https://pruebassig.igac.gov.co/server/rest/services/Vista_Puntos_Cobertura/MapServer/1/
     */
    const getNumRegsCoberN3 = async function (selCoberTxt:string = ''){
      //Objetos locales
      var where, urlServicioSIEC: string  = "";
      
      //Acceso al MapServer
      console.log ("Test Cobertura Niv 3 =>",selCoberTxt);

      //Se usa la petición para paso de parámetros
      //Definición de criterio al mapserver según parámetro
      if (typeof selCoberTxt !== 'undefined' || selCoberTxt !== ''){
        where           = "tipo_cobertura='"+selCoberTxt+"'";
        urlServicioSIEC = await getWhere(outFieldsService.fieldsOut, urls.firmasEspTCober, true, where, '', '', '', '', '4326', 'esriSpatialRelIntersects', '3857');
        
        console.log("Test URL consumo =>", urlServicioSIEC);
        return await getSelectedDataFilter (urlServicioSIEC,'qry');
      }
      return -1;
    }
    /**
     * getJSONCober2 => Método para obtener los valores de cobertura en control Coberturas2
     * @date 2025-08-15
     * @author IGAC - DIP
     * @param {string} selCober1Val 
     * @param {string} idControl 
     * @remarks Invocación método getJSONCober1, con parámetros especificados
     */
    const getJSONCober2 = async function (selCober1Val: string, idControl: string = ''){
      getJSONCober1 (selCober1Val, idControl);
    }
    /**
     * Método para cargue de departamentos, con su código Divipola
     * @date 2025-08-04
     * @author IGAC - DIP
     * @dateUpdated 2025-08-14
     * @changes Inclusión valor [Todos] en campo Departamento
     * @dateUpdated 2025-08-25
     * @changes Actualizar control errores, en el consumo API cuando se tengan problemas en el servidor remoto.
     * @dateUpdated 2025-08-28
     * @changes Actualizar control de errores, al realizar petición al servidor remoto Mapserver, analizando los códigos http de respuesta (si = 200, petición correcta, de lo contrario, es petición errónea)
     * @remarks Consumo vía Mapserver mediante objeto Departamentos => https://pruebassig.igac.gov.co/server/rest/services/Indicadores_municipios/MapServer/1/query?where=decodigo%3D%2717%27&returnGeometry=false&f=pjson&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=3857&outFields=decodigo%2Cdenombre
     * @remarks Ordenamiento campos por departamento. Fuente consulta: Claude AU => https://claude.ai/chat/aa4f51f7-1b86-43ff-9524-8a646e5566bd 
     */
    const getJSONDptos = async function () {
      const critSeleccDpto: string  = "1=1";  
      const urlDivipolaDptos = await getWhere("decodigo,denombre", urls.Departamentos, false, critSeleccDpto, '', '', '', '', '', '', '');
      console.log("Petición consumo Dptos =>",urlDivipolaDptos);

      //Activar estado cargando Lista departamentos
      setIsLoadState(true);

      //Invocación al servicio MapServer en try .. catch
      try{
        await fetch (urlDivipolaDptos,{
            method:"GET"
          }
        ).then ((DptosLst) => {
          if (!DptosLst.ok){
            var jsonErr: any = {};
            jsonErr = {
              "error": DptosLst.status,
              "errorMsg": DptosLst.statusText
            }
            return jsonErr;
            //throw new Error(`HTTP error! status: ${DptosLst.status}`);
          }
          //Validador consumo por error del server (cód http <> 200 )
          else if (typeof (DptosLst["error"]) !== 'undefined'){
            jsonErr = {
              "errorCode": DptosLst["error"].code,
              "errorMsg": DptosLst["error"].message
            }
            console.error("Error Obteniendo lista departamentos del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
          }
          //console.log("data del MapServer =>", DptosLst);
          const jsonDptosData = DptosLst.json();

          return jsonDptosData;
        })
        .then ((DptosDataLst) => {
          //Objeto local 
          var jsonSIEC: any = {};
          
          //Validador consumo por error del server (cód http <> 200 )
          if (typeof (DptosDataLst["error"]) !== 'undefined'){
            jsonSIEC = {
              "errorCode": DptosDataLst["error"].code,
              "errorMsg": DptosDataLst["error"].message,
              "errorMsgDet": DptosDataLst["error"].details[0]
            }
            console.error("Error Obteniendo lista departamentos del server =>" ,jsonSIEC["errorMsg"])+" " + "(" +jsonSIEC["errorMsgDet"]+ ")" +" "+"("+"código http =>"+jsonSIEC["errorCode"]+")";
            throw jsonSIEC["errorMsg"]+" "+"("+"código http =>"+" "+jsonSIEC["errorCode"]+")";
          }
          //Desactivar modo cargando
		      setIsLoadState(false);

          //Inclusión opción Todos ([Todos])
          jsonSIEC = {
            attributes: {
              decodigo: '*',
              denombre: '[Todos]'
            } 
          };
          DptosDataLst.features.push(jsonSIEC);
          //console.log("Array Dptos =>", DptosDataLst.features);
          console.log("Array Lista Dptos sorted =>", sortDptos (DptosDataLst.features));
          //Asignación lista Dptos ordenados por nombre al State del control Departamentos
          setJsonDptoState (sortDptos (DptosDataLst.features));
        })
      }
      catch (error)
      {
        console.error("Error Obteniendo lista departamentos del server =>", error);
        throw error;
      }
    }

    /**
     * getCampaByProj => Método para obtener listado de campañas asociado a un proyecto del filtro Proyecto (parámetro proy)
     * @date 2025-04-22
     * @author IGAC - DIP
     * @param proyId
     * @param proy
     * @dateUpdated 2025-04-29
     * @changes Inclusión de la opción [Todas] al control campañas, al seleccionar un proyecto, o al seleccionar todos en control Proyectos
     * @dateUpdated 2025-04-30
     * @changes Cuando se selecciona la opción "[Todos]" en control proyectos, desplegar todas las campañas
     * @dateUpdated 2025-05-07
     * @changes Fix Lista campañas, al seleccionar del control Proyecto, la opción [Todos], se visualizan todas las campañas
     * @dateUpdated 2025-05-30
     * @changes Fix carga lista campañas por rendimiento del widget Buscar firma
     * @dateUpdated 2025-06-25
     * @changes Supresión atributo codigofirma
     * @changes Actualización atributo projectname => projectnam
     * @changes Actualización atributo campananame => campananam
     * @dateUpdated 2025-08-25
     * @changes Actualizar control errores, en el consumo API cuando se tengan problemas en el servidor remoto.
     * @dateUpdated 2025-08-26
     * @changes Ordenamiento alfabetico listado campañas por proyecto, campo Campaña
     * @dateUpdated 2025-09-03
     * @changes Actualizar control de errores asociado al retorno de la petición desde el servidor
     * @remarks asociado al método getJSONProyectos
     */
    const getCampaByProj = function  (proyId, proy)
    {
      console.log("ID proyecto asociado =>",proyId);
      console.log("Proy =>",proy);

      var jsonSIEC: any;
      var campaArr = [];
      var tokenSeg: string = "";
      var urlServicioSIEC: string; 
      
      //console.log("Ingresando a cobertura data...=>",jsonSERV);
      console.log("Longitud campaña Lst =>",campaLst.length);
      if (campaLst.length >= 0)
      {
        setCampaLst([]);  
      } 
      //Procesar el id del proyecto, cuando la opción es [Todos]
      if (proyId === '[Todos]')
      {
        proyId = proyId.replace('[Todos]','*');
      }

      //Acceder al Web Service para obtener las campañas       
      //Obtener token seguridad
      getToken(urls.api_host + urls.api_getToken).then((datToken) => {
        tokenSeg  = datToken.data.access_token;
	      //console.log("Token seg Campañas =>",tokenSeg);
        urlServicioSIEC = urls.api_host + urls.api_getCampa_as;
        //Realización petición consumo API
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
            if (!rows.ok)
            {
              var jsonErr: any = {};
              jsonErr = {
                "error": rows.status,
                "errorMsg": rows.statusText
              }
              return jsonErr;
              //throw new Error(`HTTP error! status: ${rows.status}`);
            }
            //Validador consumo por error del server (cód http <> 200 )
            else if (typeof (rows["error"]) !== 'undefined'){
              jsonErr = {
                "errorCode": rows["error"].code,
                "errorMsg": rows["error"].message
              }
              console.error("Error Obteniendo lista departamentos del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
              throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
            }            
            return rows.json();
          })
          .then((data) => {
            var jsonErr: any	=	{};
            //Validador consumo por error del server (cód http <> 200 )
            if (typeof (data["error"]) !== 'undefined'){
              jsonErr = {
                "errorCode": data["error"].code,
                "errorMsg": data["error"].message,
                "errorMsgDet": data["error"].details[0]
              }
              console.error("Error obteniendo data del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
              throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
            }
            //Desactivar estado cargando
            setIsLoadState(false);
      
            console.log("Contenido json campañas desde petición =>", data);
            console.log("Contenido longitud =>",data.length);
            //Seteo de los datos asociados desde el consumo del Web service

            //Obtener listado de campañas asociado al proyecto
            for (var cont = 0; cont < data.data.length; cont++)
            {
              //console.log("Contenido data.features"+" "+cont+" ",jsonSERV[cont].attributes);
              /*proyectos = data.features[cont].projectname;
              console.log("Proyecto "+cont+" =>",proyectos);*/
              //Incluir la opción Todas
              //{"objectid": "*","codigofirma": null, "projectname": null, "campananame": "[Todas]"}
              if (cont === 0)
              {
                jsonSIEC = {
                  "objectid": "*",
                  "projectname": null,
                  "campananame": "[Todas]"
                };
                campaArr.push(jsonSIEC);
              }
              console.log("Campaña src =>", data.data[cont].CampanaName);
              console.log("ID Proy Campaña =>",data.data[cont].Id_Proyecto);
              if ((data.data[cont].Id_Proyecto == proyId || proyId === "*") && data.data[cont].CampanaName != null)
              {
                jsonSIEC = {
                  "objectid": data.data[cont].Id_Campana,
                  "projectname": proy,
                  "campananame": data.data[cont].CampanaName
                }
                campaArr.push(jsonSIEC);
              }
            }
            campaArr = procesaDuplic (campaArr, 'cam');
            //Ordenamiento campañas
            console.log("Lista campañas =>",sortCampa_as (campaArr));
            
            //Set al state de campañas ordenadas
            setCampaLst(sortCampa_as (campaArr));

          })
        }
        catch (error)
        {
          console.log("Error cargando data del server =>", error);
          throw error;
        }
        
      });
    }
    /**
     * Método para construcción de la cláusula WHERE asociado al servicio de firmas espectrales.
     * @date 2025-04-16
     * @author IGAC - DIP
     * @param OutFields = '*'
     * @param url
     * @param returnGeometry = false
     * @param where = '1=1'
     * @param inputGeometry
     * @param geometryType
     * @param insr
     * @param spatialRel
     * @dateUpdated 2025-05-08
     * @changes Inclusión parametro inputGeometry para registro de coordenadas latitud, longitud
     * @changes Inclusión parametro geometryType para registro de coordenadas latitud, longitud
     * @changes Inclusión parametro insr para registro de coordenadas latitud, longitud
     * @changes Inclusión parametro spatialRel para registro de coordenadas latitud, longitud
     * @dateUpdated 2025-05-09
     * @changes Corrección parámetro base inputGeometry => geometry
     * @changes Corrección parámetro where '1=1' => ''
     * @dateUpdated 2025-05-12
     * @changes Adición parámetro outSR
     * @remarks módulo obtenido del proyecto REFA, fuente module.ts 
     */
    const getWhere = 
      async function(
        OutFields='*',
        url,
        returnGeometry=false,
        where='',
        outStatistics ='',
        groupByFieldsForStatistics='',
        inputGeometry='',
        geometryType='',
        insr='',
        spatialRel='',
        outSR='' 
      ) {
        //console.log("Ingreso...");
        var finalUrl: string;
        const controller= new AbortController();    
        try {
          // Construcción de parámetros base
          const baseParams = new URLSearchParams({
            where: where,
            returnGeometry: returnGeometry.toString(),
            f: 'pjson'
          });
          
          // Adición parámetros adicionales según el tipo de consulta
          if (inputGeometry && inputGeometry.length > 0){
            baseParams.append('geometry', inputGeometry.toString());
          }
          if (geometryType && geometryType.length > 0){
            baseParams.append('geometryType', geometryType.toString());
          }
          if (insr && insr.length > 0){
            baseParams.append('inSR', insr.toString());
          }
          if (spatialRel && spatialRel.length > 0){
            baseParams.append('spatialRel', spatialRel.toString());
          }
          if (outSR && outSR.length > 0)
          {
            baseParams.append('outSR',outSR.toString()); 
          }
          
          // Agregar parámetros específicos según el tipo de consulta
          if (outStatistics && outStatistics.length > 0) {
            baseParams.append('groupByFieldsForStatistics', groupByFieldsForStatistics);
            baseParams.append('outStatistics', outStatistics);
          }
          else if (OutFields) {
            baseParams.append('outFields', OutFields);
          }          
          else {
            throw new Error('Debe proporcionar OutFields o outStatistics o inputGeometry o Input Spatial Reference o Spatial Relationship');
          }
          // Construir URL final
          finalUrl = `${url}/query?${baseParams.toString()}`;
          //console.log("=>",finalUrl);
          return finalUrl.toString();
        }
        catch (error)
        {
          console.error('Error en realizarConsulta:', error);
          throw error;
        }
    }
  
      
    /* Implementación de la función alterna _.where
      @date 2024-05-22
      @author IGAC - DIP
      @param (Array) array: Array de búsqueda
      @param (Object) object: Criterio para ser buscado como un objeto
      @returns (Array) Elemento del array que se busca
      @remarks método obtenido de Internet (https://stackoverflow.com/questions/58823625/underscore-where-es6-typescript-alternative)
    */
    function where(array, object) {
      let keys = Object.keys(object);
      return array.filter(item => keys.every(key => item[key] === object[key]));
    }

    
    
    
    /**
     * método procesaDuplic => Verifica unicidad de elementos en un array tipo JSON
     * @param (Array) arrResult => Array con items duplicados
     * @param (String) opc => opción para filtrado.
     * @date 2024-06-27
     * @author IGAC - DIP
     * @dateUpdated 2025-04-16
     * @changes Adicionar parametro opc, correspondiente al objeto que se filtra
     * @dateUpdated 2025-04-22
     * @changes Adicionar opción 'cov', correspondiente a la cobertura
     * @dateUpdated 2025-05-07
     * @changes Caso 'cam' => Actualización filtro campañas unicas (t.campananame === obj.campananame && t.projectname === obj.projectname => t.campananame === obj.campananame)
     * @returns (Array) Array JSON sin items duplicados
     * @remarks método obtenido desde URL https://www.geeksforgeeks.org/how-to-remove-duplicates-in-json-array-javascript/
     */
    
    function procesaDuplic(arrResult, opc){
      let newArrResult = [];
      switch (opc)
      {
        case 'prj':
        {
          newArrResult = arrResult.filter((obj, index, self) =>
            index === self.findIndex((t) => (
              t.projectname === obj.projectname
            )));
          return newArrResult;           
        }
        case 'cam':
        {
          newArrResult = arrResult.filter((obj, index, self) =>
            index === self.findIndex((t) => (              
              t.campananame === obj.campananame
            )));
          return newArrResult; 
        }
        case 'cov':
        {
          newArrResult = arrResult.filter((obj, index, self) =>
      index === self.findIndex((t) => (
          t.covertype === obj.covertype
      )));
          return newArrResult; 
        }
        default:
        {
          newArrResult = arrResult.filter((obj, index, self) =>
            index === self.findIndex((t) => (
              t.objectid === obj.objectid && t.projectname === obj.projectname && t.campananame === obj.campananame
            )));
          return newArrResult; 
        }
      }
      
  }
   
    /** 
      handleTxtChangevalor => Método para cambio de estado, en el campo Latitud que permita setear contenido
      @date 2025-04-02
      @author IGAC - DIP
      @param (Object) event => objeto que representa el evento de cambio de valor en el control Valor
      @dateUpdated 2025-05-02
      @changes Borrado del polígono asociado al mapa, al traer coordenadas en los controles
      @remarks FUENTE => https://www.geeksforgeeks.org/how-to-handle-input-forms-with-usestate-hook-in-react/
    */
      const handleTxtChangevalor = function (event) {
        setValorLatState(event.target.value);
      }

    /**
     * handleTxtChangevalorLon => Método para cambio de estado, en el campo Longitud que permita setear contenido
      @date 2025-04-02
      @author IGAC - DIP
      @param (Object) event => objeto que representa el evento de cambui de valor en el control Valor
      @remarks FUENTE => https://www.geeksforgeeks.org/how-to-handle-input-forms-with-usestate-hook-in-react/
     */
    const handleTxtChangevalorLon = function (event) {
      setValorLonState (event.target.value);
    }

    /**
     * handleRadChange => Método para cambio de estado, en las opciones "Seleccionar Area" y "Navegar"
     * @date 2025-04-03
     * @author IGAC - DIP
     * @param event
     * @dateUpdated 2025-04-07
     * @changes Asignar valor del state, cuando no es vacío.
     * @dateUpdated 2025-06-16
     * @changes cambio nombre método handleChkChange => handleRadChange
     * @remarks Valor del evento asociado event.target.value
     */
    const handleRadChange = function (event) {       
      if (event.target.value != ''){
        setValueNav(event.target.value);
      }
    }


    /**
     * handleHelpChange => Método para gestionar los eventos dados sobre la opción Ayuda, representado como icono
     * @date 2025-06-18
     * @author IGAC - DIP
     * @dateUpdated 2025-06-19
     * @changes Optimización evento sobre botón ?
     */
    const handleHelpChange = function (){
      setChkValueHelpState(!chkValueHelp); 
    }

    /**
     * Método para evaluar cargue de lista municipios en control Municipio, según el control Departamento
     * @date 2025-08-04
     * @author IGAC - DIP
     * @param evt 
     */
    const handleSelDptoChange = function (evt) {
      var codDpto: string = "";
      if (evt.target.value !== '' && typeof evt !== 'undefined')
      {
        setMunicDisabState (false);
        codDpto = evt.target.value.toString();
      }
      console.log("Dpto val =>",codDpto);
      
      //Al state
      setDptoSelState (codDpto);
      
      //Cargue lista municipios según departamento
      getJSONMpio (codDpto);
    }

    /**
     * handleSelMpioChange => Método para asignar valor del campo Municipio según evento en control Municipio
     * @date 2025-08-05
     * @author IGAC - DIP
     * @param evt 
     */
    
    const handleSelMpioChange = function (evt){
      setMpioSelState (evt.target.value);
    }

    /**
     * getJSONMpio => Método para obtener lista de municipios, conocido el identificador del departamento, dado en control Departamento
     * @date 2025-07-04
     * @author IGAC - DIP
     * @param {number} idDpto     
     * @dateUpdated 2025-08-14
     * @changes Inclusión valor [Todos] en campo Municipio
     * @dateUpdated 2025-08-25
     * @changes Actualizar control errores, en el consumo API cuando se tengan problemas en el servidor remoto.
     * @dateUpdated 2025-09-03
     * @changes Actualizar control de errores Parte 2, asociado al retorno de la petición desde el servidor
     */
    const getJSONMpio = async function (idDpto)
    {
      //Objetos locales
      var critSeleccDpto, urlDivipolaMpios: string = "";
      //Cargue id del control Departamento
      //console.log ("ID Dpto asociado =>",idDpto);


      //Cargue listado municipios con departamento asociado a su identificador
      critSeleccDpto  = "decodigo='"+idDpto+"'";
      urlDivipolaMpios = await getWhere(outFieldsService.fieldOutDivipola, urls.Municipios, false, critSeleccDpto, '', '', '', '', '', '', '');
      //console.log ("URL consumo Mpios Map Server =>",urlDivipolaMpios);

      //Activar estado cargando lista de municipíos
	    setIsLoadState(true);
      //Invocación al servicio en try .. catch
	    try{
        await fetch(urlDivipolaMpios, {
          method:"GET"
        })
        .then ((mpiosServer) => {
          var jsonErr: any = {};
          if (!mpiosServer.ok)
          {           
            jsonErr = {
              "error": mpiosServer.status,
              "errorMsg": mpiosServer.statusText
            }
            return jsonErr;
            //throw new Error(`HTTP error! status: ${mpiosServer.status}`);
          }
          //Validador consumo por error del server (cód http <> 200 )
          else if (typeof (mpiosServer["error"]) !== 'undefined'){
            jsonErr = {
              "errorCode": mpiosServer["error"].code,
              "errorMsg": mpiosServer["error"].message
            }
            console.error("Error Obteniendo lista departamentos del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
            throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
          }
          const jsonMpios = mpiosServer.json();
          return jsonMpios;
        })
        .then ((mpiosDataLst) => {
          //Objeto local
          var jsonSIEC: any = {};
          //Validador consumo por error del server (cód http <> 200 )
          if (typeof (mpiosDataLst["error"]) !== 'undefined'){
            jsonSIEC = {
              "errorCode": mpiosDataLst["error"].code,
              "errorMsg": mpiosDataLst["error"].message,
              "errorMsgDet": mpiosDataLst["error"].details[0]
            }
            console.error("Error obteniendo data del server =>" ,jsonSIEC["errorMsg"])+" "+"("+"código http =>"+jsonSIEC["errorCode"]+")";
            throw jsonSIEC["errorMsg"]+" "+"("+"código http =>"+" "+jsonSIEC["errorCode"]+")";
          }
          //Desactivar modo cargando
          setIsLoadState(false);
          //console.log("Mpios Lst para combo =>",mpiosDataLst.features);
          //Inclusión valor [Todos]
          jsonSIEC = {
            attributes: {
              decodigo: "*",
              depto: "[Todos]",
              mpcodigo: "*",
              mpnombre: "[Todos]"
            }
          };
          mpiosDataLst.features.push (jsonSIEC);
          console.log("Array Mpios Sorted =>", sortMpios (mpiosDataLst.features));
          setMpioLstState (sortMpios (mpiosDataLst.features));
        })
      }
      catch (error)
      {
        console.log("Error obteniendo municipios del server =>", error);
        throw error;
      }
    }
   
    /**
      consultaCatal => método que realiza la consulta, seleccionando la opción Buscar en catálogo
      @date 2025-04-08
      @author IGAC - DIP
      @param (event) evt
      @dateUpdated 2025-04-09
      @changes Inclusión validación campos requeridos
      @dateUpdated 2025-05-05
      @changes Fix validación campos requeridos, excluyendo las opciones Seleccionar Area o Navegar, por estar selecciona Seleccionar Area por defecto
      @dateUpdated 2025-05-06
      @changes Fix validación campos requeridos, coordenadas latitud y longitud asociado a las esquinas Sup Der e Inf Izq
      @dateUpdated 2025-05-07
      @changes Invocación método getJSONFilter()
      @dateUpdated 2025-05-08
      @changes Fix validación campos requeridos, coordenadas latitud y longitud asociado a un punto (modo Navegar)
      @dateUpdated 2025-05-14
      @changes Borrado de markers anteriores, al procesar la opción Buscar en catálogo
      @dateUpdated 2025-05-16
      @changes Llamado método borradoMarkers() para borrado de markers anteriores
      @dateUpdated 2025-06-04
      @changes cambio state controlForms true => false (pruebas), puesto que el data grid se renderiza en otra sección del widget
      @dateUpdated 2025-07-25
      @changes Fix realización consultas sobre los filtros, sin usar opción Limpiar
      @dateUpdated 2025-08-05
      @changes Cargue valores dpto y mpio, asociados a los campos Departamento y Municipio
      @changes Actualización validador ppal, para que incluya los campos Departamento y Municipio
      @dateUpdated 2025-08-12
      @changes Deshabilitación opción Buscar en catálogo al seleccionarlo para consulta del filtro asociado
      @dateUpdated 2025-08-20
      @changes Actualización validador asociado al campo Cobertura y sus dependientes {Coberturas1, Coberturas2}
      @changes Análisis objetos asociados al campo Cobertura y sus dependientes {Coberturas1, Coberturas2}
      @dateUpdated 2025-08-26
      @changes Parte 2 asociado al requerimiento de fecha 2025-08-20, tomando el campo Cobertura sin valor [Todas] 
      @dateUpdated 2025-09-05
      @changes Fix bug widget Bar-Chart no se refresca, cuando la consulta no cumple con el filtro => Activar limpieza sobre widget Bar-Chart, asociado al objeto dataToRenderBarChart. 
      @dateUpdated 2025-09-17
      @changes Mantenimiento validador asociado al comunicado "Publicación ambiente de pruebas banco de firmas espectrales", 2025-09-11, 15:16 - Filtros Nivel 1 (p.2).
      @dateUpdated 2025-09-19
      @changes Bug detectado sobre incidencia "Filtros Nivel 1" (p.2) => Especificados Nivel 1 y 2, si Nivel 3 es vacío, tomar consulta sobre Nivel 2.
      @remarks Actualización validador campo Cobertura y asociados, se toma longitud listas campos Coberturas 1 y Coberturas 2 mayor que 1 valor (valor = [Todas])
      @remarks Validador original con Cobertura igual a [Todas] => (typeof selCoberVal === "undefined") || (typeof selCoberFilt1Val === "undefined" && coberFilt1Lst.length > 1) || (typeof selCoberFilt2Val === "undefined" && coberFilt2Lst.length > 1)) [2025-08-25]
    */
      function consultaCatal(evt: { preventDefault: () => void; }){
        evt.preventDefault();
        
        //Cobertura
        //Coberturas 1
        //Coberturas 2
        /*console.log("Cobertura =>",selCoberVal);
        console.log("Coberturas 1 =>",selCoberFilt1Val);
        console.log("Coberturas 2 =>",selCoberFilt2Val);
        console.log("Coberturas 2 Arr =>",coberFilt2Lst);
        //Departamento
        console.log("Dpto =>", dptoSel);
        //Municipio
        console.log("Mpio =>", mpioSel);
        //Opc
         console.log("Modo coordenadas =>",radValueNav);
        //Coord Lat - Sup Izq
        console.log("Latitud Esq Sup Izq =>",txtValorLatSuIz);
        //Coord Lon - Sup Izq
        console.log("Longitud Esq Sup Izq  =>",txtValorLonSuIz);
        //Coord Lat - Inf Der
        console.log("Latitud Esq Inf Der =>",txtValorLatInDe);
        //Coord Lon - Inf Der
        console.log("Longitud Esq Inf Der  =>",txtValorLonInDe);
        //Proyecto
        console.log("Proyecto asociado =>",selProyVal);   
        //Campaña
        console.log("Campaña asociada =>",selCampaVal); */
  
        //Inclusión validación para campos requeridos (al menos 1 es requerido)
        if ((typeof selCoberVal !== "undefined" && typeof selCoberFilt1Val === "undefined" && coberFilt1Lst.length === 0 || (typeof selCoberFilt1Val !== "undefined" && typeof selCoberFilt2Val !== "undefined" && coberFilt2Lst.length === 0)) && typeof dptoSel === "undefined" && typeof mpioSel === "undefined" && (txtValorLatSuIz.trim() === "" && txtValorLatInDe.trim() === "") && ((txtValorLonSuIz.trim() === "" && txtValorLonInDe.trim() === "") && (txtValorLat.trim() === "" && txtValorLon.trim() === "")) &&  typeof selProyVal === "undefined" && typeof selCampaVal === "undefined")
        {
          console.log("Error, campos requeridos!!!");
          setAlertDial(true);
          
          setMensModal({
            deployed: true,
            type: typeMSM.error,
            tittle: 'Campos requeridos no diligenciados',
            body: 'Se requiere diligenciar los campos del filtro!'
          });
          return;
        }   

        //Deshabilitar opción Buscar en catálogo
        //setCatalBtnState (true);

        //Limpieza del data Grid 
        setRows([]);

        //Limpieza widgets Tabla Resultados        
        const dataToRenderTablaResultados = JSON.stringify({ dataToRows: [] });
        props.dispatch(appActions.widgetStatePropChange('widget_81', 'dataFromDispatchWidget_searchSIEC', dataToRenderTablaResultados));   
        const dataToRenderBarChart = JSON.stringify({ dataToRows: [], labels: []})
        props.dispatch(appActions.widgetStatePropChange('widget_82', 'dataFromDispatchWidget_searchSIEC', dataToRenderBarChart));

        //Borrado markers anteriores
        borradoMarkers(jimuMapView);

        //Restauración extent inicial
        goToInitialExtent(jimuMapView, initialExtent);
        
        //Actualización estado que asocia la renderización del data grid
        setControlForms(false);

        //Invocación generación data con base al filtro especificado
        getJSONFilter();
      }

      /**
         * método getJSONFilter() => obtener data del servicio, con base al filtro especificado
         * @date 2025-05-07
         * @author IGAC - DIP
         * @dateUpdated 2025-05-08
         * @changes Implementación geometria dada por las coordenadas Latitud, longitud
         * @dateUpdated 2025-05-09
         * @changes Actualización geometria dada por las coordenadas espaciales rectángulares (X, Y)
         * @changes Definición tipo de geometría (Polígono o Punto)
         * @changes Actualizar campos de salida en consulta al servicio
         * @dateUpdated 2025-05-12
         * @changes Actualizar parámetro Output Spatial Reference, al llamado del método getWhere()
         * @changes Actualizar parámetro Input Spatial Reference, al llamado del método getWhere()
         * @dateUpdated 2025-05-14
         * @changes Realizar borrado del objeto rows, que maneja el dataGrid, antes de obtener la data del servicio
         * @changes Fix validación, para coordenadas geográficas se valide cuando se especifican las mismas. De lo contrario, no se adiciona parámetro de selección de coordenadas
         * @dateUpdated 2025-05-15
         * @changes Bug procesamiento sentencia tGeometry
         * @changes Fix selección para caso Proyectos, Campañas
         * @dateUpdated 2025-05-19
         * @changes Fix selección para caso Proyectos, Campañas (proyecto y campaña)
         * @dateUpdated 2025-05-20
         * @changes Fix selección para caso Proyectos, Campañas (proyecto todos y campaña)
         * @dateUpdated 2025-05-22
         * @changes invocación método getSelectedDataFilter() para optimizar consumo sobre data grid
         * @dateUpdated 2025-05-29
         * @changes Especificar estado cargando antes de generar la petición al servidor remoto, bajo método getSelectedDataFilter ()
         * @changes Parametrizar salida de campos asociados al consumo del servicio
         * @dateUpdated 2025-06-25
         * @changes Actualizar urlServicioSIEC firmasEsp => firmasEspReal
         * @changes Actualizar parámetro projectname => projectnam
         * @changes Actualizar parámetro campananame => campananam
         * @dateUpdated 2025-07-18
         * @changes Actualizar objecto selProyVal, para procesarlo por separado {ProyTxt+';'+idProy}
         * @dateUpdated 2025-08-05
         * @changes Inclusión validaciones desde campos Departamento y Municipio para procesar filtro en el mapserver
         * @dateUpdated 2025-08-08
         * @changes Actualizar Acceso servicio MapServer, dado en objeto firmasEspTCober
         * @changes Actualizar campos de selección criterio al servicio MapServer https://pruebassig.igac.gov.co/server/rest/services/Vista_Puntos_Cobertura/MapServer/0 => {campananam => nombre_campana, cod_depto => codigo_departamento, cod_mpio => codigo_municipio, covertype => tipo_cobertura}
         * @dateUpdated 2025-08-20
         * @changes Construcción consulta, basado en criterio campo Cobertura y dependientes {Coberturas1, Coberturas2}
         * @dateUpdated 2025-08-21
         * @changes Inclusión validador campos Cobertura, Departamento, Municipio, Proyecto y Campaña cuando no se definen o toman el valor de [Todos / Todas], aplica todos los registros (En pruebas)
         * @dateUpdated 2025-08-22
         * @changes Actualización validación cuando el campo Coberturas 2 no tiene parámetros asignados, se toma el valor del campo Coberturas 1
         * @dateUpdated 2025-08-26
         * @changes Retomar requerimiento 2025-08-21, con actualización campo Cobertura sin opción [Todas]
         * @dateUpdated 2025-09-17
         * @changes Fix Incidencia "Filtros Nivel 1" (p.2) aplicado al Nivel 1.
         * @dateUpdated 2025-09-18
         * @changes Fix Incidencia "Filtros Nivel 1" (p.2) aplicado al Nivel 2.
         * @dateUpdated 2025-10-28
         * @changes Fix bug requerimiento 2025-08-22, por exclusión de opción "[Todas]"
         * @changes Fix bug Cuando lista del campo Nivel 3, está definida y tiene más de 1 elemento
         * @returns (String)
         * @remarks Objeto selCoberVal => compuesta <id>+";"+<valor control> (2025-08-15)
         * @remarks Objeto selCoberFilt1Val => compuesta <id>+";"+<valor control>(2025-08-15)
         * @remarks Objeto selCoberFilt2Val => compuesta <id>+";"+<valor control>(2025-08-15)
         */
      const getJSONFilter = async function(){
        var where                           :string = undefined;
        var geomCoords, tGeometry, coberVal :string = "";
        var paramNiv2Str, paramNiv3Str      :string = "";
        
        //Zona de depuración código
        console.log("Datos correctos =>");
        //Cobertura => Nivel 1       
        //Coberturas 1 => Nivel 2
        //Coberturas 2 => Nivel 3
        /*console.log("Cobertura =>",selCoberVal);
        console.log("Coberturas 1 =>",selCoberFilt1Val);
        console.log("Coberturas 2 =>", selCoberFilt2Val);
        //Departamento
        console.log("Cod Depto =>",dptoSel);
        //Municipio
        console.log("Cod Mpio =>", mpioSel);
        //Opc
        console.log("Modo coordenadas =>",radValueNav);
        
        //Proyecto
        console.log("Proyecto asociado =>",selProyVal);          
        //Campaña
        console.log("Campaña asociada =>",selCampaVal);*/ 

        //Procesamiento del where
        //Cobertura => Nivel 1
        if (typeof selCoberVal !== 'undefined')
        {
          console.log ("Test Condic Nivel 2 y Nivel 3 =>",selCoberFilt2Val+"\n");
          console.log ("Test Contin =>",coberFilt2Lst);
          //Procesamiento coberturas 1 => Nivel 2  - texto del control
          //Fix 2025-10-28
          if (typeof selCoberFilt1Val !== 'undefined' && coberFilt2Lst.length === 0){
            coberVal  = selCoberFilt1Val.split(';')[1];
            where = "tipo_cobertura='"+coberVal+"'";
          }
          //Procesamiento coberturas 2 => Nivel 3 - texto del control
          else if (typeof selCoberFilt2Val !== 'undefined' && !disCoberFilt2){
            coberVal  = selCoberFilt2Val.split(';')[1];
            //Procesamiento coberturas 2 => Nivel 3 si opción === [Todas] => Procesamiento coberturas 1 => Nivel 2 - texto del control
            if (selCoberFilt2Val.split(';')[0] === '*'){
              coberVal  = selCoberFilt1Val.split(';')[1];              
            }
            where = "tipo_cobertura='"+coberVal+"'";
          }
          //Procesamiento coberturas 2 => Nivel 3 al encontrarse deshabilitado / cuando presenta la opción [Todas], toma el valor del control coberturas 1 => Nivel 2 - 2025-08-22
          //Fix 2025-10-28
          else if (disCoberFilt2 || coberFilt2Lst.length === 0){
            coberVal  = selCoberFilt1Val.split(';')[1];
            where = "tipo_cobertura='"+coberVal+"'";
          }
          //Procesamiento Cobertura => Nivel 1, cuando coberturas 1 => Nivel 2 no es seleccionado y tiene lista definida
          else if (typeof selCoberFilt1Val === 'undefined' && coberFilt1Lst.length > 0){
            //console.log ("Visualización elementos Nivel 2 =>",coberFilt1Lst[0]);
            //Obtener elementos del nivel 3, a partir del API
            //Recorrido de los parámetros en lista Nivel 2
            for (var contNiv2 = 0; contNiv2 < coberFilt1Lst.length; contNiv2++){
              //console.log("Elem Niv 2 Array =>",coberFilt1Lst[contNiv2].objectid);
              if (typeof paramNiv2Str === 'undefined'){
                paramNiv2Str  = coberFilt1Lst[contNiv2].objectid + ",";   
              }
              else{
                paramNiv2Str  += coberFilt1Lst[contNiv2].objectid + ",";
              }
              //console.log ("Obj Niv 2"+" "+contNiv2+" =>",paramNiv2Str);
            }
            
            //Compactación última ',' que no aplica
            paramNiv2Str          = paramNiv2Str.slice (0, -1);
            
            //Consumo al API
            //Obtener token seguridad
            var urlApiServicioSIEC= urls.api_host + urls.api_getToken;
            const tokSegObj       = await getTokenAlt (urlApiServicioSIEC);
            const tokenSeg        = tokSegObj["data"].access_token;
            urlApiServicioSIEC    = urls.api_host + urls.api_getCoberTerInBNE + paramNiv2Str;
            //console.log ("Petición API =>",urlApiServicioSIEC);
            try{
              var coberNiv3Obj  = await getDominioValor (tokenSeg, urlApiServicioSIEC);
              console.log ("Consumo objetos nivel 3 =>",coberNiv3Obj);
              //Recorrido de los parámetros asociados al objeto Nivel 3
              for (var contNiv3 = 0; contNiv3 < coberNiv3Obj["data"].length; contNiv3++){
               //console.log ("Recorrido Niv 3 =>"+contNiv3+" "+"=>"+coberNiv3Obj["data"][contNiv3].Descripcion_Valor);
                if (typeof paramNiv3Str === 'undefined'){
                  paramNiv3Str  = "'"+ coberNiv3Obj["data"][contNiv3].Descripcion_Valor + "'"+ ",";
                }
                else{
                  paramNiv3Str  +=  "'"+ coberNiv3Obj["data"][contNiv3].Descripcion_Valor + "'" + ",";
                }
              }
              //Compactación última ',' que no aplica
              paramNiv3Str  = paramNiv3Str.slice (0, -1);
              console.log ("Params Nivel 3 =>",paramNiv3Str);

              //Generación consulta
              where = "tipo_cobertura"+" "+"IN"+" "+"("+paramNiv3Str+ ")";
            }
            catch (error){
              console.error ("Error generado en server =>",error);
              throw new Error (error);
            }
          }
          //Procesamiento coberturas 1 => Nivel 2, cuando coberturas 2 => Nivel 3 no es seleccionado y tiene lista definida 
          else if (typeof selCoberFilt2Val === 'undefined' && coberFilt2Lst.length > 0){
           console.log ("Visualización elementos Nivel 3 =>",coberFilt2Lst[0]);
            //Generar parámetros de elementos Nivel 3
            try{
              //Recorrido de los parámetros asociados al objeto Nivel 3
              for (var contNiv3 = 0; contNiv3 < coberFilt2Lst.length; contNiv3++){
                //console.log ("Recorrido Niv 3 =>"+contNiv3+" "+"=>"+coberFilt2Lst[contNiv3].covertype);
                if (typeof paramNiv3Str === 'undefined'){
                  paramNiv3Str   = "'" + coberFilt2Lst[contNiv3].covertype + "'" + ",";
                }
                else{
                  paramNiv3Str  +=  "'" + coberFilt2Lst[contNiv3].covertype + "'" + ",";
                }
              }
              //Compactación última ',' que no aplica
              paramNiv3Str  = paramNiv3Str.slice (0, -1);
              console.log ("Params Nivel 3 =>",paramNiv3Str);

              //Generación consulta
              where = "tipo_cobertura"+" "+"IN"+" "+"("+paramNiv3Str+ ")";
            }
            catch (error){
              console.error ("Error generado en procesamiento nivel 3 =>",error);
              throw new Error (error);
            }
          }
 
          //Procesamiento cobertura => Nivel 1 - texto del control
          else if (selCoberVal.split(';')[0] !== '*'){
            if (selCoberFilt1Val.split(';')[0] === '*' || coberFilt1Lst.length === 1){
              coberVal  = selCoberVal.split(';')[1];
              where = "tipo_cobertura='"+coberVal+"'";
            }
          }
        }
        //Departamento
        if (typeof dptoSel !== 'undefined')
        {
          if (typeof where !== 'undefined'){
            if (where.length > 0 && dptoSel !== '*'){
              where = where + " " + "AND" + " " + "codigo_departamento='" + dptoSel + "'";
            }
            else if (dptoSel !== '*'){
              where = "codigo_departamento='" + dptoSel + "'";
            }
          }
          else if (dptoSel !== '*'){
            where = "codigo_departamento='" + dptoSel + "'";
          }
        }
        //Municipio
        if (typeof mpioSel !== 'undefined')
        {
          if (typeof where !== 'undefined'){
            if (where.length > 0 && mpioSel !== '*'){
              where = where + " " + "AND" + " " + "codigo_municipio='" + mpioSel + "'";
            }
            else if (mpioSel !== '*'){
              where = "codigo_municipio='" + mpioSel + "'";
            }
          }
          else if (mpioSel !== '*'){
            where = "codigo_municipio='" + mpioSel + "'";
          }
        }
        //Coordenadas Geográficas
        //Punto Modo coordenadas opción Navegar
        //Latitud y Longitud
        //parametro Input Geometry
        if (radValueNav === 'navMap')
        {
          /*console.log("Latitud pto =>", txtValorLat);
          console.log("Longitud pto =>", txtValorLon);
           console.log("Pto Longitud (X) =>", lonRect);
          console.log("Pto Latitud (Y) =>", latRect); */
          if ((typeof txtValorLat !== 'undefined' && txtValorLat !== '') && (typeof txtValorLon !== 'undefined' && txtValorLon !== ''))
          {            
            geomCoords = txtValorLon+","+txtValorLat;
            tGeometry = 'esriGeometryPoint';
          }
        }
        //Coordenadas Geográficas
        //Polígono Modo coordenadas opción Seleccionar Area
        //Latitud y Longitud
        //parametro Input Geometry     
        else if (radValueNav === 'selArea')
        {
          /* //Coord Lat - Sup Izq
          console.log("Latitud Esq Sup Izq =>",txtValorLatSuIz);
          //Coord Lon - Sup Izq
          console.log("Longitud Esq Sup Izq  =>",txtValorLonSuIz);
          //Coord Lat - Inf Der
          console.log("Latitud Esq Inf Der =>",txtValorLatInDe);
          //Coord Lon - Inf Der
          console.log("Longitud Esq Inf Der  =>",txtValorLonInDe); */
          
          //Coord Lat (Y) - Sup Izq
          /* console.log("Latitud (Y) Esq Sup Izq =>",latRectSuIz);
          //Coord Lon (X) - Sup Izq
          console.log("Longitud Esq Sup Izq  =>",lonRectSuIz);
          //Coord Lat (Y) - Inf Der
          console.log("Latitud Esq Inf Der =>",latRectInDe);
          //Coord Lon (X)- Inf Der
          console.log("Longitud Esq Inf Der  =>",lonRectInDe); */
          if (((typeof txtValorLatSuIz !== 'undefined' && txtValorLatSuIz !== '') && (typeof txtValorLatInDe !== 'undefined' && txtValorLatInDe !== '')) && ((typeof txtValorLonSuIz !== 'undefined' && txtValorLonSuIz !== '') && (typeof txtValorLonInDe !== 'undefined' && txtValorLonInDe !== '')))
          {            
            geomCoords = txtValorLonSuIz + ","+ txtValorLatSuIz + "," + txtValorLonInDe + "," + txtValorLatInDe;
            tGeometry = 'esriGeometryEnvelope';
          }
        }
        //Proyecto
        if (typeof selProyVal !== 'undefined')
        {
          selProyVal = selProyVal.split(";")[0];
          if (selProyVal === '[Todos]')
          {            
            selProyVal = selProyVal.replace('[Todos]','*');
            setProyState (selProyVal.replace('[Todos]','*'));
          }
          if (typeof where !== 'undefined')
          {
            if (where.length > 0 && selProyVal !== '*')
            {
              where = where + " " + "AND" + " " + "projectnam='"
            + selProyVal + "'";
            }
            else if (selProyVal !== '*')
            {
              where = "projectnam='" + selProyVal + "'";
            }
          }
          else if (selProyVal !== '*')
          {
            where = "projectnam='" + selProyVal + "'";
          }
        }
        //Campaña
        if (typeof selCampaVal !== 'undefined')
        {
          if (selCampaVal === '[Todas]')
          {            
            selCampaVal = selCampaVal.replace('[Todas]','*');
            setCampaState (selCampaVal.replace('[Todas]','*'));
          }
          //Filtro por campaña
          //campaña y proyecto
          if (selCampaVal !== '*' && selProyVal !== '*')
          {
            if (typeof where !== 'undefined')
            {
              if (where.length > 0)
              {
                where = where + " " + "AND" + " " + "nombre_campana='"+selCampaVal+"'";
              }
            }
            //Campaña
            else
            {
              where = "nombre_campana='" + selCampaVal + "'";
            }
          }
          //Filtro por campaña con todos los proyectos
          else if (selProyVal === '*' && selCampaVal !== '*')
          {
            if (typeof where !== 'undefined') 
            {
              if (where.length > 0)
              {
                where = where + " " + "AND" + " " + "nombre_campana='"+ selCampaVal + "'";
              }
              else
              {
                where = "nombre_campana='" + selCampaVal + "'";
              }
            }
            else
            {
              where = "nombre_campana='" + selCampaVal + "'";
            }
          }
          //Filtro para todos proyectos y todas campañas y cobertura no definida => todos los registros del sistema 
          //else if (selCampaVal === '*' && selProyVal === '*' && typeof selCoberVal === 'undefined')
          else if ((selCampaVal === '*' || typeof selCampaVal === 'undefined') && (selProyVal === '*' || typeof selProyVal  === 'undefined') && typeof selCoberVal === 'undefined')
          {
            where = "1=1";
          }
        }

        //Condición cuando los campos Proyecto, campaña y Cobertura no se definen o toman el valor de [Todos / Todas], aplica todos los registros - 2025-08-26
        if ((typeof selCoberVal === 'undefined') && (dptoSel === '*' || typeof dptoSel === 'undefined') && (mpioSel === '*' || typeof mpioSel === 'undefined') && (selProyVal === '*' || typeof selProyVal  === 'undefined') && (selCampaVal === '*' || typeof selCampaVal === 'undefined')){
          where = "1=1";
        } 
            
        console.log("Criterio where =>",where);
        console.log("Criterio Input Geometry =>",geomCoords);
        
        //Se usa la petición para paso de parámetros
        const urlServicioSIEC = await getWhere(outFieldsService.fieldsOut, urls.firmasEspTCober, true, where, '', '', geomCoords, tGeometry, '4326', 'esriSpatialRelIntersects', '3857');
        
        console.log("URL consumo =>", urlServicioSIEC);
        
        //Limpieza del data Grid antes de obtener la información del servicio
        setRows([]);

        //Estado cargando
        //console.log("Activando cargando al Buscar en catálogo...");
        setIsLoadState(true);
        //Consumo del servicio
        getSelectedDataFilter(urlServicioSIEC);
      }

    /**
     * getSelectedDataFilter => método para traer los registros sobre el componente Data Grid
     * @date 2025-05-22
     * @author IGAC - DIP
     * @param {string} urlServicioSIEC
     * @param {string} opc
     * @dateUpdated 2025-05-29
     * @changes Desactivar modo cargando, cuando la data se trae desde servidor remoto de manera correcta
     * @dateUpdated 2025-08-25
     * @changes Actualizar control errores, en el consumo API cuando se tengan problemas en el servidor remoto.
     * @dateUpdated 2025-08-26
     * @changes Movimiento deshabilitacion estado cargando al componente ppal searchSIEC (widget)
     * @dateUpdated 2025-08-29
     * @changes Inclusión estados de consulta al servidor remoto, cuando no es exitosa
     * @dateUpdated 2025-09-01
     * @changes Actualización mensaje y estado de consulta al MapServer, cuando no es exitosa la consulta
     * @dateUpdated 2025-09-03
     * @changes Actualizar control de errores parte 2, asociado al retorno del estado de consulta <> 200 desde el servidor
     * @dateUpdated 2025-10-28
     * @changes Inclusión @param opc
     * @changes Si el parametro opc presenta valor distinto a vacio (''), realiza return del objeto
     * @dateUpdated 2025-11-06
     * @changes Fix consulta Mapserver pasando opc = 'qry' sin token de seguridad, no se necesita
     * @remarks Optimización sobre el método getJSONFilter()
     */
    const getSelectedDataFilter = async function(urlServicioSIEC: string, opc: string = "") {
      if (opc === ''){
        try{
          await fetch(urlServicioSIEC,{
            method:"GET"
          })
          .then((dataRows) => {
            var jsonErr: any = {};
            if (!dataRows.ok)
            {
              jsonErr = {
                "error": dataRows.status,
                "errorMsg": dataRows.statusText
              }
              //throw new Error(`HTTP error! status: ${dataRows.status}`);
              throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["error"];
              return jsonErr;
            }
            //Validador consumo por error del server (cód http <> 200 )
            else if (typeof (dataRows["error"]) !== 'undefined'){
              jsonErr = {
                "errorCode": dataRows["error"].code,
                "errorMsg": dataRows["error"].message
              }
              console.error("Error Obteniendo lista departamentos del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
              throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
            }  
            return dataRows.json();
          })
          .then((dataJSON) => {
            var jsonErr:any = {};
            //Validador consumo por error del server (cód http <> 200 )
            if (typeof (dataJSON["error"]) !== 'undefined'){
              jsonErr = {
                "errorCode": dataJSON["error"].code,
                "errorMsg": dataJSON["error"].message,
                "errorMsgDet": dataJSON["error"].details[0]
              }
              console.error("Error obteniendo data asociado al filtro de consulta del Mapserver (" + urlServicioSIEC +") =>" ,jsonErr["errorMsg"]+" "+"("+"Detalle error asociado => "+jsonErr["errorMsgDet"]+")"+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")");
              throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
            }
            console.log("Data traida desde remoto...",dataJSON);
            
            //Procesar generación filas data grid
            generateRowsDG(dataJSON.features);
          });
        }
        catch (error){
          console.log("Error generado =>",error);
        }
      }
      else{
        try{
          return await fetch(urlServicioSIEC,{
            method:"GET"
          })
          .then((dataRows) => {
            var jsonErr: any = {};
            if (!dataRows.ok)
            {
              jsonErr = {
                "error": dataRows.status,
                "errorMsg": dataRows.statusText
              }
              //throw new Error(`HTTP error! status: ${dataRows.status}`);
              throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["error"];
              return jsonErr;
            }
            //Validador consumo por error del server (cód http <> 200 )
            else if (typeof (dataRows["error"]) !== 'undefined'){
              jsonErr = {
                "errorCode": dataRows["error"].code,
                "errorMsg": dataRows["error"].message
              }
              console.error("Error Obteniendo lista departamentos del server =>" ,jsonErr["errorMsg"])+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
              throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
            }  
            return dataRows.json().then((dataJSON) => {
              var jsonErr:any = {};
              //Validador consumo por error del server (cód http <> 200 )
              if (typeof (dataJSON["error"]) !== 'undefined'){
                jsonErr = {
                  "errorCode": dataJSON["error"].code,
                  "errorMsg": dataJSON["error"].message,
                  "errorMsgDet": dataJSON["error"].details[0]
                }
                console.error("Error obteniendo data asociado al filtro de consulta del Mapserver (" + urlServicioSIEC +") =>" ,jsonErr["errorMsg"]+" "+"("+"Detalle error asociado => "+jsonErr["errorMsgDet"]+")"+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")");
                throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
              }
              console.log("Data traida desde remoto...",dataJSON);
              
              //Devolver longitud de la data traida desde remoto
              return dataJSON.features.length;
            });
          })
        }
        catch (error){
          console.log("Error generado =>",error);
        }
      }
    }
    /**
     * generateRowsDG => método para generar las filas del DataGrid
     * @date 2025-05-08
     * @author IGAC - DIP
     * @param dataJSON => features asociados a la data del server
     * @param geomDataJSON => Geometria asociados a los features desde server
     * @dateUpdated 2025-05-09
     * @changes Incluir columna código firma (codigofirma)
     * @changes Incluir columna instrumento (instrumentname)
     * @changes Incluir columna Altura snm (sealevelaltitude)
     * @changes Incluir columna foto firma (archivo) (photosignature)
     * @changes Incluir columna % pureza (spectralintegrity)
     * @changes Incluir columna Proyecto (projectname)
     * @changes Incluir columna Campaña (campananame)
     * @dateUpdated 2025-05-12
     * @changes Procesar geometria dadas en la localización del array geometry (coordenadas X e Y)
     * @dateUpdated 2025-05-15
     * @changes Fix validación parámetro dataJSON, el cual debe estar definido.
     * @changes Fix armado estructura JSON para registros con geometría existente
     * @changes Inclusión validación para filtrar departamentos y municipios válidos (cuando no son nulos)
     * @changes Actualización objeto rows, asociado al componente tablaResultSrcSIEC
     * @dateUpdated 2025-05-22
     * @changes Búsqueda departamento, para obtener el nombre correspondiente
     * @dateUpdated 2025-05-23
     * @changes Búsqueda municipio, para obtener el nombre correspondiente
     * @changes Búsqueda departamento código 11 (Bogotá)
     * @changes Invocación listado de municipios con código departamento
     * @dateUpdated 2025-05-26
     * @changes Separación con espacio el municipio y su correspondiente departamento
     * @dateUpdated 2025-05-29
     * @changes Parametrizar salida de campos asociados al consumo del servicio
     * @changes Especificar estado cargando antes de generar la petición al servidor remoto
     * @dateUpdated 2025-05-30
     * @changes Optimización objetos cargue código divipola asociado al departamento
     * @dateUpdated 2025-06-09
     * @changes Actualización petición, que incluya el código departamento y el código de municipio
     * @dateUpdated 2025-06-10
     * @changes Actualización petición para consulta de todos los municipios, y procesamiento Dpto, Municipio del arreglo de data consultada según filtro (Normalización petición para cargue lista de municipios)
     * @dateUpdated 2025-06-11
     * @changes Actualización petición para consulta de todos los municipios, y procesamiento Dpto, Municipio del arreglo de data consultada según filtro
     * @dateUpdated 2025-06-25
     * @changes Suprimir atributo codSig
     * @changes Suprimir atributo ins
     * @changes Suprimir atributo alsnm
     * @changes Suprimir atributo spectralintegrity
     * @changes Actualización atributo projectname => projectnam
     * @changes Actualización atributo campananame => campananam
     * @changes Actualización atributo photosignature => fileidenti
     * @changes Actualización atributo divipolamunicipio => cod_mpio
     * @changes Actualización atributo divipoladepto => cod_depto
     * @changes Actualización validación formación código Municipio desde servicio viene con la compuesta código departamento + código municipio en el objeto codMpioDivipola
     * @changes Desactivación objeto jsonStr atributo "type": dataJSON[cont].attributes.covertype, por no existir atributo en servicio datos reales (cambio temporal).
     * @changes Inclusión atributo object_id, para armarse en el objeto jsonArr
     * @dateUpdated 2025-08-08
     * @changes Actualización atributo cod_depto => codigo_departamento
     * @changes Actualización atributo cod_mpio => codigo_municipio
     * @changes Actualización atributo object_id => id_punto
     * @dateUpdated 2025-08-25
     * @changes Actualizar control errores, en el consumo API cuando se tengan problemas en el servidor remoto.
     * @dateUpdated 2025-08-26
     * @changes Movimiento deshabilitacion estado cargando al componente ppal searchSIEC (widget)
     * @dateUpdated 2025-08-28
     * @changes Actualizar control de errores, al realizar petición al servidor remoto Mapserver, analizando los códigos http de respuesta (si = 200, petición correcta, de lo contrario, es petición errónea)
     * @dateUpdated 2025-09-03
     * @changes Complementar requerimiento 2025-08-28, realizando un lanzamiento (throw) en la sección de petición <> 200
     * @dateUpdated 2025-10-07
     * @changes Incluir atributos latitud => pointLat y longitud => pointLon, cuando exista geometria asociada
     * @changes Desactivar generación data simulada de fecha 2025-08-28
     * @remarks Data simulada de prueba, por caida Mapserver (2025-08-28)
     */
    
    const generateRowsDG = async function (dataJSON){
      var jsonArr = [];
      var jsonStr, urlDivipolaMpios: any;
      var codDptoDivipola, codMpioDivipola, critSeleccDpto: string = "";
      
      console.log("Consulta registros =>",dataJSON);
      //console.log("Contenido dptos json traidos al state =>",jsonDpto);
      if (typeof dataJSON !== 'undefined' && dataJSON.length > 0)
      {
        //Normalización petición para cargue lista de municipios asociados al servicio
        critSeleccDpto   = "1=1";   //Listado de todos los municipios
        urlDivipolaMpios = await getWhere(outFieldsService.fieldOutDivipola, urls.Municipios, false, critSeleccDpto, '', '', '', '', '', '', '');
        console.log("URL consumo divipola mpios =>",urlDivipolaMpios);
        
        //Activar estado cargando lista de municipíos
        setIsLoadState(true);

        //Invocación al servicio en try .. catch
        try{          
          await fetch(urlDivipolaMpios,{
            method:"GET"
          })
          .then((rows) => {
            console.log ("State rows servicio lista Mpios =>",rows);
            if (!rows.ok)
            {
              var jsonErr: any = {};
              jsonErr = {
                "error": rows.status,
                "errorMsg": rows.statusText
              }
              throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["error"];
              return jsonErr;
              //throw new Error(`HTTP error! status: ${rows.status}`);
            }
            //Validador consumo por error del server (cód http <> 200 )
            else if (typeof (rows["error"]) !== 'undefined'){
              jsonErr = {
                "errorCode": rows["error"].code,
                "errorMsg": rows["error"].message,
                "errorDetails": rows["error"]["details"][0]
              }
              console.error("Error obteniendo lista Mpios del server =>" ,jsonErr["errorMsg"])+" " + "("+ jsonErr["errorDetails"]+ ")"+" "+"("+"código http =>"+jsonErr["errorCode"]+")";
              throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
            }
            console.log("data JSON del servicio =>",rows);
            const jsonData = rows.json();
            return jsonData;
          })
          .then((data) => {
            var jsonErr : any = {};
            if (typeof (data["error"]) !== 'undefined'){
              console.log ("Error Mpios =>",data["error"]);
              jsonErr = {
                "errorCode": data["error"].code,
                "errorMsg": data["error"].message,
                "errorDetails": data["error"].details[0]
              }
             
              console.error("Error obteniendo lista Mpios del server =>" ,jsonErr["errorMsg"]+" " + "("+ jsonErr["errorDetails"]+ ")"+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")");
              throw jsonErr["errorMsg"]+" "+"("+"código http =>"+" "+jsonErr["errorCode"]+")";
            }
            /* console.log("Contenido mpios json desde petición =>", data.features);
            console.log("Contenido longitud =>",data.features.length);*/
            //console.log("Array Mpios obtenido del depto"+" ",codDptoDivipola+"=>",data.features);
            console.log("Data mpios =>",data);
            //console.log("Contenido longitud =>",data.features.length);  
            //Validación despliegue lista municipios del server correcta     
            if (typeof data["error"] === 'undefined'){
              //Asignación lista depto y mpio desde servicio al state JSONMpio
              setJsonMpioState(data.features);
              
              //Recorrido de la data que cumple con los criterios del filtro
              for (var cont = 0; cont < dataJSON.length; cont++){
                //Validación para departamentos y municipios que no son NULL en BD
                if (dataJSON[cont].attributes.codigo_municipio !== null && dataJSON[cont].attributes.codigo_departamento !== null){
                  //Copia del código Dpto
                  codDptoDivipola = dataJSON[cont].attributes.codigo_departamento;
                  //Copia del código Mpio
                  codMpioDivipola = dataJSON[cont].attributes.codigo_municipio;
                  //Búsqueda del departamento
                  console.log("Depto Src =>",codDptoDivipola);
                  
                  //Procesamiento municipios
                  console.log("Revisión Mpio =>",dataJSON[cont].attributes.codigo_departamento);

                  //
                  //Recorrido para búsqueda de municipio desde servicio municipios
                  for (var contMpio = 0; contMpio < data.features.length; contMpio++)
                  {
                    //Caso especial, búsqueda departamento con código 11 asociado Bogotá
                    if (codDptoDivipola === codDeptoDivip.codDepto && data.features[contMpio].attributes.mpcodigo === codMpioDivipola)
                    {
                      //Asignación nombre departamento por su codigo
                      dataJSON[cont].attributes.codigo_departamento = data.features[contMpio].attributes.mpnombre;

                      //Asignación nombre municipio por su código
                      dataJSON[cont].attributes.codigo_municipio = data.features[contMpio].attributes.mpnombre;
                    }
                    //Municipios
                    else if (data.features[contMpio].attributes.decodigo === codDptoDivipola && data.features[contMpio].attributes.mpcodigo === codMpioDivipola)
                    {
                      //Asignación nombre departamento por su codigo
                      dataJSON[cont].attributes.codigo_departamento = data.features[contMpio].attributes.depto;
                      
                      //Asignación nombre municipio por su código
                      dataJSON[cont].attributes.codigo_municipio = data.features[contMpio].attributes.mpnombre;
                    }
                  }
                  
                  //Validación geometría desde el servicio
                  if (typeof dataJSON[cont].geometry !== 'undefined'){
                    jsonStr = {
                      "id": dataJSON[cont].attributes.objectid,
                      "proj": dataJSON[cont].attributes.projectnam,
                      "camp": dataJSON[cont].attributes.nombre_campana,
                      "locat": dataJSON[cont].attributes.codigo_municipio + " " + "("+dataJSON[cont].attributes.codigo_departamento + ")",
                      "phSig": dataJSON[cont].attributes.fileidenti,
                      "pointX": dataJSON[cont].geometry.x,
                      "pointY": dataJSON[cont].geometry.y,
                      "obj_id": dataJSON[cont].attributes.id_punto,
                      "covertype": dataJSON[cont].attributes.tipo_cobertura,
                      "pointLon": dataJSON[cont].attributes.longitud,
                      "pointLat": dataJSON[cont].attributes.latitud
                    }
                  }
                  //No existe geometría asociada al registro del DG
                  else
                  {
                    jsonStr = {
                      "id": dataJSON[cont].attributes.objectid,
                      "proj": dataJSON[cont].attributes.projectnam,
                      "camp": dataJSON[cont].attributes.nombre_campana,
                      "locat": dataJSON[cont].attributes.codigo_municipio + " " + "("+dataJSON[cont].attributes.codigo_departamento + ")",
                      "phSig": dataJSON[cont].attributes.fileidenti,
                      "obj_id": dataJSON[cont].attributes.id_punto,
                      "covertype": dataJSON[cont].attributes.tipo_cobertura
                    }
                  }
                  jsonArr.push(jsonStr);
                }
              }
              
              console.log("Array resultante data =>",jsonArr);
              //Seteo al state asociado a las filas del Data Grid
              setRows(jsonArr); 
            } 
            //Cuando el server presenta error de consulta
            //Data emulada para Data Grid - 2025-08-28
            else{
              console.error("Error código =>"+" "+ data["error"].code);
              //Desactivación temporal estado cargando...
              setIsLoadState (false);
              
              console.log("Data emulada para componente TablaResultados!");
              jsonStr = {
                "id": 555,
                "proj": "Proyecto Productivo de prueba",
                "camp": "Campaña de recorrido en zona de distensión",
                "locat": "Manizales" + " " + "("+ "Caldas" + ")",
                "phSig": "42010_15047_20250422_C_7_009.zip",
                "obj_id": 555,
                "covertype": "Café"
              }
              jsonArr.push(jsonStr);
              
              console.log("Array resultante data =>",jsonArr);
              //Seteo al state asociado a las filas del Data Grid
              setRows(jsonArr);
            }
          })
          .catch (errFetch => {
            console.log("Error en fetch =>",errFetch);
          }) 
        }
        catch (error)
        {
          console.log("Error cargando data del server =>", error);
          throw error;
        }
        
        //Ubicar markers según consulta
        /* console.log("Candidato marker X =>",jsonArr[0].pointX);
        console.log("Candidato marker Y =>",jsonArr[0].pointY); */
      }
      //Data simulada - 2025-08-28
      /* else{
        jsonStr = {
          "id": 555,
          "proj": "Proyecto Productivo de prueba",
          "camp": "Campaña de recorrido en zona de distensión",
          "locat": "Manizales" + " " + "("+ "Caldas" + ")",
          "phSig": "42010_15047_20250422_C_7_009.zip",
          "obj_id": 555,
          "covertype": "Café"
        }
        jsonArr.push(jsonStr);
        console.log("Array resultante data =>",jsonArr);
        //Seteo al state asociado a las filas del Data Grid
        setRows(jsonArr); 
      } */
    }
    
    /**
     * Método handleSelCoberChange => Método para procesar el dato asociado al campo Cobertura
     * @date 2025-04-08
     * @author IGAC - DIP
     * @param evt => Evento del control asociado
     * @dateUpdated 2025-08-14
     * @changes Visualizar control Coberturas 1, al seleccionar una cobertura
     * @changes Visualizar control Coberturas 2, al seleccionar una cobertura
     * @dateUpdated 2025-08-15
     * @changes Actualizar invocación método getJSONCober1, pasando el identificador del control de destino
     * @changes Inicializar control Coberturas 1, antes de obtener los valores del API
     * @dateUpdated 2025-08-19
     * @changes Fix Bug campo Coberturas 1, al asignar campo Cobertura valor [Todas]
     * @changes Fix Bug campo Coberturas 2, al asignar campo Cobertura valor [Todas]
     * @dateUpdated 2025-08-20
     * @changes Visualización / ocultamiento y limpieza campo Coberturas 1 (lista y valor), al asignar campo Cobertura valor distinto a [Todas] / al asignar valor [Todas]
     * @changes Visualización / ocultamiento y limpieza campo Coberturas 2 (lista y valor), al asignar campo Cobertura valor distinto a [Todas] / al asignar valor [Todas] 
     * @dateUpdated 2025-08-27
     * @changes Según requerimiento del 2025-08-25 sobre el ocultamiento de la opción [Todas] en campo Nivel 1, validar al cambiar valor en el campo Nivel 1 (Cobertura), oculte y limpie el campo Nivel 3.
     * @remarks Establecimiento del campo Cobertura con su state
     * @remarks Al seleccionar del campo cobertura la opción [Todos], se ocultan los controles Coberturas 1 y Coberturas 2
     * @remarks Se construye la compuesta <id> + ";" + <txt> asociado al control (2025-08-15)
     * @remarks Evento asociado al campo Nivel 1
     */
    const handleSelCoberChange = function (evt){

      //Inicialización controles dependientes => Coberturas 1 antes de cargar los valores desde el API 
      coberFilt1Lst.length = 0;
      setCoberFilt1LstState ([]);               
      
      console.log ("Verif val cober prim =>",evt.target.value);

      //Limpieza controles dependientes
      coberFilt1Lst.length  = 0;
      setCoberFilt1LstState ([]);
      coberFilt2Lst.length  = 0;
      setCoberFilt2LstState ([]);

      //Visualización campo Nivel 2 => Filtro 1
      setShowCoberFilt1State (true);
      
      //Ocultamiento, y limpieza control Coberturas 2 (Nivel 3) (listas y valor) 
      if (showCoberFilt2){
        setShowCoberFilt2State (false);
        setDisCoberFilt2State (true);
        coberFilt2Lst.length  = 0;
        setCoberFilt2LstState ([]);
        setSelCoberFilt2ValState (undefined);
      }
      //Actualización del state asociado al control Cobertura (Nivel 1)
      setCoberState (evt.target.value);
    } 

    /**
     * Método handleSelCober1Change => Método para procesar el dato asociado al campo Coberturas1
     * @date 2025-08-15
     * @author IGAC - DIP
     * @param evt
     * @dateUpdated 2025-08-19
     * @changes Actualización validador para ocultamiento control Coberturas 2
     * @dateUpdated 2025-08-20
     * @changes Habilitar / Deshabilitar y limpiar controles Coberturas 2 cuando se obtienen parámetros desde API / cuando no existan parámetros desde API
     * @dateUpdated 2025-09-05
     * @changes Fix bug campo Nivel 3, antes de cargar los nuevos valores a partir del consumo del API, borrar lista y valor correspondientes a consulta anterior.
     * @remarks basado en método handleSelCoberChange
     * @remarks Visualización / Ocultamiento campo Coberturas 2 cuando campo Coberturas 1 tiene valor distinto a [Todas] / valor igual a [Todas]
     * @remarks recepción del @param evt en target, atributo value la compuesta <id> + ";"+ <txt> del control (2025-08-15)
     * @remarks Evento asociado al campo Nivel 2
     */
    const handleSelCober1Change = function (evt){
      //Objetos locales
      var cober1Arr       = [];
      
      //Asignar valor al control Coberturas 1
      setSelCoberFilt1ValState (evt.target.value);

      //Procesamiento parámetro, para obtener el id (pos 0), y el text (pos 1) del control 
      cober1Arr = evt.target.value.split (";");

      //Validación para obtener consulta del API al control Nivel 3
      //cuando Nivel 2 no sea [Todos]
      if (evt.target.value.length > 0 && cober1Arr[0] !== '*'){
        //Limpiar valor anterior
        setSelCoberFilt2ValState (undefined); 
        //Limpiar lista
        coberFilt2Lst.length = 0;
        setCoberFilt2LstState ([]);
        //Visualizar control Nivel 3
        setShowCoberFilt2State (true);
        //Consulta valores para campo Nivel 3
        getJSONCober2 (evt.target.value, "Coberturas2");
      }
      //Validador para ocultamiento control Nivel 3
      //Valor Nivel 2 es [Todos]
      else if (cober1Arr[0] === '*')
      {
        //Deshabilitar control Coberturas 2
        setDisCoberFilt2State (true);
        //Ocultar control Coberturas 2
        setShowCoberFilt2State (false);
        //Limpiar control Coberturas 2
        setCoberFilt2LstState ([]);
        
        //Se toma el valor txt y se asigna al control Coberturas 1
        console.log ("Coberturas primarias val =>",evt.target.value);
        //Se asigna al control Coberturas 1 toda la dupla <id>+';'+<txt>
        setSelCoberFilt1ValState (evt.target.value);
      }
    }

    /**
     * Método handleSelCober2Change => Método para procesar el dato asociado al campo Coberturas2
     * @date 2025-08-15
     * @author IGAC - DIP
     * @param evt 
     * @dateUpdated 2025-08-19
     * @changes Actualizar state sobre control Coberturas 2
     * @remarks Evento asociado al campo Nivel 3
     */
    const handleSelCober2Change = function (evt){
      //Seteo del valor asociado al campo Coberturas 2
      console.log("Valor texto asociado =>",evt.target.value);
      setSelCoberFilt2ValState (evt.target.value);
    }
    /**
     * Método handleSelProyChange => Método para procesar el dato asociado al control Proyecto
     * @date 2025-04-08
     * @author IGAC - DIP
     * @param evt => Evento del control asociado
     * @dateUpdated 2025-04-22
     * @changes Llamado al método getCampaByProj, para obtener campañas asociadas, con código proyecto conocido
     * @dateUpdated 2025-07-17
     * @changes Actualización state proy con el texto asociado al control Proyecto
     * @changes Actualización objeto idProy, dividiendo el string obtenido en el value del combo Proyecto, posición 1
     * @remarks Establecimiento del campo Proyecto con su state
     * @remarks Consulta control proyectos, opción text en https://stackoverflow.com/questions/30306486/get-selected-option-text-using-react-js
     */
    const handleSelProyChange = function(evt){
      var idProy = evt.target.value.split(";")[1];
      var proyTxt = evt.nativeEvent.target.textContent;
      setProyState (evt.target.value);
      //Carga de campaña asociado el proyecto
      getCampaByProj(idProy, proyTxt);
    }

    /**
     * Método handleSelCampaChange => Método para procesar el dato asociado al control Campaña
     * @date 2025-04-08
     * @author IGAC - DIP
     * @param evt => Evento del control asociado
     * @remarks Establecimiento del campo Campaña con su state
     * 
     */    
    const handleSelCampaChange = function(evt){
      setCampaState(evt.target.value);
    }

    /**
     * Método limpiarControlesFilter => Borrado de controles asociado al componente FiltersSrcSIEC
     * @date 2025-05-16
     * @author IGAC - DIP
     * @param evt  
     * @dateUpdated 2025-05-19
     * @changes Ejecución extent inicial, al seleccionar la opción limpiar filtro / mapa     
     * @remarks Basado en método closeWidgetEvt()
     */
    const limpiarControlesFilter = function(evt: { preventDefault: () => void; })
    {
      evt.preventDefault();
      //Limpieza controles
      LimpiarControles();
      //Borrado markers anteriores      
      borradoMarkers(jimuMapView);
      //Ejecutar extent inicial
      goToInitialExtent(jimuMapView, initialExtent);
    }

    /**
     * Método LimpiarControles() => Realiza la operación de "reset" (estado inicial) de los controles según tipo: 1.Combo => Deselecciona valor; 2.Radio => Deselecciona valor; 3.Text => Borra campo
     * @date 2025-04-14
     * @author IGAC - DIP
     * @dateUpdated 2025-04-28
     * @changes Limpiar campaña al cerrar widget, para no dejar listado de campañas en la sesión anterior
     * @dateUpdated 2025-05-02
     * @changes Inicializar valor radio en Seleccionar Area por defecto
     * @dateUpdated 2025-05-05
     * @changes Inicializar coordenadas Esquina Sup Izq e Inf Der en vacío
     * @dateUpdated 2025-05-14
     * @changes Inicializar coordenadas Esquina Sup Izq e Inf Der en vacío
     * @dateUpdated 2025-06-09
     * @changes Establecer opción tipo Radio selArea => navMap
     * @dateUpdated 2025-06-11
     * @changes Borrado de los registros asociados al Data Grid
     * @changes Implementar limpiar widget TablaResultados, seleccionando la opción Limpiar
     * @changes Implementar limpiar widget Bar-Chart, seleccionando la opción Limpiar
     * @dateUpdated 2025-06-17
     * @changes Implementar limpiar opción Ayuda, estableciendo control desmarcado
     * @dateUpdated 2025-06-18
     * @changes Deshacer requerimiento 2025-06-17, ya que el control empleado para invocar ayuda, está basado en icono
     * @dateUpdated 2025-06-19
     * @changes Fix bug opción ayuda, al seleccionar la opción Limpiar (reverso requerimiento 2025-06-18). Actualización valor "" => false
     * @dateUpdated 2025-08-05
     * @changes Incluir limpieza campo Departamento
     * @changes Incluir limpieza campo Municipio
     * @dateUpdated 2025-08-12
     * @changes Habilitar opción Buscar en catálogo, sección Tipo botón
     * @dateUpdated 2025-08-13
     * @changes Limpiar y ocultar filtro campo Coberturas 1
     * @changes Limpiar y ocultar filtro campo Coberturas 2
     * @dateUpdated 2025-08-20
     * @changes Limpiar valor filtro campo Coberturas 1
     * @changes Limpiar valor filtro campo Coberturas 2
     * @dateUpdated 2025-08-21
     * @changes Reactivación limpieza widget Bar-Chart
     * @returns Estado inicial controles filtros
     */
    const LimpiarControles = function(){
      //Objetos para los widgets externos: Bar-Chart y TablaResultados
      var dataToRenderBarChart: string = "";
      var dataToRenderTablaResultados: string = "";
      
      //Tipo Combo (Select)
      setCoberState(undefined);
      setDptoSelState(undefined);
      setMpioSelState(undefined);
      mpioLst.length = 0;
      setMunicDisabState(true);
      setProyState(undefined);
      setCampaState(undefined);
      campaLst.length = 0;      
      setShowCoberFilt1State (false);
      coberFilt1Lst.length = 0;
      setSelCoberFilt1ValState (undefined);
      setShowCoberFilt2State (false);
      coberFilt2Lst.length = 0;
      setSelCoberFilt2ValState (undefined);

      //Tipo Radio
      setValueNav("navMap");
      
      //Tipo Check
      setChkValueHelpState(false);
      
      //Tipo Texto
      setValorLatState("");
      setLatPtoState("");
      setValorLatSuIzState("");
      setLatSuIzState("");
      setValorLatInDeState("");
      setLatInDeState("");
      setValorLonState("");
      setLonPtoState("");
      setValorLonSuIzState("");
      setLonSuIzState("");
      setValorLonInDeState("");
      setLonInDeState("");
      
      //Tipo botón
      setCatalBtnState (false);

      //State del Data Grid
      setRows([]);
      
      //Limpieza widgets Tabla Resultados y Bar-Chart
      dataToRenderBarChart = JSON.stringify({ dataToRows: [], labels: []})
      props.dispatch(appActions.widgetStatePropChange('widget_82', 'dataFromDispatchWidget_searchSIEC', dataToRenderBarChart));
      dataToRenderTablaResultados = JSON.stringify({ dataToRows: [] });
      props.dispatch(appActions.widgetStatePropChange('widget_81', 'dataFromDispatchWidget_searchSIEC', dataToRenderTablaResultados))   
    }

    /**
     * goToInitialExtent() => Método para obtener el extent inicial del país Colombia
     * @author IGAC - DIP
     * @date 2025-05-14
     * @param jimuMapView 
     * @param initialExtent 
     * @remarks DRA asociado al Widget Consulta Avanzada
     */
    const goToInitialExtent = (jimuMapView, initialExtent: any) => {
      if (jimuMapView && initialExtent) {
        jimuMapView.view.goTo(initialExtent, { duration: 1000 })
      }
    }
    /**
     * borradoMarkers => método para borrar los markers del mapa.
     * @date 2025-05-16
     * @author IGAC - DIP
     * @param jimuMapView
     * @dateUpdated 2025-07-25
     * @changes Borrado de los puntos resaltados desde el componente Tabla Resultados
     */
    const borradoMarkers = function (jimuMapView)
    {
      if (jimuMapView){
        jimuMapView.view.map.removeAll();
        if (typeof jimuMapView.view.graphics !== 'undefined')
        {
          jimuMapView.view.graphics.removeAll();
        }
      }
    }
    

    /**
     * Hook inicial para cargue del objeto jsonSERV, el cual contiene la data del servidor remoto (a través de acceso a Web Service de ArcGIS Map)
     * @date 2024-05-29
     * @author IGAC - DIP
     * @dateUpdated 2025-04-29
     * @changes Actualización estado sobre objeto jsonSERV
     * @changes Validación de cargue inicial, cuando el objeto jsonSERV sea vacío
     * @dateUpdated 2025-05-29
     * @changes Especificar estado "Cargando", al realizar petición de solicitud al servidor remoto
     * @remarks Método obtenido del proyecto REFA
     */
    
    useEffect(() =>
    {
      if (jsonSERV.length == 0)
      {
        //console.log("Activando cargando en hook jsonSERV...");
        setIsLoadState(true);
        getJSONData();      
      }
      
    }, [jsonSERV]);

    
    /**
     * Hook para realizar carga del listado de proyectos, asociado al state del objeto proyLst
     * @date 2025-04-22
     * @author IGAC - DIP
     * @dateUpdated 2025-05-30
     * @changes Cambio evaluación state proyLst => jsonSERV
     * @changes Actualización validación ejecución cargue lista proyectos
     */
    useEffect(() =>
    {
      console.log("Var PRoy State =>",jsonSERV);
      if (proyLst.length == 0 && jsonSERV.length > 0)
      { 
        getJSONProyectos();
      }
    }, [jsonSERV]);

    /**
     * Hook para realizar carga del listado de cobertura, asociado al state del objeto coberLst
     * @date 2025-04-22
     * @author IGAC - DIP
     * @dateUpdated 2025-06-25
     * @changes Desactivación Hook cargue cobertura, por no existir campo en servicio datos reales
     * @dateUpdated 2025-08-01
     * @changes Reactivación Hook cargue cobertura. Pendiente saber que campo mapea en servicio datos realies
     * @changes Inclusión validación consumo datos campo Cobertura
     * @dateUpdated 2025-08-06
     * @changes Fix validación (en pruebas)
     */
    useEffect(() => {
      var longRegs: number = -1;
      if (coberLst.length == 0)
      {
        getJSONCober();
      }
      if (longRegs === -1)
      {
        return;
      }
    }, [coberLst])

    /**
     * Hook para obtener los valores del state asociados a los controles Cobertura
     * @date 2025-08-19
     * @author IGAC - DIP
     * @remarks En Pruebas...
     */
    useEffect (() => {
      if (typeof selCoberVal !== 'undefined'){
        //console.log ("Valor State Cobertura =>",selCoberVal);
        getJSONCober1 (selCoberVal, "Coberturas1");
      }
    }, [selCoberVal])

    /**
     * Hook para obtener los valores asociados a los controles Cobertura y Coberturas 1
     * @date 2025-08-19
     * @author IGAC - DIP
     * @remarks En Pruebas...
     */
    useEffect (() => {
      if (typeof coberFilt1Lst !== 'undefined' && coberFilt1Lst.length > 0){ 
        console.log ("Lista Coberturas 1 =>",coberFilt1Lst);
      }
      if (typeof selCoberVal !== 'undefined' && coberFilt1Lst.length === 0){
        console.log ("Lista Coberturas 1 Long =>",coberFilt1Lst.length);
        console.log ("Valor State Cobertura =>",selCoberVal);
        setCoberState (selCoberVal);
      }
    }, [selCoberVal,coberFilt1Lst])
    /**
     * Hook Ejecución carga departamentos a la carga lista proyectos
     * @date 2025-08-04
     * @author IGAC - DIP
     */
    useEffect (() => {
      if (jsonDpto.length == 0){
        getJSONDptos();
      }
    }, [jsonDpto])
    
    /**
     * Hook para realizar carga del método componentDidUpdate(), analizando el state del widget 
     * @date 2025-05-13
     * @author IGAC - DIP
     * @dateUpdated 2025-05-29
     * @changes Importación componente ourLoading
     * @remarks Se activa hook (2025-05-29) por rendimiento en el cargue del widget
     */
    useEffect(() => {
      componentDidUpdate();
      //Importación componente ourLoading
      import('../../../../commonWidgets/widgetsModule').then(modulo => { setWidgetModules(modulo) })

    },[props.state])
    
    /**
     * Hook para realizar carga del método componentDidUpdate(), analizando el cambio en las opciones Seleccionar Area y Navegar 
     * @date 2025-05-29
     * @author IGAC - DIP
     * @remarks hook basado en el análisis del state del widget
     */ 
    
    useEffect(() => {
      componentDidUpdate();
    },[radValueNav])

    /**
     * Hook para realizar carga del método sketchHelp(), analizando el cambio en opción Ayuda
     * @date 2025-06-16
     * @author IGAC - DIP
     * @dateUpdated 2025-06-17
     * @changes invocación método sketchHelp
     * @remarks hook basado en el análisis del state del widget
     */
    useEffect(()=> {
      sketchHelp();
    }, [chkValueHelp])

    
    //Verificación de asignación estados    
    // console.log("Data asociada =>",jsonSERV);
        
    // console.log("Lista proyectos asignados al state =>",proyLst);
    // console.log("Listado coberturas asignados al state =>",coberLst);
    // console.log("Lista campañas asignados al state =>", campaLst);
    // Medida original icono w:15px h:15px
    
    return (        
          <form onSubmit={consultaCatal}>
            <div className="mb-1">
              {
                entorno === 'dev' ?
                <Label size="default">Nivel 1</Label>
              : 
                <Label size="default" className='app-root-emotion-cache-ltr-h9i97z_prod'>Nivel 1</Label>
              }
              <Select
                placeholder="Seleccione cobertura..."
                onChange={handleSelCoberChange}
                value={selCoberVal}
              >
                {
                  coberLst.map((option) => 
                    <option value={option.objectid + ";" + option.covertype}>{option.covertype}</option>
                  )
                }
              </Select>
            </div>
            {
              showCoberFilt1 &&
              <div className="mb-1">
                {
                  entorno === 'dev' ?
                  <Label size="default">Nivel 2</Label>
                  :
                  <Label size="default" className='app-root-emotion-cache-ltr-h9i97z_prod'>Nivel 2</Label>
                }
                  <Select 
                    placeholder='Especifique valor 1...'
                    value={selCoberFilt1Val}
                    onChange={handleSelCober1Change}
                    disabled={disCoberFilt1}
                  >
                    {
                      coberFilt1Lst.map ((valuesCober1) => (
                        <option value={valuesCober1.objectid + ";" + valuesCober1.covertype}>{valuesCober1.covertype}</option>
                      ))  
                    }
                  </Select>
              </div>
            }
            {
              showCoberFilt2 &&
              <div className="mb-1">
                {
                  entorno === 'dev' ?
                  <Label size="default">Nivel 3</Label>
                  :
                  <Label size="default" className='app-root-emotion-cache-ltr-h9i97z_prod'>Nivel 3</Label>
                }
                <Select 
                    placeholder='Especifique valor 2...'
                    value={selCoberFilt2Val}
                    onChange={handleSelCober2Change}
                    disabled={disCoberFilt2}
                >
                {
                  coberFilt2Lst.map ((valuesCober2) => (
                    <option value={valuesCober2.objectid + ";" + valuesCober2.covertype}>{valuesCober2.covertype}</option>
                  ))
                } 
                </Select>
              </div>
            }
            
            <div className="mb-1 proyCampaSecc">
              {
                entorno === 'dev' ?
                <Label size="default">Departamento</Label>
                :
                <Label size="default" className='app-root-emotion-cache-ltr-h9i97z_prod'>Departamento</Label>
              }
              <Select
                placeholder="Especifique departamento..."
                onChange={handleSelDptoChange}
                value={dptoSel}
              >
                {
                  jsonDpto.length > 0 && jsonDpto.map ((dptoItem) => (
                    <option value={dptoItem.attributes.decodigo}>{dptoItem.attributes.denombre}</option>
                    )
                  )
                }
              </Select>
            </div>
            <div className="mb-1">
            {
              entorno === 'dev' ?
              <Label size="default">Municipio</Label>
              :
              <Label size="default" className='app-root-emotion-cache-ltr-h9i97z_prod'>Municipio</Label>
            }
              <Select  
                placeholder="Especifique municipio..."
                disabled={municDisab}
                value={mpioSel}
                onChange={handleSelMpioChange}
              >
                {
                  mpioLst.length > 0 && mpioLst.map ((mpioItem) => (
                    <option value={mpioItem.attributes.mpcodigo}>{mpioItem.attributes.mpnombre}</option>
                  ))
                }
              </Select>
            </div>
            <div className="mb-1 proyCampaSecc">
            {
              entorno === 'dev' ?
                <Label size="default">Proyecto</Label>
                :
                <Label size="default" className='app-root-emotion-cache-ltr-h9i97z_prod'>Proyecto</Label>
            }
                <Select
                    placeholder="Especifique proyecto..."
                    onChange={handleSelProyChange}
                    value={selProyVal}
                  >
                  {
                    proyLst.length > 0 && proyLst.map(
                      (option) => (
                        <option value={option.projectname+";"+option.objectid}>{option.projectname}</option>
                        )
                      )
                    }
                </Select>
            </div>
            <div className="mb-1">
            {
              entorno === 'dev' ?
              <Label size="default"> Campaña </Label>
              :
              <Label size="default" className='app-root-emotion-cache-ltr-h9i97z_prod'> Campaña </Label>
            }
              <Select                
                placeholder="Especifique campaña..."
                onChange={handleSelCampaChange}
                value={selCampaVal}
                >
                {
                    campaLst.length > 0 && campaLst.map(
                    (option)=>(
                      <option value={option.campananame}>{option.campananame}</option>
                  ))
                }
              </Select>
            </div>
            <div role='radiogroup' className='alignRad'>
              <Label className='d-flex alignLab' >
                <Radio 
                  checked={radValueNav === 'selArea'}      
                  value='selArea'
                  name="rbtn-coordGeo"       
                  onChange={handleRadChange}
                  >                
                </Radio>
                &nbsp;Seleccionar Área
              </Label>
              <Label className='d-flex alignLab2'>
                <Radio
                  checked={radValueNav === 'navMap'} 
                  name="rbtn-coordGeo" 
                  value='navMap'                  
                  onChange={handleRadChange}
                  >                  
                </Radio>
                &nbsp;Navegar
              </Label>
              <Label className='d-flex alignLab2'>
                <img width="15px" height="15px" className='helpIcn' src={`${pathDataGridSIEC.path}/images/ayudaBuscFE.png`} onClick={handleHelpChange} title={"Ayuda"}></img>
              </Label>
            </div>
            <div className="mb-1 coordGeoSecc" style={{display: 'none'}}>
              <Label size="default"> Coordenadas geográficas (grados decimales)  </Label>
            </div>
            <div className="mb-1" style={{display: 'none'}}>
                <Label size="default">Esquina superior izquierda</Label>
            </div>
            <div className="alignCoordInfDer" style={{display: 'none'}}>
                <TextInput                  
                  placeholder="Latitud"                  
                  className="mb-4 latit_txt"
                  value={txtValorLat == '' ? latSuIz : latPto}
                  onChange={handleTxtChangevalor}
                  readOnly
                  maxLength={7}
                > 
                </TextInput>
                {/* <Label>&nbsp;</Label> */}
                <TextInput                  
                  placeholder="Longitud"
                  className="mb-4 long_txt"
                  value={txtValorLon == '' ? lonSuIz: lonPto}                  
                  onChange={handleTxtChangevalorLon}
                  readOnly
                  maxLength={7}
                  >
                </TextInput>                
              </div>
              <div className="mb-1" style={{display: 'none'}}>
                <Label size="default">Esquina inferior derecha</Label>
              </div>
              <div className="alignCoordInfDer" style={{display: 'none'}}>
                <TextInput                  
                  placeholder="Latitud"                  
                  className="mb-4 latit_txt"
                  value={txtValorLat == '' ? latInDe : latPto}
                  onChange={handleTxtChangevalor}
                  readOnly
                  maxLength={7}
                > 
                </TextInput>
                {/* <Label>&nbsp;</Label> */}
                <TextInput                  
                  placeholder="Longitud"
                  className="mb-4 long_txt"
                  value={txtValorLon == '' ? lonInDe : lonPto}
                  onChange={handleTxtChangevalorLon}
                  readOnly
                  maxLength={7}
                  >
                </TextInput>
              </div>
              <div className="btns">
                <Button
                  htmlType="submit"              
                  size="default"
                  type="default"
                  disabled={catalBtnDis}
                >
                  Buscar en catálogo
                </Button>
                <Button
                   size="default"
                   type="default"
                   onClick={limpiarControlesFilter} 
                >Limpiar</Button>
              </div>
              <div className="mb-1 accessBNEcls">
                <a href={urls.firmasEspAccessToBNE} target="_blank"><img src={ pathDataGridSIEC.path + '/'+ pathDataGridSIEC.folderimg + '/Logo_BNE.png'} width="50" height="50"></img></a>
              </div>
          </form>        
    );
}
export default FiltersSrcSIEC;