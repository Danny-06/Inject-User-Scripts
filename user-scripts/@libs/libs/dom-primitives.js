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

  if (DOMPrimitives.entities.isShadowRoot(children[0])) {
   /**
    * @type {ShadowRootOptions}
    */
   //@ts-ignore
    const options = children[0][DOMPrimitives.entities.SHADOW_ROOT]

    const shadowRoot = element.attachShadow({mode: options.mode ?? 'open'})

    if (options.adoptedStyleSheets) {
      if (Array.isArray(options.adoptedStyleSheets)) {
        shadowRoot.adoptedStyleSheets = [...options.adoptedStyleSheets]
      }
      else {
        shadowRoot.adoptedStyleSheets = [options.adoptedStyleSheets]
      }
    }
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
 * @typedef ShadowRootOptions
 * @property {'open' | 'closed' | null} [mode="open"]
 * @property {ArrayOrSingle<CSSStyleSheet>?} [adoptedStyleSheets]
 */


/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element}
 */
export const DOMPrimitives = Object.freeze({

  namespaceURI: HTMLNamespaceURI,

  entities: {

    SHADOW_ROOT: Symbol('shadow-root'),

    /**
     * 
     * @param {Child} shadowRoot 
     * @returns {ShadowRoot is DocumentFragment & {[key: (typeof DOMPrimitives)['entities']['SHADOW_ROOT']]: ShadowRootOptions}}
     */
    isShadowRoot(shadowRoot) {
      return shadowRoot != null && shadowRoot instanceof DocumentFragment && Object.hasOwn(shadowRoot, DOMPrimitives.entities.SHADOW_ROOT)
    },

  },

  /**
   * 
   * @param  {...Child} children 
   */
  Fragment(...children) {
    const fragment = new DocumentFragment()

    for (const child of children) {
      if (child == null) {
        continue
      }

      //@ts-ignore
      fragment.append(child)
    }

    return fragment
  },

  /**
   * 
   * @param {XOR<ShadowRootOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   * @returns {DocumentFragment & {[(typeof DOMPrimitives)['entitites'][SHADOW_ROOT]]: ShadowRootOptions}}
   */
  ShadowRoot(optionsOrChild, ...children) {
    const fragment = this.Fragment(...children)

    fragment[this.entities.SHADOW_ROOT] = {mode: 'open'}

    if (isOptions(optionsOrChild)) {
      fragment[this.entities.SHADOW_ROOT] = {...fragment[this.entities.SHADOW_ROOT], optionsOrChild}
    }

    return fragment
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

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  svg(optionsOrChild, ...children) {
    return this.createSVGElement('svg', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  a(optionsOrChild, ...children) {
    return this.createSVGElement('a', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  animate(optionsOrChild, ...children) {
    return this.createSVGElement('animate', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  animateMotion(optionsOrChild, ...children) {
    return this.createSVGElement('animateMotion', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  animateTransform(optionsOrChild, ...children) {
    return this.createSVGElement('animateTransform', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  circle(optionsOrChild, ...children) {
    return this.createSVGElement('circle', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  clipPath(optionsOrChild, ...children) {
    return this.createSVGElement('clipPath', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  defs(optionsOrChild, ...children) {
    return this.createSVGElement('defs', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  desc(optionsOrChild, ...children) {
    return this.createSVGElement('desc', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  ellipse(optionsOrChild, ...children) {
    return this.createSVGElement('ellipse', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feBlend(optionsOrChild, ...children) {
    return this.createSVGElement('feBlend', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feColorMatrix(optionsOrChild, ...children) {
    return this.createSVGElement('feColorMatrix', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feComposite(optionsOrChild, ...children) {
    return this.createSVGElement('feComposite', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feConvolveMatrix(optionsOrChild, ...children) {
    return this.createSVGElement('feConvolveMatrix', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feDiffuseLighting(optionsOrChild, ...children) {
    return this.createSVGElement('feDiffuseLighting', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feDisplacementMap(optionsOrChild, ...children) {
    return this.createSVGElement('feDisplacementMap', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feDistantLight(optionsOrChild, ...children) {
    return this.createSVGElement('feDistantLight', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feDropShadow(optionsOrChild, ...children) {
    return this.createSVGElement('feDropShadow', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feFlood(optionsOrChild, ...children) {
    return this.createSVGElement('feFlood', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feFuncR(optionsOrChild, ...children) {
    return this.createSVGElement('feFuncR', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feFuncG(optionsOrChild, ...children) {
    return this.createSVGElement('feFuncG', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feFuncB(optionsOrChild, ...children) {
    return this.createSVGElement('feFuncB', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feFuncA(optionsOrChild, ...children) {
    return this.createSVGElement('feFuncA', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feGaussianBlur(optionsOrChild, ...children) {
    return this.createSVGElement('feGaussianBlur', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feImage(optionsOrChild, ...children) {
    return this.createSVGElement('feImage', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feMerge(optionsOrChild, ...children) {
    return this.createSVGElement('feMerge', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feMergeNode(optionsOrChild, ...children) {
    return this.createSVGElement('feMergeNode', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feMorphology(optionsOrChild, ...children) {
    return this.createSVGElement('feMorphology', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feOffset(optionsOrChild, ...children) {
    return this.createSVGElement('feOffset', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  fePointLight(optionsOrChild, ...children) {
    return this.createSVGElement('fePointLight', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feSpecularLighting(optionsOrChild, ...children) {
    return this.createSVGElement('feSpecularLighting', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feSpotLight(optionsOrChild, ...children) {
    return this.createSVGElement('feSpotLight', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feTitle(optionsOrChild, ...children) {
    return this.createSVGElement('feTitle', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feTurbulence(optionsOrChild, ...children) {
    return this.createSVGElement('feTurbulence', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  filter(optionsOrChild, ...children) {
    return this.createSVGElement('filter', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  foreignObject(optionsOrChild, ...children) {
    return this.createSVGElement('foreignObject', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  g(optionsOrChild, ...children) {
    return this.createSVGElement('g', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  image(optionsOrChild, ...children) {
    return this.createSVGElement('image', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  line(optionsOrChild, ...children) {
    return this.createSVGElement('line', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  linearGradient(optionsOrChild, ...children) {
    return this.createSVGElement('linearGradient', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  marker(optionsOrChild, ...children) {
    return this.createSVGElement('marker', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mask(optionsOrChild, ...children) {
    return this.createSVGElement('mask', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  metadata(optionsOrChild, ...children) {
    return this.createSVGElement('metadata', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mpath(optionsOrChild, ...children) {
    return this.createSVGElement('mpath', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  path(optionsOrChild, ...children) {
    return this.createSVGElement('path', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  pattern(optionsOrChild, ...children) {
    return this.createSVGElement('pattern', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  polygon(optionsOrChild, ...children) {
    return this.createSVGElement('polygon', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  polyline(optionsOrChild, ...children) {
    return this.createSVGElement('polyline', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  radialGradient(optionsOrChild, ...children) {
    return this.createSVGElement('radialGradient', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  rect(optionsOrChild, ...children) {
    return this.createSVGElement('rect', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  script(optionsOrChild, ...children) {
    return this.createSVGElement('script', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  set(optionsOrChild, ...children) {
    return this.createSVGElement('set', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  stop(optionsOrChild, ...children) {
    return this.createSVGElement('stop', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  style(optionsOrChild, ...children) {
    return this.createSVGElement('style', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  switch(optionsOrChild, ...children) {
    return this.createSVGElement('switch', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  symbol(optionsOrChild, ...children) {
    return this.createSVGElement('symbol', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  text(optionsOrChild, ...children) {
    return this.createSVGElement('text', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  textPath(optionsOrChild, ...children) {
    return this.createSVGElement('textPath', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  title(optionsOrChild, ...children) {
    return this.createSVGElement('title', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  tspan(optionsOrChild, ...children) {
    return this.createSVGElement('tspan', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  use(optionsOrChild, ...children) {
    return this.createSVGElement('use', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  view(optionsOrChild, ...children) {
    return this.createSVGElement('view', optionsOrChild, ...children)
  },

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

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mi(optionsOrChild, ...children) {
    return this.createMathMLElement('mi', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mn(optionsOrChild, ...children) {
    return this.createMathMLElement('mn', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mo(optionsOrChild, ...children) {
    return this.createMathMLElement('mo', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  ms(optionsOrChild, ...children) {
    return this.createMathMLElement('ms', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mspace(optionsOrChild, ...children) {
    return this.createMathMLElement('mspace', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mtext(optionsOrChild, ...children) {
    return this.createMathMLElement('mtext', optionsOrChild, ...children)
  },

  // GENERAL LAYOUT

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  merror(optionsOrChild, ...children) {
    return this.createMathMLElement('merror', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mfrac(optionsOrChild, ...children) {
    return this.createMathMLElement('mfrac', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mpadded(optionsOrChild, ...children) {
    return this.createMathMLElement('mpadded', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mphantom(optionsOrChild, ...children) {
    return this.createMathMLElement('mphantom', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mroot(optionsOrChild, ...children) {
    return this.createMathMLElement('mroot', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mrow(optionsOrChild, ...children) {
    return this.createMathMLElement('mrow', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  msqrt(optionsOrChild, ...children) {
    return this.createMathMLElement('msqrt', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mstyle(optionsOrChild, ...children) {
    return this.createMathMLElement('mstyle', optionsOrChild, ...children)
  },

  // SCRIPT AND LIMIT ELEMENTS

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mmultiscripts(optionsOrChild, ...children) {
    return this.createMathMLElement('mmultiscripts', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mover(optionsOrChild, ...children) {
    return this.createMathMLElement('mover', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mprescripts(optionsOrChild, ...children) {
    return this.createMathMLElement('mprescripts', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  msub(optionsOrChild, ...children) {
    return this.createMathMLElement('msub', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  msubsup(optionsOrChild, ...children) {
    return this.createMathMLElement('msubsup', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  msup(optionsOrChild, ...children) {
    return this.createMathMLElement('msup', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  munder(optionsOrChild, ...children) {
    return this.createMathMLElement('munder', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  munderover(optionsOrChild, ...children) {
    return this.createMathMLElement('munderover', optionsOrChild, ...children)
  },

  // TABULAR MATH

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mtable(optionsOrChild, ...children) {
    return this.createMathMLElement('mtable', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mtr(optionsOrChild, ...children) {
    return this.createMathMLElement('mtr', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mtd(optionsOrChild, ...children) {
    return this.createMathMLElement('mtd', optionsOrChild, ...children)
  },

  // UNCATEGORIZED ELEMENTS

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  maction(optionsOrChild, ...children) {
    return this.createMathMLElement('maction', optionsOrChild, ...children)
  },

  // SEMANTIC ANNOTATIONS

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  annotation(optionsOrChild, ...children) {
    return this.createMathMLElement('annotation', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  annotation_xml(optionsOrChild, ...children) {
    return this.createMathMLElement('annotation_xml', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  semantics(optionsOrChild, ...children) {
    return this.createMathMLElement('semantics', optionsOrChild, ...children)
  },

})

const { div } = DOMPrimitives

div({prop: {innerHTML: '', sos: 2}, attr: {class: 'card'}, on: {click: event => {}}},
  // shadowRoot({},
  //   span(),
  // ),
  div('Hello'),
  div(),
)
