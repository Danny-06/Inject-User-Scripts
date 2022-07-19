export class StringConversion {

  constructor() {
    if (new.target) throw new TypeError(`Cannot instantiate an abstract class`)
  }

  static logN(base, x) {
    return Math.log(x) / Math.log(base)
  }

  static stringToBinaryString(string) {
    const bytes = new TextEncoder().encode(string)

    let result = ''

    for (let i = 0; i < bytes.length; i++) {
      result += String.fromCharCode(bytes[i])
    }

    return result
  }

  static charCodesFromString(string) {
    const charCodes = []

    for (let i = 0; i < string.length; i++) {
      charCodes.push(string[i].charCodeAt())
    }

    return charCodes
  }

  static codePointsFromString(string) {
    const codePoints = []

    for (let i = 0; i < string.length; i++) {
      codePoints.push(string[i].codePointAt())
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

  static base64CharsetMap = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/'
  ]

  static stringToBase64(string) {
    const bytes = new TextEncoder().encode(string)

    let padding = 3 - (bytes.length % 3)
    if (padding === 3) padding = 0


    // 3 groups of 8 bitss

    const block3Bytes = []

    for (let i = 0; i < bytes.length; i += 3) {
      block3Bytes.push([bytes[i], bytes[i + 1] ?? 0, bytes[i + 2] ?? 0])
    }


    // 4 groups of 6 bits

    const block4Of6Bits = []

    for (let i = 0; i < block3Bytes.length; i++) {
      const int6Bits = block3Bytes[i].map(n => this.numberToBinary(n, 8)).join('').match(/.{1,6}/g).map(n => parseInt(n , 2))

      block4Of6Bits.push(int6Bits[0], int6Bits[1], int6Bits[2], int6Bits[3])
    }


    // Turn resulting 6 bits into corresponding printable character

    let result = ''

    for (let i = 0; i < block4Of6Bits.length - padding; i++) {
      result += this.base64CharsetMap[block4Of6Bits[i]]
    }

    result += '='.repeat(padding)

    return result
  }

  static base64ToString(string) {
    let padding = 0

    if (string.endsWith('=='))     padding = 2
    else if (string.endsWith('=')) padding = 1


    // 4 groups of 6 bits

    const block4Of6Bits = []

    for (let i = 0; i < string.length; i += 4) {
      const n1 = this.base64CharsetMap.indexOf(string[i])
      const n2 = this.base64CharsetMap.indexOf(string[i + 1])
      const n3 = this.base64CharsetMap.indexOf(string[i + 2])
      const n4 = this.base64CharsetMap.indexOf(string[i + 3])

      block4Of6Bits.push([n1, n2, n3 === -1 ? 0 : n3, n4 === -1 ? 0 : n4])
    }

    // 3 groups of 8 bitss

    const block3Bytes = []

    for (let i = 0; i < block4Of6Bits.length; i++) {
      const int8Bits = block4Of6Bits[i].map(n => this.numberToBinary(n, 6)).join('').match(/.{1,8}/g).map(n => parseInt(n , 2))

      block3Bytes.push(int8Bits[0], int8Bits[1], int8Bits[2])
    }

    if (padding === 0) padding = undefined
    else padding *= -1

    const result = new TextDecoder().decode(new Uint8Array(block3Bytes.slice(0, padding)))

    return result
  }


  static stringToRadix(string, radix, addSpaceBetweenCharacters = false) {
    let result = ''

    const space = addSpaceBetweenCharacters ? ' ' : ''

    for (let i = 0; i < string.length; i++) {
      result += string[i].codePointAt().toString(radix) + space
    }

    return result.slice(0, -1)
  }

  static radixToString(string, radix, constainsSpaceBetweenCharacters = false) {
    let result = ''

    let list

    if (constainsSpaceBetweenCharacters) list = string.split(' ')
    else {
      const digitsLength = Math.ceil(this.logN(radix, 256))
      const regex = new RegExp(`.{1,${digitsLength}}`, 'g')
      list = string.match(regex)
    }

    list = list.filter(str => str !== '')

    for (let i = 0; i < list.length; i++) {
      result += String.fromCodePoint(parseInt(list[i], radix))
    }

    return result
  }

  static changeRadix(string, radix1, radix2) {
    let result = ''

    const list = string.split(' ').filter(str => str !== '')

    for (let i = 0; i < list.length; i++) {
      result += parseInt(list[i], radix1).toString(radix2) + ' '
    }

    return result.slice(0, -1)
  }


  static stringToBinary(string, addSpaceBetweenCharacters = false) {
    return this.stringToRadix(string, 2, addSpaceBetweenCharacters)
  }

  static binaryToString(string, constainsSpaceBetweenCharacters = false) {
    return this.radixToString(string, 2, constainsSpaceBetweenCharacters)
  }

  static stringToHex(string, addSpaceBetweenCharacters = false) {
    return this.stringToRadix(string, 16, addSpaceBetweenCharacters)
  }

  static hexToString(string, constainsSpaceBetweenCharacters = false) {
    return this.radixToString(string, 16, constainsSpaceBetweenCharacters)
  }

}
