import { proxifyPromise } from '../libs/proxy-libs.js'

export const toPromiseProxy = Symbol('Object.toPromiseProxy')

Object.prototype[toPromiseProxy] = function toPromiseProxy() {
  return proxifyPromise(this)
}
