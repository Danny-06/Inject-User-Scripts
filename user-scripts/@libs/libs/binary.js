export class Binary {

  #data

  constructor(data, sourceNumberOfBits = 8) {
    switch (typeof data) {
      case 'string':
      break

      case 'number':
      break

      case 'object':
        if (Array.isArray(data) || data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
          this.#data = Binary.#getDataAs(data, 8, sourceNumberOfBits)
        }
      break

      default:
    }
  }

  getAsChunksOf(chunkSize = 8, splitInGroupsOf = null) {
    const length = Math.ceil(this.#data.length * 8 / chunkSize)

    if (splitInGroupsOf != null) {
      if (typeof splitInGroupsOf !== 'number') {
        throw new Error(`param 2 must be a number`)
      }

      if (length % splitInGroupsOf !== 0) {
        throw new Error(`Data cannot be divided in groups of ${splitInGroupsOf}`)
      }
    }

    const data = Binary.#getDataAs(this.#data, chunkSize)

    // const value = this.#data.reduce((acc, val, index, arr) => acc + val * 2 ** (8 * ((arr.length - 1) - index)), 0)
    // const value = Binary.getValue(this.#data, 8)

    if (splitInGroupsOf != null) {
      const groupedData = Binary.#getDataAsGroupOf(data, splitInGroupsOf)

      return groupedData
    }

    return data
  }

  static getBitsValue(arr, numberOfBits) {
    const value = arr.reduce((acc, val, index, arr) => acc + val * 2 ** (numberOfBits * ((arr.length - 1) - index)), 0)
    return value
  }

  static #getDataAs(arr, numberOfBits, sourceNumberOfBits = 8) {
    const length = Math.ceil(arr.length * sourceNumberOfBits / numberOfBits)

    const data = new Array(length)

    const value = Binary.getBitsValue(arr, sourceNumberOfBits)

    const mask = 2 ** numberOfBits - 1

    for (let i = 0; i < data.length - 1; i++) {
      const chunk = value / (2 ** (numberOfBits * (data.length - 1 - i)))
      data[i] = chunk & mask
    }

    data[data.length - 1] = value & mask

    return data
  }

  static #getDataAsGroupOf(data, splitInGroupsOf) {
    const groupedData = new Array(data.length / splitInGroupsOf)

    for (let i = 0; i < groupedData.length; i++) {
      groupedData[i] = data.slice(i, i + splitInGroupsOf)
    }

    return groupedData
  }

  toString() {

  }

  valueOf() {
    // return this.#data.reduce((acc, val, index, arr) => acc + val << ((arr.length - 1) - index), 0)
  }

}
