/**
 * @template T, R
 * @typedef {T | (R & Record<string, T>)} UnionOrElse
 */

/**
 * @typedef PromiseSyncConstructor
 * @property {symbol} PENDING
 * @property {symbol} FULFILLED
 * @property {symbol} REJECTED
 */

/**
 * @template T
 * @typedef PromiseSync
 */


/**
 *
 * @type {PromiseSyncConstructor}
 */
const PromiseSync = function PromiseSync(executor) {
  if (new.target == null) {
    throw new Error(`Cannot invoke constructor without new operator`)
  }

  if (typeof executor !== 'function') {
    throw new TypeError(`Must provide an function argument to the constructor`)
  }

  const self = Object.setPrototypeOf(
    function() {
      if (self[sym_state] === PromiseSync.PENDING) {
        return new PromiseSync((resolve, reject) => {
          PromiseSync.then(
            self,
            value => {
              const thisArg = this[sym_value]
              resolve(value.apply(thisArg, arguments))
            },
            reason => reject(reason)
          )
        })
      }

      if (self[sym_state] === PromiseSync.REJECTED) {
        return PromiseSync.reject(self[sym_reason])
      }

      const func = self[sym_value]
      const thisArg = this[sym_value]
      return PromiseSync.prototype(self, func, thisArg, arguments)
    },
    PromiseSync.prototype
  )

  Object.defineProperties(self, {

    [sym_state]: {
      value: PromiseSync.PENDING,
      writable: true,
    },

    [sym_value]: {
      value: undefined,
      writable: true,
    },

    [sym_reason]: {
      value: undefined,
      writable: true
    },

    [sym_onFulfilled]: {
      value: new Set(),
    },

    [sym_onRejected]: {
      value: new Set(),
    },

  })

  Object.preventExtensions(self)

  try {
    executor(resolve.bind(self), reject.bind(self))
  } catch (reason) {
    reject.call(self, reason)
  }

  return self
}

export default PromiseSync


const proxyPrototype = new Proxy(() => {}, {
  get(target, property, receiver) {
    return new PromiseSync((resolve, reject) => {
      if (receiver[sym_state] === PromiseSync.PENDING) {
        return
      }

      if (receiver[sym_state] === PromiseSync.FULFILLED) {
        resolve(receiver[sym_value][property])
      }
      else {
        reject(receiver[sym_reason])
      }
    })
  },

  set(target, property, value, receiver) {
    throw new Error(`Cannot set properties on Promise`)
  },

  apply(_target, _thisArg, argArray) {
    const [promise, target, thisArg, args] = argArray

    return new PromiseSync((resolve, reject) => {
      resolve(target.apply(thisArg, args))
    })
  },
})

const sym_state = Symbol('state')
const sym_value = Symbol('value')
const sym_reason = Symbol('reason')

const sym_onFulfilled = Symbol('onFulfilled')
const sym_onRejected = Symbol('onRejected')



const resolve = function resolve(value) {
  if (this[sym_state] !== PromiseSync.PENDING) {
    return
  }

  if (value instanceof PromiseSync) {
    PromiseSync.then(
      value,
      value => {
        this[sym_state] = PromiseSync.FULFILLED
        this[sym_value] = value

        for (const callback of this[sym_onFulfilled]) {
          callback(value)
        }

        this[sym_onFulfilled].clear()
        this[sym_onRejected].clear()
      },
      reason => {
        this[sym_state] = PromiseSync.REJECTED
        this[sym_reason] = reason

        for (const callback of this[sym_onRejected]) {
          callback(reason)
        }

        this[sym_onFulfilled].clear()
        this[sym_onRejected].clear()
      },
    )

    return
  }

  this[sym_state] = PromiseSync.FULFILLED
  this[sym_value] = value

  for (const callback of this[sym_onFulfilled]) {
    callback(value)
  }

  this[sym_onFulfilled].clear()
  this[sym_onRejected].clear()
}

const reject = function reject(reason) {
  if (this[sym_state] !== PromiseSync.PENDING) {
    return
  }

  if (reason instanceof PromiseSync) {
    PromiseSync.then(
      reason,
      value => {
        this[sym_state] = PromiseSync.FULFILLED
        this[sym_value] = value

        for (const callback of this[sym_onFulfilled]) {
          callback(value)
        }

        this[sym_onFulfilled].clear()
        this[sym_onRejected].clear()
      },
      reason => {
        this[sym_state] = PromiseSync.REJECTED
        this[sym_reason] = reason

        for (const callback of this[sym_onRejected]) {
          callback(reason)
        }

        this[sym_onFulfilled].clear()
        this[sym_onRejected].clear()
      },
    )

    return
  }

  this[sym_state] = PromiseSync.REJECTED
  this[sym_reason] = reason

  for (const callback of this[sym_onRejected]) {
    callback(reason)
  }

  this[sym_onFulfilled].clear()
  this[sym_onRejected].clear()
}


Object.defineProperties(PromiseSync, {

  prototype: {value: proxyPrototype},

  PENDING: {value: Symbol('pending')},

  FULFILLED: {value: Symbol('fulfilled')},

  REJECTED: {value: Symbol('rejected')},

  getState: {
    value(promise) {
      return promise[sym_state]
    }
  },

  getData: {
    value(promise) {
      const data = {state: promise[sym_state]}

      if (promise[sym_value]) {
        data.value = promise[sym_value]
      }
      else
      if (promise[sym_reason]) {
        data.reason = promise[sym_reason]
      }

      return data
    }
  },

  resolve: {
    value(value) {
      return new PromiseSync(resolve => resolve(value))
    }
  },

  reject: {
    value(reason) {
      return new PromiseSync((resolve, reject) => reject(reason))
    }
  },

  then: {
    value(promise, onFulfilled, onRejected) {
      return new PromiseSync((resolve, reject) => {
        if (promise[sym_state] === PromiseSync.FULFILLED) {
          resolve(onFulfilled?.(promise[sym_value]) ?? promise[sym_value])
        }
        else
        if (promise[sym_state] === PromiseSync.REJECTED) {
          reject(onRejected?.(promise[sym_reason]) ?? promise[sym_reason])
        }
        else {
          promise[sym_onFulfilled].add(
            value => {
              resolve(onFulfilled?.(value) ?? value)
            }
          )

          promise[sym_onRejected].add(
            reason => {
              reject(onRejected?.(reason) ?? reason)
            }
          )
        }
      })
    }
  },

})


/**
 *
 * @param {GeneratorFunction} generatorFunc
 * @param  {...any} args
 * @returns {(...args: any[]) => Promise}
 */
export function getAsyncFuncFromGeneratorFunc(generatorFunc) {
  return function asyncFunction(...args) {
    const iterator = generatorFunc(...args)

    return (function nextIteration(yieldArg) {
      const {value: yieldValue, done} = iterator.next(yieldArg)

      console.log({yieldArg, yieldValue})

      if (done) {
        return PromiseSync.resolve(yieldValue)
      }

      return PromiseSync.then(
        PromiseSync.resolve(yieldValue),
        value => nextIteration(value),
        reason => iterator.throw(reason)
      )
    })()
  }
}
