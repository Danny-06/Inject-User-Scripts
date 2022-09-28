export class Binary {

  #data

  constructor(data, sourceBitSize = 8) {
    switch (typeof data) {
      case 'string':
      break

      case 'number':
      break

      case 'object':
        if (Array.isArray(data) || data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
          this.#data = Binary.#getDataAs(data, 8, sourceBitSize)
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

    if (splitInGroupsOf != null) {
      const groupedData = Binary.#getDataAsGroupOf(data, splitInGroupsOf)

      return groupedData
    }

    return data
  }

  static #getDataAs(arr, bitSize, sourceBitSize = 8) {
    const binaryStringRepresentation = Binary.bitArrayToBinaryString(arr, sourceBitSize)

    const stringChunks = Binary.splitBinaryStringIntoChunks(binaryStringRepresentation, bitSize) 

    const data = Binary.stringChunksToBitArray(stringChunks)

    return data
  }

  static bitArrayToBinaryString(arr, bitSize = 8) {
    return arr.map(n => n.toString(2).padStart(bitSize, '0')).join('')
  }

  static splitBinaryStringIntoChunks(string, bitSize) {
    return string.match(new RegExp(`.{1,${bitSize}}`, 'g')).map(str => str.padStart(bitSize, '0'))
  }

  static stringChunksToBitArray(chunks) {
    return chunks.map(str => parseInt(str, 2))
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
