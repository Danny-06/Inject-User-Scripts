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
