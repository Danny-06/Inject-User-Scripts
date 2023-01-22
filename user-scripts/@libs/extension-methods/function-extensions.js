export const tryFunction = Symbol('Function.tryAsyncFunction')

Function.prototype[tryFunction] = function tryFunction() {
  let value = null
  let reason = null

  try {
    value = this()
  } catch (error) {
    reason = error
  }

  return [value, reason]
}
