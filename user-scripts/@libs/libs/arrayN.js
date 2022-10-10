export class ArrayN {

  constructor(settings) {

    if (!settings) throw new TypeError(`a settings object must be provided to initialize the ArrayN`)

    const validSettings = ['sizes', 'initialValues', 'preCalculateCoordinates']
    const validSettingsAsStringObject = `{${validSettings.join(', ')}}`

    // Check provided keys of settings
    const settingKeys = Object.keys(settings)

    if (!settingKeys.includes('sizes')) throw new TypeError(`key 'sizes' must be defined in the settings object`)

    settingKeys.forEach(key => {
      if (!validSettings.includes(key)) throw new TypeError(`key '${key}' is not accepted as valid setting to initialize the ArrayN, these are the the valid keys ${validSettingsAsStringObject}`)
    })

    let {sizes, initialValues = [], preCalculateCoordinates = false} = settings

    // Check povided values of keys setting
    if (!Array.isArray(sizes) || !sizes.every(n => typeof n === 'number')) throw new TypeError(`sizes must be an array of numbers`)

    sizes.forEach(n => {
      if (n <= 1) throw TypeError(`sizes cannot contain values less or equal to 1`)
    })

    if (typeof preCalculateCoordinates !== 'boolean') throw new TypeError(`key 'preCalculateCoordinates' must be a boolean`)

    if (ArrayN.#isNoneIterable(initialValues)) throw new TypeError(`key 'initialValues' must be an iterable`)

    this.#sizes = Object.freeze(sizes)

    this.#preCalculateCoordinates = preCalculateCoordinates

    // Set array length from given sizes
    this.#length = initialValues.length = ArrayN.multiplyItems(this.#sizes)

    this.#array = [...initialValues]

    this.#dimensions = this.#sizes.length


    Object.seal(this.#array)


    // Get coordinates conversion values
    this.#sizes.forEach((item, index) => {
      const portionArray = this.#sizes.slice(0, index)
      const multiplicationValue = ArrayN.multiplyItems(portionArray)
      this.#coordinatesConversion.push(multiplicationValue)
    })


    if (this.#preCalculateCoordinates) {
      this.#coordinatesCollection = []
      this.#coordinatesPosition   = {}

      const coordinates = Array.from({length: this.dimensions}, () => 0)

      for (;;) {
        this.#coordinatesCollection.push([...coordinates])
        this.#coordinatesPosition[coordinates.toString()] = this.#getPositionFromCoordinates(coordinates)

        ArrayN.#increaseCoordinates(coordinates, this.#sizes)

        if (coordinates[coordinates.length - 1] >= this.#sizes[this.#sizes.length - 1]) break
      }
    }

  }


  // Public Static properties

  static sumItems(numbers) {
    let result = 0

    for (const number of numbers) {
      result += number
    }

    return result
  }

  static multiplyItems(numbers) {
    let result = 1

    for (const number of numbers) {
      result *= number
    }

    return result
  }

  static sumArrays(array1, array2, mutate = false) {
    if (array1.length !== array2.length) throw new TypeError(`length of arrays provided must be equal`)

    if (!mutate) {
      const newArray = []

      for (let i = 0; i < array1.length; i++) {
        newArray.push(array1[i] + array2[i])
      }

      return newArray
    }

    for (let i = 0; i < array1.length; i++) {
      array1[i] += array2[i]
    }

    return array1
  }

  static multiplyArrays(array1, array2, mutate = false) {
    if (array1.length !== array2.length) throw new TypeError(`length of arrays provided must be equal`)

    if (!mutate) {
      const newArray = []

      for (let i = 0; i < array1.length; i++) {
        newArray.push(array1[i] * array2[i])
      }

      return newArray
    }

    for (let i = 0; i < array1.length; i++) {
      array1[i] *= array2[i]
    }

    return array1
  }


  // Public Instance Properties

  get array()      { return this.#array      }
  get dimensions() { return this.#dimensions }
  get length()     { return this.#length     }
  get sizes()      { return this.#sizes      }


  clone(preCalculateCoordinates = false) {
    return new ArrayN({sizes: this.#sizes, initialValues: this.#array, preCalculateCoordinates})
  }

  get(coordinates) {
    if (!Array.isArray(coordinates) || !coordinates.every(n => typeof n === 'number')) throw new TypeError(`param 1 must be an array of numbers`)

    if (this.#areCoordinatesOutOfRange(coordinates)) throw this.#rangeError(coordinates)

    const position = this.#preCalculateCoordinates ? this.#coordinatesPosition[coordinates.toString()] : this.#getPositionFromCoordinates(coordinates)
    return this.#array[position]
  }

  set(value, coordinates) {
    if (!Array.isArray(coordinates) || !coordinates.every(n => typeof n === 'number')) throw new TypeError(`param 2 must be an array of numbers`)

    if (this.#areCoordinatesOutOfRange(coordinates)) throw this.#rangeError(coordinates)

    const position = this.#preCalculateCoordinates ? this.#coordinatesPosition[coordinates.toString()] : this.#getPositionFromCoordinates(coordinates)
    return this.#array[position] = value
  }

  put(data, coordinates) {

    if (!Array.isArray(coordinates) || !coordinates.every(n => typeof n === 'number')) throw new TypeError(`param 2 must be an array of numbers`)

    if (this.#areCoordinatesOutOfRange(coordinates)) throw this.#rangeError(coordinates)

    let arrayData = data

    if (data instanceof ArrayN) arrayData = data.array
    else if (!Array.isArray(arrayData)) throw new TypeError(`param 1 must be an array or an ArrayN`)

    const position = this.#getPositionFromCoordinates(coordinates)

    for (let i = 0; i < arrayData.length; i++) {
      this.#array[position + i] = arrayData[i]
    }

  }

  putOver(data, coordinates, callback = null) {
    if (!(data instanceof ArrayN)) throw new TypeError(`param 1 must be instance of ArrayN`)
    if (data.dimensions > this.#dimensions) throw new TypeError(`param 1 dimensions cannot be biggger than the actual ArrayN dimensions`)

    if (!Array.isArray(coordinates) || !coordinates.every(n => typeof n === 'number')) throw new TypeError(`param 2 must be an array of numbers`)

    if (this.#areCoordinatesOutOfRange(coordinates)) throw this.#rangeError(coordinates)

    try {

      if (callback == null)
        data.forEach((value, coords) => {
          ArrayN.sumArrays(coords, coordinates, true)

          // Exit forEach
          if (this.#areCoordinatesOutOfRange(coords)) throw ''

          this.set(value, coords)
        })
      else if (callback instanceof Function)
        data.forEach((value, coords) => {
          ArrayN.sumArrays(coords, coordinates, true)

          // Exit forEach
          if (this.#areCoordinatesOutOfRange(coords)) throw ''

          const sourceValue = this.get(coords)
          this.set(callback(value, sourceValue), coords)
        })
      else throw new TypeError(`param 3 must be a function or null`)

    } catch(error) {}
  }

  getPortion(dimensions, coordinates = []) {
    if (!Array.isArray(coordinates) || !coordinates.every(n => typeof n === 'number')) throw new TypeError(`param 1 must be an array of numbers`)

    if (typeof dimensions !== 'number') throw new TypeError(`param 1 must be a number`)

    if (dimensions > this.#dimensions) throw new TypeError(`dimensions provided cannot be bigger than dimensions of the ArrayN`)

    if (dimensions + coordinates.length > this.#dimensions) throw new TypeError(`The sum of dimensions plus coordinates length cannot be bigger than the dimensions of the ArrayN`)

    if (dimensions < 1) return null

    const array = []
    const supportArray = []

    ArrayN.#createDimensionalArray(array, [...this.#sizes].slice(0, dimensions), supportArray)

    const variableCoords = Array.from({length: dimensions}, () => 0)

    for (let i = 0; i < supportArray.length; i++) {

      for (let j = 0; j < this.#sizes[0]; j++) {

        const value = this.get([...variableCoords, ...coordinates])
        supportArray[i].push(value)

        ArrayN.#increaseCoordinates(variableCoords, this.#sizes)

      }

    }

    return array
  }

  forEach(callback) {
    if (this.#preCalculateCoordinates) {
      for (let i = 0; i < this.#coordinatesCollection.length; i++) {
        const coordinates = this.#coordinatesCollection[i]

        const value = this.get(coordinates)
        callback(value, [...coordinates])
      }

      return
    }

    const coordinates = Array.from({length: this.dimensions}, () => 0)

    for (;;) {
      const value = this.get(coordinates)
      callback(value, [...coordinates])

      ArrayN.#increaseCoordinates(coordinates, this.#sizes)

      if (coordinates[coordinates.length - 1] >= this.#sizes[this.#sizes.length - 1]) break
    }
  }


  // Private Static Properties

  static #findNextPerfectNRoot(dimensions, number) {
    const nRoot            = number           ** (1 / dimensions)
    const nextPerfectNRoot = Math.ceil(nRoot) ** dimensions

    return nextPerfectNRoot
  }

  static #isNoneIterable(value) {
    if (!value[Symbol.iterator]) return true
    return false
  }

  static #noneIterableError(value) {
    return new TypeError(`${typeof value !== 'undefined' ? typeof value : ''}${typeof value === 'object' ? '' : ' ' + value} is not iterable (cannot read property Symbol(Symbol.iterator))`)
  }

  static #createDimensionalArray(array, sizes, supportArray) {
    if (sizes.length === 1) return supportArray.push(array)

    const size = sizes.pop()

    for (let i = 0; i < size; i++) {
      const newArray = []

      array.push(newArray)

      if (sizes.length === 1) {
        supportArray.push(newArray)
        continue
      }

      ArrayN.#createDimensionalArray(newArray, [...sizes], supportArray)
    }
  }

  static #increaseCoordinates(coordinates, sizes) {
    for (let i = 0; i < coordinates.length; i++) {
      const previous = i - 1
      const current  = i

      if (i === 0) coordinates[i]++

      if (coordinates[previous] >= sizes[previous]) {
        coordinates[previous] = 0
        coordinates[current]++
      }
    }
  }


  // Private Instance Properties

  #array
  #dimensions
  #sizes
  #length

  #preCalculateCoordinates = false

  // Array the contains pre-calculated coordinates to optimize forEach speed
  #coordinatesCollection
  // Object that contains (key: coordinates toString) & (value: position), to optimize 'get' and 'set' methods
  #coordinatesPosition

  /**
   * Pre calculated values that are necesary to get the one dimensional position in the array
   * Each coordinate its multiplied with each corresponding conversion value and then they are add it together
   *
   * Example with a 3D array:
   *
   *  // 1D array with the values for the 3D array
   *  const array = [
   *   1,  2,  3,
   *   4,  5,  6,
   *   7,  8,  9
   *  ]
   *
   *  const coordinates           = [ x,  y,  z]
   *  const conversionCoordinates = [cX, cY, cZ]
   *
   *  const position = x * cX + y * cY + z * cZ
   *
   *  // Value
   *  array[position]
   */
  #coordinatesConversion = []

  #getPositionFromCoordinates(coordinates) {
    if (coordinates.length > this.#dimensions) throw new TypeError(`Number of coordinates provided are longer than the dimensions of the array`)

    // Apply module operation to coordinates
    const mapCoordinates = coordinates.map((c, index) => c % this.#sizes[index])

    // Multiply coordinates with each corresponding coordinate conversion
    const coordinatesConverted = mapCoordinates.map((c, index) => c * this.#coordinatesConversion[index])

    // Sum the converted coordinates to get the position for the one dimensional array
    const position = ArrayN.sumItems(coordinatesConverted)

    return position
  }

  #areCoordinatesOutOfRange(coordinates) {
    for (let i = 0; i < coordinates.length; i++) {
      if (coordinates[i] >= this.#sizes[i] || coordinates[i] < 0) return true
    }

    return false
  }

  #rangeError(coordinates) {
    const minRange = Array.from({length: this.#dimensions}, () => 0)
    const maxRange = Array.from({length: this.#dimensions}, (item, index) => this.#sizes[index])

    return new RangeError(`Coordinates (${coordinates}) provided are out of range: (${minRange}) - (${maxRange})`)
  }

}
