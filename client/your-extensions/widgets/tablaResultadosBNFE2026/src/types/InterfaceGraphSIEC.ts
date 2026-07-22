/**
   * Interface LabelItem => Definición de la estructura de datos del objeto LabelItem
   * @date 2025-06-11
   * @author Ing.RRH
   * @dateUpdated 2025-06-18
   * @changes Traslado desde widget ppal (searchSIEC)
   */

  export interface LabelItem {
    label: string;
    description: string;
    color: `rgba(${number}, ${number}, ${number}, ${number})` | string;
    tituloGrafico: string;
  }

  export interface InterfaceModalBody {
    Id_MetaDato?: string;
    Id_Proyecto?: string;
    Id_Instrumento?: string;
    Id_Archivo?: string;
    Id_Entidad?: string;
    Id_Pais?: string;
    Id_Ocupacion?: string;
    fileSigla?: string;
    fileName?: string;
    fileSize?: string;
    fileType?: string;
    fileDate?: string;
    fileUrl?: string;
    projName?: string;
    instrumName?: string;
    paisName?: string;
    ocupaName?: string;
    campa_a?: string;
    proj?: string;
    instrum?: string;
    pais?: string;
    ocupa?: string;
    ubic?: string;
    Citation?: string;
    Credits?: string;
    Descripcion?: string;
    Descripcion_Archivo?: string;
    Descripcion_Proyecto?: string;
    Descripcion_Instrumento?: string;
    Descripcion_Pais?: string;
    Descripcion_Ocupacion?: string;
    Summary?: string;
    Topics_Keywords?: string;
    Citeinfo_Origin?: string;
    Citeinfo_Pubdate?: string;
    Citeinfo_Title?: string;
    Pubinfo_Pubplace?: string;
    Pubinfo_Publish?: string;
    Onlink?: string;
    Lworkcit_Origin?: string;
    Lworkcit_Title?: string;
    Lworkcit_Publish?: string;
    Lworkcit_Department?: string;
    Lworkcit_Laboratory?: string;
    Lworkcit_Onlink_Based?: string;
    Lworkcit_Address_Type?: string;
    Lworkcit_Delivery_Point?: string;
    Lworkcit_Address_City?: string;
    Lworkcit_Administrative_Area?: string;
    Lworkcit_Postal_Code?: string;
    Lworkcit_Email_Address?: string;
    Lworkcit_Name?: string;
    Lworkcit_Version?: string;
    StandardName?: string;
    StandardManufacturer?: string;
    Id_SignalType?: string;
    SpectralRange?: string;
    SpectralResolution?: string;
    LightSource?: string;
    LightingAngle?: string;
    FiberTilt?: string;
    FieldOfView?: string;
    Id_AdaptedOptics?: string;
    CloudcoverPercentage?: string;
    ReferenceSystem?: string;
    SamplingDate?: string;
    SamplingTime?: string;
    NumSignatures?: string;
    Id_CoverState?: string;
    Id_RoofState?: string;
    Id_RoofDescription?: string;
    Id_WaterType?: string;
    WaterDescription?: string;
    Id_PhenoState?: string;
    Id_SoilType?: string;
    Id_SoilColor?: string;
    Id_SoilDetail?: string;
    Id_RoofAppearance?: string;
    Id_RoofColor?: string;
    Id_SpectrlaHomogeneityRoof?: string;
    Iluminance?: string;
    ChlorophyllIndex?: string;
    IdSpectraGraph?: string;
    AmbientTemperature?: string;
    RelativeHumidity?: string;
    WindSpeed?: string;
    ZenithAngle?: string;
    AzimuthAngle?: string;
    Lworkcit_Voice?: string;
    Lworkcit_Address_Country?: string;
    Id_Archivo_Zip?: string;
    ubicLat?: string;
    ubicLon?: string;
    GroundDistance?: string;
    firma?: Array<{
      id?: string;
      SignatureIdentifier?: string;
      Id_CoverType?: string;
      InstrumentName?: string;
      SeaLevelAltitude?: string;
      IntegrationTime?: string;
      Boxcar_Width?: string;
      Scan_Average?: string;
      MeasurementHeight?: string;
    }>;
  }