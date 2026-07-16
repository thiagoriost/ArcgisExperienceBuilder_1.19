export interface ObjDrawInfo {
    drawingInfo: DrawingInfo;
}

export interface DrawingInfo {
    renderer: Renderer;
    scaleSymbols: boolean;
    transparency: number;
    labelingInfo: LabelingInfo[];
}

export interface LabelingInfo {
    labelExpressionInfo: LabelExpressionInfo;
    labelPlacement: string;
    multiPart: string;
    allowOverrun: boolean;
    deconflictionStrategy: string;
    repeatLabel: boolean;
    useClippedGeometry: boolean;
    stackLabel: boolean;
    stackAlignment: string;
    removeDuplicates: string;
    stackRowLength: number;
    useCodedValues: boolean;
    maxScale: number;
    minScale: number;
    name: string;
    priority: number;
    symbol: LabelingInfoSymbol;
}

export interface LabelExpressionInfo {
    expression: string;
    title: string;
}

export interface LabelingInfoSymbol {
    type: string;
    color: number[];
    backgroundColor: null;
    borderLineColor: null;
    borderLineSize: null;
    verticalAlignment: string;
    horizontalAlignment: string;
    rightToLeft: boolean;
    angle: number;
    xoffset: number;
    yoffset: number;
    kerning: boolean;
    haloColor: number[];
    haloSize: number;
    font: Font;
}

export interface Font {
    family: string;
    size: number;
    style: string;
    weight: string;
    decoration: string;
}

export interface Renderer {
    type: string;
    authoringInfo?: AuthoringInfo;
    field?: string;
    classificationMethod?: string;
    minValue?: number;
    classBreakInfos?: ClassBreakInfo[];
    uniqueValueInfos?: UniqueValueInfo[];
    legendOptions?: LegendOptions;
}

export interface AuthoringInfo {
    type: string;
    colorRamp: AuthoringInfoColorRamp;
    classificationMethod: string;
}

export interface AuthoringInfoColorRamp {
    type: string;
    colorRamps: ColorRampElement[];
}

export interface ColorRampElement {
    type: string;
    algorithm: string;
    fromColor: number[];
    toColor: number[];
}

export interface ClassBreakInfo {
    symbol: OutlineClass;
    classMinValue?: number;
    classMaxValue: number;
    label: string;
}

export interface UniqueValueInfo {
    value: string;
    label: string;
    symbol: OutlineClass;
}

export interface OutlineClass {
    type: Type;
    style: Style;
    color: number[];
    outline?: OutlineClass;
    width?: number;
}

export enum Style {
    EsriSFSSolid = "esriSFSSolid",
    EsriSLSSolid = "esriSLSSolid",
}

export enum Type {
    EsriSFS = "esriSFS",
    EsriSLS = "esriSLS",
}

export interface LegendOptions {
    order: string;
}
