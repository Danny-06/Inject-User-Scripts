
export default class Calculator {

  /**
   *
   * @param {string} expression
   */
  parse(expression) {
    this.parseExpression(expression)
  }

  /**
   *
   * @param {string} expression
   */
  #parseExpression(expression) {
    for (let i = 0; i < expression.length; i++) {

    }
  }

  /**
   *
   * @param {string} char
   */
  #parseChar(char) {
    switch (char) {

      case '':

      default:

    }
  }

  /**
   *
   * @param {string} num1
   * @param {string} num2
   */
  sumPairOfStrings(num1, num2) {
    const strNum1 = new NumberString(num1)
    const strNum2 = new NumberString(num2)

    const wholeLength = strNum1.whole.length + strNum2.whole.length + 1
    const whole1 = strNum1.whole.padStart(wholeLength, '0')
    const whole2 = strNum2.whole.padStart(wholeLength, '0')

    const decimalLength = Math.max(strNum1.decimal.length, strNum2.decimal.length)
    const decimal1 = strNum1.decimal.padEnd(decimalLength, '0')
    const decimal2 = strNum2.decimal.padEnd(decimalLength, '0')

    const wholeArray = new Array(wholeLength)
    const decimalArray = new Array(decimalLength)


    let wholeRemaining = 0

    for (let i = wholeArray.length - 1; i >= 0; i--) {
      const n1 = parseInt(whole1[i])
      const n2 = parseInt(whole2[i])

      const sum = n1 + n2 + wholeRemaining
      const sumString = sum.toString().padStart(2, '0')

      const digit = sumString[1]
      wholeRemaining = parseInt(sumString[0])

      wholeArray[i] = digit
    }

    if (decimalArray.length === 0) {
      const result = this.removeStartPadding(wholeArray.join(''), '0')
      return result
    }


    let decimalRemaining = 0

    for (let i = decimalArray.length - 1; i >= 0; i--) {
      const n1 = parseInt(decimal1[i])
      const n2 = parseInt(decimal2[i])

      const sum = n1 + n2 + decimalRemaining
      const sumString = sum.toString().padStart(2, '0')

      const digit = sumString[1]
      decimalRemaining = parseInt(sumString[0])

      decimalArray[i] = digit
    }

    let wholeResult = wholeArray.join('')
    wholeResult = this.removeStartPadding(wholeResult, '0')
    wholeResult = this.sumPairOfStrings(wholeResult, decimalRemaining.toString())

    const decimalResult = this.removeEndPadding(decimalArray.join(''), '0')

    const result = decimalResult !== '' ? wholeResult + '.' + decimalResult : wholeResult

    return result
  }

  /**
   * 
   * @param  {...string} nums 
   */
  sumStrings(...nums) {
    let accumulator = '0'

    for (let i = 0; i < nums.length; i++) {
      accumulator = this.sumPairOfStrings(accumulator, nums[i])
    }

    return accumulator
  }

  /**
   * 
   * @param {string} num1 
   * @param {string} num2 
   */
  multiplyPairOfStrings(num1, num2) {
    const numberString1 = new NumberString(num1)
    const decimalLength1 = numberString1.decimal.length

    const num1SlicedToWhole = NumberString.sliceDecimalPoint(num1, decimalLength1)

    let accumulator = '0'

    for (let i = '0'; i !== num1SlicedToWhole; i = this.sumPairOfStrings(i, '1')) {
      accumulator = this.sumPairOfStrings(accumulator, num2)
    }

    const numberStringAccumulator = new NumberString(NumberString.sliceDecimalPoint(accumulator, -decimalLength1))

    if (decimalLength1 > 0) {
      accumulator = numberStringAccumulator.whole + '.' + numberStringAccumulator.decimal.padStart(decimalLength1, '0')
    } else {
      accumulator = numberStringAccumulator.toString()
    }

    return accumulator
  }

  /**
   * 
   * @param {...string} nums 
   */
  multiplyStrings(...nums) {
    let accumulator = '1'

    for (let i = 0; i < nums.length; i++) {
      accumulator = this.multiplyPairOfStrings(accumulator, nums[i])
    }

    return accumulator
  }

  /**
   *
   * @param {string} num
   * @param {string} charPaddingToRemove
   * @returns {string}
   */
  removeStartPadding(num, charPaddingToRemove = '0') {
    const result = Array.from(num)

    for (let i = 0; i < result.length ; i++) {
      if (result[i] !== charPaddingToRemove || result.length === 1) {
        break
      }

      i--
      result.shift()
    }

    return result.join('')
  }

  /**
   *
   * @param {string} num
   * @param {string} charPaddingToRemove
   * @returns {string}
   */
  removeEndPadding(num, charPaddingToRemove = '0') {
    const result = Array.from(num)

    for (let i = result.length - 1; i >= 0 ; i--) {
      if (result[i] !== charPaddingToRemove) {
        break
      }

      i--
      result.pop()
    }

    return result.join('')
  }

}


class NumberString {

  /**
   *
   * @param {string} num
   */
  constructor(num) {
    const wholeAndDecimal = num.split('.')

    this.#whole = NumberString.removeStartPadding(wholeAndDecimal[0], '0')
    this.#decimal = NumberString.removeEndPadding(wholeAndDecimal[1] ?? '', '0')
  }

  toString() {
    if (this.decimal === '') {
      return this.whole
    }

    return this.whole + '.' + this.decimal
  }

  valueOf() {
    return parseFloat(this.toString())
  }

  #whole
  get whole() {
    return this.#whole
  }

  #decimal
  get decimal() {
    return this.#decimal
  }

  /**
   *
   * @param {string} num
   * @param {string} charPaddingToRemove
   * @returns {string}
   */
  static removeStartPadding(num, charPaddingToRemove = '0') {
    const result = Array.from(num)

    for (let i = 0; i < result.length ; i++) {
      if (result[i] !== charPaddingToRemove || result.length === 1) {
        break
      }

      i--
      result.shift()
    }

    return result.join('')
  }

  /**
   *
   * @param {string} num
   * @param {string} charPaddingToRemove
   * @returns {string}
   */
  static removeEndPadding(num, charPaddingToRemove = '0') {
    const result = Array.from(num)

    for (let i = result.length - 1; i >= 0 ; i--) {
      if (result[i] !== charPaddingToRemove || result[i - 1] === '.') {
        break
      }

      result.pop()
    }

    return result.join('')
  }

  /**
   * 
   * @param {string} num 
   * @param {number} offset 
   */
  static sliceDecimalPoint(num, offset) {
    if (offset === 0) {
      return num
    }

    let floatNum = num

    if (!num.includes('.')) {
      floatNum = floatNum + '.0'
    }

    const padding = new Array(Math.abs(offset)).fill('0')
    const arrayNumber = [...padding, ...Array.from(floatNum), ...padding]

    let indexOfDot = arrayNumber.indexOf('.')

    let tempStore

    if (offset > 0) {
      for (let i = indexOfDot; i < indexOfDot + offset; i++) {
        tempStore = arrayNumber[i + 1] ?? '0'

        arrayNumber[i + 1] = arrayNumber[i]
        arrayNumber[i] = tempStore
      }
    } else {
      for (let i = indexOfDot; i > indexOfDot + offset; i--) {
        tempStore = arrayNumber[i - 1] ?? '0'

        arrayNumber[i - 1] = arrayNumber[i]
        arrayNumber[i] = tempStore
      }
    }

    if (arrayNumber[0] === '.') {
      arrayNumber.unshift('0')
    } else
    if (arrayNumber[arrayNumber.length - 1] === '.') {
      arrayNumber.pop()
    }

    const resultNumberString = new NumberString(arrayNumber.join(''))

    return resultNumberString.toString()
  }

}
