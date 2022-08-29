export const classMaker = {

  create(settings) {
    const {privateStore, extends: extendsConstructor, constructor = function() {}, properties = {}, privateProperties = {}, staticProperties = {}, privateStaticProperties = {}} = settings
    const $ = privateStore

    const instaceMethods = Object.fromEntries(
      Object.entries(properties).filter(([propertyName, objDescriptor]) => {
        return objDescriptor.value instanceof Function
      })
    )

    const privateInstaceMethods = Object.fromEntries(
      Object.entries(privateProperties).filter(([propertyName, objDescriptor]) => {
        return objDescriptor.value instanceof Function
      })
    )

    const instanceProperties = Object.fromEntries(
      Object.entries(properties).filter(([propertyName, objDescriptor]) => {
        return !(objDescriptor.value instanceof Function)
      })
    )

    const privateInstanceProperties = Object.fromEntries(
      Object.entries(privateProperties).filter(([propertyName, objDescriptor]) => {
        return !(objDescriptor.value instanceof Function)
      })
    )

    let classFunction

    // Computed function name with `eval`
    try {
      classFunction = eval(`(function ${constructor.name}(...args) {
        Object.defineProperties(this, instanceProperties)

        if (privateStore) {
          const privateInstance = $(this, privateClassFunction)
          Object.defineProperties(privateInstance, privateInstanceProperties)

          Object.defineProperty(this, Symbol('Private Instance'), {
            value: privateInstance,
            writable: false,
            configurable: false
          })
        }

        constructor.call(this, ...args)
      })`)
    } catch(error) {
      classFunction = function(...args) {
        Object.defineProperties(this, instanceProperties)

        if (privateStore) {
          const privateInstance = $(this, privateClassFunction)
          Object.defineProperties(privateInstance, privateInstanceProperties)

          Object.defineProperty(this, Symbol('Private Instance'), {
            value: privateInstance,
            writable: false,
            configurable: false
          })
        }

        constructor.call(this, ...args)
      }
    }


    if (extendsConstructor instanceof Function) {
      classFunction.prototype = Object.create(extendsConstructor.prototype)
    }

    classFunction.prototype.constructor = classFunction

    Object.entries(instaceMethods).forEach(([name, objDescriptor]) => {
      classFunction.prototype[name] = objDescriptor.value
    })

    Object.defineProperties(classFunction, staticProperties)

    let privateClassFunction
    if (privateStore) {
      privateClassFunction = $(classFunction)

      Object.defineProperty(classFunction, Symbol('Private Instance'), {
        value: privateClassFunction,
        writable: false,
        configurable: false
      })

      Object.entries(privateInstaceMethods).forEach(([name, objDescriptor]) => {
        privateClassFunction.prototype[name] = objDescriptor.value
      })


      Object.defineProperties(privateClassFunction, privateStaticProperties)
    }

    return classFunction
  },

  /**
   * Returns a function which map objects to a private one to allow the use of private properties in objects and classes
   * @returns {(instance, constructor) => {}}
   */
  createPrivateStore() {
    const privateInstances = new Map()

    return function getPrivateInstance(instance, constructor) {
      if (!privateInstances.has(instance)) {
        const privateInstance = instance instanceof Function ? function() {} : (constructor ? Object.create(constructor.prototype) : {})

        privateInstances.set(instance, privateInstance)
      }

      return privateInstances.get(instance)
    }
  }

}




/* Example

const myClass = (function() {

  const $ = classMaker.createPrivateStore()

  return classMaker.create({
    privateStore: $,

    extends: null,

    constructor: function myClass(name = 'name') {
      this.name = name
    },

    properties: {
      name: {
        get: () => $(this).name,
        set: value => {
          if(typeof value === 'string') {
            $(this).name = value
          }
        }
      },
      doSomething: {
        value: function doSomething() {
          return Infinity
        }
      },
      getPrivateProperty: {
        value: function getPrivateProperty() {
          return $(this).privateProperty
        }
      }
    },

    privateProperties: {
      privateProperty: {
        value: 'SoS'
      },
      funci: {
        value: function() {return NaN}
      }
    },

    staticProperties: {
      sonic: {
        get: () => 2006
      },
      elise: {
        value: () => 'princess'
      }
    },

    privateStaticProperties: {
      sonic: {value: 'Elise'},
      func: {
        value() {
          return 'Lel'
        }
      }
    }
  })

})()
*/
