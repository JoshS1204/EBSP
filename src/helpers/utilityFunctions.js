// Helper function to check if the input is a valid alphabet
function isAlphabet(char) {
  return /^[a-zA-Z]$/.test(char)
}

// Helper function to generate an object with alphabets as keys and their count as values
function generateAlphabets(start, count, direction = 'right') {
  let alphabets = {}
  let current = start.toUpperCase()
  let number = 0

  for (let i = 0; i < count; i++) {
    const key = ['right', 'down'].includes(direction) ? i : count - i - 1
    if (number === 0) {
      alphabets = {
        ...alphabets,
        [key]: current
      }
    } else {
      alphabets = {
        ...alphabets,
        [key]: current + number
      }
    }
    if (current === 'Z') {
      current = 'A'
      number++
    } else {
      current = String.fromCharCode(current.charCodeAt(0) + 1)
    }
  }
  return alphabets
}

function debounce(cb, delay = 250) {
  let timeout

  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      cb(...args)
    }, delay)
  }
}

function throttle(func, delay = 250) {
  let timerId
  return function () {
    if (!timerId) {
      timerId = setTimeout(() => {
        func.apply(this, arguments)
        timerId = null
      }, delay)
    }
  }
}

function calculateTotalChars(str) {
  return str?.length
}

function isEven(num) {
  return num % 2 === 0
}

function generateUniqueHexColors(quantity) {
  //create unique hexa color codes and put it in a array
  const colorSet = new Set()
  while (colorSet.size < quantity) {
    let color = '#'
    for (let i = 0; i < 6; i++) {
      // Generate a random digit between 0 and 15 and convert it to a hexadecimal character
      const randomDigit = Math.floor(Math.random() * 16).toString(16)
      color += randomDigit
    }
    colorSet.add(color)
  }
  return Array.from(colorSet)
}

export {
  isAlphabet,
  generateAlphabets,
  debounce,
  calculateTotalChars,
  throttle,
  isEven,
  generateUniqueHexColors
}
