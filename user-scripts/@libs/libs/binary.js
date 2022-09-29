export class Binary {

  #data
  get data() {
    return this.#data
  }

  #bitSize
  get bitSize() {
    return this.#bitSize
  }

  constructor(data, sourceBitSize = 8) {
    this.#bitSize = sourceBitSize

    switch (typeof data) {
      case 'string':
        this.#data = Binary.binaryStringToBitArray(data, this.#bitSize)
      break

      case 'number':
        this.#data = Binary.numberToBitArray(data, this.#bitSize)
      break

      case 'object':
        if (Array.isArray(data)) {
          this.#data = [...data]
        }
      break

      default:
    }
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

  static numberToBitArray(n, bitSize) {
    const binaryString = n.toString(2)
    return Binary.binaryStringToBitArray(binaryString, bitSize)
  }

  static binaryStringToBitArray(string, bitSize) {
    const stringChunks = Binary.splitBinaryStringIntoChunks(string, bitSize)
    return Binary.stringChunksToBitArray(stringChunks)
  }

  static stringChunksToBitArray(chunks) {
    return chunks.map(str => parseInt(str, 2))
  }

  static #getDataAsGroupOf(data, splitInGroupsOf) {
    const length = Math.ceil(data.length / splitInGroupsOf)
    const groupedData = new Array(length)

    let padding = splitInGroupsOf - data.length % splitInGroupsOf
    if (padding === splitInGroupsOf) padding = 0

    for (let i = 0, j = 0; i < groupedData.length; i++, j += splitInGroupsOf) {
      groupedData[i] = data.slice(j, j + splitInGroupsOf)
    }

    groupedData[groupedData.length - 1].push(...new Array(padding).fill(0))

    return groupedData
  }

  [Symbol.toStringTag]() {
    return 'Binary'
  }

  toString() {
    return JSON.stringify(this.#data)
  }

  valueOf() {
    return parseInt(this.toBinary(), 2)
  }

  do(callback) {
    return callback(this)
  }

  *[Symbol.iterator]() {
    yield* this.#data
  }

  getAsChunksOf(chunkSize = 8, splitInGroupsOf = null) {
    const length = Math.ceil(this.#data.length * 8 / chunkSize)

    if (splitInGroupsOf != null && typeof splitInGroupsOf !== 'number') {
      throw new Error(`param 2 must be a number`)
    }

    const data = Binary.#getDataAs(this.#data, chunkSize, this.#bitSize)

    if (splitInGroupsOf != null) {
      const groupedData = Binary.#getDataAsGroupOf(data, splitInGroupsOf)

      return groupedData
    }

    return data
  }

  toBinary(split = false) {
    const string = Binary.bitArrayToBinaryString(this.#data, this.#bitSize)

    if (split) {
      return Binary.splitBinaryStringIntoChunks(string, this.#bitSize)
    }

    return string
  }

}
