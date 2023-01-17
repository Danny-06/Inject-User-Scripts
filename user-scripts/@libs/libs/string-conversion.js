import { Binary } from './binary.js'

export class StringConversion {

  constructor() {
    if (new.target) throw new TypeError(`Cannot instantiate an abstract class`)
  }

  static logN(base, x) {
    return Math.log(x) / Math.log(base)
  }

  static textToBinaryText(text) {
    const bytes = new TextEncoder().encode(text)

    let result = ''

    for (let i = 0; i < bytes.length; i++) {
      result += Text.fromCharCode(bytes[i])
    }

    return result
  }

  static charCodesFromText(text) {
    const charCodes = []

    for (let i = 0; i < text.length; i++) {
      charCodes.push(text[i].charCodeAt())
    }

    return charCodes
  }

  static codePointsFromText(text) {
    const codePoints = []

    for (let i = 0; i < text.length; i++) {
      codePoints.push(text[i].codePointAt())
    }

    return codePoints
  }

  static numberToBinary(n, bitsLength = 8) {
    const binary = n.toString(2)
    if (bitsLength < binary.length) throw new TypeError(`binary length cannot be bigger than specified bitsLength`)

    const padding = '0'.repeat(bitsLength - binary.length)

    return `${padding}${binary}`
  }


  // http://www.herongyang.com/Encoding/Base64-Encoding-Algorithm.html

  static base64CharsetMap = Object.freeze([
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/'
  ])

  static bytesToBase64(bytes) {
    const blockOf8Bits = new Binary(bytes).getAsChunksOf(8, 3).flat()

    const blockOf6Bits = new Binary(blockOf8Bits).getAsChunksOf(6)

    // Turn resulting 6 bits into corresponding printable character

    const padding = this.#getPaddingFromBytesLength(bytes.length)

    const result = this.blockOf6BitsToBase64(blockOf6Bits, padding)

    return result
  }

  static base64ToBytes(base64String) {
    const blockOf6Bits = this.base64ToByteArray(base64String)

    const blockOf8Bits = new Binary(blockOf6Bits, 6).getAsChunksOf(8)

    const padding = this.#getPaddingFromBase64String(base64String)

    const sliceEnd = blockOf8Bits.length - padding

    const bytes = new Uint8Array(blockOf8Bits.slice(0, sliceEnd))

    return bytes
  }

  static textToBase64(text) {
    const bytes = new TextEncoder().encode(text)

    const result = this.bytesToBase64(bytes)

    return result
  }

  static base64ToText(base64String) {
    const bytes = this.base64ToBytes(base64String)

    const result = new TextDecoder().decode(bytes)

    return result
  }

  static #getPaddingFromBytesLength(bytesLength) {
    let padding = 3 - (bytesLength % 3)
    if (padding === 3) padding = 0

    return padding
  }

  static #getPaddingFromBase64String(base64String) {
    let padding = 0

    if (base64String.endsWith('=='))     padding = 2
    else if (base64String.endsWith('=')) padding = 1

    return padding
  }

  static base64ToByteArray(base64) {
    const padding = this.#getPaddingFromBase64String(base64)

    const byteArray = new Array(base64.length)

    for (let i = 0; i < base64.length - padding; i++) {
      const byte = this.base64CharsetMap.indexOf(base64[i])
      byteArray[i] = byte
    }

    for (let i = padding; i > 0; i--) {
      byteArray[base64.length - i] = 0
    }

    return byteArray
  }

  static blockOf6BitsToBase64(blockOf6Bits, padding) {
    let result = ''

    for (let i = 0; i < blockOf6Bits.length - padding; i++) {
      result += this.base64CharsetMap[blockOf6Bits[i]]
    }

    result += '='.repeat(padding)

    return result
  }

  static textToRadix(text, radix, addSpaceBetweenCharacters = false) {
    let result = ''

    const space = addSpaceBetweenCharacters ? ' ' : ''

    for (let i = 0; i < text.length; i++) {
      result += text[i].codePointAt().toString(radix) + space
    }

    return result.slice(0, -1)
  }

  static radixToText(text, radix, constainsSpaceBetweenCharacters = false) {
    let result = ''

    let list

    if (constainsSpaceBetweenCharacters) list = text.split(' ')
    else {
      const digitsLength = Math.ceil(this.logN(radix, 256))
      const regex = new RegExp(`.{1,${digitsLength}}`, 'g')
      list = text.match(regex)
    }

    list = list.filter(str => str !== '')

    for (let i = 0; i < list.length; i++) {
      result += String.fromCodePoint(parseInt(list[i], radix))
    }

    return result
  }

  static changeRadix(text, radix1, radix2) {
    let result = ''

    const list = text.split(' ').filter(str => str !== '')

    for (let i = 0; i < list.length; i++) {
      result += parseInt(list[i], radix1).toString(radix2) + ' '
    }

    return result.slice(0, -1)
  }


  static textToBinary(text, addSpaceBetweenCharacters = false) {
    return this.textToRadix(text, 2, addSpaceBetweenCharacters)
  }

  static binaryToText(text, constainsSpaceBetweenCharacters = false) {
    return this.radixToText(text, 2, constainsSpaceBetweenCharacters)
  }

  static textToHex(text, addSpaceBetweenCharacters = false) {
    return this.textToRadix(text, 16, addSpaceBetweenCharacters)
  }

  static hexToText(text, constainsSpaceBetweenCharacters = false) {
    return this.radixToText(text, 16, constainsSpaceBetweenCharacters)
  }

}
