export interface LayerInfo {
  id: number
  name: string
  parentLayerId?: number
  subLayerIds?: number[] | null
  nameServicio?: string
  url?: string
  nameOriginal?: string
}

export interface MapServiceResponse {
  layers: LayerInfo[]
}

export interface FieldInfo {
  name: string
  type: string
}
