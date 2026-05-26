/*
Funciones comunes para limpieza de widget.
@author: IGAC, Ing. David Zornosa
*/

import type { JimuMapView } from 'jimu-arcgis'

interface MutableRef<T> {
    current: T
}

export interface InitialMapViewRefs {
    initialExtentRef: MutableRef<__esri.Extent | null>
    initialZoomRef: MutableRef<number | null>
    initialScaleRef: MutableRef<number | null>
}

export const captureInitialMapView = (
    view: JimuMapView,
    refs: InitialMapViewRefs
) => {
    if (!view || refs.initialExtentRef.current) return

    refs.initialExtentRef.current = view.view.extent?.clone() ?? null
    refs.initialZoomRef.current = typeof view.view.zoom === 'number' ? view.view.zoom : null
    refs.initialScaleRef.current = typeof view.view.scale === 'number' ? view.view.scale : null
}

export const resetToDefaultMapView = (
jimuMapView: JimuMapView | null | undefined,
refs: InitialMapViewRefs
) => {
    const view = jimuMapView?.view
    const initialExtent = refs.initialExtentRef.current

    if (!view || !initialExtent) return

    setTimeout(async () => {
        await view.goTo({ target: initialExtent })
    }, 2000)

    if (typeof refs.initialZoomRef.current === 'number') {
        view.zoom = refs.initialZoomRef.current
    }

    if (typeof refs.initialScaleRef.current === 'number') {
        view.scale = refs.initialScaleRef.current
    }
}