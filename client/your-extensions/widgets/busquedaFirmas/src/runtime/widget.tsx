import { React, type AllWidgetProps } from 'jimu-core'
import Sketch from "@arcgis/core/widgets/Sketch";
import type { IMConfig } from '../config'
import { type JimuMapView, JimuMapViewComponent } from 'jimu-arcgis'
import FiltersSrcSIEC from '../components/FiltersSrcSIEC'
import { InterfaceMensajeModal, InterfaceResponseBusquedaFirmas, typeMSM } from '../types/InterfaceResponseBusquedaFirmas'
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import DialogsSrcSIEC from '../components/dialogsSrcSIEC';
import { pathDataGridSIEC } from '../types/dataDG';

const { useEffect, useState } = React

const WidgetBusquedaFirmas = (props: AllWidgetProps<IMConfig>) => {
  console.log(888888,"WidgetBusquedaFirmas")
  const [jimuMapView, setJimuMapView] = useState<JimuMapView>()
  const [view, setView] = useState(null);
  const [initialExtent, setInitialExtent] = useState<__esri.Extent>(null)
  const [utilsModule, setUtilsModule] = useState(null)
  const [widgetModules, setWidgetModules] = useState(null)
  const [servicios, setServicios] = useState(null)
  /** FiltersSrcSIEC  */
  const [jsonSERV, setJsonSERV] = useState([]);
  const [selCoberVal, setCober] = useState<number>();
  const [coberLst, setCoberLst] = useState([]);
  const [showCoberFilt1, setShowCoberFilt1] = useState<boolean>(false);
  const [disCoberFilt1, setDisCoberFilt1] = useState<boolean>(false);
  const [showCoberFilt2, setShowCoberFilt2] = useState<boolean>(false);
  const [disCoberFilt2, setDisCoberFilt2] = useState<boolean>(false);
  const [selCoberFilt1Val, setSelCoberFilt1Val] = useState<number>();
  const [selCoberFilt2Val, setSelCoberFilt2Val] = useState<number>();
  const [coberFilt1Lst, setCoberFilt1Lst] = useState([]);
  const [coberFilt2Lst, setCoberFilt2Lst] = useState([]);
  const [radValueNav, setValueNav] = useState<number>(1); 
  const [txtValorLat, setValorLat] = useState<string>("");
  const [txtValorLatSupIzq, setValorLatSupIzq] = useState<string>("");
  const [txtValorLatInfDer, setValorLatInfDer] = useState<string>("");
  const [txtValorLon, setValorLon] = useState<string>("");
  const [txtValorLonSupIzq, setValorLonSupIzq] = useState<string>("");
  const [txtValorLonInfDer, setValorLonInfDer] = useState<string>("");
  const [lonPtoFilter, setLonPtoFilter] = useState<number>(0);
  const [latPtoFilter, setLatPtoFilter] = useState<number>(0);
  const [lonSupIzqFilter, setLonSupIzqFilter] = useState<number>(0);
  const [latSupIzqFilter, setLatSupIzqFilter] = useState<number>(0);
  const [lonInfDerFilter, setLonInfDerFilter] = useState<number>(0);
  const [latInfDerFilter, setLatInfDerFilter] = useState<number>(0);
  const [selProyVal, setProy] = useState<number>();
  const [proyLst, setProyLst] = useState([]);
  const [selCampaVal, setCampa] = useState<number>();
  const [campaLst, setCampaLst] = useState([]);
  const [ResponseBusquedaFirma, setResponseBusquedaFirma] = useState<InterfaceResponseBusquedaFirmas>();
  const [alertDial, setAlertDial] = useState(false);
  const [mensModal, setMensModal] = useState<InterfaceMensajeModal>({
      deployed: false,
      type: typeMSM.info,
      tittle: "",
      body: "",
      subBody: "",
    });
  const [controlForms, setControlForms] = useState(false);
  const [rows, setRows] = useState([]);
  const [sketchSt, setSketch] = useState<Sketch>();
  const [jsonDpto, setJsonDpto] = useState([]);
  const [jsonMpio, setJsonMpio] = useState([]);
  const [dptoVal, setDptoVal] = useState<number>();
  const [municLst, setMunicLst] = useState([]);
  const [mpioVal, setMpioVal] = useState<number>();
  const [municDisab, setMunicDisab] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [catalBtnDis, setCatalBtnDis] = useState<boolean>(true);
  const [chkValueHelp, setChkValueHelp] = useState<boolean>(false);




  /**
     * Guarda la vista activa del mapa para operar con capas y navegación.
     *
     * @param {JimuMapView} jmv Vista activa de Experience Builder.
     * @returns {void}
  */
  const activeViewChangeHandler = (jmv: JimuMapView) => {
    let sketchWeb: Sketch;
    let objJSON: any = "";
    if (utilsModule?.logger()) console.log('Ingresando al evento objeto JimuMapView...')
    if (jmv) {
      setJimuMapView(jmv)

      const layerWeb = new GraphicsLayer();
      jmv.view.map.add(layerWeb);

      setInitialExtent(jmv.view.extent) // Guarda el extent inicial

      //Atributos del widget Sketch configurados con el objeto definido - 2025-06-13
      objJSON = {
        createTools: {
          point: false,
          polyline: false,
          polygon: false,
          circle: false,
          rectangle: true,
          multipoint: false,
        },
        selectionTools: {
          "custom-selection": false,
          "lasso-selection": false,
          "rectangle-selection": false,
        },
        settingsMenu: false,
        undoRedoMenu: false,
      };

      if (typeof sketchWeb === "undefined") {
        sketchWeb = new Sketch({
          layer: layerWeb,
          view: jmv.view,
          creationMode: "single",
          availableCreateTools: ["rectangle"],
          visibleElements: objJSON,
        });
      }
      setSketch(sketchWeb);


    }
  

  }


  useEffect(() => {
    // setResponseConsulta(dataPruebaResponse)
    import('../../../commonWidgets/widgetsModule').then(modulo => { setWidgetModules(modulo) })
    import('../../../utils/module').then(modulo => { setUtilsModule(modulo) })
    import('../../../api/servicios').then(modulo => { setServicios(modulo) })
    return () => {
      // Acción a realizar cuando el widget se cierra.
      if (utilsModule?.logger()) console.log('El widget se cerrará')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showHideStates = (show: boolean) => {
  
      const mostrarEstados = () =>{
        console.log({
          jsonSERV,
          selCoberVal,
          coberLst,
          showCoberFilt1,
          disCoberFilt1,
          showCoberFilt2,
          disCoberFilt2,
          selCoberFilt1Val,
          selCoberFilt2Val,
          coberFilt1Lst,
          coberFilt2Lst,
          radValueNav,
          txtValorLat,
          txtValorLatSupIzq,
          txtValorLatInfDer,
          txtValorLon,
          txtValorLonSupIzq,
          txtValorLonInfDer,
          lonPtoFilter,
          latPtoFilter,
          lonSupIzqFilter,
          latSupIzqFilter,
          lonInfDerFilter,
          latInfDerFilter,
          selProyVal,
          proyLst,
          selCampaVal,
          campaLst,
          ResponseBusquedaFirma,
          alertDial,
          mensModal,
          controlForms,
          rows,
          sketchSt,
          jsonDpto,
          jsonMpio,
          dptoVal,
          municLst,
          mpioVal,
          municDisab,
          isLoading,
          catalBtnDis,
          chkValueHelp,
          pathDataGridSIEC
        })
      }
      const limpiarEstados = () =>{
        


      }
      show ? mostrarEstados() : limpiarEstados();
      alert("Continuar con esta logica para mostrar/limpiar estados en consola");
    }

  return (
     <div className="w-100 p-3 bg-primary text-white">
      <button onClick={() => showHideStates(true)}>
        Mostrar Estado
      </button>
      <button onClick={() => showHideStates(false)}>
        Ocultar Estado
      </button>

      {props.useMapWidgetIds && props.useMapWidgetIds.length === 1 && (
        <JimuMapViewComponent
          useMapWidgetId={props.useMapWidgetIds?.[0]}
          onActiveViewChange={activeViewChangeHandler}
        />
      )}

      

      {
        alertDial && (
          //? showDialog("No se cumplen los criterios!")
          <DialogsSrcSIEC
            setAlertDial={setAlertDial}
            mensModal={mensModal}
            setMensModal={setMensModal}
            classCss={"reqValidator"}
          ></DialogsSrcSIEC>
        )
      }
     {/*
      {alertDial ? (
        //? showDialog("No se cumplen los criterios!")
        <DialogsSrcSIEC
          setAlertDial={setAlertDial}
          mensModal={mensModal}
          setMensModal={setMensModal}
          classCss={"reqValidator"}
        ></DialogsSrcSIEC>
      ) : null}
      {false  &&
        widgetModules?.TABLARESULTADOS_SIEC({
          rows,
          columns,
          view,
          setControlForms,
          jimuMapView,
          setResponseBusquedaFirma,
          typeGraphMap,
          setAlertDial,
          setMensModal,
          pagination: true,
          paginationModel,
          setPaginationModel,
          files,
          setFiles,
          modalDetail,
          setModalDetail,
          props,
          initialExtent,
          modalHead,
          setModalHead,
          modalBody,
          setModalBody,
          jsonDpto,
          setJsonDpto,
          jsonMpio,
          setJsonMpio,
        })}
      {true  && (*/
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
        ></FiltersSrcSIEC>/*
      )}
      {isLoading && widgetModules?.OUR_LOADING()} */}
    </div>
  )
}

export default WidgetBusquedaFirmas
