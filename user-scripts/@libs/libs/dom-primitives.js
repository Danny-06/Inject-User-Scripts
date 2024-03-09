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

  html() {

  },

  head() {

  },

  body() {

  },

  meta() {

  },

  title() {

  },

  style() {

  },

  link() {

  },

  script() {

  },

  noscript() {},

  base() {

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

  p() {},

  h1() {},

  h2() {},

  h3() {},

  h4() {},

  h5() {},

  h6() {},

  a() {},

  pre() {},

  code() {},

  var() {},

  hr() {},

  br() {},

  wbr() {},

  strong() {},

  em() {},

  b() {},

  i() {},

  del() {},

  ins() {},

  s() {},

  u() {},

  q() {},

  blockquote() {},

  cite() {},

  abbr() {},

  time() {},

  data() {},

  kbd() {},

  mark() {},

  dfn() {},

  dl() {},

  dt() {},

  dd() {},

  samp() {},

  small() {},

  sub() {},

  sup() {},

  bdi() {},

  bdo() {},

  address() {},

  article() {},

  header() {},

  nav() {},

  main() {},

  section() {},

  aside() {},

  footer() {},

  hgroup() {},

  search() {},

  img() {},

  picture() {},

  map() {},

  area() {},

  video() {},

  audio() {},

  track() {},

  source() {},

  canvas() {},

  iframe() {},

  embed() {},

  object() {},

  portal() {},

  figure() {},

  figcaption() {},

  // LIST

  ul() {},

  ol() {},

  menu() {},

  li() {},

  // TABLE

  table() {},

  caption() {},

  col() {},

  colgroupd() {},

  thead() {},

  tbody() {},

  tfoot() {},

  tr() {},

  th() {},

  td() {},

  // FORM

  form() {},

  button() {},

  input() {},

  textarea() {},

  label() {},

  select() {},

  option() {},

  optgroup() {},

  output() {},

  fieldset() {},

  legend() {},

  progress() {},

  meter() {},

  // WEB COMPONENTS

  slot() {},

  template() {},

  // INTERACTIVE ELEMENTS

  details() {},

  summary() {},

  dialog() {},

  // RUBY

  ruby() {},

  rp() {},

  rt() {},

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
