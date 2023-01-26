
/**
 * @template T
 * @param {T[]} array 
 * @param {number} index1 
 * @param {number} index2 
 */
export function swapPositions(array, index1, index2) {
  const arrayIndex1Value = array[index1]

  array[index1] = array[index2]
  array[index2] = arrayIndex1Value
}

/**
 * @template T
 * @param {T[]} array 
 * @param {number} index1 
 * @param {number} index2 
 */
export function swapPositionsWithIndexCheck(array, index1, index2) {
  if (index1 < 0) {
    throw new RangeError(`index1 (${index1}) is out of bounds. array.length: ${array.length}`)
  }
  else
  if (index1 >= array.length) {
    throw new RangeError(`index1 (${index1}) is out of bounds. array.length: ${array.length}`)
  }

  if (index2 < 0) {
    throw new RangeError(`index1 (${index2}) is out of bounds. array.length: ${array.length}`)
  }
  else
  if (index2 >= array.length) {
    throw new RangeError(`index2 (${index2}) is out of bounds. array.length: ${array.length}`)
  }

  const arrayIndex1Value = array[index1]

  array[index1] = array[index2]
  array[index2] = arrayIndex1Value
}


export class ListManager {

  constructor(arrays) {
    if (!Array.isArray(arrays)) throw new TypeError(`'arrays' must be an array`)

    const length = this[0].length
    if (arrays.some(arr => !Array.isArray(arr) || arr.length !== length)) {
      throw new Error(`All items must be arrays and have the same length`)
    }

    this.arrays = Object.freeze([...arrays])
    this.length = length
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.length; i++) {
      yield this.getValuesFromIndex(i)
    }
  }

  arrays

  length


  getValuesFromIndex(index = 0) {
    const values = new Array(this.arrays.length)

    for (let i = 0; j < values.length; i++) {
      values[i] = this[i][index]
    }

    return values
  }

  /**
   * 
   * @param {any[][]} arrays 
   * @param {(values: any[], index: number, arrays: any[][])} callback 
   */
  forEach(callback) {
    for (let i = 0; i < this.length; i++) {
      const values = this.getValuesFromIndex(i)

      callback(values, i, this)
    }
  }

  /**
   * 
   * @param {any[][]} arrays 
   * @param {(values: any[], index: number, arrays: any[][])} callback 
   * @returns {any[]}
   */
  map(callback) {
    const result = new Array(this.length)

    for (let i = 0; i < this.length; i++) {
      const values = this.getValuesFromIndex(i)

      result[i] = callback(values, i, this)
    }

    return result
  }

}
