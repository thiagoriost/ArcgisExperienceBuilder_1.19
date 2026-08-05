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
    participacion_microfundios:{
        indicadorLabel:"Participación porcentual de microfundios en sobreutilización por cantidad en frontera agrícola",
        tohasOwnProperty: ["micro_sobr", "micro_sub_"],
        bitacora: "utilizado en el sigRA"
    },
    conflictos_uso_suelo:{
        indicadorLabel:"conflictos_uso_suelo",
        tohasOwnProperty: ["nivel_3", "area_ha"],
        bitacora: "utilizado en el sigRA"
    }
}