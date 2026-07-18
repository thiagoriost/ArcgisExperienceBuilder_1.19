
/**
* Parametrización del Path del sistema, para uso en componente tablaResultSrcSIEC
* @date 2025-04-09
* @author IGAC - DIP
* @dateUpdated 2025-05-19
* @changes Actualización del JSON asociado
* @dateUpdated 2025-05-29
* @changes creación objeto controller para parametrización
* @dateUpdated 2025-06-20
* @changes creacion atributo folderimg, que indica el folder images público
* @dateUpdated 2025-06-25
* @changes creacion atributo folderHlp, que indica el folder de los gif animados, opción ayuda
* @dateUpdated 2025-07-01
* @changes creación objeto generarFileStand, para incluir la marca de tiempo (timestamp en el nombre de los archivos empaquetados, empleandos en el componente tablaResultados)
* @dateUpdated 2025-08-12
* @changes Acoplamiento formación ruta (path) para acceso a los archivos gif de la opción Ayuda
* @dateUpdated 2025-08-13
* @changes creación objeto getTimeInfo, para obtener la información del tiempo control sesión
* @changes creación objeto formatTime, para obtener formato legible desde unidad tiempo en ms (milisegundos)
* @dateUpdated 2025-08-22
* @changes creación objeto entorno, que define la instalación del proyecto {'dev => Desarrollo, 'prod' => Producción / Pruebas}
* @dateUpdated 2025-08-25
* @changes creación sección validadores campos formulario, objeto tValidators
* @dateUpdated 2025-09-16
* @changes creación objeto numPosiciones, que determina la longitud máxima de campos, asociados al formulario Información usuario descarga firma
* @dateUpdated 2025-09-18
* @changes creación objeto numPageDG, el cual determina registros para el campo Filas por página, componente tablaResultados
* @dateUpdated 2025-10-07
* @changes creación objeto tolerFactorSrcP, el cual nos calcula el factor de tolerancia en ls búsqueda desde mapa base, al registro renderizado en el componente Tabla Resultados.
* @dateUpdated 2025-10-29
* @changes creación atributo folderDocs, bajo objeto pathDataGridSIEC
* @changes creación objeto manUsrName, que determina el nombre del manual de usuario proyecto.
* @changes actualización objeto controllerDev 10 => 16
* @dateUpdated 2026-02-27
* @changes Inclusión atributo loadIconSrcDev  => Path para cargue icono estado "Cargando" entorno desarrollo
* @changes Inclusión atributo loadIconSrcProd => Path para cargue icono estado "Cargando" entorno productivo
* @remarks Folder desde server/public
* @remarks para desarrollo, usar atributo pathDev especificado en atributo path del objeto pathDataGridSIEC.
* @remarks para produccion, el folder es bancofirmas/cdn/1/resources (atributo pathProd). Usar atributo pathProd especificado en atributo path del objeto pathDataGridSIEC.
* @remarks para produccion (2025-08-21) => controllerProd = 6; path: pathProd
* @remarks para produccion (2025-09-11) => controllerProd= 45; path: pathProd
* @remarks para produccion (2025-09-18) => controllerProd= 48; path: pathProd
* @remarks para produccion (2025-09-19) => controllerProd= 49; path: pathProd
* @remarks para produccion (2025-09-23) => controllerProd= 50; path: pathProd
* @remarks para produccion (2025-09-24) => controllerProd= 51; path: pathProd
* @remarks para produccion (2025-09-24) => controllerProd= 52; path: pathProd
* @remarks para produccion (2025-10-10) => controllerProd= 53; path: pathProd
* @remarks para produccion (2025-10-10) => controllerProd= 54; path: pathProd
* @remarks para produccion (2025-10-10) => controllerProd= 55; path: pathProd
* @remarks para produccion (2025-10-10) => controllerProd= 56; path: pathProd
* @remarks para produccion (2025-10-10) => controllerProd= 57; path: pathProd
* @remarks para produccion (2025-10-29) => controllerProd= 58; path: pathProd
* @remarks para produccion (2025-11-06) => controllerProd= 59; path: pathProd
* @remarks para produccion (2025-11-06) => controllerProd= 60; path: pathProd
* @remarks para produccion (2025-12-22) => controllerProd= 61; path: pathProd
* @remarks para produccion (2025-12-22) => controllerProd= 62; path: pathProd
* @remarks para produccion (2025-12-22) => controllerProd= 63; path: pathProd
* @remarks para produccion (2025-12-22) => controllerProd= 64; path: pathProd
* @remarks para produccion (vigencia 2026 => 2026-02-05) => controllerProd= 65; path: pathProd
* @remarks para produccion (2026-02-19) => controllerProd= 66; path: pathProd
* @remarks para produccion (2026-02-19) => controllerProd= 67; path: pathProd
* @remarks para produccion (2026-02-26) => controllerProd= 68; path: pathProd
*/
const entorno = "dev"
const controllerDev = 16
const controllerProd= 68
const pathIniDev = "../images_server"
const pathIniProd = "/bancofirmas/cdn/"
const pathEnd = "/resources"
const manUsrName = "SIG_FirmasEspectrales_2025_MUP_V.2.0_20102024.pdf"
const pathDev = pathIniDev /* + controllerDev + pathEnd */
const pathProd = pathIniProd + controllerProd + pathEnd
const numPosiciones = 10
const numPageDG = [2,5,8,10]
const tolerFactorSrcP=0.02
const imageSrc = '/images/icon_picker_in_setting/loading_three.gif'
const loadIconSrcDev = pathDev + imageSrc
const loadIconSrcProd = pathProd + imageSrc
const loadIcon = loadIconSrcDev
const pathDataGridSIEC = {
    path: pathDev,
    folder: "siec_img",
    folderimg:"images",
    folderHlp:"siec_help",
    folderDocs:"docs"
}

/**
 * Parametrización de usuario que realiza petición al API
 * @date 2025-08-13
 * @author IGAC - DIP
 * @remarks valores obtenidos del objeto accessAPIparams
 */
const userAPI = {
  usrAPI: "usuario_api@dip-igac.gov.co",
  passAPI: "4piF1rm4$.*"
}

/**
 * Parametrización código divipola especial, asociado a Bogotá D.C
 * @author IGAC - DIP
 * @remarks Uso en el componente FiltersSrcSIEC
 */
const codDeptoDivip = {
    codDepto: "11",
    NomDepto: "Bogotá, D.C"
}

/**
 * Parametrización campos salida asociados al consumo de servicios remotos
 * @date 2025-05-29
 * @author IGAC - DIP
 * @dateUpdated 2025-06-25
 * @changes Suprimir atributo codigofirma
 * @changes Suprimir atributo covertype por no existir en servicio (temporal)
 * @changes Suprimir atributo sealevelaltitude
 * @changes Suprimir atributo instrumentname
 * @changes Suprimir atributo spectralintegrity
 * @changes Actualizar atributo fieldsOut: {projectname => projectnam, campananame => campananam, divipoladepto => cod_depto, divipolamunicipio => cod_mpio, photosignature => fileidenti}
 * @dateUpdated 2025-07-21
 * @changes Incluir atributo object_id
 * @dateUpdated 2025-08-06
 * @changes Incluir atributo tipo_cobertura, en objeto fieldsOutTCover
 * @dateUpdated 2025-08-08
 * @changes Actualizar atributo fieldsOut: {campananam => nombre_campana, cod_depto => codigo_departamento, cod_mpio => codigo_municipio, object_id => id_punto}
 * @changes Actualizar atributo fieldsOut: Incluir campo tipo_cobertura
 * @dateUpdated 2025-10-07
 * @changes Actualizar atributo fieldsOut: Incluir campo latitud, longitud
 */
const outFieldsService = {
    fieldsOut: "objectid,id_punto,projectnam,nombre_campana,codigo_departamento,codigo_municipio,fileidenti,tipo_cobertura,latitud,longitud",
    fieldOutDivipola: "mpcodigo,mpnombre,decodigo,depto",
    fieldsOutTCover: "tipo_cobertura"
}

/**
 * Parametrización acceso método getToken usado en componente FiltersSrcSIEC, para generar token de seguridad
 * @date 2025-07-17
 * @author IGAC - DIP
 * @dateUpdated 2025-08-13
 * @changes Parametrización de los atributos email y password desde el objeto userAPI
 */
const accessAPIparams = {
    email: userAPI.usrAPI,
    password: userAPI.passAPI
}

/**
 * Parametrización opción Ayuda, asociado al widget Buscador FE
 * @date 2025-06-17
 * @author IGAC - DIP
 * @dateUpdated 2025-06-19
 * @changes Actualización contenido con tag img (en pruebas)
 * @dateUpdated 2025-06-20
 * @changes Actualización contenido
 * @dateUpdated 2025-06-25
 * @changes Creación atributo contenidoFunc
 * @changes Renderización de imagenes gif en PopUp, por medio del objeto pathDataGridSIEC
 * @changes aplicación clase imgAnimateImg
 * @dateUpdated 2025-09-03
 * @changes Suprimir Paso 5, ya que no aplica, por no presentar sección Coordenadas geográficas.
 * @remarks Fuente de consulta: https://www.esri.com/arcgis-blog/products/js-api-arcgis/mapping/using-html-with-popups-in-the-arcgis-api-for-javascript
 */
const sketchHelpParams = {
    titulo: `<h2 class="titleHelp">Ayuda uso herramienta dibujo rectángulo</h2>`,
    contenidoFunc: function () {
        const divContent = document.createElement("div")
        divContent.innerHTML = `<div class="contentHelp">
            <h3>Paso 1</h3>
            <p>Invocar 
            la herramienta rectángulo, por medio de la opción Seleccionar Área del widget Buscador FE</p>
            <img class="imgAnimateImg" src="${pathDataGridSIEC.path}/${pathDataGridSIEC.folderimg}/${pathDataGridSIEC.folderHlp}/Fig1.gif" alt="img"/>
            <h3>Paso 2</h3>
            <p>Realizar acercamiento del mapa base, a la zona geográfica deseada (p.Ej.Bogotá)</p>
            <div>
            <img class="imgAnimateImg" src="${pathDataGridSIEC.path}/${pathDataGridSIEC.folderimg}/${pathDataGridSIEC.folderHlp}/Fig2.gif" alt="img"/>
            </div>
            <h3>Paso 3</h3>
            <p>Seleccione la opción ▭, el cursor se despliega como una cruz (✚), permitiendo dibujar un rectángulo en el mapa base</p>
            <img class="imgAnimateImg3" src="${pathDataGridSIEC.path}/${pathDataGridSIEC.folderimg}/${pathDataGridSIEC.folderHlp}/Fig3.gif" alt="Img"/>
            <h3>Paso 4</h3>
            <p>Dibuje el rectángulo sobre el mapa base.</p>
            <img class="imgAnimateImg4" src="${pathDataGridSIEC.path}/${pathDataGridSIEC.folderimg}/${pathDataGridSIEC.folderHlp}/Fig4.gif" alt="Img"/>
        </div>`
        return divContent
    }
}

/**
   * dataGridLang => Objeto que define el idioma del componente Tabla Resultados (tablaResultados)
   * @date 2025-08-12
   * @author IGAC - DIP
   * @returns {any} Objeto JSON con las propiedades asociadas al componente tablaResultados
   * @remarks Fuente de consulta: Claude AI => https://claude.ai/chat/a840d280-a530-46cd-a46c-efc32f38b480
   */
const dataGridLang = {
  // Textos del toolbar
  toolbarDensity: 'Densidad',
  toolbarDensityLabel: 'Densidad',
  toolbarDensityCompact: 'Compacta',
  toolbarDensityStandard: 'Estándar',
  toolbarDensityComfortable: 'Cómoda',
  toolbarColumns: 'Columnas',
  toolbarColumnsLabel: 'Seleccionar columnas',
  toolbarFilters: 'Filtros',
  toolbarFiltersLabel: 'Mostrar filtros',
  toolbarFiltersTooltipHide: 'Ocultar filtros',
  toolbarFiltersTooltipShow: 'Mostrar filtros',
  toolbarFiltersTooltipActive: (count) =>
    count !== 1 ? `${count} filtros activos` : `${count} filtro activo`,
  toolbarExport: 'Exportar',
  toolbarExportLabel: 'Exportar',
  toolbarExportCSV: 'Descargar como CSV',
  toolbarExportPrint: 'Imprimir',

  // Textos de paginación
  footerRowSelected: (count) =>
    count !== 1
      ? `${count.toLocaleString()} filas seleccionadas`
      : `${count.toLocaleString()} fila seleccionada`,
    footerTotalRows: 'Filas totales:',
    footerTotalVisibleRows: (visibleCount, totalCount) =>
      `${visibleCount.toLocaleString()} de ${totalCount.toLocaleString()}`,
    footerPaginationRowsPerPage: 'Filas por página:',

  // Textos de filtros
  filterPanelAddFilter: 'Agregar filtro',
  filterPanelDeleteIconLabel: 'Borrar',
  filterPanelLogicOperator: 'Operador lógico',
  filterPanelOperator: 'Operador',
  filterPanelOperatorAnd: 'Y',
  filterPanelOperatorOr: 'O',
  filterPanelColumns: 'Columnas',
  filterPanelInputLabel: 'Valor',
  filterPanelInputPlaceholder: 'Valor del filtro',

  // Operadores de filtro
  filterOperatorContains: 'contiene',
  filterOperatorEquals: 'igual',
  filterOperatorStartsWith: 'comienza con',
  filterOperatorEndsWith: 'termina con',
  filterOperatorIs: 'es',
  filterOperatorNot: 'no es',
  filterOperatorAfter: 'después de',
  filterOperatorOnOrAfter: 'en o después de',
  filterOperatorBefore: 'antes de',
  filterOperatorOnOrBefore: 'en o antes de',
  filterOperatorIsEmpty: 'está vacío',
  filterOperatorIsNotEmpty: 'no está vacío',
  filterOperatorIsAnyOf: 'es cualquiera de',

  // Textos de columnas
  columnMenuLabel: 'Menú',
  columnMenuShowColumns: 'Mostrar columnas',
  columnMenuFilter: 'Filtro',
  columnMenuHideColumn: 'Ocultar',
  columnMenuUnsort: 'Desordenar',
  columnMenuSortAsc: 'Ordenar ASC',
  columnMenuSortDesc: 'Ordenar DESC',

  // Textos de selección
  checkboxSelectionHeaderName: 'Selección',
  checkboxSelectionSelectAllRows: 'Seleccionar todas las filas',
  checkboxSelectionUnselectAllRows: 'Deseleccionar todas las filas',
  checkboxSelectionSelectRow: 'Seleccionar fila',
  checkboxSelectionUnselectRow: 'Deseleccionar fila',

  // Textos varios
  booleanCellTrueLabel: 'sí',
  booleanCellFalseLabel: 'no',
  actionsCellMore: 'más',
  pinToLeft: 'Anclar a la izquierda',
  pinToRight: 'Anclar a la derecha',
  unpin: 'Desanclar',

  // Mensajes de error
  noRowsLabel: 'No hay resultados asociados a la búsqueda!',
  noResultsOverlayLabel: 'No se encontraron resultados.',
  errorOverlayDefaultLabel: 'Ocurrió un error.'

}

/**
 * generarFileStand=> método que genera el archivo con el estándar name+_+anio+_+mes+_+dia+_+hr+_+min+_+seg
 * @date 2025-07-01
 * @author IGAC - DIP
 * @param fName => nombre del archivo
 * @returns fName con estándar name+_+anio+_+mes+_+dia+_+hr+_+min+_+seg
 * @remarks Método obtenido del widget consulta simple, componente tablaResultCS (2024-06-21)
 */

const generarFileStand = function(fName:string) {
    //Procesar fecha y hora
    const date = new Date()
    const yearCSV = date.getUTCFullYear()
    const dayCSV = procesaFechaHora (date.getUTCDate())
    const monthFullCSV= procesaFechaHora (date.getUTCMonth() + 1)

    //Horas minutos y segundos
    const hourCSV = procesaFechaHora(date.getHours())
    const minutesCSV = procesaFechaHora(date.getMinutes())
    const secondsFullCSV= procesaFechaHora(date.getSeconds())

    console.log("Anio =>",yearCSV)
    console.log("Mes =>",monthFullCSV)
    console.log("Dia =>",dayCSV)
    console.log("Hora =>",hourCSV)
    console.log("Minutos =>",minutesCSV)
    console.log("Segundos =>",secondsFullCSV)

    return (fName+"_"+yearCSV+"_"+monthFullCSV+"_"+dayCSV+"_"+hourCSV+"_"+minutesCSV+"_"+secondsFullCSV)

  }

/**
 *  procesaFechaHora => método para devolver el número del día o mes o el número de minutos o segundos que contienen un solo digito (1-9) con un cero a la izquierda
 * @date 2025-07-01
 * @author IGAC - DIP
 * @returns Número del mes correcto
 * @remarks Método obtenido del widget consulta simple, componente tablaResultCS (2024-06-21)
 */

  const procesaFechaHora = function(nTime: number) {
      if (Number(nTime) > 0 && Number(nTime) < 10)
      {
        return '0'+nTime.toString()
      }
      return nTime
  }
/**
 * Sección seguridad consumo servicios API
 * @date 2025-08-13
 * @author IGAC - DIP
 */

/**
 * AESToNormalPass => Decodificación termino codificado con algoritmo AES
 * @date 2025-08-13
 * @author IGAC - DIP
 * @param passCoded
 * @param key
 * @returns {string} Término decodificado
 * @remarks Proceso decodificación
 * @remarks FUENTE consulta: AI Claude => https://claude.ai/chat/5f6b204d-9435-4ade-b4ba-750957a4ede9
 */
const AESToNormalPass = async function (passCoded, key) {
  try{
      //Conversión de base64
      const dataProcDecod = new Uint8Array (
          atob (passCoded).split ('').map (c => c.charCodeAt (0))
      )

      //Extración semillas salt, iv y datos cifrados
      const salt = dataProcDecod.slice (0, 16)
      const iv = dataProcDecod.slice (16, 28)
      const encryptObj= dataProcDecod.slice (28)

      //Derivación clave
      const keyAes = await deriveKey (key, salt)

      //Descifrado
      const decodeData = await crypto.subtle.decrypt (
          {
              name: 'AES-GCM',
              iv: iv
          },
          keyAes,
          encryptObj
      )

      //Conversión a texto
      const decoderCla = new TextDecoder ()
      return decoderCla.decode (decodeData)
  }
  catch (error) {
      throw new Error('Error al descifrar: Contraseña incorrecta o datos corruptos')
  }
}

/**
 * deriveKey => Método para obtener clave derivada
 * @date 2025-08-13
 * @author IGAC - DIP
 * @param pass
 * @param saltKey
 * @returns {string} llave derivada
 * @remarks FUENTE consulta: Claude AI => https://claude.ai/chat/5f6b204d-9435-4ade-b4ba-750957a4ede9
 */
const deriveKey = async function (pass, saltKey) {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey (
      'raw',
      encoder.encode (pass),
      {
          name: 'PBKDF2'
      },
      false,
      ['deriveKey']
  )

  return await crypto.subtle.deriveKey (
      {
          name: 'PBKDF2',
          salt: saltKey,
          iterations: 100000,
          hash: 'SHA-256'
      },
      keyMaterial,
      {
          name: 'AES-GCM',
          length: 256
      },
      false,
      ['encrypt', 'decrypt']
  )
}

/**
 * generateAES => generador clave AES
 * @date 2025-08-13
 * @author IGAC - DIP
 * @remarks Proceso codificación
 * @remarks FUENTE consulta: Claude AI => https://claude.ai/chat/5f6b204d-9435-4ade-b4ba-750957a4ede9
 */
const generateAES = async function (claStr, claSHA) {
  try{
      const encoder = new TextEncoder()
      const dataEnc = encoder.encode (claStr)
      const salt = crypto.getRandomValues (new Uint8Array (16))
      const iv = crypto.getRandomValues (new Uint8Array (12))

      //Derivar clave
      const keyCifr = await deriveKey (claSHA, salt)

      //Cifrado
      const cifrData = await crypto.subtle.encrypt (
          {
              name: 'AES-GCM',
              iv: iv
          },
          keyCifr,
          dataEnc
      )

      //Combinación de objetos salt, iv y datos cifrados
      const resultCif = new Uint8Array (salt.length + iv.length + cifrData.byteLength)

      resultCif.set (salt, 0)
      resultCif.set (iv, salt.length)
      resultCif.set (new Uint8Array (cifrData), salt.length + iv.length)

      //Conversión a base64
      return btoa (String.fromCharCode (...resultCif))
   }
  catch (error) {
      throw new Error('Error al cifrar =>' + error.message)
  }
}
/**
 * generateSHA1 => Método para generar cifrado de clave.
 * @date 2025-08-13
 * @author IGAC - DIP
 * @param passW
 * @returns {string} Clave codificada
 * @remarks FUENTE consulta: Claude AI => https://claude.ai/chat/5f6b204d-9435-4ade-b4ba-750957a4ede9
*/
const generateSHA1 = async function (passW) {
  const encoder = new TextEncoder()
  const claEncode = encoder.encode (passW)
  const hashBuff = await crypto.subtle.digest ('SHA-1', claEncode)
  const hashArr = Array.from (new Uint8Array (hashBuff))
  const hashClaCoded= hashArr.map (b => b.toString (16).padStart (2, '8')).join ('')
  return hashClaCoded
}

/**
 * Sección control tiempo seguridad, de acuerdo al token obtenido del sistema
 * @date 2025-08-14
 * @author IGAC - DIP
 */

/**
  Constantes de control para manejo de sesión y descarga.
  @date 2025-08-29
  @author IGAC - DIP
  @dateUpdated 2025-09-01
  @changes Definición control timeDownLoad, el cual propociona el tiempo en ms (milisegundos), para continuación del proceso de descarga, cuando existe el usuario en la BD
  @remarks Valor timeExpires para prueba asociado a 75000 ms (milisegundos) para pruebas (1m:15s)
  @remarks Valor timeExpires para entorno productivo asociado a 24 horas <=> 86400 seg <=> 86400000 ms
  @remarks Valor timeDownLoad para prueba  asociado a 5500 ms (milisegundos) (0m:5,5s)
  @remarks Valor timeDownLoad para entorno productivo asociado a 5500 ms (milisegundos) (0m:5,5s)
  @remarks FUENTE consulta: Claude AI => https://claude.ai/chat/1524c133-89ab-4f4c-a923-c5a6b3f5cf4e
  @remarks Tiempo en ms (miliSegundos)
*/

//const timeExpires = 86400000; //Producción
const timeExpires = 75000 //Pruebas
//const timeDownLoad= 30000;
const timeDownLoad= 5500 //Pruebas

/**
 * getTimeInfo => método para calculo de tiempo transcurrido y restante de la sesión
 * @date 2025-08-14
 * @author IGAC - DIP
 * @param {time}
 * @param {time}
 * @param {boolean}
 * @returns {time}
 * @returns {time}
 * @returns {time}
 * @remarks FUENTE consulta: Claude AI => https://claude.ai/chat/1524c133-89ab-4f4c-a923-c5a6b3f5cf4e
 */
const getTimeInfo = function (sessionStartTime, currentTime, expires) {
  if (!sessionStartTime) {
    return -1
  }
  const elapsTime = currentTime - sessionStartTime
  const remainTime= Math.max (0, expires - elapsTime)
  const expired = elapsTime >= expires

  return { elapsTime, remainTime, expired }
}

/**
 * formatTime => Método para formateo de información de hora, en minutos:segundos:milisegundos
 * @date 2025-08-14
 * @author IGAC - DIP
 * @returns {string} Minutos:Segundos:Milisegundos (m:s:ms)
 * @remarks FUENTE consulta: Claude AI => https://claude.ai/chat/1524c133-89ab-4f4c-a923-c5a6b3f5cf4e
*/

const formatTime = function (datTime) {
  const totalSeconds = Math.floor (datTime / 1000)
  const minutes = Math.floor (totalSeconds / 60)
  const seconds = totalSeconds % 60
  const ms = datTime % 1000

  return `${minutes.toString().padStart (2, '0')}: ${seconds.toString().padStart (2, '0')}.${ms.toString().padStart (3, '0')}`
}

/**
 * Sección validadores campos formulario
 * @date 2025-08-25
 * @author IGAC - DIP
 * @remarks FUENTE consulta: Claude, AI => https://claude.ai/chat/5b18640b-67bd-4e3d-9658-dbc103456392
 */

/**
 * Objeto tValidators => Contiene los tipos de validadores a saber:
 * email => Validador de formación campo correo electrónico (email) con la estructura <param>+@+<param 2>+.+<param 3>
 * @param {string} valueEmail
 * required => Validador campo requerido
 * @param {string} valueReq
 * minLength => Validador de longitud mínima de campos.
 * @param {number} min
 * @param {string} value
 * @dateUpdated 2025-09-12
 * @changes inclusión objeto texto, con su correspondiente expresión regular
 * @changes actualización objeto email, con su correspondiente expresión regular
 * @dateUpdated 2025-09-15
 * @changes Implementación validador textMinLength, el cual une el validador text y minLength
 * @dateUpdated 2025-09-16
 * @changes Actualización término "el email" => "Este campo"
 * @changes Fix método minLength, cuando no se especifica objeto value, se devuelve mensaje "Éste campo es requerido"
 * @changes Fix método text: actualización término "válida" => "válido"
 * @dateUpdated 2025-09-22
 * @changes Fix expresión regular, validador text.
 * @changes Inclusión validador siglas para campo Empresa / Organización, tomando expresión regular, en objeto text (ln 537)
 * @dateUpdated 2025-09-23
 * @changes De acuerdo a reunión seguimiento 2025-09-23 => adicionar al validador tipo text, para que admita minúsculas en Nombres y Apellidos
 * @changes De acuerdo a reunión seguimiento 2025-09-23 => adicionar al validador tipo text, para que admita minúsculas en Organización / Empresa
 * @remarks FUENTE consulta: Claude, AI => https://claude.ai/chat/5b18640b-67bd-4e3d-9658-dbc103456392
 * @remarks FUENTE consulta: Claude, AI => https://claude.ai/chat/664da0e5-adb1-4323-a455-6e1b32318b43
 * @remarks Expresión regular original objeto email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 * @remarks Expresión regular, en objeto text => ^(?!.*\\d)[A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]+( [A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]+)*$
 * @remarks Expresión regular, en objeto text incluyendo términos "de", "del", "de los", "de las" en minúsculas => "^(?!.*\\d)[A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]+( (de los|de las|del|de|la|el|y) [A-Za-záéíóúñüÁÉÍÓÚÑÜ]+| [A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]+)*$"
 * @remarks Expresión regular, en objeto text incluyendo inciales => "^(?!.*\\d)[A-ZÁÉÍÓÚÑÜ]([a-záéíóúñü]+)?( ([A-ZÁÉÍÓÚÑÜ]([a-záéíóúñü]+)?|(de los|de las|del|de|la|el|y) [A-Za-záéíóúñüÁÉÍÓÚÑÜ]+))*$"
 * @remarks Expresión regular, en objeto text que valide Nombre + Apellido => "^(?!.*\\d)(?!^[A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]*$)[A-ZÁÉÍÓÚÑÜ]([a-záéíóúñü]+)?( ([A-ZÁÉÍÓÚÑÜ]([a-záéíóúñü]+)?|(de los|de las|del|de|la|el|y) [A-Za-záéíóúñüÁÉÍÓÚÑÜ]+))*$"
 * @remarks Expresión regular, en objeto text que valide expresiones con solo mayúsculas (P.Ej.MANUEL) => "^(?!.*\\d)(?=.* )[A-ZÁÉÍÓÚÑÜ]([a-záéíóúñüA-ZÁÉÍÓÚÑÜ]*)?( ([A-ZÁÉÍÓÚÑÜ]([a-záéíóúñüA-ZÁÉÍÓÚÑÜ]*)?|(de los|de las|del|de|la|el|y) [A-Za-záéíóúñüÁÉÍÓÚÑÜ]+))+$"
 * @remarks Expresión regular, en objeto text que valide expresiones con solo minúsculas => ^(?!.*\\d)(?=.* )[A-Za-záéíóúñüÁÉÍÓÚÑÜ]([a-záéíóúñüA-ZÁÉÍÓÚÑÜ]*)?( ([A-Za-záéíóúñüÁÉÍÓÚÑÜ]([a-záéíóúñüA-ZÁÉÍÓÚÑÜ]*)?|(de los|de las|del|de|la|el|y) [A-Za-záéíóúñüÁÉÍÓÚÑÜ]+))+$
 * @remarks Expresión regular, en objeto textSigle asociado al campo Empresa / Organización => ^(?!.*\\d)[A-ZÁÉÍÓÚÑÜ&][A-Za-záéíóúñüÁÉÍÓÚÑÜ &.,()-]*[A-Za-záéíóúñüÁÉÍÓÚÑÜ&)]$
 * @remarks Expresión regular, en objeto textSigle asociado al campo Empresa / Organización que acepte mínusculas => ^(?!.*\\d)[A-Za-záéíóúñüÁÉÍÓÚÑÜ&][A-Za-záéíóúñüÁÉÍÓÚÑÜ &.,()-]*[A-Za-záéíóúñüÁÉÍÓÚÑÜ&)]$
 * @remarks FUENTE consulta expresión regular, en objeto email => https://es.stackoverflow.com/questions/453176/como-validar-correctamente-un-email-con-expresiones-regulares
 * @remarks minLength es función que devuelve otra función. Uso => f(a)(b)
 * @remarks Asociado a incidencia => "Ventana emergente control usuario para descarga", P1
 */
const tValidators = {
  email: function (valueEmail) {
    const emailRegex = new RegExp ("[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[.][a-zA-Z]{2,5}","g")

    if (!valueEmail || !emailRegex.test(valueEmail)) {
      return mjeValida (valueEmail, 'email')
    }
    //Si es ok
    return ''
  },
  required: function (valueReq) {
    if (!valueReq || valueReq.toString().trim() === '') {
      //return 'Éste campo es requerido';
      return mjeValida (valueReq, 'required')
    }
    //Si es ok
    return ''
  },
  minLength: (min) => (value) => {
    console.log("Expresión =>",value)
    if (!value || typeof value === 'undefined') {
      return `Debe tener al menos ${min} caracteres`
    }
    console.log("Num pos =>",min)
    console.log("Long expresión =>",value.length)
    if (value.length < min) {
      return `Debe tener al menos ${min} caracteres`
    }

    return ''
  },
  text: function (value) {
    const txtExpReg = new RegExp ("^(?!.*\\d)(?=.* )[A-Za-záéíóúñüÁÉÍÓÚÑÜ]([a-záéíóúñüA-ZÁÉÍÓÚÑÜ]*)?( ([A-Za-záéíóúñüÁÉÍÓÚÑÜ]([a-záéíóúñüA-ZÁÉÍÓÚÑÜ]*)?|(de los|de las|del|de|la|el|y) [A-Za-záéíóúñüÁÉÍÓÚÑÜ]+))+$", "g")

    if (!value || !txtExpReg.test (value)) {
      return mjeValida (value, 'text')
    }
    return ''
  },
  textSigle: function (value) {
    const textSigle = new RegExp ("^(?!.*\\d)[A-Za-záéíóúñüÁÉÍÓÚÑÜ&][A-Za-záéíóúñüÁÉÍÓÚÑÜ &.,()-]*[A-Za-záéíóúñüÁÉÍÓÚÑÜ&)]$","g")

    if (!value || !textSigle.test (value)) {
      return mjeValida (value, 'textSigle')
    }
    return ''
  },
  textMinLength: function (min, value) {
   /* console.log("Valor prueba campo Interés =>",value);
    console.log("\nPosiciones prueba campo Interés =>", min);*/
    if (tValidators.text (value) === '' && tValidators.minLength (min)(value) !== '') {
      return "Este campo es requerido" + "  "+ tValidators.minLength (min)(value)
    }
    //console.log("Validador textMinLength =>",tValidators.text (value)+ " " + tValidators.minLength (min)(value));
    if (tValidators.text (value) === '' && tValidators.minLength (min)(value) === '') {
      return ''
    }
    return tValidators.text (value)+ " " + tValidators.minLength (min)(value)
  }
}

/**
 * mjeValida => Obtener mensaje de validación para campos que se encuentran mal ingresados o que no tengan información
 * @date 2025-09-23
 * @author IGAC - DIP
 * @param valTxt
 * @dateUpdated 2025-09-24
 * @changes Actualización mensaje validación en validador "required" "Formato inválido. Uso con Mayúscula, mínuscula" => "Formato inválido."
 * @changes Actualización mensaje validación en validador "textSigle" "Formato inválido. Uso minúscula, Mayúscula sin símbolos" => "Formato inválido."
 * @returns {string}
 */
const mjeValida = function (valTxt, fld) {
  if (!valTxt) {
    return "El campo es requerido."
  }
  switch (fld) {
    case 'email':{
      if (!valTxt.includes('@')) {
        return "El campo debe contener símbolo @"
      }
      if (!valTxt.includes('.')) {
        return "El campo debe contener dominio válido (Ej. .com, .co)"
      }
      return "Formato de email inválido (usuario@dominio.com)"
    }
    case 'required':{
      return 'El campo es requerido.'
    }
    case 'text':{
      if (/\d/.test(valTxt)) {
         return "No se permiten números en éste campo"
      }
      if (/[^A-Za-záéíóúñüÁÉÍÓÚÑÜ ]/.test(valTxt)) {
        return "Permitido solo letras incluyendo acentos"
      }
      /* if (!valTxt.includes(' ') || valTxt.trim().split(' ').length < 2){
        return "Se debe ingresar al menos nombre y apellido";
      } */
      return "Formato inválido."
    }
    case 'textSigle':{
      if (/\d/.test(valTxt)) {
         return "No se permiten números en éste campo"
      }
      if (/[^A-Za-záéíóúñüÁÉÍÓÚÑÜ ]/.test(valTxt)) {
        return "Permitido solo letras incluyendo acentos y espacio"
      }
      return "Formato inválido."
    }
  }
  return 'ok'
}
  /*
      Sección ordenamiento de objetos de manera alfabetica
      @date 2025-08-25
  */
  /**
   * sortCober => Método para realizar ordenamiento lista de registros al campo Cobertura
   * @date 2025-08-06
   * @author IGAC - DIP
   * @param {object} obj
   * @param {string} order
   * @returns {object}
   */
    const sortCober = function (obj, order = 'asc') {
      //Objetos locales
      const sortedObj = [...obj].sort ((a, b) => order === 'asc' ? a.covertype.localeCompare (b.covertype): b.covertype.localeCompare (a.covertype))
      return sortedObj
    }
    /**
     * sortDptos => Ordenamiento de departamentos
     * @date 2025-08-05
     * @author IGAC - DIP
     * @param {object} obj
     * @param {string} order
     * @returns {object}
     * @remarks Campo nombre dpto: depto
     * @remarks FUENTE consulta: Claude AI => https://claude.ai/chat/aa4f51f7-1b86-43ff-9524-8a646e5566bd
     */
    const sortDptos = function (obj, order = 'asc') {
      //Objetos locales
      const sortedObj = [...obj].sort ((a, b) => order === 'asc' ? a.attributes.denombre.localeCompare (b.attributes.denombre) : b.attributes.denombre.localeCompare (a.attributes.denombre))
      return sortedObj
    }
    /**
     * sortMpios => Método para ordenamiento de municipios
     * @date 2025-08-05
     * @author IGAC - DIP
     * @param {object} obj
     * @param {string} order
     * @returns {object}
     * @reamrks campo nombre municipio mpnombre
     * @remarks FUENTE consulta: Claude AI => https://claude.ai/chat/aa4f51f7-1b86-43ff-9524-8a646e5566bd
     */
    const sortMpios = function (obj, order = 'asc') {
      //Objetos locales
      const sortedObj = [...obj].sort ((a, b) => order === 'asc' ? a.attributes.mpnombre.localeCompare (b.attributes.mpnombre): b.attributes.mpnombre.localeCompare (a.attributes.mpnombre))
      return sortedObj
    }

     /**
     * sortOcupa => Método para realizar ordenamiento de la lista al campo Ocupación
     * @date 2025-08-26
     * @author IGAC - DIP
     * @param {object} obj
     * @param {string} order
     * @returns {object}
     * @remarks basado en método sortPaises()
     */
     const sortOcupa = function (obj, order = 'asc') {
      return sortPaises (obj, order = 'asc')
    }

    /**
     * sortPaises => Método para realizar ordenamiento de la lista al campo país
     * @date 2025-08-25
     * @author IGAC - DIP
     * @param {object} obj
     * @param {string} order
     * @returns {object}
     */
    const sortPaises = function (obj, order = 'asc') {
      //Objetos locales
      const sortedObj = [...obj].sort ((a, b) => order === 'asc' ? a.Descripcion_Valor.localeCompare (b.Descripcion_Valor): b.Descripcion_Valor.localeCompare (a.Descripcion_Valor))
      return sortedObj
    }

    /**
     * sortProyectos => Método para realizar ordenamiento lista sobre el campo Proyecto
     * @date 2025-08-26
     * @author IGAC - DIP
     * @param {object} obj
     * @param {string} order
     * @returns {object}
     */
    const sortProyectos = function (obj, order = 'asc') {
      //Objetos locales
      const sortedObj = [...obj].sort ((a, b) => order === 'asc' ? a.ProjectName.localeCompare (b.ProjectName): b.ProjectName.localeCompare (a.ProjectName))
      return sortedObj
    }

    /**
     * sortCampa_as => Método para realizar ordenamiento lista sobre el campo Campa&ene;a
     * @date 2025-08-26
     * @author IGAC - DIP
     * @param {object} obj
     * @param {string} order
     * @returns {object}
     */
    const sortCampa_as = function (obj, order = 'asc') {
      //Objetos locales
      const sortedObj = [...obj].sort ((a, b) => order === 'asc' ? a.campananame.localeCompare (b.campananame): b.campananame.localeCompare (a.campananame))
      return sortedObj
    }

/**
 * getTokenByUser => Método para obtener el token de seguridad del API, conocido el usuario del sistema
 * @date 2025-08-13
 * @author IGAC - DIP
 * @param {string} urlToken
 * @param {string} usr
 * @param {string} pass
 * @param {string} key
 * @returns {object} Cuando la petición es OK, se devuelve un objeto.
 * @returns {string} Cuando la petición es error, se devuelve un string.
 * @remarks Realizar petición al servicio, basado en método getToken
 */
const getTokenByUser = async function (urlToken, usr, pass, key) {
  //Decodificar clave
  const passwNorm = await AESToNormalPass (pass, key)
  //console.log("Termino original =>",passwNorm);
  try{
    return fetch(urlToken,{
      method:"POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: usr,
        password: passwNorm
      })
    })
    .then((rows) => {
      if (!rows.ok)
      {
        const objJSON = {
          error: {
            status: rows.status,
            statusText: rows.statusText
          }
        }
        return objJSON
      }
      return rows.json().then((data) => {
        console.log("Contenido json Token =>",data)
        return data
      })
    })
    .catch((err) => {
      //console.error("Error de consulta =>",err);
      const objJSON = {
        error: {
          status: -1,
          statusText: err
        }
      }
      return objJSON
    })
  }
  catch (error)
  {
    console.log("Error obteniendo token del server =>", error)
    throw error
  }

}
  /**
   * getToken => método para obtener token de seguridad
   * @date 2025-07-18
   * @author IGAC - DIP
   * @param urlToken
   * @dateUpdated 2025-08-25
   * @changes Actualizar control errores, en el consumo API cuando se tengan problemas en el servidor remoto.
   * @returns {string}
   * @remarks Método movido del componente FiltersSrcSIEC
   * @remarks generación del token, empleando promises
   */
  const getToken = async function (urlToken: string) {
    try{
      return fetch(urlToken,{
        method:"POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: accessAPIparams.email,
          password: accessAPIparams.password
        })
      })
      .then((rows) => {
        if (!rows.ok)
        {
          let jsonErr: any = {}
          jsonErr = {
            "error": rows.status,
            "errorMsg": rows.statusText
          }
          return jsonErr
          //throw new Error(`HTTP error! status: ${rows.status}`);
        }
        return rows.json().then((data) => {
          console.log("Contenido json Token =>",data)
          return data
        })
      })
      .catch((err) => {
        console.log("Error de consulta =>",err)
      })
    }
    catch (error)
    {
      console.log("Error obteniendo token del server =>", error)
      throw error
    }
  }

  /**
   * getTokenAlt => Método alterno para obtener token de seguridad, sin emplear promise
   * @date 2025-07-29
   * @author IGAC - DIP
   * @param urlToken
   * @dateUpdated 2025-08-27
   * @changes Actualización operación POST => GET
   * @dateUpdated 2025-08-28
   * @changes Deshacer requerimiento 2025-08-27, por parámetro sección body, el metodo no puede ser GET
   * @returns {string}
   * @remarks Basado en método getToken, sin emplear promises
   */
  const getTokenAlt = async function (urlToken: string) {
    try{
      const dataServer = await fetch(urlToken,{
        method:"POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: accessAPIparams.email,
          password: accessAPIparams.password
        })
      })
      return dataServer.json()
    }
    catch (error)
    {
      console.log("Error obteniendo token del server =>", error)
      throw error
    }
  }

  /**
   * getDominioValorTh => Método para obtener valor de un dominio conocido su identificador
   * @date 2025-07-24
   * @author IGAC - DIP
   * @param ident
   * @param tokenSeg
   * @dateUpdated 2025-08-25
   * @changes Actualizar control errores, en el consumo API cuando se tengan problemas en el servidor remoto.
   * @returns {string}
   * @remarks Consumo empleando promises
   */

  const getDominioValorTh = async function (tokenSeg: string, ident: string) {
    try{
      return fetch(ident,{
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
          let jsonErr: any = {}
          jsonErr = {
            "error": rows.status,
            "errorMsg": rows.statusText
          }
          return jsonErr
          //throw new Error(`HTTP error! status: ${rows.status}`);
        }
        return rows.json().then((data) => {
          console.log("Contenido json valor dominio =>",data)
          return data
        })
      })
      .catch((err) => {
        console.log("Error de consulta =>",err)
      })
    }
    catch (error)
    {
      console.log("Error obteniendo valores dominio del server =>", error)
      throw error
    }
  }

  /**
   * getDominioValor => Método para obtener valor de un dominio conocido su identificador
   * @date 2025-07-24
   * @author IGAC - DIP
   * @param tokenSeg
   * @param ident
   * @returns {string}
   * @remarks Método alterno para obtener información del servidor, sin emplear promises. Método asociado: getDominioValorTh
   * @remarks Fuente consulta => https://stackoverflow.com/questions/47604040/how-to-get-data-returned-from-fetch-promise (@Senthil Balaji)
   */
  const getDominioValor = async function (tokenSeg: string, ident: string) {
    try{
      const dataServer = await fetch(ident,{
        method:"GET",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer'+' '+tokenSeg
        }
      })
      return await dataServer.json()
    }
    catch (error)
    {
      console.log("Error obteniendo valores dominio del server =>", error)
      throw error
    }
  }

  /**
   * getProjDetailsByIdProj => Método para obtener los detalles asociados a un proyecto (param urlServ)
   * @date 2025-07-29
   * @author IGAC - DIP
   * @param tokSeg
   * @param urlServ
   * @returns {Object}
   * @remarks invocación método getDominioValor
   */
  const getProjDetailsByIdProj = async function (tokSeg: string, urlServ: string) {
    try{
      return await getDominioValor (tokSeg, urlServ)
    }
    catch (error)
    {
      console.log("Error obteniendo valores dominio del server =>", error)
      throw error
    }
  }
  /**
   * getInstrumDetailsByNomInstrum => Método para obtener detalles asociados a un instrumento de medición de firmas espectrales
   * @date 2025-07-29
   * @author IGAC - DIP
   * @param tokSeg
   * @param urlServ
   * @returns {Object}
   */
  const getInstrumDetailsByNomInstrum = async function (tokSeg: string, urlServ: string) {
    try{
      return await getDominioValor (tokSeg, urlServ)
    }
    catch (error)
    {
      console.log("Error obteniendo valores dominio del server =>", error)
      throw error
    }
  }

  /**
   * getFileNameByIdFile => Método para obtener nombre del archivo (filename_download), asociado a su identificador
   * @date 2025-07-30
   * @author IGAC - DIP
   * @param tokSeg
   * @param urlServ
   * @returns
   */
  const getFileNameByIdFile = async function (tokSeg: string, urlServ: string) {
    try{
      return await getDominioValor (tokSeg, urlServ)
    }
    catch (error)
    {
      console.log("Error obteniendo valores dominio del server =>", error)
      throw error
    }
  }

export{
    entorno,
    pathDataGridSIEC,
    manUsrName,
    loadIcon,
    codDeptoDivip,
    outFieldsService,
    accessAPIparams,
    sketchHelpParams,
    dataGridLang,
    tValidators,
    timeExpires,
    timeDownLoad,
    numPosiciones,
    numPageDG,
    tolerFactorSrcP,
    sortDptos,
    sortMpios,
    sortCober,
    sortPaises,
    sortProyectos,
    sortCampa_as,
    sortOcupa,
    generarFileStand,
    generateAES,
    generateSHA1,
    deriveKey,
    AESToNormalPass,
    getTimeInfo,
    formatTime,
    getToken,
    getTokenAlt,
    getTokenByUser,
    getDominioValor,
    getProjDetailsByIdProj,
    getInstrumDetailsByNomInstrum,
    getFileNameByIdFile
}