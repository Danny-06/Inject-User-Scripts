export function runGeneratorAsAsyncFunction(generator, ...args) {
  const iterator = generator(...args)

  return (function nextIteration(it, yieldArg) {
    const {value: yieldValue, done} = it.next(yieldArg)

    if (done) {
      return Promise.resolve(yieldValue)
    }

    const promise = yieldValue != null && 'then' in yieldValue && typeof yieldValue.then === 'function' ? yieldValue : Promise.resolve(yieldValue)

    return promise.then(value => nextIteration(it, value), reason => it.throw(reason))
  })(iterator)
}
