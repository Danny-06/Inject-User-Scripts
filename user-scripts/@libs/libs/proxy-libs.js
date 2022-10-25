
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
