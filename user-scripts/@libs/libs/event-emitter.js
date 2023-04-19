export default class EventEmitter {

  /**@type {Map<string | symbol, Set<(...args) => void>>} */
  #eventKeyListenersMap

  constructor() {
    this.#eventKeyListenersMap = new Map()
  }

  addListener(eventName, listener) {
    if (typeof eventName !== 'string' && typeof eventName !== 'symbol') {
      throw new TypeError('eventName must be of type string or symbol')
    }

    if (this.#eventKeyListenersMap.has(eventName)) {
      this.#eventKeyListenersMap.get(eventName).add(listener)
    }
    else {
      this.#eventKeyListenersMap.set(eventName, new Set([listener]))
    }

    return () => {
      this.removeListener(eventName, listener)
    }
  }

  removeListener(eventName, listener) {
    const listeners = this.#eventKeyListenersMap.get(eventName)

    listeners.delete(listener)

    if (listeners.size === 0) {
      this.#eventKeyListenersMap.delete(eventName)
    }
  }

  on(eventName, listener) {
    return this.addListener(eventName, listener)
  }

  off(eventName, listener) {
    return this.removeListener(eventName, listener)
  }

  once(eventName, listener) {
    const wrapperCallback = (...args) => {
      listener(...args)

      this.removeListener(eventName, wrapperCallback)
    }

    this.addListener(eventName, wrapperCallback)
  }

  emit(eventName, ...args) {
    this.#eventKeyListenersMap.get(eventName)
    ?.forEach(listener => listener(...args))
  }

  eventNames() {
    return [...this.#eventKeyListenersMap.keys()]
  }
  
}
