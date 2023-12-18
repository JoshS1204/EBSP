import { generateAlphabets, isEven } from './utilityFunctions'
import { v4 as uuidv4 } from 'uuid'

const createCircularTableHandler = (layerConfig, newName = null) => {
  //create and add data to layersArray
  const tableData = layerConfig?.tableData
  let alphabetsObject = {}
  const shapeData = {
    shapes: [],
    layerConfig: {
      ...layerConfig,
      name: newName ? newName : layerConfig?.name
    }
  }

  if (tableData?.seatLabelType === 'alphabets') {
    alphabetsObject = generateAlphabets(
      tableData?.seatLabelStartWith,
      tableData?.seatCount,
      tableData?.labelDirection
    )
  }

  const centerX = tableData?.centerX
  const centerY = tableData?.centerY
  const tableRadius =
    Number(
      (Number(tableData?.perSeatTableRadius) * (Number(tableData?.seatCount) - 4)).toFixed(0)
    ) > 42
      ? Number(
        (Number(tableData?.perSeatTableRadius) * (Number(tableData?.seatCount) - 4)).toFixed(0)
      )
      : 42

  const table = {
    x: centerX,
    y: centerY,
    radius: tableRadius,
    fill: '#fff',
    stroke: '#324B4B',
    text: 'red',
    fontSize: 13,
    fontFamily: 'Poppins',
    fontStyle: 'bold',
    align: 'center',
    verticalAlign: 'middle',
    type: 'Circle',
    isParent: true,
    // text: tableData?.name,
    masTerTabel: true
  }
  shapeData.shapes.push(table)

  const seatAngle = (2 * Math.PI) / tableData?.seatCount
  for (let i = 0; i < tableData?.seatCount; i++) {
    const angle = i * seatAngle
    const x = centerX + Math.cos(angle) * (tableRadius + tableData?.seatRadius)
    const y = centerY + Math.sin(angle) * (tableRadius + tableData?.seatRadius)
    const seat = {
      x: x,
      y: y,
      radius: tableData?.seatRadius,
      fill: '#18A19B',
      stroke: '#324B4B',
      type: 'Circle',
      isSeat: true,
      isSold: false,
      isAvailable: false,
      uuid: uuidv4(),
      isHold: false,
      isTicketAssigned: false,
      seat_meta: {},
      isSelected: false
    }
    if (tableData?.seatLabelType === 'numbers') {
      seat.text =
        tableData?.labelDirection == 'right'
          ? i + Number(tableData?.seatLabelStartWith) || 0
          : tableData?.seatCount - i + Number(tableData?.seatLabelStartWith) - 1
    }
    if (tableData?.seatLabelType === 'alphabets') {
      seat.text = alphabetsObject[i]
    }
    shapeData.shapes.push(seat)
  }
  return shapeData
}

const createRectangleTableHandler = (layerConfig, newName = null) => {
  const tableData = layerConfig?.tableData
  const seatCountX = Number(tableData?.seatCountX)
  const seatCountY = Number(tableData?.seatCountY)
  const seatRadius = Number(tableData?.seatRadius)
  let seatLabelStartWith
  let alphabetsObject = {}
  if (tableData?.seatLabelType === 'numbers') {
    if (tableData?.labelDirection == 'right') {
      seatLabelStartWith = Number(tableData?.seatLabelStartWith) - 1
    } else {
      seatLabelStartWith = Number(tableData?.seatLabelStartWith) + seatCountX + seatCountY
    }
  }
  if (tableData?.seatLabelType === 'alphabets') {
    alphabetsObject = generateAlphabets(
      tableData?.seatLabelStartWith,
      seatCountX + seatCountY,
      tableData?.labelDirection
    )
    seatLabelStartWith = 0
  }
  const shapeData = {
    shapes: [],
    layerConfig: {
      ...layerConfig,
      name: newName ? newName : layerConfig?.name
    }
  }
  const centerX = tableData?.centerX
  const centerY = tableData?.centerY

  //caluculate table width and height from seat count
  let tableWidth = null
  let tableHeight = null

  if (seatCountX < 4 && !isEven(seatCountX)) {
    tableWidth = Number(seatCountX * 1.4 * seatRadius)
  } else if (seatCountX < 6 && !isEven(seatCountX)) {
    tableWidth = Number(seatCountX * 1.3 * seatRadius)
  } else {
    tableWidth = Number(seatCountX * 1.2 * seatRadius)
  }

  if (seatCountY < 4 && !isEven(seatCountY)) {
    tableHeight = Number(seatCountY * 1.4 * seatRadius)
  } else if (seatCountY < 6 && !isEven(seatCountY)) {
    tableHeight = Number(seatCountY * 1.3 * seatRadius)
  } else {
    tableHeight = Number(seatCountY * 1.2 * seatRadius)
  }

  tableHeight = tableHeight > 48 ? tableHeight : 48
  tableWidth = tableWidth > 48 ? tableWidth : 48

  const gapPercentage = 0

  //create a text object for table name in the center of the table

  // Create the table
  const rectangleable = {
    x: centerX - tableWidth / 2,
    y: centerY - tableHeight / 2,
    width: tableWidth,
    height: tableHeight,
    fill: '#fff',
    stroke: '#324B4B',
    type: 'Rect',
    isParent: true
    // text: tableData?.name,
  }
  shapeData.shapes.push(rectangleable)
  // Calculate the available space for seats
  const availableWidth = tableWidth - 2 * seatRadius
  const availableHeight = tableHeight - 2 * seatRadius

  // Calculate the spacing between seats
  const seatSpacingX =
    seatCountX > 2
      ? availableWidth /
      (Math.ceil(seatCountX / 2) - 1 + gapPercentage * (Math.ceil(seatCountX / 2) - 1))
      : 0
  const seatSpacingY =
    seatCountY > 2
      ? availableHeight /
      (Math.ceil(seatCountY / 2) - 1 + gapPercentage * (Math.ceil(seatCountY / 2) - 1))
      : 0
  // Create the seats on left side of the table
  for (let i = 0; i < Math.ceil(seatCountX / 2); i++) {
    const x =
      centerX - tableWidth / 2 + seatRadius + seatSpacingX * i + gapPercentage * seatSpacingX * i
    seatLabelStartWith =
      tableData?.seatLabelType == 'numbers' && tableData?.labelDirection == 'left'
        ? seatLabelStartWith - 1
        : seatLabelStartWith + 1
    // Create seats on the left side
    const yLeft = centerY - tableHeight / 2 - seatRadius
    const seatLeft = {
      x: x,
      y: yLeft,
      radius: seatRadius,
      fill: '#18A19B',
      stroke: '#324B4B',
      type: 'Circle',
      text: '',
      isSeat: true,
      isSold: false,
      isAvailable: false,
      uuid: uuidv4(),
      isHold: false,
      isTicketAssigned: false,
      seat_meta: {},
      isSelected: false
    }
    if (tableData?.seatLabelType === 'numbers') {
      if (tableData?.labelDirection == 'right') {
        seatLeft.text = seatLabelStartWith
      } else {
        seatLeft.text = seatLabelStartWith
      }
    } else {
      seatLeft.text = alphabetsObject[seatLabelStartWith - 1]
    }
    shapeData.shapes.push(seatLeft)
  }
  // Create the seats on the bottom of the table
  for (let i = 0; i < Math.floor(seatCountY / 2); i++) {
    const y =
      centerY - tableHeight / 2 + seatRadius + seatSpacingY * i + gapPercentage * seatSpacingY * i
    seatLabelStartWith =
      tableData?.seatLabelType == 'numbers' && tableData?.labelDirection == 'left'
        ? seatLabelStartWith - 1
        : seatLabelStartWith + 1
    // Create seats on the bottom side
    const xBottom = centerX + tableWidth / 2 + seatRadius
    const seatBottom = {
      x: xBottom,
      y: y,
      radius: seatRadius,
      fill: '#18A19B',
      stroke: '#324B4B',
      type: 'Circle',
      text: '',
      isSeat: true,
      isSold: false,
      isAvailable: false,
      uuid: uuidv4(),
      isHold: false,
      isTicketAssigned: false,
      seat_meta: {},
      isSelected: false
    }
    if (tableData?.seatLabelType === 'numbers') {
      if (tableData?.labelDirection == 'right') {
        seatBottom.text = seatLabelStartWith
      } else {
        seatBottom.text = seatLabelStartWith
      }
    } else {
      seatBottom.text = alphabetsObject[seatLabelStartWith - 1]
    }
    shapeData.shapes.push(seatBottom)
  }
  // Create the seats on right side of the table
  for (let i = 0; i < Math.floor(seatCountX / 2); i++) {
    const x =
      centerX + tableWidth / 2 - seatRadius - seatSpacingX * i - gapPercentage * seatSpacingX * i
    seatLabelStartWith =
      tableData?.seatLabelType == 'numbers' && tableData?.labelDirection == 'left'
        ? seatLabelStartWith - 1
        : seatLabelStartWith + 1
    // Create seats on the right side
    const yRight = centerY + tableHeight / 2 + seatRadius
    const seatRight = {
      x: x,
      y: yRight,
      radius: seatRadius,
      fill: '#18A19B',
      stroke: '#324B4B',
      type: 'Circle',
      text: '',
      isSeat: true,
      isSold: false,
      isAvailable: false,
      uuid: uuidv4(),
      isHold: false,
      isTicketAssigned: false,
      seat_meta: {},
      isSelected: false
    }
    if (tableData?.seatLabelType === 'numbers') {
      if (tableData?.labelDirection == 'right') {
        seatRight.text = seatLabelStartWith
      } else {
        seatRight.text = seatLabelStartWith
      }
    } else {
      seatRight.text = alphabetsObject[seatLabelStartWith - 1]
    }
    shapeData.shapes.push(seatRight)
  }
  // Create the seats on the top of the table
  for (let i = 0; i < Math.ceil(seatCountY / 2); i++) {
    const y =
      centerY + tableHeight / 2 - seatRadius - seatSpacingY * i - gapPercentage * seatSpacingY * i
    seatLabelStartWith =
      tableData?.seatLabelType == 'numbers' && tableData?.labelDirection == 'left'
        ? seatLabelStartWith - 1
        : seatLabelStartWith + 1
    // Create seats on the top side
    const xTop = centerX - tableWidth / 2 - seatRadius
    const seatTop = {
      x: xTop,
      y: y,
      radius: seatRadius,
      fill: '#18A19B',
      stroke: '#324B4B',
      type: 'Circle',
      text: '',
      isSeat: true,
      isSold: false,
      isAvailable: false,
      uuid: uuidv4(),
      isHold: false,
      isTicketAssigned: false,
      seat_meta: {},
      isSelected: false
    }
    if (tableData?.seatLabelType === 'numbers') {
      if (tableData?.labelDirection == 'right') {
        seatTop.text = seatLabelStartWith
      } else {
        seatTop.text = seatLabelStartWith
      }
    } else {
      seatTop.text = alphabetsObject[seatLabelStartWith - 1]
    }
    shapeData.shapes.push(seatTop)
  }
  return shapeData
}

const createSeatingAreaTableHandler = (layerConfig, newName = null) => {
  const tableData = layerConfig?.tableData
  const shapeData = {
    shapes: [],
    layerConfig: {
      ...layerConfig,
      name: newName ? newName : layerConfig?.name
    }
  }
  // Add code to create the seating area
  const centerX = tableData?.centerX
  const centerY = tableData?.centerY
  const seatRadius = 20
  const rows = tableData?.numberOfRows
  const seatsPerRow = tableData?.seatsPerRow
  const gap = 30
  let alphabetsObject = generateAlphabets(
    tableData?.rowLabelStartWith,
    tableData?.numberOfRows,
    tableData?.rowLabelType
  )

  //table background white

  let extraSpace = 0.65
  //calculate extra space according to seatsPerRow
  extraSpace =
    tableData?.seatsPerRow >= 10
      ? 0.8
      : tableData?.seatsPerRow > 8
        ? 0.75
        : tableData?.seatsPerRow > 6
          ? 0.7
          : 0.61

  const tableWidth = seatsPerRow * (seatRadius * extraSpace + gap) + gap
  const tableHeight = rows * (seatRadius * 0.3 + gap) + gap
  const table = {
    x: centerX - 20,
    y: centerY - 20,
    width: tableWidth,
    height: tableHeight,
    fill: '#fff',
    stroke: '#fff',
    type: 'Rect',
    name: tableData?.type,
    isParent: true
  }
  shapeData.shapes.push(table)

  for (let i = 0; i < rows; i++) {
    if (['Show All', 'Left Side'].includes(tableData?.selectedRowLabel)) {
      const rowLabelLeft = {
        // calculate the x,y position of this label according to the first seat with the same seat gap
        x: centerX - gap * 1.5,
        y: centerY + i * (seatRadius + gap) - 4,

        text: `${alphabetsObject[i]}`,
        fontSize: 13,
        fontFamily: 'Poppins',
        fontStyle: 'bold',
        type: 'Text'
      }
      shapeData.shapes.push(rowLabelLeft)
    }

    for (let j = 0; j < seatsPerRow; j++) {
      const x = centerX + j * (seatRadius + gap)
      const y = centerY + i * (seatRadius + gap)
      const seat = {
        x: x,
        y: y,
        radius: seatRadius,
        fill: '#18A19B',
        stroke: '#324B4B',
        fontSize: 13,
        fontFamily: 'Poppins',
        fontStyle: 'bold',
        type: 'Circle',
        isSeat: true,
        isSold: false,
        isAvailable: false,
        uuid: uuidv4(),
        isHold: false,
        isTicketAssigned: false,
        seat_meta: {},
        isSelected: false,
        rowName: alphabetsObject[i],
        text:
          tableData?.seatLabelType == 'right'
            ? j + Number(tableData?.seatLabelStartWith)
            : tableData?.seatsPerRow - j + Number(tableData?.seatLabelStartWith) - 1
      }
      shapeData.shapes.push(seat)
    }
    if (['Show All', 'Right Side'].includes(tableData?.selectedRowLabel)) {
      const rowLabelRight = {
        //put it after the last seat of the row with same gap of seats
        x: centerX + seatsPerRow * (seatRadius + gap) - 10,
        y: centerY + i * (seatRadius + gap) - 5,

        text: `${alphabetsObject[i]}`,
        fontSize: 13,
        fontFamily: 'Poppins',
        fontStyle: 'bold',
        type: 'Text'
      }
      shapeData.shapes.push(rowLabelRight)
    }
  }
  return shapeData
}

const createWaitingAreaTableHandler = (layerConfig, newName = null) => {
  const tableData = layerConfig?.tableData

  const shapeData = {
    shapes: [],
    layerConfig: {
      ...layerConfig,
      name: newName ? newName : layerConfig?.name
    }
  }
  const centerX = tableData?.centerX
  const centerY = tableData?.centerY

  //caluculate table width and height from seat count
  const tableWidth = Number(tableData?.width)
  const tableHeight = Number(tableData?.height)

  // Create the table
  const rectangleable = {
    x: centerX - tableWidth / 2,
    y: centerY - tableHeight / 2,
    width: tableWidth,
    height: tableHeight,
    fill: '#fff',
    stroke: '#324B4B',
    type: 'Rect',
    isParent: true,
    uuid: uuidv4()
  }

  shapeData.shapes.push(rectangleable)
  return shapeData
}

export {
  createCircularTableHandler,
  createRectangleTableHandler,
  createSeatingAreaTableHandler,
  createWaitingAreaTableHandler
}
