import { React } from 'jimu-core'
import { Button, Select, Table } from 'jimu-ui'

//@ts-expect-error
import './stylesTablaResultados.css'

const { useMemo } = React

/**
 * Modelo de paginacion manual para la tabla de resultados.
 */
export interface PaginationModelTR {
  page: number
  pageSize: number
}

/**
 * Estructura minima de un registro mostrado en la tabla.
 */
export interface TablaResultadosRow {
  id: string | number
  locat?: string
  phSig?: string
  [key: string]: any
}

/**
 * Props del componente de tabla de resultados.
 */
export interface TablaResultadosTableProps {
  rows: TablaResultadosRow[]
  paginationModel: PaginationModelTR
  pageSizeOptions: number[]
  selectedRowIds: Array<string | number>
  isDownloading: boolean
  containerRef: React.RefObject<HTMLDivElement>
  onPaginationModelChange: (model: PaginationModelTR) => void
  onRowSelectionChange: (rowIds: Array<string | number>) => void
  onRowClick: (row: TablaResultadosRow) => void
  onDownloadClick: (row: TablaResultadosRow) => void
  onDetailsClick: (row: TablaResultadosRow) => void
}

/**
 * Renderiza una tabla nativa de jimu-ui con paginacion manual.
 *
 * @param props Propiedades de renderizado y manejo de eventos de la tabla.
 * @returns Componente visual de tabla de resultados.
 */
const TablaResultadosTable = function (props: TablaResultadosTableProps) {
  const {
    rows,
    paginationModel,
    pageSizeOptions,
    selectedRowIds,
    isDownloading,
    containerRef,
    onPaginationModelChange,
    onRowSelectionChange,
    onRowClick,
    onDownloadClick,
    onDetailsClick
  } = props

  const totalRows = rows?.length ?? 0
  const totalPages = Math.max(1, Math.ceil(totalRows / paginationModel.pageSize))
  const currentPage = Math.min(paginationModel.page, totalPages - 1)

  const startIndex = currentPage * paginationModel.pageSize
  const endIndex = Math.min(startIndex + paginationModel.pageSize, totalRows)

  const pageRows = useMemo(() => {
    return rows.slice(startIndex, endIndex)
  }, [rows, startIndex, endIndex])

  /**
   * Actualiza el tamano de pagina y reinicia a la primera pagina.
   */
  const handlePageSizeChange = function (evt) {
    const nextPageSize = Number(evt?.target?.value ?? paginationModel.pageSize)
    onPaginationModelChange({ page: 0, pageSize: nextPageSize })
  }

  /**
   * Navega una pagina atras dentro de los limites actuales.
   */
  const goPrevPage = function () {
    onPaginationModelChange({
      ...paginationModel,
      page: Math.max(0, currentPage - 1)
    })
  }

  /**
   * Navega una pagina adelante dentro de los limites actuales.
   */
  const goNextPage = function () {
    onPaginationModelChange({
      ...paginationModel,
      page: Math.min(totalPages - 1, currentPage + 1)
    })
  }

  /**
   * Maneja la seleccion de registro y sincroniza el zoom en mapa.
   */
  const handleRowClick = function (row: TablaResultadosRow) {
    onRowSelectionChange([row.id])
    onRowClick(row)
  }

  return (
    <div className='tr-results-wrapper'>
      <div className='tr-results-table-container' ref={containerRef}>
        <Table responsive className='tblAlign tr-results-table'>
          <thead>
            <tr>
              <th className='w-100table'>Operaciones</th>
              <th className='w-100table'>Ubicacion</th>
              <th className='w-100table'>Archivo firma</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length > 0 ? pageRows.map((row) => {
              const isSelected = selectedRowIds.includes(row.id)
              return (
                <tr
                  key={row.id}
                  data-id={row.id}
                  className={isSelected ? 'row-highlight tr-results-selected' : ''}
                  onClick={() => { handleRowClick(row) }}
                >
                  <td style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
                    <Button
                      // type='tertiary'
                      onClick={(evt) => {
                        evt.stopPropagation()
                        onDownloadClick(row)
                      }}
                      disabled={isDownloading}
                      className='td-button'
                    >
                      Descarga
                    </Button>
                    <Button
                      // type='tertiary'
                      onClick={(evt) => {
                        evt.stopPropagation()
                        onDetailsClick(row)
                      }}
                      className='td-button'
                    >
                      Detalles
                    </Button>
                  </td>
                  <td>{row.locat}</td>
                  <td>{row.phSig}</td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan={3}>Sin resultados para mostrar.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <div className='tr-results-pagination'>
        <div className='tr-results-pagination-left'>
          <label className='tr-results-pagination-label'>Filas por pagina:</label>
          <Select value={String(paginationModel.pageSize)} onChange={handlePageSizeChange}>
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </Select>
        </div>
        <div className='tr-results-pagination-right'>
          <span>{totalRows === 0 ? '0-0 de 0' : `${startIndex + 1}-${endIndex} de ${totalRows}`}</span>
          <Button type='secondary' size='sm' disabled={currentPage <= 0} onClick={goPrevPage}>Anterior</Button>
          <Button type='secondary' size='sm' disabled={currentPage >= totalPages - 1} onClick={goNextPage}>Siguiente</Button>
        </div>
      </div>
    </div>
  )
}

export default TablaResultadosTable
