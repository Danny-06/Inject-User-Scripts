export const tryPromise = Symbol('Promise.tryPromise')

Promise.prototype[tryPromise] = function tryPromise() {
  return this.then(
    value => [value, null],
    reason => [null, reason]
  )
}

const value = Promise.resolve(2)[tryPromise]()
