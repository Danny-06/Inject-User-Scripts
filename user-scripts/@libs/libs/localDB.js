export default class LocalDB {

  static #objectStoreName = 'table-key-value-pairs'

  static #privateSymbolToCreateInstance = Symbol('createInstance')

  /**
   * @type {IDBDatabase}
   */
  database
  /**
   * @type {IDBOpenDBRequest}
   */
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
        resolve(localDB)
      })
      localDB.request.addEventListener('error', event => reject(event))
    })
  }

  constructor(databaseName, privateKey) {
    if (privateKey !== LocalDB.#privateSymbolToCreateInstance) {
      throw new Error(`Cannot make an instance of this class manually. Call the static method 'createLocalDB' instead`)
    }

    const request = indexedDB.open(databaseName)

    Object.defineProperty(this, 'request', {
      value: request,
      writable: false,
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
        writable: false,
        enumerable: true
      })
    })
  }

  getItem(key, objectStoreName = null) {
    this.#throwErrorIfDatabaseIsDeleted()

    return new Promise((resolve, reject) => {
      let transaction

      const tableName = objectStoreName ? objectStoreName : LocalDB.#objectStoreName

      try {
        transaction = this.database.transaction(tableName, 'readwrite')
      } catch (error) {
        reject(error)
        return
      }

      const objectStore = transaction.objectStore(tableName)
      const request = objectStore.get(key)

      request.addEventListener('success', event => {
        resolve(request.result)
      })

      request.addEventListener('error', event => {
        reject(event)
      })
    })
  }

  setItem(key, value, objectStoreName = null) {
    this.#throwErrorIfDatabaseIsDeleted()

    return new Promise((resolve, reject) => {
      let transaction

      const tableName = objectStoreName ? objectStoreName : LocalDB.#objectStoreName

      try {
        transaction = this.database.transaction(tableName, 'readwrite')
      } catch (error) {
        reject(error)
        return
      }

      const objectStore = transaction.objectStore(tableName)
      const request = objectStore.put(value, key)

      request.addEventListener('success', event => {
        resolve()
      })

      request.addEventListener('error', event => {
        reject(event)
      })
    })
  }

  removeItem(key, objectStoreName = null) {
    this.#throwErrorIfDatabaseIsDeleted()

    return new Promise((resolve, reject) => {
      let transaction

      const tableName = objectStoreName ? objectStoreName : LocalDB.#objectStoreName

      try {
        transaction = this.database.transaction(tableName, 'readwrite')
      } catch (error) {
        reject(error)
        return
      }

      const objectStore = transaction.objectStore(tableName)
      const request = objectStore.delete(key)

      request.addEventListener('success', event => {
        resolve()
      })

      request.addEventListener('error', event => {
        reject(event)
      })
    })
  }

  getAll(query = undefined, count = undefined, objectStoreName = null) {
    this.#throwErrorIfDatabaseIsDeleted()

    return new Promise((resolve, reject) => {
      let transaction

      const tableName = objectStoreName ? objectStoreName : LocalDB.#objectStoreName

      try {
        transaction = this.database.transaction(tableName, 'readwrite')
      } catch (error) {
        reject(error)
        return
      }

      const objectStore = transaction.objectStore(tableName)
      const request = objectStore.getAll(query, count)

      request.addEventListener('success', event => {
        resolve(request.result)
      })

      request.addEventListener('error', event => {
        reject(event)
      })
    })
  }

  getAllKeys(query = undefined, count = undefined, objectStoreName = null) {
    this.#throwErrorIfDatabaseIsDeleted()

    return new Promise((resolve, reject) => {
      let transaction

      const tableName = objectStoreName ? objectStoreName : LocalDB.#objectStoreName

      try {
        transaction = this.database.transaction(tableName, 'readwrite')
      } catch (error) {
        reject(error)
        return
      }

      const objectStore = transaction.objectStore(tableName)
      const request = objectStore.getAllKeys(query, count)

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
