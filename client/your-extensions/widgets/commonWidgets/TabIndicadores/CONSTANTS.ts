export const INDICADORES_SELECTED = {
    DEFAULT: {
        indicadorLabel: "Distribución predial",
        tohasOwnProperty: ["Microfundi", "Microfundio", "microfundi", "microfundio", "Minifundio", "minifundio"],
        bitacora: "utilizado en el sigRA"
    },
    area_promedio_predial:{
        indicadorLabel:"Área promedio predial",
        tohasOwnProperty: ["RPromedio", "RCategoria", "RFPromedio", "RFCategoria", "RFAPromedio", "RFaCategoria"],
        bitacora: "utilizado en el sigRA"
    },
    coeficiente_gini:{
        indicadorLabel:"Coeficiente de GINI",
        tohasOwnProperty: ["R_Gini", "RF_Gini", "R_num_pred", "RFA_Gini"],
        bitacora: "utilizado en el sigRA"
    },
    vocacion_uso:{
        indicadorLabel:"Vocación de Uso",
        tohasOwnProperty: ["Area", "FID_ag_100"],
        bitacora: "utilizado en el sigRA"
    },
    conflictos_uso_sueloFront_agric:{
        indicadorLabel:"Conflicto de uso del suelo en frontera agrícola",
        tohasOwnProperty: ["nivel_2", "nivel_3"],
        bitacora: "utilizado en el sigRA"
    },
    participacion_microfundios_cantidad:{
        indicadorLabel:"Participación porcentual de microfundios en sobreutilización por cantidad en frontera agrícola",
        tohasOwnProperty: ["micro_sobr", "micro_sub_"],
        bitacora: "utilizado en el sigRA"
    },
    participacion_microfundios_area:{
        indicadorLabel:"Participación porcentual de microfundios en sobreutilización por área  en frontera agrícola",
        tohasOwnProperty: ["micro_sobr", "micro_sub_"],
        bitacora: "utilizado en el sigRA"
    },
    participacion_minifundios_cantidad:{
        indicadorLabel:"Participación porcentual de minifundios en sobreutilización por cantidad en frontera agrícola",
        tohasOwnProperty: ["mini_sobre", "mini_sub_n"],
        bitacora: "utilizado en el sigRA"
    },
    participacion_minifundios_area:{
        indicadorLabel:"Participación porcentual de minifundios en sobreutilización por área  en frontera agrícola",
        tohasOwnProperty: ["mini_sobre", "mini_sub_n"],
        bitacora: "utilizado en el sigRA"
    },
    participacion_pequena_propiedad_cantidad:{
        indicadorLabel:"Participación porcentual de pequeña propiedad en sobreutilización por cantidad  en frontera agrícola",
        tohasOwnProperty: ["mini_sobre", "mini_sub_n"],
        bitacora: "utilizado en el sigRA",
        url: "https://services2.arcgis.com/RVvWzU3lgJISqdke/arcgis/rest/services/Participaciones_porcentuales_en_sobreutilizacion/FeatureServer/4"
    },
    participacion_pequena_propiedad_area:{
        indicadorLabel:"Participación porcentual de pequeña propiedad en sobreutilización por área en frontera agrícola",
        tohasOwnProperty: ["mini_sobre", "mini_sub_n"],
        bitacora: "utilizado en el sigRA",
        url: "https://services2.arcgis.com/RVvWzU3lgJISqdke/arcgis/rest/services/Participaciones_porcentuales_en_sobreutilizacion/FeatureServer/5"
    },
    conflictos_uso_suelo:{
        indicadorLabel:"conflictos_uso_suelo",
        tohasOwnProperty: ["nivel_3", "area_ha"],
        bitacora: "utilizado en el sigRA"
    }
}