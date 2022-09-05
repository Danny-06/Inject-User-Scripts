import { Node } from './node.js'

class Element extends Node {

  constructor() {
    if (!new.target) throw new Error(`Cannot create an instance of an abstract class.`)
  }

  animate() {
    throw new Error()
  }

  append(...nodes) {

  }

  remove() {
    
  }

  after(...nodes) {

  }

  before(...nodes) {

  }

  attachShadow(shadowRootInit) {

  }

}
