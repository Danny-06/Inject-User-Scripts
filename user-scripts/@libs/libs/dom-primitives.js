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
 * @typedef {UnionOrType<keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap | keyof MathMLElementTagNameMap, string>} TagName
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

const HTMLNamespaceURI = 'http://www.w3.org/1999/xhtml'
const SVGNamespaceURI = 'http://www.w3.org/2000/svg'
const MathMLNamespaceURI = 'http://www.w3.org/1998/Math/MathML'


/**
 * @typedef {UnionOrType<typeof HTMLNamespaceURI | typeof SVGNamespaceURI | typeof MathMLNamespaceURI, string>?} NamespaceURI
 */

/**
 * @typedef CreateElementOptions
 * @property {NamespaceURI} [namespaceURI]
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
 * @template {CreateElementOptions} O
 * @param {T} tagName 
 * @param {O?} [options] 
 * @param {...Child} children 
 * @returns {O['namespaceURI'] extends typeof HTMLNamespaceURI ? (T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLUnknownElement) : O['namespaceURI'] extends typeof SVGNamespaceURI ? (T extends keyof SVGElementTagNameMap ? SVGElementTagNameMap[T] : SVGElement) : O['namespaceURI'] extends typeof MathMLNamespaceURI ? (T extends keyof MathMLElementTagNameMap ? MathMLElementTagNameMap[T] : MathMLElement) :  O['namespaceURI'] extends string ? Element : (T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLUnknownElement)}
 */
export function createElement(tagName, options, ...children) {
  const { attr, prop, on } = options ?? {}

  const namespaceURI = options?.namespaceURI ?? 'http://www.w3.org/1999/xhtml'

  //@ts-ignore
  const element = document.createElementNS(namespaceURI, tagName)

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

  for (const child of children) {
    if (child == null) {
      continue
    }

    //@ts-ignore
    element.append(child)
  }

  //@ts-ignore
  return element
}


/**
 * @template {TagName} T
 * @template {CreateElementOptions} O
 * @param  {T} tagName 
 * @param {XOR<O, Child>?} [optionsOrChild] 
 * @param  {...Child} children 
 * @returns {O['namespaceURI'] extends typeof HTMLNamespaceURI ? (T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLUnknownElement) : O['namespaceURI'] extends typeof SVGNamespaceURI ? (T extends keyof SVGElementTagNameMap ? SVGElementTagNameMap[T] : SVGElement) : O['namespaceURI'] extends typeof MathMLNamespaceURI ? (T extends keyof MathMLElementTagNameMap ? MathMLElementTagNameMap[T] : MathMLElement) :  O['namespaceURI'] extends string ? Element : (T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLUnknownElement)}
 */
export function createElementPrimitive(tagName, optionsOrChild, ...children) {
  if (isOptions(optionsOrChild)) {
    //@ts-ignore
    return createElement(tagName, optionsOrChild, ...children)
  }

  //@ts-ignore
  return createElement(tagName, null, ...[optionsOrChild, ...children])
}

/**
 * @param {XOR<CreateElementOptions, unknown> | null | undefined} options 
 */
function isOptions(options) {
  if (options == null) {
    return false
  }

  if (typeof options !== 'object') {
    return false
  }

  return Object.getPrototypeOf(options) === null || Object.getPrototypeOf(options) === Object
}

/**
 * @typedef {Omit<CreateElementOptions, 'namespaceURI'>} CreateElementPrimitiveOptions
 */


/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element}
 */
export const DOMPrimitives = Object.freeze({

  namespaceURI: HTMLNamespaceURI,

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

  ShadowRoot() {

  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  html(optionsOrChild, ...children) {
    return createElementPrimitive('html', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  head(optionsOrChild, ...children) {
    return createElementPrimitive('head', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  body(optionsOrChild, ...children) {
    return createElementPrimitive('body', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  meta(optionsOrChild, ...children) {
    return createElementPrimitive('meta', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  title(optionsOrChild, ...children) {
    return createElementPrimitive('title', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  style(optionsOrChild, ...children) {
    return createElementPrimitive('style', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  link(optionsOrChild, ...children) {
    return createElementPrimitive('link', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  script(optionsOrChild, ...children) {
    return createElementPrimitive('script', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  noscript(optionsOrChild, ...children) {
    return createElementPrimitive('noscript', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  base(optionsOrChild, ...children) {
    return createElementPrimitive('base', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  div(optionsOrChild, ...children) {
    return createElementPrimitive('div', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  span(optionsOrChild, ...children) {
    return createElementPrimitive('span', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  p(optionsOrChild, ...children) {
    return createElementPrimitive('p', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  h1(optionsOrChild, ...children) {
    return createElementPrimitive('h1', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  h2(optionsOrChild, ...children) {
    return createElementPrimitive('h2', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  h3(optionsOrChild, ...children) {
    return createElementPrimitive('h3', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  h4(optionsOrChild, ...children) {
    return createElementPrimitive('h4', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  h5(optionsOrChild, ...children) {
    return createElementPrimitive('h5', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  h6(optionsOrChild, ...children) {
    return createElementPrimitive('h6', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  a(optionsOrChild, ...children) {
    return createElementPrimitive('a', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  pre(optionsOrChild, ...children) {
    return createElementPrimitive('pre', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  code(optionsOrChild, ...children) {
    return createElementPrimitive('code', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  var(optionsOrChild, ...children) {
    return createElementPrimitive('var', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  hr(optionsOrChild, ...children) {
    return createElementPrimitive('hr', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  br(optionsOrChild, ...children) {
    return createElementPrimitive('br', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  wbr(optionsOrChild, ...children) {
    return createElementPrimitive('wbr', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  strong(optionsOrChild, ...children) {
    return createElementPrimitive('strong', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  em(optionsOrChild, ...children) {
    return createElementPrimitive('em', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  b(optionsOrChild, ...children) {
    return createElementPrimitive('b', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  i(optionsOrChild, ...children) {
    return createElementPrimitive('i', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  del(optionsOrChild, ...children) {
    return createElementPrimitive('del', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  ins(optionsOrChild, ...children) {
    return createElementPrimitive('ins', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  s(optionsOrChild, ...children) {
    return createElementPrimitive('s', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  u(optionsOrChild, ...children) {
    return createElementPrimitive('u', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  q(optionsOrChild, ...children) {
    return createElementPrimitive('q', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  blockquote(optionsOrChild, ...children) {
    return createElementPrimitive('blockquote', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  cite(optionsOrChild, ...children) {
    return createElementPrimitive('cite', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  abbr(optionsOrChild, ...children) {
    return createElementPrimitive('abbr', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  time(optionsOrChild, ...children) {
    return createElementPrimitive('time', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  data(optionsOrChild, ...children) {
    return createElementPrimitive('data', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  kbd(optionsOrChild, ...children) {
    return createElementPrimitive('kbd', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mark(optionsOrChild, ...children) {
    return createElementPrimitive('mark', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  dfn(optionsOrChild, ...children) {
    return createElementPrimitive('dfn', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  dl(optionsOrChild, ...children) {
    return createElementPrimitive('dl', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  dt(optionsOrChild, ...children) {
    return createElementPrimitive('dt', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  dd(optionsOrChild, ...children) {
    return createElementPrimitive('dd', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  samp(optionsOrChild, ...children) {
    return createElementPrimitive('samp', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  small(optionsOrChild, ...children) {
    return createElementPrimitive('small', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  sub(optionsOrChild, ...children) {
    return createElementPrimitive('sub', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  sup(optionsOrChild, ...children) {
    return createElementPrimitive('sup', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  bdi(optionsOrChild, ...children) {
    return createElementPrimitive('bdi', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  bdo(optionsOrChild, ...children) {
    return createElementPrimitive('bdo', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  address(optionsOrChild, ...children) {
    return createElementPrimitive('address', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  article(optionsOrChild, ...children) {
    return createElementPrimitive('article', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  header(optionsOrChild, ...children) {
    return createElementPrimitive('header', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  nav(optionsOrChild, ...children) {
    return createElementPrimitive('nav', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  main(optionsOrChild, ...children) {
    return createElementPrimitive('main', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  section(optionsOrChild, ...children) {
    return createElementPrimitive('section', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  aside(optionsOrChild, ...children) {
    return createElementPrimitive('aside', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  footer(optionsOrChild, ...children) {
    return createElementPrimitive('footer', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  hgroup(optionsOrChild, ...children) {
    return createElementPrimitive('hgroup', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  search(optionsOrChild, ...children) {
    return createElementPrimitive('search', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  img(optionsOrChild, ...children) {
    return createElementPrimitive('img', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  picture(optionsOrChild, ...children) {
    return createElementPrimitive('picture', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  map(optionsOrChild, ...children) {
    return createElementPrimitive('map', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  area(optionsOrChild, ...children) {
    return createElementPrimitive('area', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  video(optionsOrChild, ...children) {
    return createElementPrimitive('video', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  audio(optionsOrChild, ...children) {
    return createElementPrimitive('audio', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  track(optionsOrChild, ...children) {
    return createElementPrimitive('track', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  source(optionsOrChild, ...children) {
    return createElementPrimitive('source', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  canvas(optionsOrChild, ...children) {
    return createElementPrimitive('canvas', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  iframe(optionsOrChild, ...children) {
    return createElementPrimitive('iframe', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  embed(optionsOrChild, ...children) {
    return createElementPrimitive('embed', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  object(optionsOrChild, ...children) {
    return createElementPrimitive('object', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  portal(optionsOrChild, ...children) {
    return createElementPrimitive('portal', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  figure(optionsOrChild, ...children) {
    return createElementPrimitive('figure', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  figcaption(optionsOrChild, ...children) {
    return createElementPrimitive('figcaption', optionsOrChild, ...children)
  },

  // LIST

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  ul(optionsOrChild, ...children) {
    return createElementPrimitive('ul', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  ol(optionsOrChild, ...children) {
    return createElementPrimitive('ol', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  menu(optionsOrChild, ...children) {
    return createElementPrimitive('menu', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  li(optionsOrChild, ...children) {
    return createElementPrimitive('li', optionsOrChild, ...children)
  },

  // TABLE

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  table(optionsOrChild, ...children) {
    return createElementPrimitive('table', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  caption(optionsOrChild, ...children) {
    return createElementPrimitive('caption', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  col(optionsOrChild, ...children) {
    return createElementPrimitive('col', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  colgroup(optionsOrChild, ...children) {
    return createElementPrimitive('colgroup', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  thead(optionsOrChild, ...children) {
    return createElementPrimitive('thead', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  tbody(optionsOrChild, ...children) {
    return createElementPrimitive('tbody', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  tfoot(optionsOrChild, ...children) {
    return createElementPrimitive('tfoot', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  tr(optionsOrChild, ...children) {
    return createElementPrimitive('tr', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  th(optionsOrChild, ...children) {
    return createElementPrimitive('th', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  td(optionsOrChild, ...children) {
    return createElementPrimitive('td', optionsOrChild, ...children)
  },

  // FORM

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  form(optionsOrChild, ...children) {
    return createElementPrimitive('form', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  button(optionsOrChild, ...children) {
    return createElementPrimitive('button', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  input(optionsOrChild, ...children) {
    return createElementPrimitive('input', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  textarea(optionsOrChild, ...children) {
    return createElementPrimitive('textarea', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  label(optionsOrChild, ...children) {
    return createElementPrimitive('label', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  select(optionsOrChild, ...children) {
    return createElementPrimitive('select', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  option(optionsOrChild, ...children) {
    return createElementPrimitive('option', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  optgroup(optionsOrChild, ...children) {
    return createElementPrimitive('optgroup', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  output(optionsOrChild, ...children) {
    return createElementPrimitive('output', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  fieldset(optionsOrChild, ...children) {
    return createElementPrimitive('fieldset', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  legend(optionsOrChild, ...children) {
    return createElementPrimitive('legend', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  progress(optionsOrChild, ...children) {
    return createElementPrimitive('progress', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  meter(optionsOrChild, ...children) {
    return createElementPrimitive('meter', optionsOrChild, ...children)
  },

  // WEB COMPONENTS

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  slot(optionsOrChild, ...children) {
    return createElementPrimitive('slot', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  template(optionsOrChild, ...children) {
    return createElementPrimitive('template', optionsOrChild, ...children)
  },

  // INTERACTIVE ELEMENTS

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  details(optionsOrChild, ...children) {
    return createElementPrimitive('details', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  summary(optionsOrChild, ...children) {
    return createElementPrimitive('summary', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  dialog(optionsOrChild, ...children) {
    return createElementPrimitive('dialog', optionsOrChild, ...children)
  },

  // RUBY

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  ruby(optionsOrChild, ...children) {
    return createElementPrimitive('ruby', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  rp(optionsOrChild, ...children) {
    return createElementPrimitive('rp', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  rt(optionsOrChild, ...children) {
    return createElementPrimitive('rt', optionsOrChild, ...children)
  },

})



/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Element}
 */
export const SVGPrimitives = Object.freeze({

  namespaceURI: SVGNamespaceURI,

  /**
   * @template {UnionOrType<keyof SVGElementTagNameMap, string>} T
   * @param {T} tagName
   * @param {XOR<CreateElementOptions, Child>?} [optionsOrChild] 
   * @param  {...Child} children 
   * @returns {T extends keyof SVGElementTagNameMap ? SVGElementTagNameMap[T] : SVGElement}
   */
  createSVGElement(tagName, optionsOrChild, ...children) {
    if (isOptions(optionsOrChild)) {
      //@ts-ignore
      optionsOrChild.namespaceURI = this.namespaceURI
    }

    //@ts-ignore
    return createElementPrimitive(tagName, optionsOrChild, ...children)
  },

  // CONTAINER ELEMENTS

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  svg(optionsOrChild, ...children) {
    return this.createSVGElement('svg', optionsOrChild, ...children)
  },

  a() {},

  animate() {},

  animateMotion() {},

  animateTransform() {},

  circle() {},

  clipPath() {},

  defs() {},

  desc() {},

  ellipse() {},

  feBlend() {},

  feColorMatrix() {},

  feComposite() {},

  feConvolveMatrix() {},

  feDiffuseLighting() {},

  feDisplacementMap() {},

  feDistantLight() {},

  feDropShadow() {},

  feFlood() {},

  feFuncR() {},

  feFuncG() {},

  feFuncB() {},

  feFuncA() {},

  feGaussianBlur() {},

  feImage() {},

  feMerge() {},

  feMergeNode() {},

  feMorphology() {},

  feOffset() {},

  fePointLight() {},

  feSpecularLighting() {},

  feSpotLight() {},

  feTitle() {},

  feTurbulence() {},

  filter() {},

  foreignObject() {},

  g() {},

  image() {},

  line() {},

  linearGradient() {},

  marker() {},

  mask() {},

  metadata() {},

  mpath() {},

  path() {},

  pattern() {},

  polygon() {},

  polyline() {},

  radialGradient() {},

  rect() {},

  script() {},

  set() {},

  stop() {},

  style() {},

  switch() {},

  symbol() {},

  text() {},

  textPath() {},

  title() {},

  tspan() {},

  use() {},

  view() {},

})


/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/MathML/Element}
 */
export const MathMLPrimitives = Object.freeze({

  namespaceURI: MathMLNamespaceURI,

  /**
   * @template {UnionOrType<keyof MathMLElementTagNameMap, string>} T
   * @param {T} tagName
   * @param {XOR<CreateElementOptions, Child>?} [optionsOrChild] 
   * @param  {...Child} children 
   * @returns {T extends keyof MathMLElementTagNameMap ? MathMLElementTagNameMap[T] : MathMLElement}
   */
  createMathMLElement(tagName, optionsOrChild, ...children) {
    if (isOptions(optionsOrChild)) {
      //@ts-ignore
      optionsOrChild.namespaceURI = this.namespaceURI
    }

    //@ts-ignore
    return createElementPrimitive(tagName, optionsOrChild, ...children)
  },

  // TOP-LEVEL ELEMENTS

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  math(optionsOrChild, ...children) {
    return this.createMathMLElement('math', optionsOrChild, ...children)
  },

  // TOKEN ELEMENTS

  mi() {},

  mn() {},

  mo() {},

  ms() {},

  mspace() {},

  mtext() {},

  // GENERAL LAYOUT

  merror() {},

  mfrac() {},

  mpadded() {},

  mphantom() {},

  mroot() {},

  mrow() {},

  msqrt() {},

  mstyle() {},

  // SCRIPT AND LIMIT ELEMENTS

  mmultiscripts() {},

  mover() {},

  mprescripts() {},

  msub() {},

  msubsup() {},

  msup() {},

  munder() {},

  munderover() {},

  // TABULAR MATH

  mtable() {},

  mtd() {},

  mtr() {},

  // UNCATEGORIZED ELEMENTS

  maction() {},

  // SEMANTIC ANNOTATIONS

  annotation() {},

  annotation_xml() {},

  semantics() {},

})

const { div } = DOMPrimitives

div({prop: {innerHTML: '', sos: 2}, attr: {class: 'card'}, on: {click: event => {}}},
  // shadowRoot({},
  //   span(),
  // ),
  div('Hello'),
  div(),
)
