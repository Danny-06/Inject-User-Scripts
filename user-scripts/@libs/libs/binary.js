export class Binary {

  /**
   * @type {number[]}
   */
  #data
  get data() {
    return this.#data
  }

  #bitSize
  get bitSize() {
    return this.#bitSize
  }

  /**
   * 
   * @param {string|number|number[]|ArrayBuffer} data 
   * @param {number} sourceBitSize 
   */
  constructor(data, sourceBitSize = 8) {
    this.#bitSize = sourceBitSize

    const type = typeof data

    switch (type) {
      case 'string':
        if (data === '') {
          throw new Error(`Cannot parse empty string`)
        }

        if (/[^0^1]/.test(data)) {
          throw new Error(`Invalid binary string. It must contain only 1's and 0's`)
        }

        this.#data = Binary.binaryStringToBitArray(data, this.#bitSize)
      break

      case 'number':
        if (data < 0) {
          throw new Error(`Cannot parse a negative number`)
        }

        this.#data = Binary.numberToBitArray(data, this.#bitSize)
      break

      case 'object':
        data.forEach(n => {
          if (n < 0) throw new Error(`Array cannot contain negative numbers`)
        })

        const TypedArray = Object.getPrototypeOf(Uint8Array)

        if (Array.isArray(data) || data instanceof TypedArray) {
          this.#data = [...data]
        }
        else
        if (data instanceof ArrayBuffer) {
          this.#data = [...new Uint8Array(data)]
        }
      break

      default:
        throw new Error(`'${type}' is not a valid type to create the Binary instance`)
    }

    Object.freeze(this.#data)
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
    string = string.replace(new RegExp(`^0{0,${bitSize - 1}}`), '')

    if (string === '') string = '0'

    let padding = bitSize - (string.length % bitSize)
    if (padding === bitSize) padding = 0

    const bitsLength = string.length + padding
    string = string.padStart(bitsLength, '0')

    const stringBinaryChunks = string.match(new RegExp(`.{1,${bitSize}}`, 'g'))

    return stringBinaryChunks
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

  get [Symbol.toStringTag]() {
    return 'Binary'
  }

  toJSON() {
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

  /**
   * 
   * @param {number} chunkSize 
   * @param {number} splitInGroupsOf 
   * @returns {number[]}
   */
  getAsChunksOf(chunkSize = 8, splitInGroupsOf = null) {
    if (chunkSize <= 0) {
      throw new TypeError(`'chunkSize' cannot be 0 or negative`)
    }

    if (splitInGroupsOf != null) {
      if (typeof splitInGroupsOf !== 'number') {
        throw new TypeError(`'splitInGroupsOf' must be a number`)
      }

      if (splitInGroupsOf <= 0) {
        throw new TypeError(`'splitInGroupsOf' cannot be 0 or negative`)
      }
    }

    const data = Binary.#getDataAs(this.#data, chunkSize, this.#bitSize)

    if (splitInGroupsOf != null) {
      const groupedData = Binary.#getDataAsGroupOf(data, splitInGroupsOf)

      return groupedData
    }

    return data
  }

  toText() {
    return new TextDecoder().decode(this.toUint8Array())
  }

  toBlob(type = '') {
    return new Blob([this.toUint8Array()], {type})
  }

  toArrayBuffer() {
    return this.toUint8Array().buffer
  }

  toUint8Array() {
    return new Uint8Array(this.getAsChunksOf(8))
  }

  at(index = 0) {
    const binary = this.toBinaryString()

    let equivalentIndex = index % binary.length

    if (equivalentIndex < 0) {
      equivalentIndex = binary.length + equivalentIndex
    }

    const value = parseInt(binary[equivalentIndex])

    return value
  }

  valueOf() {
    return parseInt(this.toBinaryString(), 2)
  }

  toBinaryString(split = false) {
    const string = Binary.bitArrayToBinaryString(this.#data, this.#bitSize)

    if (split) {
      return Binary.splitBinaryStringIntoChunks(string, this.#bitSize)
    }

    return string
  }

}
