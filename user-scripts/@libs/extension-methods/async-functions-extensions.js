const AsyncFunction = (async function() {}).constructor

export const tryAsyncFunction = Symbol('AsyncFunction.tryAsyncFunction')

AsyncFunction.prototype[tryAsyncFunction] = function tryAsyncFunction() {
  return this().then(
    value => [value, null],
    reason => [null, reason]
  )
}
