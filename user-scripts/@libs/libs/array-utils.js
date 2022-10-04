
/**
 * 
 * @param {any[][]} arrays 
 * @param {(values: any[], index: number, arrays: any[][])} callback 
 */
export function forAllEach(arrays, callback) {
  const length = arrays[0].length

  if (arrays.some(arr => arr.length !== length)) throw new Error(`All arrays must have the same length`)

  for (let i = 0; i < length; i++) {
    const values = new Array(arrays.length)

    for (let j = 0; j < values.length; j++) {
      values[j] = arrays[j][i]
    }

    callback(values, i, arrays)
  }
}
