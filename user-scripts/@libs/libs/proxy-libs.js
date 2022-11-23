
/**
 * Returns a Proxy of the given object which handles the assigned Promises to it
 * to set the properties of the original object.
 * It also implements a 'then' method to handle the fulfillment of all the assigned Promises.
 * @param {any} obj
 * @returns {Proxy<any>}
 */
export function asyncObjectWrapper(obj) {
  const promises = []
  const then = function then(callback) {
    return Promise.all(promises).then(() => callback())
  }

  return new Proxy(obj, {
    get: (target, property, receiver) => {
      if (property !== 'then') return

      return then
    },
    set: (target, property, value) => {
      if (!(value instanceof Promise)) return true

      promises.push(value)

      value.then(v => target[property] = v)

      return true
    }
  })
}


/**
 * Plain Object wrapper that allows to create inmediately an object when accesing a property
 * that doens't exist and that new object will also be wrapped in a Proxy
 */
export class ProxyPropertyAccess {

  static wrap(object) {
    return new Proxy(object, {
      get: (target, property, receiver) => {
        if (!target.hasOwnProperty(property)) {
          target[property] = this.wrap({})
        }

        return Reflect.get(target, property, receiver)
      },
      set: (target, property, value, receiver) => {
        return Reflect.set(target, property, value, receiver)
      }
    })
  }

  static wrapperToObject(proxyWrapper) {
    const object = {}

    ;(function readProxyAndAssignToObject(obj, proxy) {

      Object.entries(proxy).forEach(([key, value]) => {
        if (typeof value === 'object') {
          obj[key] = {}
          readProxyAndAssignToObject(obj[key], value)
          return
        }

        obj[key] = value
      })

    })(object, proxyWrapper)

    return object
  }

}

/**
 *
 * @param {HTMLElement} element
 * @returns {Proxy}
 */
export function cssInlinePropertiesProxyWrapper(element) {
  return new Proxy(element, {
    get: (target, property, handler) => {
      const priority = element.style.getPropertyPriority(property)

      return `${element.style.getPropertyValue(property)}${priority ? ` !${priority}` : ''}`
    },
    set: (target, property, value) => {
      const priority = value.match(/![a-z]+$/ig)?.[0].slice(1) ?? ''
      const propertyValue = priority ? value.replace(new RegExp(`!${priority}$`, 'i'), '') : value

      element.style.setProperty(property, propertyValue, priority)

      return true
    }
  })
}


export function proxifyPromise(value) {
  const promise = Promise.resolve(value)

  // Add anonymous function to target parameter to
  // allow the 'apply' trap
  return new Proxy(function() {}, {
    get: (target, property, receiver) => {
      switch (property) {
        case 'then':
          return promise.then.bind(promise)
        case 'catch':
          return promise.catch.bind(promise)
        case 'finally':
          return promise.finally.bind(promise)

        default:
      }

      const restultPromise = new Promise(async (resolve, reject) => {
        const [targetValue, error] = await promise.then(value => [value, null], reason => [null, reason])

        if (error) {
          reject(error)
          return
        }

        const value = targetValue[property]

        const resolveValue = typeof value === 'function' ?
                             value.bind(targetValue) :
                             value

        resolve(resolveValue)
      })

      const promiseProxyfied = proxifyPromise(restultPromise)

      return promiseProxyfied
    },

    apply(target, thisArg, args) {
      const mixedPromise = promise.then(value => [value, null], reason => [null, reason])

      const promiseProxyfied = proxifyPromise(
        mixedPromise.then(([func, error]) => {
          if (error) {
            throw error
          }

          const result = func.apply(thisArg, args)

          return result
        })
      )

      return promiseProxyfied
    }
  })
}
