/**
 * 
 * @param {GeneratorFunction} generatorFunc 
 * @param  {...any} args 
 * @returns {(...args: any[]) => Promise}
 */
export function getAsyncFuncFromGeneratorFunc(generatorFunc) {
  return function asyncFunction(...args) {
    const iterator = generatorFunc(...args)

    return (function nextIteration(it, yieldArg) {
      const {value: yieldValue, done} = it.next(yieldArg)
  
      if (done) {
        return Promise.resolve(yieldValue)
      }
  
      const isThenable = typeof yieldValue === 'object' && typeof yieldValue.then === 'function'
      const promise = isThenable ? yieldValue : Promise.resolve(yieldValue)
  
      return promise.then(value => nextIteration(it, value), reason => it.throw(reason))
    })(iterator)
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
