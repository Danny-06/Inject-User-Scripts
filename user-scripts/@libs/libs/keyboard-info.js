/**
 * @typedef {string} KeyCode
 */

/**
 * @typedef {string} Key
 */

/**
 * @typedef {{code: KeyCode, key: Key>}} KeyInfo
 */

export default class KeyboardInfo {

  constructor() {
    this.#pressedKeys = new Map()

    window.addEventListener('keydown', event => {
      if (event.repeat) {
        return
      }

      this.#pressedKeys.set(event.code, {code: event.code, key: event.key})
    }, {capture: true})

    window.addEventListener('keyup', event => {
      this.#pressedKeys.delete(event.code)
    }, {capture: true})
  }

  /**
   * @type {Map<string, KeyInfo}
   */
  #pressedKeys

  isKeyCodePressed(code) {
    return this.#pressedKeys.has(code)
  }

  /**
   * 
   * @param {KeyCode} code 
   * @returns {KeyInfo | null}
   */
  getPressedKey(code) {
    return this.#pressedKeys.get(code) ?? null
  }

}


export class KeySequence {

  /**
   * 
   * @param {KeyCode[]} matchKeySequence 
   * @param {number} timeoutDuration 
   * @param {{useKey: boolean}} options
   */
  constructor(matchKeySequence, timeoutDuration, options) {
    this.#matchKeySequence = Object.freeze(structuredClone(matchKeySequence))
    this.#currentKeySequence = []
    this.#callbacks = new Set()

    const {useKey} = options

    window.addEventListener('keydown', event => {
      clearTimeout(this.#resetTimeout)

      this.#currentKeySequence.push(useKey ? event.key : event.code)

      if (this.#sequenceMatches) {
        this.#currentKeySequence = []

        for (const callback of this.#callbacks) {
          callback(this.#matchKeySequence)
        }
      }

      this.#resetTimeout = setTimeout(() => {
        this.#currentKeySequence = []
      }, timeoutDuration)
    })
  }

  get #sequenceMatches() {
    const start = this.#currentKeySequence.length - this.#matchKeySequence.length

    for (let i = start, j = 0; i < this.#currentKeySequence.length; i++, j++) {
      if (this.#currentKeySequence[i] !== this.#matchKeySequence[j]) {
        return false
      }
    }

    return true
  }

  #matchKeySequence

  #currentKeySequence

  #resetTimeout

  #callbacks

  addListener(callback) {
    this.#callbacks.add(callback)
  }

}
