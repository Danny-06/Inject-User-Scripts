export class LocalDB {

  static #objectStoreName = 'table-key-value-pairs'

  static #privateSymbolToCreateInstance = Symbol('createInstance')

  database
  request

  #isDeleted = false

  /**
   * 
   * @param {string} databaseName 
   * @returns {Promise<LocalDB>}
   */
  static createLocalDB(databaseName) {
    return new Promise((resolve, reject) => {
      const localDB = new LocalDB(databaseName, LocalDB.#privateSymbolToCreateInstance)

      localDB.request.addEventListener('success', event => {
        const db = event.target.result

        if (db.objectStoreNames.length !== 1 || !db.objectStoreNames.contains(LocalDB.#objectStoreName)) {
          reject(new Error(`This database is not compatible with this class`))
          return
        }

        resolve(localDB)
      })
      localDB.request.addEventListener('error', event => reject(event))
    })
  }

  /**
   * 
   * @param {string} databaseName 
   * @param {symbol} privateKey 
   */
  constructor(databaseName, privateKey) {
    if (privateKey !== LocalDB.#privateSymbolToCreateInstance) {
      throw new Error(`Cannot make an instance of this class manually. Call the static method 'createLocalDB' instead`)
    }

    const request = indexedDB.open(databaseName)

    Object.defineProperty(this, 'request', {
      value: request,
      enumerable: true
    })

    request.addEventListener('upgradeneeded', event => {
      const db = event.target.result
      db.createObjectStore(LocalDB.#objectStoreName)
    })

    request.addEventListener('success', event => {
      const db = event.target.result

      Object.defineProperty(this, 'database', {
        value: db,
        enumerable: true
      })
    })
  }

  /**@type {IDBDatabase} */
  database

  /**
   * 
   * @param {string} key 
   * @returns 
   */
  getItem(key) {
    this.#throwErrorIfDatabaseIsDeleted()

    return new Promise((resolve, reject) => {
      /**@type {IDBTransaction} */
      let transaction

      try {
        transaction = this.database.transaction(LocalDB.#objectStoreName, 'readwrite')
      } catch (error) {
        reject(error)
        return
      }

      const objectStore = transaction.objectStore(LocalDB.#objectStoreName)
      const request = objectStore.get(key)

      request.addEventListener('success', event => {
        resolve(request.result)
      })

      request.addEventListener('error', event => {
        reject(event)
      })
    })
  }

  /**
   * 
   * @param {string} key 
   * @param {any} value 
   * @returns {any}
   */
  setItem(key, value) {
    this.#throwErrorIfDatabaseIsDeleted()

    return new Promise((resolve, reject) => {
      /**@type {IDBTransaction} */
      let transaction

      try {
        transaction = this.database.transaction(LocalDB.#objectStoreName, 'readwrite')
      } catch (error) {
        reject(error)
        return
      }

      const objectStore = transaction.objectStore(LocalDB.#objectStoreName)
      const request = objectStore.put(value, key)

      request.addEventListener('success', event => {
        resolve()
      })

      request.addEventListener('error', event => {
        reject(event)
      })
    })
  }

  /**
   * 
   * @param {string} key 
   * @returns 
   */
  removeItem(key) {
    this.#throwErrorIfDatabaseIsDeleted()

    return new Promise((resolve, reject) => {
      let transaction

      try {
        transaction = this.database.transaction(LocalDB.#objectStoreName, 'readwrite')
      } catch (error) {
        reject(error)
        return
      }

      const objectStore = transaction.objectStore(LocalDB.#objectStoreName)
      const request = objectStore.delete(key)

      request.addEventListener('success', event => {
        resolve()
      })

      request.addEventListener('error', event => {
        reject(event)
      })
    })
  }

  getAll(query = undefined, count = undefined) {
    this.#throwErrorIfDatabaseIsDeleted()

    return new Promise((resolve, reject) => {
      let transaction

      try {
        transaction = this.database.transaction(LocalDB.#objectStoreName, 'readwrite')
      } catch (error) {
        reject(error)
        return
      }

      const objectStore = transaction.objectStore(LocalDB.#objectStoreName)
      const request = objectStore.getAll()

      request.addEventListener('success', event => {
        resolve(request.result)
      })

      request.addEventListener('error', event => {
        reject(event)
      })
    })
  }

  getAllKeys(query = undefined, count = undefined) {
    this.#throwErrorIfDatabaseIsDeleted()

    return new Promise((resolve, reject) => {
      let transaction

      try {
        transaction = this.database.transaction(LocalDB.#objectStoreName, 'readwrite')
      } catch (error) {
        reject(error)
        return
      }

      const objectStore = transaction.objectStore(LocalDB.#objectStoreName)
      const request = objectStore.getAllKeys()

      request.addEventListener('success', event => {
        resolve(request.result)
      })

      request.addEventListener('error', event => {
        reject(event)
      })
    })
  }

  getAllMap() {
    const map = {}

    return new Promise((resolve, reject) => {
      this.getAllKeys().then(keys => {
        this.getAll().then(values => {
          keys.forEach((key, index) => {
            map[key] = values[index]
          })

          resolve(map)
        })
      })
    })
  }

  deleteDB() {
    this.#throwErrorIfDatabaseIsDeleted()

    return new Promise((resolve, reject) => {
      this.database.close()

      const request = indexedDB.deleteDatabase(this.database.name)

      request.addEventListener('success', event => {
        this.#isDeleted = true
        resolve()
      })

      request.addEventListener('error', event => {
        reject(event)
      })
    })
  }

  #throwErrorIfDatabaseIsDeleted() {
    if (this.#isDeleted) throw new Error(`Cannot use a database that was deleted`)
  }

}
