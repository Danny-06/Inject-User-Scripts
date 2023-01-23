import { proxifyPromise } from '../libs/proxy-libs.js'

export const toPromiseProxy = Symbol('Object.toPromiseProxy')

Object.prototype[toPromiseProxy] = function toPromiseProxy() {
  return proxifyPromise(this)
}



export const run = Symbol('Object.run')

Object.prototype[run] = function toPromiseProxy(callback) {
  return callback(this)
}
