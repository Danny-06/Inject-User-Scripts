import { hyphenToLowerCase, lowerCaseToHyphen } from './string-utils.js'


const mutationObserver = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.type === 'attributes') {
      const target = mutation.target

      const name = mutation.attributeName
      const oldValue = mutation.oldValue
      const newValue = target.getAttribute(name)

      target?.attributeChangedCallback(name, oldValue, newValue)
    }
  })
})

/**
 * Allows the creation of custom elements through any `HTMLElement` like a `<div>`.
 * The class provided is invoked in the `element` and then its `prototype` is changed
 * with the prototype of the `class`.
 *
 * To declare the `constructor` of the class it must be declared as `_constructor_`
 * instead of the normal constructor to allow the function to invoke it in the `element`.
 *
 * Since the `element` is not an instance of the component is not posible to use `private properties`.
 * For that reason, is recommended to replace them with properties that starts with an underscore.
 *
 * @template T
 * @param {new () => T} classComponent
 * @param {HTMLElement} [elementToApply=null]
 * @returns {InstanceType<T>}
 *
 * @example
 * const component = createWebComponent(class MyComponent extends HTMLElement {
 *   _constructor_() {
 *     this.property = 'value'
 *
 *     console.log(this._privateValue)
 *   }
 *
 *   get innerHTML() {
 *     return super.innerHTML
 *   }
 *
 *   set innerHTML(value) {
 *     super.innerHTML = value
 *   }
 *
 *   static get observedAttributes() {
 *     return ['my-attribute']
 *   }
 *
 *   attributeChangedCallback(name, oldValue, newValue) {
 *     console.log(...arguments)
 *   }
 * })
 */
export function createWebComponent(classComponent, elementToApply = null) {
  if (!(classComponent.prototype instanceof HTMLElement)) {
    throw new TypeError(`class component must extends HTMLElement`)
  }

  const component = elementToApply ?? document.createElement('div')

  if (classComponent.observedAttributes) {
    mutationObserver.observe(component, {
      attributes: true,
      attributeFilter: classComponent.observedAttributes,
      attributeOldValue: true
    })
  }


  Object.setPrototypeOf(component, classComponent.prototype)
  classComponent.prototype._constructor_?.call(component)

  return component
}


/**
 * Takes a selector as a parameter and return a Promise that resolves in the element when it exists in the DOM
 * @param {string} selector
 * @param {{node?: Element, checkOpposite?: boolean, useSetTimeout?: boolean, timeout?: number}} options
 * @returns {Promise<Element>}
 */
export function waitForSelector(selector, options = {}) {

  const {node = document, checkOpposite = false, useSetTimeout = false, timeout} = options

  const callAsynchronously = useSetTimeout ?
                             callback => setTimeout(callback, 1000 / 60) :
                             requestAnimationFrame

  const checkElement = checkOpposite ? element => !element : element => element

  return new Promise((resolve, reject) => {

    if (typeof timeout === 'number') {
      setTimeout(reject, timeout, new Error(`Wait for selector operation cancelled. Timeout of ${timeout}ms finished`))
    }

    ;(function queryElement(selector, resolve) {
      const element = node.querySelector(selector)

      if (checkElement(element)) return resolve(element)

      callAsynchronously(() => queryElement(selector, resolve))
    })(selector, resolve)

  })

}

/**
 * 
 * @param {Element} node 
 * @param {string} selector 
 * @param {{timeout: number}} [options]
 * @returns {Promise<void>}
 */
export function waitForSelectorMatch(node, selector, options) {
  const {timeout = null} = options ?? {}

  return new Promise((resolve, reject) => {
    if (timeout != null && typeof timeout !== 'number') {
      reject(new TypeError(`'timeout' must be a number`))

      return
    }

    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout of ${timeout}ms reached.`))
    }, timeout)

    void function checkSelectorMatch() {
      if (node.matches(selector)) {
        clearTimeout(timeoutId)

        resolve()

        return
      }

      requestAnimationFrame(checkSelectorMatch)
    }()
  })
}


export async function importText(url, baseURL = import.meta.url) {
  const response = await fetch(new URL(url, baseURL).href)

  const text = await response.text()

  return text
}

/**
 *
 * @param {string} url
 * @returns {Promise<CSSStyleSheet>}
 */
export async function importCSSModule(url, baseURL = import.meta.url) {
  const text = await importText(url, baseURL)

  const stylesheet = textToCSSModule(text)

  return stylesheet
}

export async function importCSSModules(styleSheetsURL, baseURL = import.meta.url) {
  const promises = styleSheetsURL.map(url => importCSSModule(new URL(url, baseURL).href))

  const cssModules = await Promise.all(promises)

  return cssModules
}

export async function importCSSModulesList(styleSheetsURLList, baseURL) {
  const promises = styleSheetsURLList.map(styleSheetsURL => importCSSModules(styleSheetsURL, baseURL))
  const cssModulesList = await Promise.all(promises)

  return cssModulesList
}

export function getAdoptedStyleSheetsURLFromDeclarativeTemplateShadowDOM(template) {
  const styleSheetsURL = template.dataset.adoptedStylesheets?.split(/\s/) ?? []

  return styleSheetsURL
}

export function getStylesheetsURLListFromTree(documentFragment) {
  const templates = queryDeclarativeTemplatesShadowDOM(documentFragment)

  const styleSheetsURLList = templates.map(t => getAdoptedStyleSheetsURLFromDeclarativeTemplateShadowDOM(t))

  return styleSheetsURLList
}


/**
 *
 * @param {string} text
 * @returns {CSSStyleSheet}
 */
export function textToCSSModule(text) {
  const stylesheet = new CSSStyleSheet()
  stylesheet.replace(text)

  return stylesheet
}


/**
 * @typedef ParseHTMLOptions
 * @property {boolean} [parseDeclarativeShadowDOM=true]
 * @property {boolean} [loadCSSModules=false]
 * @property {string} baseURL
 */


/**
 * @param {string} url
 * @param {ParseHTMLOptions} options
 */
export async function importHTML(url, options = {}) {
  const text = await importText(url, options.baseURL)

  const documentFragment = parseHTML(text, {baseURL: url, ...options})

  return documentFragment
}

/**
 *
 * @param {string} htmlString
 * @param {ParseHTMLOptions} options
 * @returns {DocumentFragment}
 */
export function parseHTML(htmlString, options = {}) {
  const { parseDeclarativeShadowDOM: parseDSDOM = true, loadCSSModules = false, mapId = false, baseURL } = options

  const trustedHTMLPolicy = window.trustedTypes ? trustedTypes.createPolicy('trustedHTML', {createHTML: string => string}) : {createHTML: string => string}

  const trustedHTML = trustedHTMLPolicy.createHTML(htmlString)

  const document = window.document.implementation.createHTMLDocument()

  const documentFragment = document
                          .createRange()
                          .createContextualFragment(trustedHTML)

  if (parseDSDOM) {
    const templates = queryDeclarativeTemplatesShadowDOM(documentFragment)

    if (loadCSSModules) {
      templates.forEach(template => {
        const shadowRoot = parseDeclarativeShadowDOM(template.parentElement)

        const styleSheetsURL = template.dataset.stylesheets?.split(/\s/)

        if (!styleSheetsURL) return

        loadCSSModulesAndAppendToShadowDOM(shadowRoot, styleSheetsURL)
      })
    } else {
      templates.forEach(template => parseDeclarativeShadowDOM(template.parentElement))
    }
  }

  const nodesMapId = getAllElementsMapWithBracketsId(documentFragment, {shadowRoot: true})

  return mapId ? [documentFragment, nodesMapId] : documentFragment
}

/**
 * 
 * @param {string[]} strings 
 * @param  {...any} args 
 */
export function html(strings, ...args) {
  const joinedString = strings.reduce((acc, value, index) => acc + value + index < strings.length - 1 ? args[index] : '')

  return parseHTML(joinedString)
}

export function parseHTMLDocument(htmlString) {
  const doc = new DOMParser().parseFromString(htmlString, 'text/html')

  return doc
}

export function parseXML(xmlString) {
  return new DOMParser().parseFromString(xmlString, 'text/xml')
}


/**
 *
 * @param {DocumentFragment | HTMLElement} documentFragment
 * @returns {HTMLTemplateElement[]}
 */
export function queryDeclarativeTemplatesShadowDOM(documentFragment) {
  const templates = [...documentFragment.querySelectorAll('template[shadowroot]:first-child')]

  templates.forEach(template => {
    const innerTemplates = queryDeclarativeTemplatesShadowDOM(template.content)
    templates.push(...innerTemplates)
  })

  return templates
}

/**
 *
 * @param {HTMLElement} hostElement
 * @returns {ShadowRoot}
 */
export function parseDeclarativeShadowDOM(hostElement) {
  if (!hostElement) {
    throw new Error(`HostElement not found for declarative shadow DOM`)
  }

  const template = hostElement.querySelector(':scope > template[shadowroot]:first-child')

  const hasTemplate = template != null

  if (!hasTemplate) return false

  template.remove()

  const mode = template.getAttribute('shadowroot')

  const shadowRoot = hostElement.attachShadow({mode})
  shadowRoot.append(template.content)

  return shadowRoot
}

export function appendCSSModulesToShadowRoot(shadowRoot, cssModules) {
  shadowRoot.adoptedStyleSheets = cssModules
}

export async function loadCSSModulesAndAppendToShadowDOM(shadowRoot, styleSheetsURL, baseURL) {
  const cssModules = await importCSSModules(styleSheetsURL, baseURL)

  appendCSSModulesToShadowRoot(shadowRoot, cssModules)
}

export function parseMultipleDeclarativeShadowDOM(element) {
  const templates = queryDeclarativeTemplatesShadowDOM(element)

  const shadowRoots = templates.map(template => parseDeclarativeShadowDOM(template.parentElement))

  return shadowRoots
}

export function parseMultipleDeclarativeShadowDOMAndLoadCSSModules(element, baseURL) {
  const templates = queryDeclarativeTemplatesShadowDOM(element)

  templates.forEach(template => {
    const shadowRoot = parseDeclarativeShadowDOM(template.parentElement)

    const styleSheetsURL = getAdoptedStyleSheetsURLFromDeclarativeTemplateShadowDOM(template)

    loadCSSModulesAndAppendToShadowDOM(shadowRoot, styleSheetsURL, baseURL)
  })
}

export function parseMultipleDeclarativeShadowDOMAndAppendCSSModules(element, cssModulesList) {
  const templates = queryDeclarativeTemplatesShadowDOM(element)

  templates.forEach((template, index) => {
    const shadowRoot = parseDeclarativeShadowDOM(template.parentElement)

    appendCSSModulesToShadowRoot(shadowRoot, cssModulesList[index])
  })
}



/**
 *
 * @param {{template: string, stylesheet: string}} urlOptions
 * @param {string} baseURL
 * @returns {[
 *   {
 *     documentFragment: Node,
 *     clone(ownerDocument?: Document): DocumentFragment
 *   },
 *   CSSStyleSheet
 * ]}
 */
export async function importTemplateAndCSS(urlOptions, baseURL) {
  const {template: templateURL, stylesheet: stylesheetURL} = urlOptions

  const [dialogTemplate, stylesheet] = await Promise.all([
    importTemplate(templateURL, {baseURL, parseDeclarativeShadowDOM: false}),
    importCSSModule(stylesheetURL, baseURL)
  ])

  return [dialogTemplate, stylesheet]
}

/**
 *
 * @param {string} url
 * @param {string} baseURL
 * @returns
 */
export async function importTemplate(url, options) {
  const documentFragment   = await importHTML(url, options)

  return {
    documentFragment: documentFragment.cloneNode(true),

    /**
     * @param {Document} ownerDocument
     * @returns {DocumentFragment}
     */
    clone(ownerDocument = null) {
      /**
       * @type {DocumentFragment}
       */
      const templateClone = documentFragment.cloneNode(true)

      // Adopt the DocumentFragment with its childs to the specified document
      if (ownerDocument instanceof Document) {
        ownerDocument.adoptNode(templateClone)
      }

      parseMultipleDeclarativeShadowDOM(templateClone)

      return templateClone
    }
  }
}

export async function importTemplateWithAdoptedStyleSheets() {
  const documentFragment   = await importHTML(url, {baseURL})
  const styleSheetsURLList = getStylesheetsURLListFromTree(documentFragment)
  const cssModulesList     = await importCSSModulesList(styleSheetsURLList, baseURL)

  return {
    documentFragment: documentFragment.cloneNode(true),

    /**
     * @param {Document} ownerDocument
     * @returns {DocumentFragment}
     */
    clone(ownerDocument = null) {
      /**
       * @type {DocumentFragment}
       */
      const templateClone = documentFragment.cloneNode(true)

      // Adopt the DocumentFragment with its childs to the specified document
      if (ownerDocument instanceof Document) {
        ownerDocument.adoptNode(templateClone)
      }

      parseMultipleDeclarativeShadowDOMAndAppendCSSModules(templateClone, cssModulesList)

      return templateClone
    }
  }
}


export function getAllShadowRootNodes(node) {
  const shadowRoots = [node, ...node.querySelectorAll('*')].filter(n => n.shadowRoot).map(n => n.shadowRoot)

  shadowRoots.forEach(shadowRoot => {
    const shadowRootsNested = getAllShadowRootNodes(shadowRoot)

    shadowRoots.push(...shadowRootsNested)
  })

  return shadowRoots
}


/**
 *
 * @param {Element | Document | DocumentFragment} node
 * @param {boolean} removeBracketIds
 * @returns {{[key: string]: Element}}
 */
export function getAllElementsMapWithBracketsId(node = document, options = {}) {
  if (node == null) throw new TypeError(`param 1 cannot be null or undefined`)
  if (!(node instanceof Element || node instanceof Document || node instanceof DocumentFragment)) {
    throw new TypeError(`param 1 must be an instance of Element, Document or DocumentFragment`)
  }

  const {removeBracketIds = true, shadowRoot = false} = options

  const elements = [...getElementsByAttribute('[id]', {startNode: node})]

  if (shadowRoot) {
    const shadowRoots = getAllShadowRootNodes(node)

    shadowRoots.forEach(shadowRoot => {
      const shadowRootChildNodes = getElementsByAttribute('[id]', {startNode: shadowRoot})
      elements.push(...shadowRootChildNodes)
    })
  }

  const map = {}

  elements.forEach(element => {
    const bracketId = element.getAttribute('[id]')

    const key = hyphenToLowerCase(bracketId)

    if (key === '') throw new DOMException(`'[id]' attribute cannot be empty`)

    if (key in map) throw new DOMException(`'[id]' attribute must be unique:\n[id="${bracketId}"]`)

    map[key] = element
  })

  if (removeBracketIds) {
    elements.forEach(element => element.removeAttribute('[id]'))
  }

  return map
}

/**
 * Query element by attribute, even invalid attribute names
 * @param {string} attr
 * @param {{startNode: Element | Document | DocumentFragment}} options
 * @returns {Element[]}
 */
export function getElementsByAttribute(attr, options = {}) {
  const {startNode = document, shadowRoot = false} = options

  const nodeList = [...startNode.querySelectorAll('*')]

  if (startNode instanceof Element) {
    nodeList.unshift(startNode)
  }

  return nodeList.filter(n => n.hasAttribute(attr))
}


/**
 * Append any attribute to an element even those with invalid characters
 * @param {Element} element
 * @param {string} attrName
 * @param {string} attrValue
 * @returns {Attr}
 */
export function setAttribute(element, attrName, attrValue = '') {
  const trustedHTMLPolicy = window.trustedTypes ? trustedTypes.createPolicy('trustedHTML', {createHTML: string => string}) : {createHTML: string => string}

  const div = document.createElement('div')
  div.innerHTML = trustedHTMLPolicy.createHTML(`<div ${attrName}="${attrValue}"></div>`)

  const attribute = div.children[0].attributes[attrName].cloneNode()

  element.attributes.setNamedItem(attribute)

  return attribute
}



export function getTokensFromString(string) {
  if (string == null) return []
  return [...new Set(string.split(' '))].filter(t => t !== '')
}

export function addTokenToDOMStringMapProperty(settings) {
  const {token, dataset, property} = settings

  const tokens = getTokensFromString(dataset[property])
  if (!tokens.includes(token)) tokens.push(token)

  return dataset[property] = tokens.join(' ')
}

export function removeTokenFromDOMStringMapProperty(settings) {
  const {token, dataset, property} = settings

  if (dataset[property] == null) return ''

  const tokens = getTokensFromString(dataset[property]).filter(t => t !== token)

  return dataset[property] = tokens.join(' ')
}


/**
 *
 * @param {string} name
 * @param {{
 *  id: string,
 *  classes: string[],
 *  style: {[key: string]: string},
 *  dataset: {[key: string]: string},
 *  attributes: {[key: string]: string},
 *  properties: {[key: string]: string},
 *  namespace: string,
 *  options: ElementCreationOptions
 * }} settings
 * @returns {HTMLElement}
 */
export function createElement(name = 'div', settings = {}) {
  const {id, classes, style, dataset, attributes, properties, namespace, options} = settings

  const element = namespace != null ?
                  document.createElementNS(namespace, name, options) :
                  document.createElement(name, options)

  const tp = window.trustedTypes ? trustedTypes.createPolicy('', {createHTML: e => e, createScriptURL: e => e}) : {createHTML: e => e, createScriptURL: e => e}

  if (id != null)      element.id = id
  if (Array.isArray(classes)) element.classList.add(...classes)

  if (style != null) setStyleProperties(element.style, style)

  if (element.dataset != null) {
    for (const [property, value] of Object.entries(dataset ?? {})) {
      if (value === undefined) continue

      element.dataset[property] = value
    }
  }

  for (const [property, value] of Object.entries(attributes ?? {})) {
    if (value === undefined) continue

    if (['src', 'href'].includes(property)) {
      element.setAttribute(property, tp.createScriptURL(value))

      continue
    }

    element.setAttribute(property, value)
  }

  for (const [property, value] of Object.entries(properties ?? {})) {
    if (value === undefined) continue

    if (['innerHTML', 'outerHTML', 'innerText', 'outerText', 'textContent'].includes(property)) {
      element[property] = tp.createHTML(value)

      continue
    }

    if (['src', 'href'].includes(property)) {
      element[property] = tp.createScriptURL(value)

      continue
    }

    element[property] = value
  }

  return element
}


export function turnStringIntoTrustedHTML(htmlString) {
  if (!window.trustedTypes) {
    return htmlString
  }

  const trustedHTMLPolicy = trustedTypes.createPolicy('trustedHTML', {createHTML: string => string})
  return trustedHTMLPolicy.createHTML(htmlString)
}

export function stringToValidInnerHTML(string) {
  const div = document.createElement('div')

  const trustedHTMLPolicy = window.trustedTypes ? trustedTypes.createPolicy('trustedHTML', {createHTML: string => string}) : null

  div.innerHTML = trustedHTMLPolicy?.createHTML(string) ?? string

  return div.innerHTML
}


/**
 *
 * @param {CSSStyleDeclaration} style
 * @param {{}} properties
 */
export function setStyleProperties(style, properties) {
  for (const property in properties) {

    let propertyName = property

    const isCustomProperty = propertyName.startsWith('--')
    const hasHyphen = propertyName.includes('-')
    if(!isCustomProperty && !hasHyphen) {
      propertyName = lowerCaseToHyphen(propertyName)
    }

    const prefixVendors = propertyName.search(/^(webkit|moz|ms|o)-/) !== -1
    if(prefixVendors) {
      propertyName = `-${propertyName}`
    }

    const priority = properties[property].match(/![a-z]+$/ig)?.[0].slice(1) ?? ''
    const propertyValue = priority ? properties[property].replace(new RegExp(`!${priority}$`, 'i'), '') : properties[property]

    style.setProperty(propertyName, propertyValue, priority)

  }
}


/**
 *
 * @param {HTMLTemplateElement} template
 * @param {{}} obj
 * @returns {DocumentFragment}
 */
export function fillDeclarativeTemplate(template, obj) {

  // Use always duplicate character for interpolation
  const interpolationStart = '{{'
  const interpolationEnd   = '}}'

  const loopAttributeName = '[for]'
  const loopItemPrefix    = '@'
  const loopIndexPrefix   = '#'

  function getInterpolationTokens(string) {
    // const regex = /.{0}(?={{[^{^}]+}})|(?<={{[^{^}]+}}).{0}/

    const start = interpolationStart
    const end   = interpolationEnd
    const regex = new RegExp(`.{0}(?=${start}[^${start[0]}^${end[0]}]+${end})|(?<=${start}[^${start[0]}^${end[0]}]+${end}).{0}`)
    return string.trim().split(regex).filter(s => s !== '')
  }

  function getElementsByAttribute(attr, options = {}) {
    const {startNode = document} = options

    const nodeList = [...startNode.querySelectorAll('*')]
    return nodeList.filter(n => n.hasAttribute(attr))
  }

  function setAttribute(element, attrName, attrValue = '') {
    const trustedHTMLPolicy = window.trustedTypes ? trustedTypes.createPolicy('trustedHTML', {createHTML: string => string}) : {createHTML: string => string}

    const div = document.createElement('div')
    div.innerHTML = trustedHTMLPolicy.createHTML(`<div ${attrName}="${attrValue}"></div>`)

    const attribute = div.children[0].attributes[attrName].cloneNode()

    element.attributes.setNamedItem(attribute)

    return attribute
  }

  function getValueFromPropertyPath(obj, propertyPath) {
    if (propertyPath == null) return obj

    const propertyPathSplit = propertyPath.split('.')

    let valueHolder = obj

    for (let k = 0; k < propertyPathSplit.length; k++) {
      const property = propertyPathSplit[k]

      const isPrimitive = value => ['object', 'function'].every(type => typeof value !== type)

      if (
        isPrimitive(valueHolder) && !(property in Object.getPrototypeOf(valueHolder)) ||
        !isPrimitive(valueHolder) && !(property in valueHolder)
      ) {
        console.error(`PropertyPathError: property '${property}' does not exists in ${typeof valueHolder}`, typeof valueHolder === 'string' ? `'${valueHolder}'` : valueHolder, `from source ${typeof obj}`, typeof obj === 'string' ? `'${obj}'` : obj, `from the property path '${propertyPath}'`)
        return 'undefined'
      }

      valueHolder = valueHolder[property]
    }

    return valueHolder
  }

  function computeValueFromInterpolationTokens(tokens, obj) {
    return tokens.map(text => {
      if (!text.startsWith(interpolationStart) || !text.endsWith(interpolationEnd)) return text

      const propertyPath = text.replace(interpolationStart, '').replace(interpolationEnd, '')

      if (propertyPath.startsWith(loopItemPrefix) || propertyPath.startsWith(loopIndexPrefix)) return text

      return getValueFromPropertyPath(obj, propertyPath)
    }).join('')
  }

  function computeValueFromInterpolationTokensLoop(tokens, item, itemName, indexName, currentIndex) {
    return tokens.map(text => {
      if (!text.startsWith(interpolationStart) || !text.endsWith(interpolationEnd)) return text

      const itemPropertyPath = text.replace(interpolationStart, '').replace(interpolationEnd, '')

      if (itemPropertyPath.startsWith(`${loopIndexPrefix}${indexName}`)) return currentIndex

      if (!itemPropertyPath.startsWith(`${loopItemPrefix}${itemName}.`) && itemPropertyPath !== `${loopItemPrefix}${itemName}`) return text

      const propertyPath = itemPropertyPath.replace(`${loopItemPrefix}${itemName}.`, '').replace(`${loopItemPrefix}${itemName}`, '') || null

      return getValueFromPropertyPath(item, propertyPath)
    }).join('')
  }

  function computeElementAttributes(element, obj) {
    const attributes = [...element.attributes].filter(attr => attr.nodeName !== loopAttributeName)

    for (let k = 0; k < attributes.length; k++) {
      const attribute = attributes[k]

      const tokens = getInterpolationTokens(attribute.value)

      attribute.value = computeValueFromInterpolationTokens(tokens, obj)
    }
  }

  function computeElementAttributesLoop(element, item, itemName, indexName, currentIndex) {
    const attributes = [...element.attributes].filter(attr => attr.nodeName !== loopAttributeName)

    for (let k = 0; k < attributes.length; k++) {
      const attribute = attributes[k]

      const tokens = getInterpolationTokens(attribute.value)

      attribute.value = computeValueFromInterpolationTokensLoop(tokens, item, itemName, indexName, currentIndex)
    }
  }

  function computeElementTextNodes(element, obj) {
    const childNodes = element.childNodes

    for (let j = 0; j < childNodes.length; j++) {
      const node = childNodes[j]

      if (!(node instanceof Text)) continue

      const tokens = getInterpolationTokens(node.nodeValue)

      node.nodeValue = computeValueFromInterpolationTokens(tokens, obj)
    }
  }

  function computeElementTextNodesLoop(element, item, itemName, indexName, currentIndex) {
    const childNodes = element.childNodes

    for (let k = 0; k < childNodes.length; k++) {
      const node = childNodes[k]

      if (!(node instanceof Text)) continue

      const tokens = getInterpolationTokens(node.nodeValue)

      node.nodeValue = computeValueFromInterpolationTokensLoop(tokens, item, itemName, indexName, currentIndex)
    }
  }

  function fillDeclarativeElementTree(element, obj) {
    computeElementAttributes(element, obj)
    computeElementTextNodes(element, obj)
  }

  function fillDeclarativeElementTreeLoop(loopElement, obj) {
    const loopTokensAndIndexName = loopElement.getAttribute(loopAttributeName).split(/; ?/)

    const loopTokens = loopTokensAndIndexName[0].split(' ')

    const itemName = loopTokens[0]
    const loopType = loopTokens[1]
    const collectionPropertyPath = loopTokens[2]

    const indexName = loopTokensAndIndexName[1]

    if (collectionPropertyPath.includes(loopItemPrefix)) return

    loopElement.removeAttribute(loopAttributeName)


    const objectToIterate = getValueFromPropertyPath(obj, collectionPropertyPath)

    // Save reference for the last element to keep appending elements one after another
    let currentElement = loopElement

    const fistElement = loopElement

    // Read collection

    let collection

    switch (loopType) {
      case 'of': {
        if (objectToIterate[Symbol.iterator] instanceof Function) {
          collection = objectToIterate
        } else {
          collection = Object.values(objectToIterate)
        }
      }
      break

      case 'in': {
        collection = Object.keys(objectToIterate)
      }
      break

      case 'from': {
        collection = Object.entries(objectToIterate)
      }
      break

      default:
    }

    for (let i = 0; i < collection.length; i++) {
      const item = collection[i]

      const elementCopy = loopElement.cloneNode(true)

      // Read element itself

      computeElementAttributesLoop(elementCopy, item, itemName, indexName, i)
      computeElementTextNodesLoop(elementCopy, item, itemName, indexName, i)


      const innerLoops = getElementsByAttribute(loopAttributeName, {startNode: elementCopy})

      for (let j = 0; j < innerLoops.length; j++) {
        const innerLoop = innerLoops[j]

        const loopTokensAndIndexName = innerLoop.getAttribute(loopAttributeName).split(/; ?/)

        const loopTokens = loopTokensAndIndexName[0].split(' ')

        const innerItemName = loopTokens[0]
        const innerLoopType = loopTokens[1]
        const innerCollectionPropertyPath = loopTokens[2]

        const innerIndexName = loopTokensAndIndexName[1]

        // const attrValue = innerLoop.getAttribute(loopAttributeName)

        // const tokens = attrValue.split(' ')

        // const innerCollectionPropertyPath = tokens[2]

        if (innerCollectionPropertyPath !== `${loopItemPrefix}${itemName}` && !innerCollectionPropertyPath.startsWith(`${loopItemPrefix}${itemName}.`)) continue

        const computedInnerCollectionPropertyPath = innerCollectionPropertyPath.replace(`${loopItemPrefix}${itemName}`, `${collectionPropertyPath}.${i}`)
        const value = `${innerItemName} ${innerLoopType} ${computedInnerCollectionPropertyPath}${innerIndexName ? `; ${innerIndexName}`: ''}`

        setAttribute(innerLoop, loopAttributeName, value)
      }


      // Read element childs

      const childs = elementCopy.querySelectorAll('*')

      for (let j = 0; j < childs.length; j++) {
        const child = childs[j]

        computeElementAttributesLoop(child, item, itemName, indexName, i)
        computeElementTextNodesLoop(child, item, itemName, indexName, i)
      }

      currentElement.after(elementCopy)

      currentElement = elementCopy
    }

    fistElement.remove()
  }

  if (template instanceof HTMLTemplateElement) {
    const content = template.content.cloneNode(true)

    // Read elements

    const childs = content.querySelectorAll('*')

    for (let i = 0; i < childs.length; i++) {
      fillDeclarativeElementTree(childs[i], obj)
    }

    // Read loop elements

    let loopChilds

    while (loopChilds = getElementsByAttribute(loopAttributeName, {startNode: content}), loopChilds.length) {
      for (let i = 0; i < loopChilds.length; i++) {
        fillDeclarativeElementTreeLoop(loopChilds[i], obj)
      }
    }

    return content
  }

}


/**
 *
 * @param {Element} node
 * @param {Element} [parent]
 * @returns {Promise<void>}
 */
export function waitForNodeConnected(node, parent = document.body) {
  return new Promise(resolve => {
    if (node.isConnected) {
      resolve()
      return
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver

    const mutationObserver = new MutationObserver((mutationList, observer) => {
      for (const mutation of mutationList) {
        if (Array.prototype.includes.call(mutation.addedNodes, node)) {
          mutationObserver.disconnect()
          resolve()
        }
      }
    })

    mutationObserver.observe(parent, {childList: true, subtree: true})
  })
}

/**
 *
 * @param {Document|HTMLIFrameElement} document
 * @param {{waitAgainForLoad: boolean}} options
 * @returns {Promise<Document|HTMLIFrameElement>}
 */
export function waitForDocumentReady(document, options = {}) {
  const {waitAgainForLoad = null} = options

  if (document == null) {
    throw new TypeError(`document cannot be null or undefined`)
  }

  return new Promise((resolve, reject) => {
    let doc = document

    if (document instanceof HTMLIFrameElement) {
      if (document.contentDocument == null) {
        reject(new Error(`Cannot access 'iframe.contentDocument'`))
      }

      doc = document.contentDocument
    }
    else
    if (!(document instanceof Document)) {
       reject(new TypeError(`param must be either a Document or a HTMLIFrameElement`))
    }

    if (
        doc.readyState === 'complete'
        && doc.location != null
        && doc.location.origin !== 'null'
    ) {
      resolve(document)

      return
    }

    if (document instanceof HTMLIFrameElement) {
       document.addEventListener('load', event => {
        if (typeof waitAgainForLoad === 'number') {
          setTimeout(() => resolve(document), waitAgainForLoad)
          return
        }

        resolve(document)
      }, {once: true})

     return
    }

    const listenerCallback = event => {
      if (doc.readyState !== 'complete') {
        return
      }

      doc.removeEventListener('readystatechange', listenerCallback)

      resolve(document)
    }

    doc.addEventListener('readystatechange', listenerCallback)
  })
}
