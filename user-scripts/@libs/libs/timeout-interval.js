export class Timeout {

  #id
  get id() {
    return this.#id
  }
  set id(value) {
    throw new Error(`This property is readonly`)
  }

  #callback
  get callback() {
    return this.#callback
  }
  set callback(value) {
    throw new Error(`This property is readonly`)
  }

  #args
  get args() {
    return this.#args
  }
  set args(value) {
    throw new Error(`This property is readonly`)
  }

  #timeout
  get timeout() {
    return this.#timeout
  }
  set timeout(value) {
    throw new Error(`This property is readonly`)
  }

  #aborted = false
  get aborted() {
    return this.#aborted
  }
  set aborted(value) {
    throw new Error(`This property is readonly`)
  }

  #promise
  #auxResolve
  #auxReject

  constructor(options = {}) {
    const {callback, args = [], timeout = 0} = options

    if (typeof callback !== 'function') throw new TypeError(`'callback' must be a function`)
    if (typeof timeout !== 'number')    throw new TypeError(`'timeout' must be a number`)
    if (!Array.isArray(args))           throw new TypeError(`'args' must be an array`)

    this.#callback = callback
    this.#args = args
    this.#timeout = timeout

    this.#promise = new Promise((resolve, reject) => {
      this.#auxResolve = (...args) => {
        resolve(this.callback(...args))
      }

      this.#auxReject = () => {
        reject(new Error(`Timeout aborted`))
      }
    })

    this.#id = setTimeout(this.#auxResolve, timeout, ...this.#args)
  }

  abort() {
    clearTimeout(this.id)
    this.#aborted = true

    this.#auxReject()
  }

  then(callback) {
    return this.#promise.then(callback)
  }

}

export class Interval {

  #id
  get id() {
    return this.#id
  }
  set id(value) {
    throw new Error(`This property is readonly`)
  }

  #callback
  get callback() {
    return this.#callback
  }
  set callback(value) {
    throw new Error(`This property is readonly`)
  }

  #args
  get args() {
    return this.#args
  }
  set args(value) {
    throw new Error(`This property is readonly`)
  }

  #timeout
  get timeout() {
    return this.#timeout
  }
  set timeout(value) {
    if (typeof value !== 'number') throw new TypeError(`Value must be a number`)

    this.#timeout = value
  }

  #aborted = false
  get aborted() {
    return this.#aborted
  }
  set aborted(value) {
    throw new Error(`This property is readonly`)
  }

  #auxCallback

  #promise
  #currentValue

  constructor(options = {}) {
    const {callback, args = [], timeout = 0} = options

    if (typeof callback !== 'function') throw new TypeError(`'callback' must be a function`)
    if (typeof timeout !== 'number')    throw new TypeError(`'timeout' must be a number`)
    if (!Array.isArray(args))           throw new TypeError(`'args' must be an array`)

    this.#callback = callback
    this.#args = args
    this.#timeout = timeout

    this.#promise = new Promise((resolve, reject) => {

      this.#id = setTimeout(
        (...args) => {
          this.#auxCallback(...args)
          resolve(this.#currentValue)
        },
        this.#timeout,
        ...this.#args
      )

    })

    this.#auxCallback = (...args) => {
      this.#promise = new Promise((resolve, reject) => {
        this.#currentValue = this.#callback(...args)

        this.#id = setTimeout(
          (...args) => {
            this.#auxCallback(...args)
            resolve(this.#currentValue)
          },
          this.#timeout,
          ...this.#args
        )
      })
    }
  }

  abort() {
    clearTimeout(this.id)
    this.#aborted = true
  }

  toPromise() {
    return this.#promise.then()
  }

  async *[Symbol.asyncIterator]() {
    while (!this.#aborted) {
      yield this.toPromise()
    }
  }

}
