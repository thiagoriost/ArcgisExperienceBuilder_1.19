/** @jsx jsx */
import { React, jsx, AllWidgetProps } from 'jimu-core'
import { Button } from 'jimu-ui'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
//@ts-expect-error
import '../../../utils/styles/consulta-widget.css'
const { useEffect, useState, useRef, useCallback } = React

import { urls } from '../../../api/serviciosQuindio'
import { WIDGET_IDS } from '../../../shared/constants/widget-ids'
import { ArcgisService } from '../../../shared/services/arcgis.service'
import { HttpService } from '../../../shared/services/http.service'
import { useCancelableHttp } from '../../../shared/hooks/useCancelableHttp'
import stethoscopeIcon from '../assets/stethoscope-solid-full.svg'
import starIcon from '../assets/star-solid-full.svg'

import {
    abrirTablaResultados,
    limpiarYCerrarWidgetResultados
} from '../../../widget-result/src/runtime/widget'
import { listarCapas, queryCapa } from './util'

import ConsultaGeneral  from './components/ConsultaGeneral'
import ConsultaIndicadores from './components/ConsultaIndicadores'
import ConsultaTematicas from './components/ConsultaTematicas'
import { SearchActionBar } from '../../../shared/components/search-action-bar'
import { dibujarFeatures, limpiarFeatures } from '../../../shared/utils/dibujar-features-utils'
import { captureInitialMapView, resetToDefaultMapView } from '../../../shared/utils/widget-limpieza-utils'
import { MAP_DEFAULT_VIEW } from '../../../shared/constants/map-defaults'

import type { ConsultaComponentHandle } from './consulta-general-types'
import type {
    SelectOption,
} from './types'
import { listaMunicipios } from './components/SelectMunicipio'
import SelectDesdeArray from './components/SelectDesdeArray'
import { ResultTable } from '../../../shared/components/ResultTable'
import PanelInformativo, { itemsContacto, itemsInformacionContacto } from '../../../shared/components/PanelInformativo/PanelInformativo'
import { limpiarYCerrarwidgetLeyenda } from '../../../widget-leyenda/src/runtime/widget'

const arcgisService = new ArcgisService()
const httpService = new HttpService();

const Widget = (props: AllWidgetProps<any>) => {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('');
    const [mostrarBusqueda, setMostrarBusqueda] = useState(true);
    
    const { execute, cancelAll } = useCancelableHttp();
    const cancelAllRef = useRef(cancelAll);
    const widgetResultId = WIDGET_IDS.RESULT

    const [tipoConsulta, setTipoConsulta] = useState('')    
    const [municipios, setMunicipios] = useState<SelectOption[]>([])
    const [idMunicipio, setIdMunicipio] = useState<string>('')
    const [jimuMapView, setJimuMapView] = useState<JimuMapView>();
    const initialExtentRef = useRef<__esri.Extent | null>(null)
    const initialZoomRef = useRef<number | null>(null)
    const initialScaleRef = useRef<number | null>(null)

    const activeViewChangeHandler = (view: JimuMapView) => {
        if (!view) return

        setJimuMapView(view)
        captureInitialMapView(view, { initialExtentRef, initialZoomRef, initialScaleRef })
    }
    
    const refs = {
        general: useRef<ConsultaComponentHandle>(null), 
        indicadores: useRef<ConsultaComponentHandle>(null),
        tematicas: useRef<ConsultaComponentHandle>(null)
    };
    const previousWidgetStateRef = useRef(props.state)

    const refDatos = useRef({});

    useEffect(() => {
        const cargarMunicipios = async () => {
            setLoading(true)
            const lista = await listaMunicipios(execute, arcgisService) ?? []            
            setMunicipios(lista);
            setLoading(false);
            //setIdMunicipio((current) => current || lista?.[0]?.value || '')
        }          

        void cargarMunicipios();      
    }, []);

    useEffect(() => {
        return () => {
            cancelAllRef.current()
        }
    }, []);   

    useEffect(() => {
        cancelAllRef.current = cancelAll
    }, [cancelAll])

    // Esto se usa para limpieza
    const clearResults = useCallback(() => {
        limpiarYCerrarWidgetResultados(widgetResultId)
        limpiarFeatures(jimuMapView, 'consulta-salud-general-feature')
    }, [jimuMapView, widgetResultId])

    // Esto se usa para limpieza
    const resetMapView = useCallback(() => {
        resetToDefaultMapView(jimuMapView, { initialExtentRef, initialZoomRef, initialScaleRef })
    }, [jimuMapView])

   
    const consultar = async ()=> {   
        // Limpieza        
        limpiarYCerrarwidgetLeyenda(WIDGET_IDS.LEYENDA);
        limpiarYCerrarWidgetResultados(widgetResultId);
        limpiarFeatures(jimuMapView, 'consulta-salud-general-feature');
        void jimuMapView?.view?.goTo(MAP_DEFAULT_VIEW);

        const result = await refs[tipoConsulta].current.consultar();

        if (tipoConsulta === 'general') {
            await dibujarFeatures({
                jimuMapView,
                features: result.features,
                fields: result.fields,
                spatialReference: result.spatialReference,
                layerId: 'consulta-salud-general-feature',
                title: 'Consulta salud',
                scale: 40000,
                expandFactor: 1.5
            })
            setMostrarBusqueda(false);
            refDatos.current = {...result};
        } else {
            abrirTablaResultados(
                tipoConsulta === 'indicadores',
                result.features,
                result.fields,
                props,
                widgetResultId,
                result.spatialReference,
                "Resultados - Consulta de salud",
                result.withGraphic
            )            
        }              
    }

    // Esto se usa para limpieza
    const onLimpiar = useCallback(() => {
        if (tipoConsulta == '') 
            return;

        refs[tipoConsulta].current?.limpiar()

        setTipoConsulta('');
        setMostrarBusqueda(true)
        setMessage('')

        clearResults()
        resetMapView()
    }, [clearResults, resetMapView, tipoConsulta])

    // Esto se usa para limpieza
    useEffect(() => {
        const wasClosed = previousWidgetStateRef.current === 'CLOSED'
        const isClosed = props.state === 'CLOSED'

        previousWidgetStateRef.current = props.state

        if (!isClosed || wasClosed) return

        cancelAllRef.current()
        limpiarYCerrarWidgetResultados(widgetResultId)
        limpiarFeatures(jimuMapView, 'consulta-salud-general-feature')
        void jimuMapView?.view?.goTo(MAP_DEFAULT_VIEW)

        if (tipoConsulta === '') return

        refs[tipoConsulta].current?.limpiar()
        setTipoConsulta('')
        setMostrarBusqueda(true)
        setMessage('')
    }, [props.state])

    const tiposConsulta = [
        { value: 'general', label: 'General' },
        { value: 'indicadores', label: 'Indicadores' },
        { value: 'tematicas', label: 'Temáticas' }
    ];    

    const capacidadesItems = Array.isArray(refDatos.current.cgCapacidades)
    ? refDatos.current.cgCapacidades.map((item) => ({
        label: item.attributes.TIPO_CAPACIDAD,
        value: String(item.attributes.VALORCAPACIDAD ?? '')
        }))
    : [];
    
    const serviciosItems = Array.isArray(refDatos.current.cgServicios)
    ? refDatos.current.cgServicios.map((item) => ({
        value: item.attributes.TIPO_SERVICIO
        })).sort((a: any, b: any) => a.value.localeCompare(b.value))
    : [];

    return (
        <div className="consulta-widget">
            <div style={{ position: 'absolute', width: 0, height: 0 }}>
                <JimuMapViewComponent
                    useMapWidgetId={props.useMapWidgetIds?.[0]}
                    onActiveViewChange={activeViewChangeHandler}
                />
            </div>
            <div style={{ display: mostrarBusqueda ? 'block' : 'none' }}>
                <FormularioDeBusqueda
                    tiposConsulta={tiposConsulta}
                    tipoConsulta={tipoConsulta}
                    setTipoConsulta={setTipoConsulta}
                    refs={refs}
                    loading={loading}
                    setLoading={setLoading}
                    execute={execute}
                    props={props}
                    idMunicipio={idMunicipio}
                    setIdMunicipio={setIdMunicipio}
                    municipios={municipios}
                    message={message}
                    setMessage={setMessage}
                    consultar={consultar}
                    limpiar={onLimpiar}/>
            </div>

            <div className="consulta-widget" style={{ display: mostrarBusqueda ? 'none' : 'block' }}>                
                <PanelInformativo
                    imagenUrl={refs.general.current?.getFeatures()?.[0]?.attributes?.['FOTOS']
                        ? `https://sigquindio.gov.co/ArchivosQuindioIII/${refs.general.current.getFeatures()[0].attributes['FOTOS']}`
                        : ''
                    }
                    titulo={ refs.general.current?.getFeatures()?.[0]?.attributes["NOMBREEQUIPAMIENTO"]}
                    listaIconoTextoItems={
                        /*
                        [ {iconoSrc: starIcon, iconoAlt:"Estrella", texto:"Item importante", valor:refs.general.current?.getFeatures()?.[0]?.attributes["HORARIOS"]}]    
                        */
                        itemsContacto({
                            horario: refs.general.current?.getFeatures()?.[0]?.attributes["HORARIOS"],
                            direccion: refs.general.current?.getFeatures()?.[0]?.attributes["DIRECCION"],
                            telefono: refs.general.current?.getFeatures()?.[0]?.attributes["TELEFONO"],
                        })
                    }
                    chipsIconoTextoTitulo={"capacidades"}
                    chipsIconoTextoItems={capacidadesItems}
                    chipsIconoTextoIcono={stethoscopeIcon}                              
                    chipsTextoTitulo={"servicios"}
                    chipsTextoItems={serviciosItems}              
                    botonOnClick={() => setMostrarBusqueda(true)} />
            </div>
        </div>
    )
}

function FormularioDeBusqueda({tiposConsulta, tipoConsulta, setTipoConsulta, refs, loading, setLoading, execute, props, idMunicipio, setIdMunicipio, 
    municipios, message, setMessage, consultar, limpiar}: any) {
    const [canSearch, setCanSearch] = React.useState(false)

    React.useEffect(() => {
        setCanSearch(false)
    }, [tipoConsulta])

    return (
    <div className="consulta-widget" >
            <SelectDesdeArray label={"Consulta por"} valor={tipoConsulta} setValor={setTipoConsulta} 
            array={tiposConsulta} disabled={loading}  />

            {tipoConsulta === 'general' && (
                <ConsultaGeneral
                arcgisService={arcgisService}
                httpService={httpService}
                ref={refs.general}
                loading={loading}
                setLoading={setLoading}
                execute={execute}
                url={urls.SERVICIO_SALUD}
                urlAlfanumerico={urls.SERVICIO_SALUD_ALFANUMERICO}
                idMunicipio={idMunicipio}
                setIdMunicipio={setIdMunicipio}
                municipios={municipios}
                message={message}
                setMessage={setMessage}
                onValidityChange={setCanSearch} />
            )}

            {tipoConsulta === 'indicadores' && (           
                <ConsultaIndicadores            
                arcgisService={arcgisService}
                httpService={httpService}
                ref={refs.indicadores}
                loading={loading}
                setLoading={setLoading}
                execute={execute}
                url={urls.SERVICIO_SALUD_ALFANUMERICO}
                setMessage={setMessage}
                onValidityChange={setCanSearch} />
            )}

            {tipoConsulta === 'tematicas' && (
                <ConsultaTematicas
                arcgisService={arcgisService}
                httpService={httpService}
                ref={refs.tematicas}
                loading={loading}
                setLoading={setLoading}
                idMunicipio={idMunicipio}
                setIdMunicipio={setIdMunicipio}
                municipios={municipios}
                execute={execute}
                url={urls.SERVICIO_SALUD_ALFANUMERICO}
                setMessage={setMessage}
                onValidityChange={setCanSearch} />
            )}

            <SearchActionBar
            onSearch={consultar}
            onClear={limpiar}
            loading={loading}
            disableSearch={!canSearch}
            searchLabel="Buscar"
            helpText="Consulte información de salud del departamento seleccionando el tipo de consulta y los filtros disponibles. Puede buscar equipamientos, indicadores o temáticas por municipio para visualizar resultados en el mapa, tabla o panel informativo."
            />

            <div>
                {message}  
            </div>
        </div>
    )
}

export default Widget
