import DOMMaker, { buildElement, buildElementNS, buildShadowHostElement, NSMaker } from './libs/core.js'
import { createWebComponent } from './libs/create-web-component.js'

const _ = DOMMaker

export default _


/**
 * @typedef {import('./libs/core.js').NSMakerProxyProperties<SVGElement, 'http://www.w3.org/2000/svg'>} SVGMaker
 */

/**
 * @type {SVGMaker}
 */
const _svg = NSMaker('http://www.w3.org/2000/svg')

export {
  buildElement,
  buildShadowHostElement,
  createWebComponent,

  _svg,

  NSMaker,
  buildElementNS
}
