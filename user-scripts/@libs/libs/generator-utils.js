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

      if (done) {
        return Promise.resolve(yieldValue)
      }

      const isThenable = typeof yieldValue === 'object' && typeof yieldValue.then === 'function'
      const promise = isThenable ? yieldValue : Promise.resolve(yieldValue)

      return promise.then(value => nextIteration(value), reason => iterator.throw(reason))
    })()
  }
}


/**
 *
 * @param {GeneratorFunction} generatorFunc
 * @param  {...any} args
 * @returns {Promise}
 */
export function runGeneratorFuncAsAsyncFunc(generatorFunc, ...args) {
  const asyncFunction = getAsyncFuncFromGeneratorFunc(generatorFunc)

  return asyncFunction(...args)
}


/**
 *
 * @param {GeneratorFunction} generatorFunc
 * @param  {...any} args
 * @returns {(...args: any[]) => Promise}
 */
export function getCustomAsyncFuncFromGeneratorFunc(generatorFunc) {
  return function asyncFunction(...args) {
    const iterator = generatorFunc(...args)

    return (function nextIteration(yieldArg) {
      // const {value: yieldValue, done} = iterator.next(yieldArg)

      // if (done) {
      //   return Promise.resolve(yieldValue)
      // }

      // const isThenable = typeof yieldValue === 'object' && typeof yieldValue.then === 'function'
      // const promise = isThenable ? yieldValue : Promise.resolve(yieldValue)

      // return promise.then(value => nextIteration(value), reason => iterator.throw(reason))
    })()
  }
}
