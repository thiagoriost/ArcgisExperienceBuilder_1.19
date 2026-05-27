import { React, type AllWidgetProps } from 'jimu-core'
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis'

import SelectDesdeArray from '../../../consulta-salud/src/runtime/components/SelectDesdeArray';
import { urls } from '../../../api/serviciosQuindio'

import '../../../utils/styles/consulta-widget.css';
import { loadLayers } from '../../../shared/services/queryMapServer.service';
import type { LayerInfo } from '../../../shared/types/types_consultaAvanzadaAlfanumerica';

const { useEffect, useState } = React

const Widget = (props: AllWidgetProps<any>) => {
    const [loading, setLoading] = useState(false);
    const [idServicio, setIdServicio] = useState<string>('');
    const [idGrupo, setIdGrupo] = useState<string>('');
    const [grupos, setGrupos] = useState<Array<{ value: string, label: string }>>([]);
    const [idCapa, setIdCapa] = useState<string>('');
    const [capas, setCapas] = useState<Array<{ value: string, label: string }>>([]);
    const [layers, setLayers] = useState<LayerInfo[]>([]);
    const [jimuMapView, setJimuMapView] = useState<JimuMapView | null>(null);

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

    useEffect(() => {
        const cargarGrupos = async () => {
            if (!urlServicioSeleccionado) {
                setLayers([]);
                setGrupos([]);
                setIdGrupo('');
                setCapas([]);
                setIdCapa('');
                return;
            }

            setLoading(true);

            try {
                const resp = await loadLayers(urlServicioSeleccionado);
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
                setLayers([]);
                setGrupos([]);
                setIdGrupo('');
                setCapas([]);
                setIdCapa('');
            } finally {
                setLoading(false);
            }
        }

        void cargarGrupos();
    }, [urlServicioSeleccionado, tieneGroupLayers]);

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
    }, [idGrupo, layers, tieneGroupLayers]);

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

        if (!idCapa || !urlServicioSeleccionado) return

        let cancelled = false

        const agregarFeatureLayer = async () => {
            const { default: FeatureLayer } = await import('@arcgis/core/layers/FeatureLayer')

            if (cancelled) return

            const layer = new FeatureLayer({
                url: `${urlServicioSeleccionado}/${idCapa}`,
                id: layerId,
                title: capas.find(capa => capa.value === idCapa)?.label ?? 'Consulta espacial',
                outFields: ['*']
            })

            view.map.add(layer)

            await layer.load()

            if (cancelled) return

            await view.whenLayerView(layer)
        }

        void agregarFeatureLayer()

        return () => {
            cancelled = true
            const layer = view.map.findLayerById(layerId)

            if (layer) {
                view.map.remove(layer)
                layer.destroy?.()
            }
        }
    }, [jimuMapView, idCapa, capas, urlServicioSeleccionado]);

    useEffect(() => {
        const cargarExtentCapa = async () => {
            if (!idCapa || !urlServicioSeleccionado) return;

            try {
                const { default: esriRequest } = await import('@arcgis/core/request');
                const response = await esriRequest(`${urlServicioSeleccionado}/${idCapa}`, {
                    query: { f: 'json' },
                    responseType: 'json'
                });

                //alert(JSON.stringify(response.data?.extent ?? null, null, 2));
            } catch (error) {
                alert('No fue posible obtener el extent de la capa seleccionada.');
            }
        }

        void cargarExtentCapa();
    }, [idCapa, urlServicioSeleccionado]);

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
            <SelectDesdeArray label={"Capas"} valor={idCapa} setValor={setIdCapa}
            array={capas} disabled={loading || !urlServicioSeleccionado || (tieneGroupLayers && !idGrupo)} />
        </div>
    )
}

export default Widget
