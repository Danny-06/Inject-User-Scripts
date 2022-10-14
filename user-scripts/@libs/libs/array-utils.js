
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

    for (let j = 0; j < values.length; j++) {
      values[j] = this[j][index]
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
