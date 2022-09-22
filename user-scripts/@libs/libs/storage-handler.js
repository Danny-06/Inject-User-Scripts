export class StorageHandler {

  constructor(storage = window.localStorage) {
    this.#storage = storage
  }

  #internalStorage

  get storage() {
    const storage = this.#internalStorage

    if (storage == null) throw TypeError(`'storage' cannot be null or undefined`)
    if (!(storage instanceof Storage)) throw TypeError(`'storage' must be an instance of Storage`)

    return storage
  }

  /**
   * Private setter to make the property read only
   */
  set #storage(value) {
    if (value == null) throw TypeError(`'storage' cannot be null or undefined`)
    if (!(value instanceof Storage)) throw TypeError(`'storage' must be an instance of Storage`)

    this.#internalStorage = value
  }

  /**
   * Throws an error if 'key' is doesn't have the correct type 
   */
  #checkKey(key) {
    const isKeyValidTypeOf = typeof key !== 'string'
    if (isKeyValidTypeOf) throw new TypeError(`'key' must be type of 'string'`)
  }

  /**
   * Throws an error if 'value' is doesn't have the correct type 
   */
  #checkValue(value) {
    const valueType = typeof value
    const isValueValidTypeOf = valueType !== 'string' && valueType !== 'number' && valueType !== 'boolean' && valueType !== 'object'
    if (isValueValidTypeOf) throw new TypeError(`'value' must be one of these types: 'string' 'number' 'boolean' 'object'`)
  }

  getParsedStorage() {
    const parsedStorage = {}

    for (const key in this.storage) {
      if (!this.storage.hasOwnProperty(key)) continue

      parsedStorage[key] = this.getItem(key)
    }

    return parsedStorage
  }

  clear() {
    this.storage.clear()
  }

  removeItem(key) {
    this.#checkKey(key)

    this.storage.removeItem(key)
  }

  setItem(key, value) {
    this.#checkKey(key)
    this.#checkValue(value)

    this.storage.setItem(key, JSON.stringify(value))
  }

  getItem(key) {
    this.#checkKey(key)

    const storageValue = this.storage.getItem(key)
    const value = (storageValue === '' || storageValue == null) ? null : storageValue

    const data = this.#try(() => JSON.parse(value), value)

    return data
  }

  #try(callback, returnValueIfCatch = undefined) {
    try {
      return callback()
    } catch (error) {}

    return returnValueIfCatch
  }

}
