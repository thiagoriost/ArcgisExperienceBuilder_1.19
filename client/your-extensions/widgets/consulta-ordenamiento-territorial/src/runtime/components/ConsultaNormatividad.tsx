/** @jsx jsx */
import { React, jsx } from 'jimu-core'

import type { ArcGisFeature, SelectOption } from '../../../../consulta-salud/src/runtime/types'
import { arrayValueLabel, cargarDesdeArcgisService } from '../../../../consulta-salud/src/runtime/util'
import SelectMunicipio from '../../../../consulta-salud/src/runtime/components/SelectMunicipio'
import SelectDesdeArray from '../../../../consulta-salud/src/runtime/components/SelectDesdeArray'
const {useState, useEffect, useImperativeHandle, forwardRef } = React

const ConsultaNormatividad = forwardRef(({
    url,
    urlArchivos,
    execute,
    arcgisService,
    handleError,
    loading,
    setLoading,
    municipios,
    idMunicipio,
    setIdMunicipio,
    setMensaje,
    setFichaPdfUrl,
    setFichaPdfMensaje,
    onValidityChange
}, ref) => {
    const [fichas, setFichas] = useState<SelectOption[]>([])
    const [idFicha, setIdFicha] = useState<string>('')
    const [urlPorFicha, setUrlPorFicha] = useState<{[ficha: string]: string}>({})

    useImperativeHandle(ref, () => ({
        consultar: async () => {
            return cargarDesdeArcgisService(execute, arcgisService, url, 2, {
                where: `MUNICIPIO=${idMunicipio} AND FICHANORMT='${idFicha}'`,
                outFields: '*',
                returnGeometry: true
            }, setLoading)
        },
        limpiar: () => {
            setIdFicha('')
            setIdMunicipio('')
            setUrlPorFicha({})
            setFichaPdfUrl('')
            setFichaPdfMensaje('')
        }
    }), [idFicha])

    useEffect(() => {
        onValidityChange?.(Boolean(idMunicipio && idFicha))
    }, [idMunicipio, idFicha, onValidityChange])

    useEffect(() => {
        const cargarFichas = async () => {
            if (!idMunicipio) {
                setFichas([])
                setIdFicha('')
                setUrlPorFicha({})
                setFichaPdfUrl('')
                setFichaPdfMensaje('')
                return
            }

            const ret = await cargarDesdeArcgisService(execute, arcgisService, url, 2, {
                where: `MUNICIPIO="${idMunicipio}"`,
                outFields: 'FICHANORMT,FICHAPDF',
                returnDistinctValues: true,
                returnGeometry: false,
                orderByFields: `FICHANORMT ASC`
            }, setLoading)

            const fichasUnicas = new Map<string, ArcGisFeature>()
            const urlsPorFicha: {[ficha: string]: string} = {}

            ret.features.forEach((feature) => {
                const ficha = String(feature.attributes?.FICHANORMT ?? '')

                if (!ficha || fichasUnicas.has(ficha)) {
                    return
                }

                fichasUnicas.set(ficha, feature)
                urlsPorFicha[ficha] = String(feature.attributes?.FICHAPDF ?? '')
            })

            setFichas(arrayValueLabel(Array.from(fichasUnicas.values()), 'FICHANORMT', 'FICHANORMT'))
            setUrlPorFicha(urlsPorFicha)
            setIdFicha('')
        }

        cargarFichas()
    }, [idMunicipio])

    useEffect(() => {
        const fichaUrl = idFicha ? urlPorFicha[idFicha] ?? '' : ''

        setFichaPdfUrl(idFicha && fichaUrl ? `${urlArchivos}${fichaUrl}` : '')
        setFichaPdfMensaje(idFicha && !fichaUrl ? 'La normativa no cuenta con ficha asociada.' : '')
    }, [idFicha, urlPorFicha, urlArchivos])

    useEffect(() => {
        setMensaje('');
    }, [idFicha, idMunicipio])

    useEffect(() => {
        setFichaPdfUrl('');
        setFichaPdfMensaje('');
    }, [idMunicipio])

    return (
        <>
            <SelectMunicipio loading={loading} municipios={municipios} idMunicipio={idMunicipio} setIdMunicipio={setIdMunicipio} />
            <SelectDesdeArray label={'Ficha'} valor={idFicha} setValor={setIdFicha} array={fichas} disabled={loading} />
        </>
    )
})

export default ConsultaNormatividad
