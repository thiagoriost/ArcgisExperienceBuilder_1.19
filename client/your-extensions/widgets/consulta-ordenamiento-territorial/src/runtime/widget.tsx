/** @jsx jsx */
import { React, jsx, AllWidgetProps } from 'jimu-core'

const { useEffect, useState, useRef, useCallback } = React
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis'
import { Link } from 'jimu-ui';

import { IMConfig } from '../config';

import '../../../utils/styles/consulta-widget.css'
import '../styles/style.css'

import SelectDesdeArray from '../../../consulta-salud/src/runtime/components/SelectDesdeArray';
import SelectMunicipio, { listaMunicipios } from '../../../consulta-salud/src/runtime/components/SelectMunicipio';
import { ArcGisFeature, ArcGisField, SelectOption } from '../../../consulta-salud/src/runtime/types';
import { useCancelableHttp } from '../../../shared/hooks/useCancelableHttp';
import { ArcgisService } from '../../../shared/services/arcgis.service';
import { handleError } from '../../../consulta-salud/src/runtime/util';
import { ConsultaComponentHandle } from '../../../consulta-salud/src/runtime/consulta-general-types';
import ConsultaNormatividad from './components/ConsultaNormatividad';
import { SearchActionBar } from '../../../shared/components/search-action-bar';
import ConsultaEstrato from './components/ConsultaEstrato';
import { useDibujarFeatures } from '../../../shared/hooks/useDibujarFeatures';
import ConsultaClasificacion from './components/ConsultaClasificacion';
import { captureInitialMapView, resetToDefaultMapView } from '../../../shared/utils/widget-limpieza-utils';
import dbIcon from '../assets/database-solid-full.svg'
import pdfIcon from '../assets/file-pdf-solid-full.svg'

const arcgisService = new ArcgisService()

export default function Widget (props: AllWidgetProps<IMConfig>) {    
    const tiposConsulta = [
        { value: 'normatividad', label: 'Normatividad de uso del suelo' },
        { value: 'estrato', label: 'Viviendas por estrato socioeconómico' },
        { value: 'clasificacion', label: 'Clasificación de uso del suelo' }
    ];

    const [tipoConsulta, setTipoConsulta] = useState('normatividad');
    const [municipios, setMunicipios] = useState<SelectOption[]>([])
    const [idMunicipio, setIdMunicipio] = useState<string>('')
    const [loading, setLoading] = useState(false);
    const [jimuMapView, setJimuMapView] = useState<JimuMapView | null>(null);
    const initialExtentRef = useRef<__esri.Extent | null>(null)
    const initialZoomRef = useRef<number | null>(null)
    const initialScaleRef = useRef<number | null>(null)
    const [mensaje, setMensaje] = useState('');
    const [fichaPdfUrl, setFichaPdfUrl] = useState('');
    const [fichaPdfMensaje, setFichaPdfMensaje] = useState('');

    const [resultadosADibujar, setResultadosADibujar] = useState<{
        features: ArcGisFeature[]
        fields: ArcGisField[]
        spatialReference?: __esri.SpatialReference
    } | null>(null);

    const { execute, cancelAll } = useCancelableHttp()
    const cancelAllRef = useRef(cancelAll);

    useEffect(() => {
        const cargarMunicipios = async () => {
            setLoading(true)
            try {
                const lista = await listaMunicipios(execute, arcgisService)
                setMunicipios(lista ?? [])
            } catch (error) {
                setMunicipios([])
            } finally {
                setLoading(false);
            }
        }          

        void cargarMunicipios();      
    }, []);

    useEffect(() => {
        return () => {
            cancelAllRef.current()
        }
    }, []);

    useEffect(() => {  
        setMensaje('');
        setFichaPdfUrl('');
        setFichaPdfMensaje('');
    }, [tipoConsulta]);

    useEffect(() => {
        cancelAllRef.current = cancelAll
    }, [cancelAll]);
   
    const refs = {
        normatividad: useRef<ConsultaComponentHandle>(null),
        estrato: useRef<ConsultaComponentHandle>(null),
        clasificacion: useRef<ConsultaComponentHandle>(null)
    }

    const activeViewChangeHandler = (view: JimuMapView) => {
        if (!view) return

        setJimuMapView(view)
        captureInitialMapView(view, { initialExtentRef, initialZoomRef, initialScaleRef })
    }

    useDibujarFeatures({
        jimuMapView,
        features: resultadosADibujar?.features ?? [],
        fields: resultadosADibujar?.fields ?? [],
        spatialReference: resultadosADibujar?.spatialReference,
        layerId: 'consulta-ordenamiento-territorial',
        groupLayerId: 'capas-temporales',
        title: 'Resultados ordenamiento territorial',
        enabled: true,
        zoom:20
    })

    const consultar = async () => {
        const result = await refs[tipoConsulta].current.consultar();        
        setMensaje(`${result?.features?.length ?? 0} registros encontrados`)
        setResultadosADibujar(result)
    }

    // Esto se usa para limpieza
    const clearResults = useCallback(() => {
        setResultadosADibujar(null)
    }, [])

    // Esto se usa para limpieza
    const resetMapView = useCallback(() => {
        resetToDefaultMapView(jimuMapView, { initialExtentRef, initialZoomRef, initialScaleRef })
    }, [jimuMapView])

    // Esto se usa para limpieza
    const onLimpiar = useCallback(() => {
        refs[tipoConsulta].current?.limpiar()

        setMensaje('')
        setFichaPdfUrl('')
        setFichaPdfMensaje('')

        clearResults()
        resetMapView()
    }, [clearResults, resetMapView, tipoConsulta])

    // Esto se usa para limpieza
    useEffect(() => {
        if (props.state === 'CLOSED') {
            cancelAll()
            onLimpiar()
        }
    }, [props.state, cancelAll, onLimpiar])
    
    return (
        <div className="consulta-widget" >             
            <div style={{ position: 'absolute', width: 0, height: 0 }}>
                <JimuMapViewComponent
                useMapWidgetId={props.useMapWidgetIds?.[0]}
                onActiveViewChange={activeViewChangeHandler}
                />
            </div>

            <SelectDesdeArray label={"Consulta por"} valor={tipoConsulta} setValor={setTipoConsulta} 
            array={tiposConsulta} disabled={loading} />

            {tipoConsulta === 'normatividad' && (
                <ConsultaNormatividad url={props.config.endpointOrdenamientoTerritorial} 
                urlArchivos={props.config.endpointArchivos} execute={execute} arcgisService={arcgisService}
                handleError={handleError} loading={loading} setLoading={setLoading} municipios={municipios} idMunicipio={idMunicipio} 
                setIdMunicipio={setIdMunicipio} ref={refs.normatividad} setMensaje={setMensaje} setFichaPdfUrl={setFichaPdfUrl}
                setFichaPdfMensaje={setFichaPdfMensaje}/>
            )}

            {tipoConsulta === 'estrato' && (
                <ConsultaEstrato url={props.config.endpointOrdenamientoTerritorial} execute={execute} arcgisService={arcgisService}
                handleError={handleError} loading={loading} setLoading={setLoading} municipios={municipios} idMunicipio={idMunicipio} 
                setIdMunicipio={setIdMunicipio} ref={refs.estrato} />
            )}
            
            {tipoConsulta === 'clasificacion' && (
                <ConsultaClasificacion url={props.config.endpointOrdenamientoTerritorial} execute={execute} arcgisService={arcgisService}
                handleError={handleError} loading={loading} setLoading={setLoading} municipios={municipios} idMunicipio={idMunicipio} 
                setIdMunicipio={setIdMunicipio} ref={refs.clasificacion} />
            )}

            {(mensaje || fichaPdfUrl || fichaPdfMensaje) && (
                <div className="consulta-widget__resultado-row">
                    {mensaje && (
                        <span className="consulta-widget__resultado-mensaje">
                            <img src={dbIcon} alt="" className="consulta-widget__resultado-icon" />
                            {mensaje}
                        </span>
                    )}
                    {fichaPdfMensaje && (
                        <span>{fichaPdfMensaje}</span>
                    )}
                    {fichaPdfUrl && (
                        <Link
                            href={fichaPdfUrl}
                            target="_blank"
                            className="consulta-widget__link-boton"
                        >
                            <img src={pdfIcon} alt="" className="consulta-widget__link-boton-icon" />
                            Ver ficha
                        </Link>
                    )}
                </div>
            )}
            
            {/*tipoConsulta === 'normatividad' && (
                <div>
                    <Link href={`${props.config.endpointArchivos}${urlFicha}`} target="_blank">
                        Ver fichaaa
                    </Link>                
                </div>
            )*/}

            <SearchActionBar
            onSearch={consultar}
            onClear={onLimpiar}
            loading={loading}
            searchLabel="Buscar"
            helpText="Ingrese una condición de búsqueda válida para habilitar el botón de busqueda. Utilice los campos, valores y operadores para construir su consulta. Por ejemplo: CAMPO1 = 'Valor' AND CAMPO2 > 100."
            />
        </div>
    )
   //return (<div style={{backgroundColor: 'lightgray'}}>des</div>)
}
