
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
  const proxy = new Proxy(element, {
    get: (target, property, handler) => {
      switch (property) {
        case 'toObject':
          return function toObject() {
            const styleString = target.getAttribute('style')?.trim()

            if (!styleString) {
              return {}
            }

            const declarationEntries = styleString
                                     .replaceAll('\n', '')
                                     .replace(/(?<=(;))\s*/g, '')
                                     .split(';')
                                     .filter(str => str)
                                     .map(declaration => declaration.split(':').map(str => str.trim()))
  
            const styles = Object.fromEntries(declarationEntries)
  
            return styles
          }

        case 'toJSON':
          return function toJSON() {
            return JSON.stringify(proxy.toObject())
          }
      }

      const priority = target.style.getPropertyPriority(property)

      return `${target.style.getPropertyValue(property)}${priority ? ` !${priority}` : ''}`
    },
    set: (target, property, value) => {
      const priority = value.match(/![a-z]+$/ig)?.[0].slice(1) ?? ''
      const propertyValue = priority ? value.replace(new RegExp(`!${priority}$`, 'i'), '') : value

      target.style.setProperty(property, propertyValue, priority)

      return true
    }
  })

  return proxy
}

/**
 * Allows to access future value of Promises with dot notation.
 * You can also use Promise methods on the Proxy to handle it as expected.
 * @param {any} value 
 * @returns {Proxy}
 */
export function proxifyPromise(value) {
  const promise = Promise.resolve(value)

  // Add anonymous function to target parameter to
  // allow the 'apply' trap
  return new Proxy(function() {}, {
    set: (target, property, value, receiver) => {
      ;(async function() {
        const [target, error] = await promise.then(value => [value, null], reason => [null, reason])

        if (error) {
          throw error
        }

        if (target == null) {
          throw new Error(`Cannot read property '${property.toString()}' of ${target}`)
        }

        Reflect.set(target, property, value, receiver)
      })()

      return true
    },

    get: (target, property, receiver) => {
      const promiseMethods = {
        then(callback) {
          return proxifyPromise(promise.then(callback))
        },
        catch(callback) {
          return proxifyPromise(promise.catch(callback))
        },
        finally(callback) {
          return proxifyPromise(promise.finally(callback))
        }
      }

      switch (property) {
        // Add Promises methods to handle the Proxy
        case 'then':
          return promiseMethods.then
        case 'catch':
          return promiseMethods.catch
        case 'finally':
          return promiseMethods.finally

        default:
      }

      const restultPromise = new Promise(async (resolve, reject) => {
        const [target, error] = await promise.then(value => [value, null], reason => [null, reason])

        if (error) {
          reject(error)
          return
        }

        const value = target[property]

        const resolveValue = typeof value === 'function' ?
                             value.bind(target) :
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
