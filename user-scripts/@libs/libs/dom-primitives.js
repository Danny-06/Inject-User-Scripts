//@ts-check

/**
 * {@link https://www.totaltypescript.com/tips/create-autocomplete-helper-which-allows-for-arbitrary-values}
 * @template {keyof any} Union
 * @template {keyof any} Type
 * @typedef {Union | Omit<Type, Union>} UnionOrType
 */

/**
 * @template T
 * @typedef {T | T[]} ArrayOrSingle
 */


// XOR Utility
// https://stackoverflow.com/a/62061663/18241830

/**
 * @template T
 * @template U
 * @typedef {{ [P in Exclude<keyof T, keyof U>]?: never }} Without
 */

/**
 * @template T
 * @template U
 * @typedef {(T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U} XOR
 */




/**
 * @typedef {undefined | boolean | number | bigint | string} Primitive
 */

/**
 * @typedef {UnionOrType<keyof HTMLElementTagNameMap, string>} TagName
 */



/**
 * @template Data
 * @typedef {(options?: Child | CreateElementComponentOptions<Data>, ...children: Child[]) => ElementComponentReturnValue} ElementComponent
 */

/**
 * @typedef {null | Primitive | CharacterData | HTMLElement | DocumentFragment} ElementComponentReturnValue
 */

/**
 * @template T
 * @typedef {CreateElementOptions & {data?: ComponentData<T>?}} CreateElementComponentOptions
 */

/**
 * @template T
 * @typedef {{[key: string]: unknown} & T} ComponentData
 */

/**
 * @typedef CreateElementOptions
 * @property {ElementAttributes?} [attr]
 * @property {ElementProperties?} [prop]
 * @property {ElementListeners?} [on]
 */

/**
 * @typedef {{[key: string]: unknown}} ElementProperties
 */

/**
 * @typedef {{[key: string]: null | Primitive}} ElementAttributes
 */

/**
 * @typedef {(event: Event) => void} GenericEventListener
 */

/**
 * @typedef {{[key: string]: GenericEventListener | [GenericEventListener, AddEventListenerOptions | null | undefined]}} ElementListeners
 */


/**
 * @typedef {null | Primitive | CharacterData | HTMLElement | DocumentFragment} Child
 */


/**
 * Create element.
 * @template {TagName} T
 * @param {T} tagName 
 * @param {CreateElementOptions?} [options] 
 * @param {...Child} children 
 * @returns {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLElement}
 */
export function createElement(tagName, options, ...children) {
  //@ts-ignore
  const element = document.createElement(tagName)

  const { attr, prop, on } = options ?? {}

  for (const [name, value] of Object.entries(attr ?? {})) {
    element.setAttribute(name, String(value))
  }

  for (const [property, value] of Object.entries(prop ?? {})) {
    element[property] = value
  }

  for (const [eventName, listenerOrTuple] of Object.entries(on ?? {})) {
    const [listener, options] = Array.isArray(listenerOrTuple) ? listenerOrTuple : [listenerOrTuple]

    element.addEventListener(eventName, listener, options ?? undefined)
  }

  //@ts-ignore
  element.append(...children)
  
  //@ts-ignore
  return element
}


/**
 * @template {TagName} T
 * @param  {T} tagName 
 * @param {XOR<CreateElementOptions, Child>} [optionsOrChild] 
 * @param  {...Child} children 
 * @returns {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLElement}
 */
export function createElementPrimitive(tagName, optionsOrChild, ...children) {
  if (typeof optionsOrChild === 'object' && optionsOrChild !== null && !(optionsOrChild instanceof Node) && (Object.getPrototypeOf(optionsOrChild) == null || optionsOrChild instanceof Object)) {
    return createElement(tagName, optionsOrChild, ...children)
  }

  return createElement(tagName, null, ...[optionsOrChild, ...children])
}


export const DOMPrimitives = {

  /**
   * 
   * @param  {...Child} children 
   */
  Fragment(...children) {
    const fragment = new DocumentFragment()

    //@ts-ignore
    fragment.append(...children)

    return fragment
  },

  /**
   * 
   * @param {XOR<CreateElementOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  div(optionsOrChild, ...children) {
    return createElementPrimitive('div', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  span(optionsOrChild, ...children) {
    return createElementPrimitive('span', optionsOrChild, ...children)
  },

}


const { div } = DOMPrimitives

div({prop: {innerHTML: '', sos: 2}, attr: {class: 'card'}, on: {click: event => {}}},
  // shadowRoot({},
  //   span(),
  // ),
  div('Hello'),
  div(),
)
