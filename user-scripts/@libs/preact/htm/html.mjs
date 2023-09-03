import { h } from '../preact.mjs'
import htm from './htm.mjs'

// https://github.com/developit/htm


// Disable cache of htm
// https://github.com/developit/htm#caching
function myH() {
  this[0] = 3
  return h(...arguments)
}

const html = htm.bind(myH)

export default html
