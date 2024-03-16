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
 * @typedef {CreateElementOptions<T> & {data?: ComponentData<T>?}} CreateElementComponentOptions
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
 * @template T
 * @typedef CreateElementOptions
 * @property {NamespaceURI} [namespaceURI]
 * @property {RunCallback<T>?} [run]
 * @property {ElementAttributes?} [attr]
 * @property {ElementProperties?} [prop]
 * @property {ElementListeners?} [on]
 */

/**
 * @typedef {{[key: string]: XOR<unknown, Signal<unknown>>}} ElementProperties
 */

/**
 * @typedef {{[key: string]: null | Primitive | Signal<Primitive>}} ElementAttributes
 */

/**
 * @typedef {(event: Event) => void} GenericEventListener
 */

/**
 * @typedef {{[key: string]: GenericEventListener | [GenericEventListener, AddEventListenerOptions | null | undefined]}} ElementListeners
 */

/**
 * @template T
 * @typedef {(element: T) => void} RunCallback
 */


/**
 * @typedef {null | Primitive | CharacterData | HTMLElement | DocumentFragment} ChildValues
 */


/**
 * @typedef {ChildValues | Signal<ChildValues>} Child
 */


/**
 * Create element.
 * @template {TagName} T
 * @template {O['namespaceURI'] extends typeof HTMLNamespaceURI ? (T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLUnknownElement) : O['namespaceURI'] extends typeof SVGNamespaceURI ? (T extends keyof SVGElementTagNameMap ? SVGElementTagNameMap[T] : SVGElement) : O['namespaceURI'] extends typeof MathMLNamespaceURI ? (T extends keyof MathMLElementTagNameMap ? MathMLElementTagNameMap[T] : MathMLElement) :  O['namespaceURI'] extends string ? Element : (T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLUnknownElement)} Return
 * @template {CreateElementOptions<Return>} O
 * @param {T} tagName 
 * @param {O?} [options] 
 * @param {...Child} children 
 * @returns {Return}
 */
export function createElement(tagName, options, ...children) {
  const { run, attr, prop, on } = options ?? {}

  const namespaceURI = options?.namespaceURI ?? 'http://www.w3.org/1999/xhtml'

  /**
   * @type {Element}
   */
  //@ts-ignore
  const element = document.createElementNS(namespaceURI, tagName)

  for (const [name, value] of Object.entries(attr ?? {})) {
    if (typeof value !== 'function') {
      element.setAttribute(name, String(value))
    }
    else {
      value.addListener(() => element.setAttribute(name, String(value())))
    }
  }

  for (const [property, value] of Object.entries(prop ?? {})) {
    if (typeof value !== 'function') {
      element[property] = value
    }
    else {
      value.addListener(() => element[property] = value())
    }
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

    //@ts-ignore
    shadowRoot.append(children[0])

    children.shift()

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

    if (typeof child !== 'function') {
      //@ts-ignore
      element.append(child)
    }
    else {
      let slot = DOMPrimitives.valueToNode(child() ?? document.createComment(''))
      //@ts-ignore
      element.append(slot)

      child.addListener(() => {
        const newChild = DOMPrimitives.valueToNode(child() ?? document.createComment(''))
        // @ts-ignore
        slot.replaceWith(newChild)
        slot = newChild
      })
    }
  }

  //@ts-ignore
  run?.(element)

  //@ts-ignore
  return element
}


/**
 * @template {TagName} T
 * @template {O['namespaceURI'] extends typeof HTMLNamespaceURI ? (T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLUnknownElement) : O['namespaceURI'] extends typeof SVGNamespaceURI ? (T extends keyof SVGElementTagNameMap ? SVGElementTagNameMap[T] : SVGElement) : O['namespaceURI'] extends typeof MathMLNamespaceURI ? (T extends keyof MathMLElementTagNameMap ? MathMLElementTagNameMap[T] : MathMLElement) :  O['namespaceURI'] extends string ? Element : (T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLUnknownElement)} Return
 * @template {CreateElementOptions<Return>} O
 * @param  {T} tagName 
 * @param {XOR<O, Child>?} [optionsOrChild] 
 * @param  {...Child} children 
 * @returns {Return}
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
 * @param {XOR<CreateElementOptions<Node>, unknown> | null | undefined} options 
 */
function isOptions(options) {
  if (options == null) {
    return false
  }

  if (typeof options !== 'object') {
    return false
  }

  return Object.getPrototypeOf(options) === null || Object.getPrototypeOf(options) === Object.prototype
}

/**
 * @typedef {Omit<CreateElementOptions<Node>, 'namespaceURI'>} CreateElementPrimitiveOptions
 */

/**
 * @typedef ShadowRootOptions
 * @property {'open' | 'closed' | null} [mode="open"]
 * @property {ArrayOrSingle<CSSStyleSheet>?} [adoptedStyleSheets]
 */


/**
 * @template T
 * @typedef {((value?: T) => T) & SignalConstructor} Signal
 */


/**
 * 
 * @param {Signal<unknown>} signal 
 * @returns 
 */
// @ts-ignore
function SignalConstructor(signal) {
  Object.setPrototypeOf(signal, SignalConstructor.prototype)

  signal[SignalConstructor.symbols.LISTENERS] = new Set()

  return signal
}

SignalConstructor.symbols = {
  LISTENERS: Symbol('listeners-slot')
}

SignalConstructor.prototype = {

  constructor: SignalConstructor,

  /**
   * 
   * @param {() => void} listener 
   */
  addListener(listener) {
    const listeners = this[SignalConstructor.symbols.LISTENERS]
    listeners.add(listener)
  },

  emit() {
    const listeners = this[SignalConstructor.symbols.LISTENERS]

    try {
      for (const listener of listeners) {
        listener()
      }
    } catch (reason) {
      console.error(reason)
    }
  },

  /**
   * @template T
   * @param {() => T} derivedCallback 
   * @returns {Signal<T>}
   */
  createDerivedSignal(derivedCallback) {
    //@ts-ignore
    return createDerivedSignal(this, derivedCallback)
  }

}

/**
 * 
 * @template T
 * @param {T} initialValue 
 * @returns {Signal<T>}
 */
export function createSignal(initialValue) {
  let value = initialValue
 
  /**
   * @type {Signal<T>}
   */
  //@ts-ignore
  const signal = SignalConstructor((...args) => {
    if (args.length === 0) {
      return value
    }

    //@ts-ignore
    value = args[0]

    signal.emit()

    return value
  })

  return signal
}

/**
   * @template T
   * @param {ArrayOrSingle<Signal<T>>} singalOrSignals 
   * @param {() => T} derivedCallback 
   * @returns {Signal<T>}
   */
export function createDerivedSignal(singalOrSignals, derivedCallback) {
  const signals = Array.isArray(singalOrSignals) ? singalOrSignals : [singalOrSignals]
  
  //@ts-ignore
  const derivedSignal = SignalConstructor(derivedCallback)

  for (const signal of signals) {
    signal.addListener(() => derivedSignal.emit())
  }

  //@ts-ignore
  return derivedSignal
}


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
   * @param {unknown} value 
   */
  valueToNode(value) {
    //@ts-ignore
    const fragment = DOMPrimitives.Fragment(value)

    return fragment.firstChild
  },

  /**
   * It must be the 1st child of an element,  
   * otherwise it is treated as a normal {@link DocumentFragment}.
   * @param {XOR<ShadowRootOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   * @returns {DocumentFragment & {[(typeof DOMPrimitives)['entitites'][SHADOW_ROOT]]: ShadowRootOptions}}
   */
  ShadowRoot(optionsOrChild, ...children) {
    const fragment = isOptions(optionsOrChild)
    ? DOMPrimitives.Fragment(...children)
    //@ts-ignore
    : DOMPrimitives.Fragment(...[optionsOrChild, ...children])

    fragment[DOMPrimitives.entities.SHADOW_ROOT] = {mode: 'open'}

    if (isOptions(optionsOrChild)) {
      //@ts-ignore
      fragment[DOMPrimitives.entities.SHADOW_ROOT] = {...fragment[DOMPrimitives.entities.SHADOW_ROOT], ...optionsOrChild}
    }

    return fragment
  },

  /**
   * 
   * @param {boolean | Signal<boolean>} condition 
   * @param {() => Omit<Child, null | undefined>} ifCallback 
   * @param {(() => Omit<Child, null | undefined>)?} [elseCallback] 
   */
  If(condition, ifCallback, elseCallback) {
    if (typeof condition === 'function') {
      let currentConditionValue = condition()
      let slot = currentConditionValue ? ifCallback() : (elseCallback?.() ?? document.createComment('placeholder'))
      if (!(slot instanceof Node)) {
        //@ts-ignore
        slot = DOMPrimitives.valueToNode(slot)
      }

      condition.addListener(() => {
        if (currentConditionValue === condition()) {
          return
        }

        currentConditionValue = condition()

        let newChild = currentConditionValue ? ifCallback() : (elseCallback?.() ?? document.createComment('placeholder'))
        if (!(newChild instanceof Node)) {
          //@ts-ignore
          newChild = DOMPrimitives.valueToNode(newChild)
        }

        //@ts-ignore
        slot.replaceWith(newChild)

        slot = newChild
      })

      return slot
    }

    return condition ? ifCallback() : elseCallback?.()
  },

  /**
   * 
   * @param {Primitive | null} value 
   * @returns {Comment}
   */
  Comment(value) {
    //@ts-ignore
    return document.createComment(value ?? '')
  },

  /**
   * @param {string | Element | null} [titleOrRootElement] 
   * @param {Element?} [rootElement] 
   */
  HTMLDocument(titleOrRootElement, rootElement) {
    let doc
    let root

    if (titleOrRootElement instanceof Element) {
      doc = document.implementation.createHTMLDocument()
      root = titleOrRootElement
    }
    else {
      doc = document.implementation.createHTMLDocument(titleOrRootElement ?? undefined)
      root = rootElement
    }


    doc.firstElementChild?.remove()

    if (root) {
      doc.append(root)
    }

    return doc
  },

  /**
   * @param {{namespace?: string?, qualifiedName?: string?, doctype?: DocumentType?} | Element | null} optionsOrRootElement
   * @param {Element?} [rootElement] 
   */
  Document(optionsOrRootElement, rootElement) {
    let doc
    let root

    if (optionsOrRootElement instanceof Element) {
      doc = document.implementation.createDocument('', '', null)
      root = optionsOrRootElement
    }
    else {
      const { namespace, qualifiedName, doctype } = optionsOrRootElement ?? {}
      doc = document.implementation.createDocument(namespace ?? '', qualifiedName ?? '', doctype)
      root = rootElement
    }

    if (root) {
      doc.append(root)
    }

    return doc
  },

  /**
   * 
   * @param {string} qualifiedName 
   * @param {string?} [publicId] 
   * @param {string?} [systemId] 
   */
  Doctype(qualifiedName, publicId, systemId) {
    return document.implementation.createDocumentType(qualifiedName, publicId ?? '', systemId ?? '')
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
   * @template {T extends keyof SVGElementTagNameMap ? SVGElementTagNameMap[T] : SVGElement} Return
   * @param {T} tagName
   * @param {XOR<CreateElementOptions<Return>, Child>?} [optionsOrChild] 
   * @param  {...Child} children 
   * @returns {Return}
   */
  createSVGElement(tagName, optionsOrChild, ...children) {
    if (isOptions(optionsOrChild)) {
      //@ts-ignore
      optionsOrChild.namespaceURI = SVGPrimitives.namespaceURI
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
    return SVGPrimitives.createSVGElement('svg', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  a(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('a', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  animate(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('animate', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  animateMotion(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('animateMotion', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  animateTransform(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('animateTransform', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  circle(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('circle', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  clipPath(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('clipPath', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  defs(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('defs', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  desc(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('desc', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  ellipse(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('ellipse', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feBlend(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feBlend', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feColorMatrix(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feColorMatrix', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feComposite(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feComposite', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feConvolveMatrix(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feConvolveMatrix', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feDiffuseLighting(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feDiffuseLighting', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feDisplacementMap(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feDisplacementMap', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feDistantLight(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feDistantLight', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feDropShadow(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feDropShadow', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feFlood(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feFlood', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feFuncR(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feFuncR', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feFuncG(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feFuncG', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feFuncB(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feFuncB', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feFuncA(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feFuncA', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feGaussianBlur(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feGaussianBlur', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feImage(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feImage', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feMerge(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feMerge', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feMergeNode(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feMergeNode', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feMorphology(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feMorphology', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feOffset(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feOffset', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  fePointLight(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('fePointLight', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feSpecularLighting(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feSpecularLighting', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feSpotLight(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feSpotLight', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feTitle(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feTitle', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  feTurbulence(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('feTurbulence', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  filter(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('filter', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  foreignObject(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('foreignObject', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  g(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('g', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  image(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('image', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  line(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('line', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  linearGradient(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('linearGradient', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  marker(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('marker', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mask(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('mask', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  metadata(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('metadata', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mpath(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('mpath', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  path(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('path', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  pattern(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('pattern', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  polygon(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('polygon', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  polyline(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('polyline', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  radialGradient(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('radialGradient', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  rect(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('rect', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  script(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('script', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  set(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('set', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  stop(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('stop', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  style(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('style', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  switch(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('switch', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  symbol(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('symbol', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  text(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('text', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  textPath(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('textPath', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  title(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('title', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  tspan(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('tspan', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  use(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('use', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  view(optionsOrChild, ...children) {
    return SVGPrimitives.createSVGElement('view', optionsOrChild, ...children)
  },

})


/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/MathML/Element}
 */
export const MathMLPrimitives = Object.freeze({

  namespaceURI: MathMLNamespaceURI,

  /**
   * @template {UnionOrType<keyof MathMLElementTagNameMap, string>} T
   * @template {T extends keyof MathMLElementTagNameMap ? MathMLElementTagNameMap[T] : MathMLElement} Return
   * @param {T} tagName
   * @param {XOR<CreateElementOptions<Return>, Child>?} [optionsOrChild] 
   * @param  {...Child} children 
   * @returns {Return}
   */
  createMathMLElement(tagName, optionsOrChild, ...children) {
    if (isOptions(optionsOrChild)) {
      //@ts-ignore
      optionsOrChild.namespaceURI = MathMLPrimitives.namespaceURI
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
    return MathMLPrimitives.createMathMLElement('math', optionsOrChild, ...children)
  },

  // TOKEN ELEMENTS

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mi(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('mi', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mn(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('mn', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mo(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('mo', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  ms(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('ms', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mspace(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('mspace', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mtext(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('mtext', optionsOrChild, ...children)
  },

  // GENERAL LAYOUT

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  merror(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('merror', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mfrac(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('mfrac', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mpadded(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('mpadded', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mphantom(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('mphantom', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mroot(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('mroot', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mrow(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('mrow', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  msqrt(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('msqrt', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mstyle(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('mstyle', optionsOrChild, ...children)
  },

  // SCRIPT AND LIMIT ELEMENTS

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mmultiscripts(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('mmultiscripts', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mover(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('mover', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mprescripts(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('mprescripts', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  msub(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('msub', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  msubsup(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('msubsup', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  msup(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('msup', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  munder(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('munder', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  munderover(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('munderover', optionsOrChild, ...children)
  },

  // TABULAR MATH

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mtable(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('mtable', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mtr(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('mtr', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  mtd(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('mtd', optionsOrChild, ...children)
  },

  // UNCATEGORIZED ELEMENTS

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  maction(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('maction', optionsOrChild, ...children)
  },

  // SEMANTIC ANNOTATIONS

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  annotation(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('annotation', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  annotation_xml(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('annotation_xml', optionsOrChild, ...children)
  },

  /**
   * 
   * @param {XOR<CreateElementPrimitiveOptions, Child>} [optionsOrChild] 
   * @param  {...Child} children 
   */
  semantics(optionsOrChild, ...children) {
    return MathMLPrimitives.createMathMLElement('semantics', optionsOrChild, ...children)
  },

})
