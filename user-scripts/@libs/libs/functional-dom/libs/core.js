import { $map, createElement, createElementNS, setChildren, setClasses, setStyleProperties } from './helpers.js'

/**
 * @typedef {string | number | HTMLElement | DocumentFragment} CoreNode
 */

/**
 * @typedef {CoreNode[] | CoreNode[][]} Children
 */

/**
 * @typedef {(...children: CoreNode[]) => DocumentFragment} DOMMakerProxyFunc
 */

/**
 * @typedef {{
 *  [key in keyof HTMLElementTagNameMap]: (properties?: FunctionalDOMProperties, ...children: Children) => HTMLElementTagNameMap[key]
 * }} DOMMakerHTMLProxyProperties
 */

/**
 * @typedef ShadowDOMOptions
 * @property {ShadowRootInit} [init]
 * @property {ShadowRootMode} [mode=open]
 * @property {CSSStyleSheet[]} [adoptedStyleSheets=[]]
 * @property {HTMLElement[]} [children]
 */

/**
 * @typedef {{
 *  $: {[key in keyof HTMLElementTagNameMap]: (properties: FunctionalDOMProperties, shadowDOMOptions: ShadowDOMOptions, ...children: Children) => HTMLElementTagNameMap[key]}
 * }} DOMMakerShadowDOMHTMLProxyProperties
 */

/**
 * @typedef {{
 *  $: {[key: string]: (properties: FunctionalDOMProperties, shadowDOMOptions: ShadowDOMOptions, ...children: Children) => HTMLElement}
 * }} DOMMakerShadowDOMProxyProperties
 */

/**
 * @typedef {{
 *  $map: (length: number, callback: (index: number) => CoreNode) => CoreNode[]
 * }} DOMMakerMapFunc
 */

/**
* @typedef {{
*  [key: string]: (properties?: FunctionalDOMProperties, ...children: Children) => HTMLElement
* }} DOMMakerProxyProperties
*/

/**
 * @typedef {DOMMakerProxyFunc & DOMMakerHTMLProxyProperties & DOMMakerShadowDOMHTMLProxyProperties & DOMMakerShadowDOMProxyProperties & DOMMakerMapFunc & DOMMakerProxyProperties} DOMMakerProxy
 */

/**
 * @typedef {boolean | number | bigint | string | null | undefined} Primitive
 */

/**
 * @typedef FunctionalDOMProperties
 * @property {string} [id]
 * @property {string | string[]} [class]
 * @property {{[key: string]: Primitive}} [dataset]
 * @property {{[key: string]: Primitive}} [attributes]
 * @property {{[key: string]: Primitive}} [style]
 */


/**
 * @type {DOMMakerProxy}
 * 
 * Proxy object that is the core of this library.  
 * By invoking it as a `function` you can wrap multiple `DOM elements` in a `DocumentFramgent`.
 * 
 * If instead we access a `property` of it  
 * we will get a `function` that creates a `DOM element`  
 * which `tagName` match the name of the function.
 * 
 * @example
 *  const div = document.createElement('div')
 *  const button = document.createElement('button')
 * 
 *  // DocumentFragment<HTMLDivElement, HTMLButtonElement>
 *  const documentFragment = DOMMaker(div, button)
 * 
 * @example
 * const div    = DOMMaker.div()
 * const button = DOMMaker.button()
 * 
 * const customElement = DOMMaker['custom-element']()
 *  
 */
const DOMMaker = new Proxy(function() {}, {

  /**
   * 
   * @param {*} target 
   * @param {*} thisArg 
   * @param {CoreNode[]} argArray 
   * @returns {DocumentFragment}
   */
  apply: (target, thisArg, argArray) => {
    const documentFragment = new DocumentFragment()

    // @ts-ignore
    documentFragment.append(...argArray.filter(node => node != null))

    return documentFragment
  },

  /**
   * @param {*} target 
   * @param {string} property 
   * @param {*} receiver 
   * @returns {*}
   */
  get: (target, property, receiver) => {
    switch (property) {
      case '$':
        return new Proxy(function() {}, {
          /**
           * @param {*} target 
           * @param {string} innerProperty 
           * @param {*} receiver 
           * @returns {*}
           */
          get: (target, innerProperty, receiver) => {
            return function(properties, shadowDOMOptions, ...children) {
              const element = createElement(innerProperty)

              buildShadowHostElement(element, properties, shadowDOMOptions, ...children)

              return element
            }
          }
        })

      case '$map':
        return $map

      default:
    }

    return function(properties, ...children) {
      const element = createElement(property)

      buildElement(element, properties, ...children)

      return element
    }
  }

})

export default DOMMaker

/**
 * @template T
 * @param {T extends HTMLElement ? T : never} element 
 * @param {FunctionalDOMProperties} [properties] 
 * @param  {...CoreNode} children 
 * @returns {T}
 * 
 * It's similar to `DOMMaker.property()` but instead of  
 * creating an element it just takes an `element` and applies  
 * the `properties` and the `children` to it.
 */
export function buildElement(element, properties = {}, ...children) {
  const {id, class: classes, dataset, attributes, style} = properties ?? {}

  const tp = window.trustedTypes ? trustedTypes.createPolicy('', {createHTML: e => e, createScriptURL: e => e }) : {createHTML: e => e, createScriptURL: e => e }

  if (id) {
    element.id = id
  }

  if (classes) {
    setClasses(element, classes)
  }

  if (dataset) {
    for (const [property, value] of Object.entries(dataset ?? {})) {
      if (value === undefined) continue

      // @ts-ignore
      element.dataset[property] = value
    }
  }

  for (const [property, value] of Object.entries(attributes ?? {})) {
    if (value === undefined) continue

    if (['src', 'href'].includes(property)) {
      element.setAttribute(property, tp.createScriptURL(value))

      continue
    }

    // @ts-ignore
    element.setAttribute(property, value)
  }
  
  if (style) {
    // @ts-ignore
    setStyleProperties(element.style, style)
  }

  setChildren(element, children)

  return element
}

/**
 * @template T
 * @param {T extends HTMLElement ? T : never} element 
 * @param {FunctionalDOMProperties=} properties 
 * @param {ShadowDOMOptions=} shadowDOMOptions
 * @param  {...CoreNode} children 
 * @returns {T}
 * 
 * It's similar to `buildElement` but it also accepts
 * an extra parameter to configure the `Shadow DOM`
 */
export function buildShadowHostElement(element, properties = {}, shadowDOMOptions = {}, ...children) {
  buildElement(element, properties, ...children)

  const shadowRootInit = {mode: 'open', ...shadowDOMOptions.init}

  if (shadowDOMOptions.mode) {
    shadowRootInit.mode = shadowDOMOptions.mode
  }
  
  const shadowRoot = element.attachShadow(shadowRootInit)
  
  if (Array.isArray(shadowDOMOptions.adoptedStyleSheets)) {
    shadowRoot.adoptedStyleSheets = shadowDOMOptions.adoptedStyleSheets
  }
  
  shadowRoot.append(...shadowDOMOptions.children ?? [])
  
  return element
}




// TO DO

/**
 * @template T
 * @template R
 * @typedef {{
 *  [key in keyof SVGElementTagNameMap]: (properties?: FunctionalDOMProperties, ...children: T[]) => R extends 'http://www.w3.org/2000/svg' ? SVGElementTagNameMap[key] : Element
 * }} NSMakerProxySVGProperties
 */

/**
 * @template T
 * @template R
 * @typedef {{
 *  [key: string]: (properties?: FunctionalDOMProperties, ...children: T[]) => R extends 'http://www.w3.org/2000/svg' ? SVGElement : T
 * }} NSMakerProxyStringProperties
 */

/**
 * @template T
 * @template R
 * @typedef {NSMakerProxySVGProperties<T, R> & NSMakerProxyStringProperties<T, R>} NSMakerProxyProperties
 */

/**
 * @typedef {<T extends 'http://www.w3.org/2000/svg' | string>(namespace: T) => T extends 'http://www.w3.org/2000/svg' ? NSMakerProxyProperties<SVGElement, T> : NSMakerProxyProperties<Element, T>} NSMaker
 */

/**
 * @type {NSMaker}
 * 
 * Function that returns a Proxy object to create elements of a specific namespace.  
 * It is similar to `DOMMaker` in behavior but just limited to other elements that are not HTML.  
 * 
 * @example
 * const SVGMaker = NSMaker('http://www.w3.org/2000/svg')
 * 
 * const svg = SVGMaker.svg()
 * const rect = SVGMaker.rect()
 * 
 * const CustomMaker = NSMaker('my-namespace')
 * 
 * const customElement = NSMaker.customelement()
 * 
 */
export const NSMaker = namespace => {
  // @ts-ignore
  return new Proxy(function() {}, {

    /**
     * @template T
     * @param {*} target 
     * @param {T extends keyof HTMLElementTagNameMap ? T : HTMLElement} property 
     * @param {*} receiver 
     * @returns {(properties: FunctionalDOMProperties, ...children: HTMLElement[]) => HTMLElementTagNameMap[T]}
     */
    get: (target, property, receiver) => {
      // @ts-ignore
      return function(properties, ...children) {
        // @ts-ignore
        const element = createElementNS(property, namespace)
  
        // @ts-ignore
        buildElementNS(element, properties, ...children)
  
        return element
      }
    }
  
  })
}

/**
 * @template T
 * @param {T extends Element ? T : never} element 
 * @param {FunctionalDOMProperties=} properties 
 * @param  {...Element} children 
 * @returns {T}
 * 
 * It's similar to `DOMMaker.property()` but instead of  
 * creating an element it just takes an `element` and applies  
 * the `properties` and the `children` to it.
 */
export function buildElementNS(element, properties = {}, ...children) {
  const {id, class: classes, dataset, attributes, style} = properties

  const tp = window.trustedTypes ? trustedTypes.createPolicy('', {createHTML: e => e, createScriptURL: e => e}) : {createHTML: e => e, createScriptURL: e => e }

  if (id) {
    element.id = id
  }

  if (classes) {
    // @ts-ignore
    setClasses(element, classes)
  }
  
  if (dataset) {
    for (const [property, value] of Object.entries(dataset ?? {})) {
      if (value === undefined) continue
      
      // @ts-ignore
      element.dataset[property] = value
    }
  }
  
  for (const [property, value] of Object.entries(attributes ?? {})) {
    if (value === undefined) continue
    
    if (['src', 'href'].includes(property)) {
      element.setAttribute(property, tp.createScriptURL(value))
      
      continue
    }
    
    // @ts-ignore
    element.setAttribute(property, value)
  }
  
  if (style) {
    // @ts-ignore
    setStyleProperties(element.style, style)
  }
  
  // @ts-ignore
  setChildren(element, children)

  return element
}
