/**
 * @template T, R
 * @typedef {T | (R & Record<string, T>)} UnionOrElse
 */

/**
 * @typedef PromiseProxyStaticFields
 * @property {ProxyConstructor} prototype
 * @property {symbol} PENDING
 * @property {symbol} FULFILLED
 * @property {symbol} REJECTED
 * @property {symbol} promiseToPromiseProxy
 * @property {symbol} getState
 * @property {symbol} getData
 * @property {symbol} resolve
 * @property {symbol} reject
 * @property {symbol} then
 */



/**
 * @template T
 * @typedef {(value?: T | PromiseProxy<T>) => void} PromiseProxyResolve
 */

/**
 * @typedef {(reason?: any) => void} PromiseProxyReject
 */

/**
 * @template T
 * @typedef {(resolve: PromiseProxyResolve<T>, reject?: PromiseProxyReject) => void} PromiseProxyExecutor
 */

/**
 * @template T
 * @typedef {new (executor: PromiseProxyExecutor<T>) => PromiseProxy<T>} PromiseProxyConstructorSignature
 */

/**
 * @typedef {PromiseProxyStaticFields & PromiseProxyConstructorSignature} PromiseProxyConstructor
 */

/**
 * @template T
 * @typedef {{[key in T]: PromiseProxy<T[key]>}} PromiseProxy
 */



// const sos = new PromiseProxy(resolve => resolve(''))

// sos.add

/**
 *
 * @type {PromiseProxyConstructor}
 */
var PromiseProxy = function (executor) {
  if (new.target == null) {
    throw new Error(`Cannot invoke constructor without new operator`)
  }

  if (typeof executor !== 'function') {
    throw new TypeError(`Must provide an function argument to the constructor`)
  }

  const self = Object.setPrototypeOf(
    function() {
      if (self[sym_state] === PromiseProxy.PENDING) {
        return new PromiseProxy((resolve, reject) => {
          PromiseProxy.then(
            self,
            value => {
              const thisArg = this != null ? this[sym_value] : undefined
              resolve(PromiseProxy.prototype(self, value, thisArg, arguments))
            },
            reason => reject(reason)
          )
        })
      }

      if (self[sym_state] === PromiseProxy.REJECTED) {
        return PromiseProxy.reject(self[sym_reason])
      }

      const func = self[sym_value]
      const thisArg = this != null ? this[sym_value] : undefined

      return PromiseProxy.prototype(self, func, thisArg, arguments)
    },
    PromiseProxy.prototype
  )

  Object.defineProperties(self, {

    [sym_state]: {
      value: PromiseProxy.PENDING,
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

export default PromiseProxy


const proxyPrototype = new Proxy(() => {}, {
  get(target, property, receiver) {
    return new PromiseProxy((resolve, reject) => {
      if (receiver[sym_state] === PromiseProxy.PENDING) {
        PromiseProxy.then(
          receiver,
          value => resolve(value[property]),
          reason => reject(reason),
        )
        return
      }

      if (receiver[sym_state] === PromiseProxy.FULFILLED) {
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

    if (typeof target !== 'function') {
      return PromiseProxy.reject(new TypeError(`(${target}) is not a function in PromiseProxy`, {cause: target}))
    }

    return new PromiseProxy((resolve, reject) => {
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
  if (this[sym_state] !== PromiseProxy.PENDING) {
    return
  }

  if (value instanceof PromiseProxy) {
    PromiseProxy.then(
      value,
      value => {
        this[sym_state] = PromiseProxy.FULFILLED
        this[sym_value] = value

        for (const callback of this[sym_onFulfilled]) {
          callback(value)
        }

        this[sym_onFulfilled].clear()
        this[sym_onRejected].clear()
      },
      reason => {
        this[sym_state] = PromiseProxy.REJECTED
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

  this[sym_state] = PromiseProxy.FULFILLED
  this[sym_value] = value

  for (const callback of this[sym_onFulfilled]) {
    callback(value)
  }

  this[sym_onFulfilled].clear()
  this[sym_onRejected].clear()
}

const reject = function reject(reason) {
  if (this[sym_state] !== PromiseProxy.PENDING) {
    return
  }

  if (reason instanceof PromiseProxy) {
    PromiseProxy.then(
      reason,
      value => {
        this[sym_state] = PromiseProxy.FULFILLED
        this[sym_value] = value

        for (const callback of this[sym_onFulfilled]) {
          callback(value)
        }

        this[sym_onFulfilled].clear()
        this[sym_onRejected].clear()
      },
      reason => {
        this[sym_state] = PromiseProxy.REJECTED
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

  this[sym_state] = PromiseProxy.REJECTED
  this[sym_reason] = reason

  for (const callback of this[sym_onRejected]) {
    callback(reason)
  }

  this[sym_onFulfilled].clear()
  this[sym_onRejected].clear()
}


Object.defineProperties(PromiseProxy, {

  prototype: {value: proxyPrototype},

  PENDING: {value: Symbol('pending')},

  FULFILLED: {value: Symbol('fulfilled')},

  REJECTED: {value: Symbol('rejected')},

  promiseToPromiseProxy: {
    value(promise) {
      if (!(promise instanceof Promise)) {
        throw new TypeError(`parameter must be a Promise object`)
      }

      return new PromiseProxy((resolve, reject) => {
        promise.then(resolve, reject)
      })
    }
  },

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
      return new PromiseProxy(resolve => resolve(value))
    }
  },

  reject: {
    value(reason) {
      return new PromiseProxy((resolve, reject) => reject(reason))
    }
  },

  then: {
    value(promise, onFulfilled, onRejected) {
      return new PromiseProxy((resolve, reject) => {
        if (promise[sym_state] === PromiseProxy.FULFILLED) {
          try {
            resolve(onFulfilled?.(promise[sym_value]) ?? promise[sym_value])
          } catch (reason) {
            reject(reason)
          }
        }
        else
        if (promise[sym_state] === PromiseProxy.REJECTED) {
          try {
            if (onRejected) {
              resolve(onRejected(promise[sym_reason]))
            }
            else {
              reject(promise[sym_reason])
            }
          } catch (reason) {
            reject(reason)
          }
        }
        else {
          promise[sym_onFulfilled].add(
            value => {
              try {
                resolve(onFulfilled?.(value) ?? value)
              } catch (reason) {
                reject(reason)
              }
            }
          )

          promise[sym_onRejected].add(
            reason => {
              try {
                if (onRejected) {
                  resolve(onRejected(reason))
                }
                else {
                  reject(reason)
                }
              } catch (reason) {
                reject(reason)
              }
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
      let yieldValue, done

      try {
        ({value: yieldValue, done} = iterator.next(yieldArg))
      } catch (reason) {
        return PromiseProxy.reject(reason)
      }

      console.log({yieldArg, yieldValue})

      if (done) {
        return PromiseProxy.resolve(yieldValue)
      }

      return PromiseProxy.then(
        PromiseProxy.resolve(yieldValue),
        value => nextIteration(value),
        reason => {
          try {
            const {value: yieldValue, done} = iterator.throw(reason)

            if (done) {
              return yieldValue
            }

            return nextIteration(yieldValue)
          } catch {
            return PromiseProxy.reject(reason)
          }
        }
      )
    })()
  }
}
