export const addCircleObjectHandler = (layerConfig, newName = null) => {
    const objectData = layerConfig?.objectData;
    const circle = {
        x: objectData?.centerX,
        y: objectData?.centerY,
        radius: objectData?.circleRadius,
        fill: objectData?.circleColor,
        stroke: '#BEC9C8',
        type: 'Circle',
    }
    const shapedata = {
        shapes: [circle],
        layerConfig: {
            ...layerConfig,
            name: newName ? newName : layerConfig?.name,
        },
    }
    return shapedata;
}

export const addSquareObjectHandler = (layerConfig, newName = null) => {
    const objectData = layerConfig?.objectData;
    const rectangle = {
        x: objectData?.centerX,
        y: objectData?.centerY,
        width: objectData?.width,
        height: objectData?.height,
        fill: objectData?.fill,
        stroke: '#BEC9C8',
        type: 'Rect',
    }
    const shapedata = {
        shapes: [rectangle],
        layerConfig: {
            ...layerConfig,
            name: newName ? newName : layerConfig?.name,
        },
    }
    return shapedata;
}

export const addLineObjectHandler = (layerConfig, newName = null) => {

    const objectData = layerConfig?.objectData;

    let lineStartX = 0;
    let lineStartY = 0;
    let lineEndX = 200;
    let lineEndY = 0;

    const line = {
        x: objectData?.centerX,
        y: objectData?.centerY,
        points: objectData?.points ? [...objectData?.points] : [lineStartX, lineStartY, lineEndX, lineEndY],
        stroke: '#000',
        strokeWidth: objectData?.strokeWidth,
        type: 'Line',
        componentName: 'lineObjectController',
    }
    const shapedata = {
        shapes: [line],
        layerConfig: {
            ...layerConfig,
            name: newName ? newName : layerConfig?.name,
        },
    }
    return shapedata;
}
export const addTextObjectHandler = (layerConfig, newName = null) => {


    const objectData = layerConfig?.objectData;
    const text = {
        x: objectData?.centerX,
        y: objectData?.centerY,
        fontSize: objectData?.fontSize,
        text: objectData?.text,
        fill: objectData?.fill,
        fontFamily: objectData?.fontFamily,
        fontStyle: objectData?.fontStyle,
        type: 'Text',
    }
    const shapedata = {
        shapes: [text],
        layerConfig: {
            ...layerConfig,
            name: newName ? newName : layerConfig?.name,
        },
    }
    return shapedata;
}

export const addIconObjectHandler = (layerConfig, newName = null) => {
    const objectData = layerConfig?.objectData;
    const icon = {
        x: objectData?.centerX,
        y: objectData?.centerY,
        image: objectData.image,
        width: objectData.width,
        height: objectData.height,
        type: 'Icon',
    }
    const shapedata = {
        shapes: [icon],
        layerConfig: {
            ...layerConfig,
            name: newName ? newName : layerConfig?.name,
        },
    }
    return shapedata;
}


