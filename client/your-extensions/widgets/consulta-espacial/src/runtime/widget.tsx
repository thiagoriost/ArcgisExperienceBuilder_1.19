import { React, type AllWidgetProps } from 'jimu-core'
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel'
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils'
import { Button, Icon } from 'jimu-ui'

import SelectDesdeArray from '../../../consulta-salud/src/runtime/components/SelectDesdeArray';
import { urls } from '../../../api/serviciosQuindio'

import '../../../utils/styles/consulta-widget.css';
import { loadLayers } from '../../../shared/services/queryMapServer.service';
import type { LayerInfo } from '../../../shared/types/types_consultaAvanzadaAlfanumerica';
import { WIDGET_IDS } from '../../../shared/constants/widget-ids';
import { MAP_DEFAULT_VIEW } from '../../../shared/constants/map-defaults';
import { adjustFieldsForResultsWidget, featuresFixed } from '../../../shared/utils/export.utils';
import { abrirTablaResultados, limpiarYCerrarWidgetResultados } from '../../../widget-result/src/runtime/widget';

const { useCallback, useEffect, useRef, useState } = React

const RECTANGLE_SELECT_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M3 4h10v8H3V4Zm1 1v6h8V5H4Z"/><path fill="currentColor" d="M1 1h3v1H2v2H1V1Zm11 0h3v3h-1V2h-2V1ZM1 12h1v2h2v1H1v-3Zm13 0h1v3h-3v-1h2v-2Z"/></svg>'
const POLYGON_SELECT_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M7.8 1.2 14 4.5v6.2l-5.7 4.1-6.3-2.6V5.7l5.8-4.5Zm.1 1.2L3 6.2v5.3l5.1 2.1 4.9-3.5v-5L7.9 2.4Z"/><path fill="currentColor" d="M7 1h2v2H7V1ZM1 5h3v3H1V5Zm11-1h3v3h-3V4ZM1 10h3v3H1v-3Zm6 3h3v3H7v-3Zm6-4h2v3h-2V9Z"/></svg>'

const Widget = (props: AllWidgetProps<any>) => {
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [idServicio, setIdServicio] = useState<string>('');
    const [idGrupo, setIdGrupo] = useState<string>('');
    const [grupos, setGrupos] = useState<Array<{ value: string, label: string }>>([]);
    const [idCapa, setIdCapa] = useState<string>('');
    const [capas, setCapas] = useState<Array<{ value: string, label: string }>>([]);
    const [layers, setLayers] = useState<LayerInfo[]>([]);
    const [jimuMapView, setJimuMapView] = useState<JimuMapView | null>(null);
    const [selectionActive, setSelectionActive] = useState<'rectangle' | 'polygon' | null>(null);
    const [selectionCount, setSelectionCount] = useState<number | null>(null);
    const featureLayerRef = useRef<FeatureLayer | null>(null);
    const selectionLayerRef = useRef<GraphicsLayer | null>(null);
    const sketchViewModelRef = useRef<SketchViewModel | null>(null);
    const selectedHighlightRef = useRef<any>(null);
    const previousWidgetStateRef = useRef(props.state);
    const selectionRunRef = useRef(0);
    const widgetResultId = WIDGET_IDS.RESULT;

    const servicios = [
        {value: 'CARTOGRAFIA_BASICA', label: 'Cartografía Básica', url: urls.SERVICIO_CARTOGRAFIA_BASICA, tieneGroupLayers:true},
        {value: 'AMBIENTAL', label: 'Ambiental', url: urls.SERVICIO_AMBIENTAL, tieneGroupLayers:true},
        {value: 'EDUCACION', label: 'Educación', url: urls.SERVICIO_EDUCACION, tieneGroupLayers:false},
        {value: 'SALUD', label: 'Salud', url: urls.SERVICIO_GENERAL_SALUD, tieneGroupLayers: false},
        {value: 'CULTURA_Y_TURISMO', label: 'Cultura y Turismo', url: urls.SERVICIO_CULTURA_TURISMO, tieneGroupLayers:true},
        {value: 'ORDENAMIENTO_TERRITORIAL', label: 'Ordenamiento Territorial', url: urls.SERVICIO_ORDENAMIENTO_TERRITORIAL, tieneGroupLayers:true},
        {value: 'INDUSTRIA_Y_COMERCIO', label: 'Industria y Comercio', url: urls.SERVICIO_INDUSTRIA_COMERCIO, tieneGroupLayers: false},
        {value: 'GESTION_DEL_RIESGO', label: 'Gestión del Riesgo', url: urls.SERVICIO_RIESGO_CONSULTA, tieneGroupLayers: false},
    ];

    const servicioSeleccionado = servicios.find(servicio => servicio.value === idServicio);
    const urlServicioSeleccionado = servicioSeleccionado?.url;
    const tieneGroupLayers = servicioSeleccionado?.tieneGroupLayers ?? false;

    const activeViewChangeHandler = (view: JimuMapView) => {
        if (!view) return

        setJimuMapView(view)
    }

    const limpiarSeleccion = () => {
        selectedHighlightRef.current?.remove?.()
        selectedHighlightRef.current = null
        selectionLayerRef.current?.removeAll()
        setSelectionCount(null)
    }

    const limpiarMapaConsultaEspacial = useCallback(() => {
        const view = jimuMapView?.view
        selectionRunRef.current += 1

        selectedHighlightRef.current?.remove?.()
        selectedHighlightRef.current = null

        sketchViewModelRef.current?.destroy()
        sketchViewModelRef.current = null

        if (view) {
            const featureLayer = view.map.findLayerById('consulta-espacial-featurelayer')
            if (featureLayer) {
                view.map.remove(featureLayer)
                featureLayer.destroy?.()
            }

            const selectionLayer = selectionLayerRef.current ?? view.map.findLayerById('consulta-espacial-selection-layer') as GraphicsLayer | null
            if (selectionLayer) {
                selectionLayer.removeAll()
                view.map.remove(selectionLayer)
                selectionLayer.destroy?.()
            }
        } else {
            selectionLayerRef.current?.removeAll()
            selectionLayerRef.current?.destroy?.()
        }

        featureLayerRef.current = null
        selectionLayerRef.current = null
        setSelectionActive(null)
        setSelectionCount(null)
    }, [jimuMapView])

    const limpiarTodo = useCallback(() => {
        limpiarYCerrarWidgetResultados(widgetResultId)
        limpiarMapaConsultaEspacial()
        setLoading(false)
        setLoadingMessage('')
        setIdServicio('')
        setIdGrupo('')
        setGrupos([])
        setIdCapa('')
        setCapas([])
        setLayers([])
    }, [limpiarMapaConsultaEspacial, widgetResultId])

    const activarSeleccion = (tipoSeleccion: 'rectangle' | 'polygon') => {
        const view = jimuMapView?.view
        const layer = featureLayerRef.current
        const selectionRunId = selectionRunRef.current + 1

        if (!view || !layer) {
            alert('Seleccione una capa antes de usar la seleccion espacial.')
            return
        }

        selectionRunRef.current = selectionRunId
        limpiarSeleccion()
        setSelectionActive(tipoSeleccion)

        let selectionLayer = selectionLayerRef.current

        if (!selectionLayer) {
            selectionLayer = new GraphicsLayer({ id: 'consulta-espacial-selection-layer' })
            selectionLayerRef.current = selectionLayer
            view.map.add(selectionLayer)
        }

        sketchViewModelRef.current?.destroy()

        const sketchViewModel = new SketchViewModel({
            view,
            layer: selectionLayer,
            updateOnGraphicClick: false
        })

        sketchViewModelRef.current = sketchViewModel

        sketchViewModel.on('create', async event => {
            if (event.state === 'cancel') {
                setSelectionActive(null)
                sketchViewModel.destroy()
                sketchViewModelRef.current = null
                return
            }

            if (event.state !== 'complete') return

            setLoading(true)
            setLoadingMessage('Seleccionando datos...')

            try {
                const query = layer.createQuery()
                query.geometry = event.graphic.geometry
                query.spatialRelationship = 'intersects'
                query.returnGeometry = true
                query.outFields = ['*']

                const result = await layer.queryFeatures(query)
                if (selectionRunRef.current !== selectionRunId) return

                const layerView = await view.whenLayerView(layer)
                if (selectionRunRef.current !== selectionRunId) return

                const objectIds = result.features
                    .map(feature => feature.attributes?.[layer.objectIdField])
                    .filter(objectId => objectId !== undefined && objectId !== null)

                selectedHighlightRef.current?.remove?.()
                selectedHighlightRef.current = objectIds.length > 0 ? layerView.highlight(objectIds) : null
                setSelectionCount(objectIds.length)

                if (result.features.length > 0) {
                    const fields = adjustFieldsForResultsWidget(result.features)
                    const fixedFeatures = featuresFixed(result.features)
                    const layerTitle = layer.title || capas.find(capa => capa.value === idCapa)?.label || 'Consulta espacial'

                    abrirTablaResultados(
                        false,
                        fixedFeatures,
                        fields,
                        props,
                        widgetResultId,
                        result.features[0]?.geometry?.spatialReference || layer.spatialReference || view.spatialReference,
                        `Resultados selección espacial - ${layerTitle}`,
                        { showGraphic: false }
                    )
                } else {
                    limpiarYCerrarWidgetResultados(widgetResultId)
                }
            } catch (error) {
                if (selectionRunRef.current === selectionRunId) {
                    alert('No fue posible seleccionar los elementos con la geometria dibujada.')
                }
            } finally {
                if (selectionRunRef.current !== selectionRunId) return

                setSelectionActive(null)
                setLoading(false)
                setLoadingMessage('')
                sketchViewModel.destroy()
                sketchViewModelRef.current = null
            }
        })

        sketchViewModel.create(tipoSeleccion)
    }

    useEffect(() => {
        let cancelled = false

        const cargarGrupos = async () => {
            if (!urlServicioSeleccionado) {
                return;
            }

            setLoading(true);

            try {
                const resp = await loadLayers(urlServicioSeleccionado);
                if (cancelled) return

                const layers = resp.layers ?? [];

                const opcionesGrupos = layers
                    .filter(layer => layer.parentLayerId === -1 && Array.isArray(layer.subLayerIds))
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(layer => ({
                        value: String(layer.id),
                        label: layer.name
                    }));
                
                const opcionesCapas = layers
                    .filter(layer => !Array.isArray(layer.subLayerIds))
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(layer => ({
                        value: String(layer.id),
                        label: layer.name
                    }));

                setLayers(layers);
                setGrupos(tieneGroupLayers ? opcionesGrupos : []);
                setIdGrupo('');
                setCapas(tieneGroupLayers ? [] : opcionesCapas);
                setIdCapa('');
            } catch (error) {
                if (cancelled) return

                setLayers([]);
                setGrupos([]);
                setIdGrupo('');
                setCapas([]);
                setIdCapa('');
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        setLayers([]);
        setGrupos([]);
        setIdGrupo('');
        setCapas([]);
        setIdCapa('');
        void cargarGrupos();

        return () => {
            cancelled = true
        }
    }, [idServicio]);

    useEffect(() => {
        const wasClosed = previousWidgetStateRef.current === 'CLOSED'
        const isClosed = props.state === 'CLOSED'

        previousWidgetStateRef.current = props.state

        if (!isClosed || wasClosed) return

        limpiarTodo()
        void jimuMapView?.view?.goTo(MAP_DEFAULT_VIEW)
    }, [props.state, limpiarTodo, jimuMapView])

    useEffect(() => {
        if (!tieneGroupLayers) return;

        if (!idGrupo) {
            setCapas([]);
            setIdCapa('');
            return;
        }

        const opcionesCapas = layers
            .filter(layer => layer.parentLayerId === Number(idGrupo) && !Array.isArray(layer.subLayerIds))
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(layer => ({
                value: String(layer.id),
                label: layer.name
            }));

        setCapas(opcionesCapas);
        setIdCapa('');
    }, [idGrupo]);

    useEffect(() => {
        const view = jimuMapView?.view

        if (!view) {
            if (idCapa) {
                alert('No hay un mapa disponible para crear el FeatureLayer. Revise que el widget tenga configurado un Map widget.')
            }
            return
        }

        const layerId = 'consulta-espacial-featurelayer'
        const existingLayer = view.map.findLayerById(layerId)

        if (existingLayer) {
            view.map.remove(existingLayer)
            existingLayer.destroy?.()
        }

        featureLayerRef.current = null
        selectionRunRef.current += 1
        limpiarSeleccion()
        sketchViewModelRef.current?.destroy()
        sketchViewModelRef.current = null
        setSelectionActive(null)

        if (!idCapa || !urlServicioSeleccionado) return

        let cancelled = false

        const agregarFeatureLayer = async () => {
            setLoading(true)
            setLoadingMessage('Cargando datos...')

            try {
                if (cancelled) return

                const layer = new FeatureLayer({
                    url: `${urlServicioSeleccionado}/${idCapa}`,
                    id: layerId,
                    title: capas.find(capa => capa.value === idCapa)?.label ?? 'Consulta espacial',
                    outFields: ['*']
                })

                view.map.add(layer)
                featureLayerRef.current = layer

                await layer.load()

                if (cancelled) return

                const extentResponse = await layer.queryExtent()

                if (cancelled) return

                if (extentResponse.extent) {
                    await view.goTo(extentResponse.extent.expand(1.1))
                }

                if (cancelled) return

                setLoadingMessage('Dibujando datos...')

                const layerView = await view.whenLayerView(layer)

                if (cancelled) return

                await reactiveUtils.whenOnce(() => !view.updating && !layerView.updating)
            } catch (error) {
                if (!cancelled) {
                    alert('No fue posible cargar la capa seleccionada.')
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                    setLoadingMessage('')
                }
            }
        }

        void agregarFeatureLayer()

        return () => {
            cancelled = true
            const layer = view.map.findLayerById(layerId)

            if (layer) {
                view.map.remove(layer)
                layer.destroy?.()
            }

            if (featureLayerRef.current?.id === layerId) {
                featureLayerRef.current = null
            }
        }
    }, [idCapa]);

    return (
        <div className="consulta-widget">
            <div style={{ position: 'absolute', width: 0, height: 0 }}>
                <JimuMapViewComponent
                useMapWidgetId={props.useMapWidgetIds?.[0]}
                onActiveViewChange={activeViewChangeHandler}
                />
            </div>

            <SelectDesdeArray label={"Servicios"} valor={idServicio} setValor={setIdServicio} 
            array={servicios} disabled={loading}  />
            
            {tieneGroupLayers && (
                <SelectDesdeArray label={"Grupos"} valor={idGrupo} setValor={setIdGrupo}
                array={grupos} disabled={loading} />
            )}
            {servicioSeleccionado && (
                <SelectDesdeArray label={"Capas"} valor={idCapa} setValor={setIdCapa}
                array={capas} disabled={loading } />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, border: "1px solid #ccc",
    borderRadius: "4px", padding:"5px"}}>
                <Button
                    icon
                    size="sm"
                    title="Seleccion rectangular"
                    disabled={loading || !featureLayerRef.current}
                    onClick={() => activarSeleccion('rectangle')}
                    type={selectionActive === 'rectangle' ? 'primary' : 'default'}
                >
                    <Icon icon={RECTANGLE_SELECT_ICON} size={16} />
                </Button>
                Selección rectangular
                <Button
                    icon
                    size="sm"
                    title="Seleccion poligonal"
                    disabled={loading || !featureLayerRef.current}
                    onClick={() => activarSeleccion('polygon')}
                    type={selectionActive === 'polygon' ? 'primary' : 'default'}
                >
                    <Icon icon={POLYGON_SELECT_ICON} size={16} />
                </Button>
                Selección poligonal
                {selectionCount !== null && (
                    <span>{selectionCount} elementos seleccionados</span>
                )}
            </div>
            {loading && (
                <div style={{ marginTop: 12 }}>
                    {loadingMessage}
                </div>
            )}
        </div>
    )
}

export default Widget
