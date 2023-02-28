export declare const colorMap: {
    tranparent: string;
    initial: string;
    inherit: string;
    text: string;
    blue: string;
    indigo: string;
    purple: string;
    pink: string;
    red: string;
    orange: string;
    yellow: string;
    green: string;
    teal: string;
    grey: string;
    background: string;
    border: string;
    accent: string;
    blueSurface: string;
    indigoSurface: string;
    purpleSurface: string;
    pinkSurface: string;
    redSurface: string;
    orangeSurface: string;
    yellowSurface: string;
    greenSurface: string;
    tealSurface: string;
    greySurface: string;
    accentSurface: string;
    blueActive: string;
    indigoActive: string;
    purpleActive: string;
    pinkActive: string;
    redActive: string;
    orangeActive: string;
    yellowActive: string;
    greenActive: string;
    tealActive: string;
    greyActive: string;
    accentActive: string;
    blueDim: string;
    indigoDim: string;
    purpleDim: string;
    pinkDim: string;
    redDim: string;
    orangeDim: string;
    yellowDim: string;
    greenDim: string;
    tealDim: string;
    greyDim: string;
    accentDim: string;
    bluePrimary: string;
    indigoPrimary: string;
    purplePrimary: string;
    pinkPrimary: string;
    redPrimary: string;
    orangePrimary: string;
    yellowPrimary: string;
    greenPrimary: string;
    tealPrimary: string;
    greyPrimary: string;
    accentPrimary: string;
    blueLight: string;
    indigoLight: string;
    purpleLight: string;
    pinkLight: string;
    redLight: string;
    orangeLight: string;
    yellowLight: string;
    greenLight: string;
    tealLight: string;
    greyLight: string;
    accentLight: string;
    blueBright: string;
    indigoBright: string;
    purpleBright: string;
    pinkBright: string;
    redBright: string;
    orangeBright: string;
    yellowBright: string;
    greenBright: string;
    tealBright: string;
    greyBright: string;
    accentBright: string;
    textPrimary: string;
    textAccent: string;
    textSecondary: string;
    textTertiary: string;
    backgroundPrimary: string;
    backgroundSecondary: string;
    borderPrimary: string;
    blueGradient: string;
    purpleGradient: string;
    redGradient: string;
    greenGradient: string;
    greyGradient: string;
    accentGradient: string;
};
export declare type Color = keyof typeof colorMap;
export declare type WithColor = {
    /** The color to style the component */
    color?: Color;
};
declare type ColorStyleItem = {
    text: string;
    background: string;
    border: string;
    hover: string;
};
declare type ColorAttribute = keyof ColorStyleItem;
declare const colorStyleMap: {
    transparent: ColorStyleItem;
    disabled: ColorStyleItem;
    background: ColorStyleItem;
    blueGradient: ColorStyleItem;
    purpleGradient: ColorStyleItem;
    redGradient: ColorStyleItem;
    greenGradient: ColorStyleItem;
    greyGradient: ColorStyleItem;
    accentGradient: ColorStyleItem;
    blueSecondary: ColorStyleItem;
    indigoSecondary: ColorStyleItem;
    purpleSecondary: ColorStyleItem;
    pinkSecondary: ColorStyleItem;
    redSecondary: ColorStyleItem;
    orangeSecondary: ColorStyleItem;
    yellowSecondary: ColorStyleItem;
    greenSecondary: ColorStyleItem;
    tealSecondary: ColorStyleItem;
    greySecondary: ColorStyleItem;
    accentSecondary: ColorStyleItem;
    bluePrimary: ColorStyleItem;
    indigoPrimary: ColorStyleItem;
    purplePrimary: ColorStyleItem;
    pinkPrimary: ColorStyleItem;
    redPrimary: ColorStyleItem;
    orangePrimary: ColorStyleItem;
    yellowPrimary: ColorStyleItem;
    greenPrimary: ColorStyleItem;
    tealPrimary: ColorStyleItem;
    greyPrimary: ColorStyleItem;
    accentPrimary: ColorStyleItem;
};
export declare type ColorStyle = keyof typeof colorStyleMap;
export declare type WithColorStyle = {
    /** The color style to style the component */
    colorStyle?: ColorStyle;
};
export declare const getColor: (color: Color) => string;
export declare const getColorStyle: (colorStyle: ColorStyle, attribute: ColorAttribute) => string;
export {};
