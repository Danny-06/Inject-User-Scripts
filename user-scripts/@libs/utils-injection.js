import { extensionId, getURL, crossFetch } from './chrome-extension-utils.js'

import { MouseInfo } from './libs/mouse-info.js'
import { StringConversion } from './libs/string-conversion.js'
import { StringImageConversion } from './libs/string-image-conversion.js'
import { StorageHandler } from './libs/storage-handler.js'
import { ArrayN } from './libs/arrayN.js'
import { ZipManager } from './libs/zip-manager.js'
import { ScrollBox } from './libs/scroll-box.js'
import { showConfirmDialog } from './libs/confirm-dialog.js'
import { showAlertDialog } from './libs/alert-dialog.js'
import { showPromptDialog } from './libs/prompt-dialog.js'
import { LocalDB } from './libs/localDB.js'
import { classMaker } from './libs/class-maker.js'
import { showPopup } from './libs/show-popup.js'
import { asyncObjectWrapper } from './libs/proxy-libs.js'
import { drawMediaInCanvas, getImageFromCanvas, getMediaAsBlob, getMediaAsDataURL, getMediaAsImageData } from './libs/canvas-utils.js'
import { Interval, Timeout } from './libs/timeout-interval.js'
import { Binary } from './libs/binary.js'
import { ListManager } from './libs/array-utils.js'

const canvasUtils = {
  drawMediaInCanvas,
  getMediaAsBlob,
  getMediaAsImageData,
  getImageFromCanvas,
  getMediaAsDataURL
}

const chromeExtension = {
  extensionId,
  getURL,
  crossFetch
}

export {
  MouseInfo, ScrollBox, StringConversion, StringImageConversion, StorageHandler,
  ArrayN, ZipManager, showAlertDialog, showConfirmDialog, showPromptDialog, LocalDB,
  classMaker, showPopup, asyncObjectWrapper, canvasUtils, Timeout, Interval,
  Binary, chromeExtension, ListManager
}

export function getValueFromPropertyPath(obj, propertyPath) {
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

/**
 * Query element by attribute, even invalid attribute names
 * @param {string} attr
 * @param {{startNode: Element | Document | DocumentFragment}} options
 * @returns {Element[]}
 */
export function getElementsByAttribute(attr, options = {}) {
  const {startNode = document} = options

  const nodeList = [...startNode.querySelectorAll('*')]
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
  const trustedHTMLPolicy = trustedTypes.createPolicy('trustedHTML', {createHTML: string => string})

  const div = document.createElement('div')
  div.innerHTML = trustedHTMLPolicy.createHTML(`<div ${attrName}="${attrValue}"></div>`)

  const attribute = div.children[0].attributes[attrName].cloneNode()

  element.attributes.setNamedItem(attribute)

  return attribute
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
    const trustedHTMLPolicy = trustedTypes.createPolicy('trustedHTML', {createHTML: string => string})
  
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


export function createPublicPromise() {
  let resolve
  let reject

  const promise = new Promise((resolveFunction, rejectFunction) => {
    resolve = resolveFunction
    reject = rejectFunction
  })

  const publicPromise = {
    resolve,
    reject,

    then(onFulfilled, onRejected) {
      return promise.then(onFulfilled, onRejected)
    },
    catch(onRejected) {
      return promise.catch(onRejected)
    },
    finally(onFinally) {
      return promise.finally(onFinally)
    },

    mixResult() {
      const mixedPromise = this.createPublicPromise()

      this.then(
        value => mixedPromise.resolve([value, null]),
        reason => mixedPromise.resolve([null, reason])
      )

      return mixedPromise
    },

    [Symbol.toStringTag]: 'PublicPromise'
  }

  return publicPromise
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

  const tp = trustedTypes.createPolicy('', {createHTML: e => e, createScriptURL: e => e })

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

export function promiseWrapper(promise) {
  if (typeof promise.then !== 'function') throw new TypeError(`param 1 must be a thenable`)

  return new Promise(resolve => {
    promise
    .then(
      value => resolve([value, null]),
      reason => resolve([null, reason])
    )
  })
}

export function appendMetaViewport(width = 'device-width', initialScale = '1.0' , userScalable = 'yes') {
  const metaViewport = document.createElement('meta')
  metaViewport.name = 'viewport'
  metaViewport.content = `width=${width}, initial-scale=${initialScale}, user-scalable=${userScalable}`

  document.head.prepend(metaViewport)

  return metaViewport
}

export function xhrFetch(url, options = {method: 'GET', body: null, headers: null, username: null, password: null}, async = true) {

  if (url == null) throw new TypeError('1 argument required, but only 0 present')

  const xhr = new XMLHttpRequest
  xhr.responseType = 'blob'

  const {method, body, headers, username, password} = options ?? {}

  xhr.open(method, url, async, username, password)

  for (let header in headers) {
    xhr.setRequestHeader(header, headers[header])
  }

  xhr.send(body)

  return new Promise((resolve, reject) => {

    xhr.onload = () => {

      const response = new Response(xhr.response)

      let urlResponse = location.origin + location.pathname + url

      const urlStartsWithToUseOriginalURL = [
        /^.*:/.test(url)
      ]

      if ( urlStartsWithToUseOriginalURL.includes(true) ) urlResponse = url

      if ( url.startsWith('./') ) urlResponse = location.origin + location.pathname + url.replace('./', '')
      if ( url.startsWith('/') ) urlResponse = location.origin + url

      Object.defineProperty(response, 'url', { value: urlResponse })

      resolve(response)

    }

    xhr.onerror = event => {
      reject(xhr.response)
    }

  })

}

export function newTabFromCode(HTML, CSS, JS) {
  if(HTML == null) return null

  let win = open(""/*, "New Window", "width=600, height=400, location=no"*/);
  // Window.document.location = "about:blank"
  win.document.write(HTML);

  if(CSS != null ) {
    let style = document.createElement('style');
    style.innerHTML = CSS;
    win.document.head.append(style);
  }

  if(JS != null) {
    let script = document.createElement('script');
    script.innerHTML = JS;
    win.document.head.append(script);
  }

  win.document.close();
}

/**
 * Returns an number in the given range
 * @param   {number}  from
 * @param   {number}  to
 * @returns {number}  Random Integer between 'from' and 'to'
 */
export function randomRange(from, to) {
  return Math.floor(Math.random() * (to + 1 - from)) + from
}

export function delay(time) {
  /**
   * @type {(value?: any) => void}
   */
  let res
    /**
   * @type {(reason?: any) => void}
   */
  let rej
  const promise = new Promise((resolve, reject) => {
    res = resolve
    rej = reject

    setTimeout(resolve, time)
  })

  return {
    resolve: res,
    reject: rej,
    then:    (onFulfilled, onRejected) => promise.then(onFulfilled, onRejected),
    catch:   onRejected => promise.catch(onRejected),
    finally: onFinally => promise.finally(onFinally),
  }
}

export function clamp(min, value, max) {
  if (min >= max) throw new TypeError(`min and max cannot be the same and min cannot be bigger than max`)

  if (value < min) return min
  if (value > max) return max

  return value
}

export function imageBitmapToImage(imageBitmap) {
  const canvas = document.createElement('canvas');
  [canvas.width, canvas.height] = [imageBitmap.width, imageBitmap.height]

  const ctx = canvas.getContext('2d')

  ctx.drawImage(imageBitmap, 0, 0)

  const img = new Image()
  img.src = canvas.toDataURL()

  return img
}

export function stop(time) {
  const initialTime = Date.now()

  while (Date.now() - initialTime < time) {}
}

/**
 * 
 * @param {File[]} files 
 * @returns {FileList}
 */
export function fileListFromArray(files) {
  const dataTransfer = new DataTransfer()

  files.forEach(item => {
    dataTransfer.items.add(item)
  })

  return dataTransfer.files
}

/**
 * 
 * @param {HTMLScriptElement} script 
 * @returns 
 */
export function cloneScript(script) {
  /**
   * @type {HTMLScriptElement} 
   */
  const clonedScript = document.createElement('script');

  [...script.attributes].forEach(attr => {
    clonedScript.attributes.setNamedItem(attr.cloneNode())
  })

  clonedScript.innerHTML = script.innerHTML

  return clonedScript
}

// /**
//  * Returns a **Proxy** wrapper for any data that has **let** and **also** methods
//  * @param {{}} obj 
//  * @returns {Proxy}
//  */
// export function selfMethodsProxy(obj) {

//   return new Proxy(obj, {
//     get: (target, property, receiver) => {

//       switch (property) {
//         case 'let':
//           return function(callback) {
//             return callback(receiver)
//           }

//         case 'also':
//           return function(callback) {
//             callback(receiver)
//             return receiver
//           }

//         default:
//           const propertyValue = Reflect.get(target, property, receiver)
//           return propertyValue instanceof Function ? propertyValue.bind(target) : propertyValue
//       }

//     }
//   })

// }


export function cutDecimals(number, numberOfDecimalsToKeep) {
  if (number == null || typeof number !== 'number') throw new TypeError('argument 1 must be a number')
  if (numberOfDecimalsToKeep == null || numberOfDecimalsToKeep <= 0) throw new TypeError('argument 2 must be a positive non Zero number')

  const numberLength = number.toString().length
  const integerLength = parseInt(number).length
  // const decimalLength = numberLength - integerLength

  numberOfDecimalsToKeep = 10 ** numberOfDecimalsToKeep

  number = parseInt(number * numberOfDecimalsToKeep) / numberOfDecimalsToKeep

  return number
}

export function styleSheetToText(stylesheet) {
  return [...stylesheet.cssRules].reduce( (resultCSS, rule) => resultCSS + rule.cssText, '' ).replaceAll('\\', '')
}

export function styleSheetToPrettyText(stylesheet) {
  let cssCode = [...stylesheet.cssRules].reduce( (resultCSS, rule) => resultCSS + rule.cssText + '\n', '' )

  cssCode = cssCode.replaceAll('\\', '')

  // Reemplazar todos los inicios de llave con 'una llave', 'un salto de línea' y 'un espacio'
  cssCode = cssCode.replaceAll('{', '{\n ')
  // Reemplazar todos los 'puntos y coma' con 'un punto y coma', 'un salto de línea' y 'un espacio'
  cssCode = cssCode.replaceAll('; ', ';\n  ')


  cssCode = cssCode.replaceAll('}', '}\n')
  // Reemplazar todos los dobles espacios seguidos de una llave con 'una llave' y 'un salto de línea'
  cssCode = cssCode.replaceAll('  }\n', '}\n')

  cssCode = cssCode.replaceAll('}\n\n}', '  }\n\n}')

  // Restaurar selectores de atributo para que no se dividan en una nueva linea
  // cssCode = cssCode.replace(/(?<=(\[([^\]].|\n)+))(;\n  )(?=(((([^\[]|\n)+)|)\]))/g, '; ')

  // Eliminar salto de línea extra
  cssCode = cssCode.slice(0, -2)

  return cssCode
}

export function getConstructedStyleSheets(stylesheets) {
  const constructedStyleSheets = []

  for (const stylesheet of stylesheets) {
    try {
      const constructedStyleSheet = new CSSStyleSheet({media: [...stylesheet.media].join(', '), disabled: stylesheet.disabled, /*title: stylesheet.title*/})
      //if (!stylesheet.title) Object.defineProperty(constructedStyleSheet, 'title', {value: null})

      constructedStyleSheet.replace( styleSheetToText(stylesheet) )

      constructedStyleSheets.push( constructedStyleSheet )
    } catch(error) { continue }
  }

  return constructedStyleSheets
}

// Put the 'stylesheets' in the document as 'adoptedStyleSheets' if posible
// and remove the originals 'stylesheets' from the document
export function turnStyleSheetsIntoAdoptedStyleSheets() {

  document.adoptedStyleSheets = [...getConstructedStyleSheets(document.styleSheets), ...document.adoptedStyleSheets]

  document.querySelectorAll('style, link[rel="stylesheet"]')
  .forEach(stylesheet => {
    try {

      if (!stylesheet.getAttribute('href')) return stylesheet.remove()

      // If the 'cssRules' property is not accessible due to CORS
      // keep the stylesheet in the document
      stylesheet.sheet.cssRules

    } catch(error) {
      return console.warn(error)
    }

    stylesheet.remove()
  })

}

export const lowerCaseToHyphen = string => string.split(/(?=[A-Z])/).map(str => str.toLowerCase()).join('-')

export const hyphenToLowerCase = string => string.split('-').map((str, index) => index !== 0 ? str[0].toUpperCase() + str.slice(1) : str).join('')


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
 * @param {HTMLElement} element 
 * @returns {Proxy}
 */
export function cssInlinePropertiesProxyWrapper(element) {
  return new Proxy(element, {
    get: (target, property, handler) => {
      const priority = element.style.getPropertyPriority(property)

      return `${element.style.getPropertyValue(property)}${priority ? ` !${priority}` : ''}`
    },
    set: (target, property, value) => {
      const priority = value.match(/![a-z]+$/ig)?.[0].slice(1) ?? ''
      const propertyValue = priority ? value.replace(new RegExp(`!${priority}$`, 'i'), '') : value

      element.style.setProperty(property, propertyValue, priority)

      return true
    }
  })
}

/**
 * 
 * @param {string} accept 
 * @param {boolean} multiple 
 * @returns {Promise<File|File[]>}
 */
export function requestFile(accept = '*/*', multiple = false) {

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = accept

  input.multiple = multiple

  input.click()

  return new Promise( resolve => {
    input.onchange = () => {
      resolve(multiple ? input.files : input.files[0])
    }
  })

}

/**
 * 
 * @param {Blob} blob 
 * @param {'text'|'binaryString'|'arrayBuffer'|'dataURL'} mode 
 * @param {string} encoding 
 * @returns {Promise<string|ArrayBuffer>}
 */
export function readFileAs(blob, mode, encoding = 'UTF-8') {
  if (!(blob instanceof Blob)) throw new TypeError(`param 1 is not instance of 'Blob'`);
  if (typeof mode !== 'string') throw new TypeError(`param 2 must be type of 'string'`)
  if (mode.length <= 0) throw new TypeError(`Invalid string length of param 2`)

  // Uppercase first letter
  let readerMode = mode.replace(/^[a-z]/, mode[0].toUpperCase());
  readerMode = `readAs${readerMode}`

  if (!(readerMode in FileReader.prototype)) throw new TypeError(`Mode '${mode}' is an invalid mode`);

  const reader = new FileReader();
  reader[readerMode](blob, encoding);

  return new Promise(resolve => {
    reader.onloadend = event => {
      resolve(reader.result)
    }

    reader.onerror = event => {
      reject(reader.error)
    }
  });
}

/**
 * 
 * @param {[]} array 
 * @param {function} splitter 
 * @returns {[]}
 */
export function splitArray(array, splitter) {

  if (!array.forEach)   throw new TypeError('param 1 must be an array')
  if (splitter == null) throw new TypeError(`param 2 can't be ${splitter}`)


  if (typeof splitter !== 'function') {
    const element = splitter
    splitter = el => el === element
  }

  const data = []

  let dataIndex = -1

  const condition = !splitter(array[0])

  if (condition) {
    dataIndex++
    data.push([])
  }

  for (let i = 0; i < array.length; i++) {
    let skipCondition = splitter(array[i])

    while (skipCondition) {
      if (i === array.length - 1) return data

      i++
      skipCondition = splitter(array[i])
    }

    const condition = i > 0 ? splitter(array[i - 1]) : false

    if (condition) {
      dataIndex++
      data.push([])
    }

    data[dataIndex].push(array[i])
  }

  return data

}

export async function printPage(url) {
  if (typeof url !== 'string') throw new TypeError(`url must be type of 'string'`)

  const iframe = document.createElement('iframe')
  iframe.className = 'temp-printing-iframe'

  iframe.src = url
  iframe.style.setProperty('display', 'none', 'important')

  // Load iframe
  document.body.append(iframe)

  await new Promise(resolve => iframe.onload = resolve)

  const winIframe = iframe.contentWindow

  winIframe.print()
  winIframe.onafterprint = event => iframe.remove()
}

/**
 * @typedef ParseHTMLOptions
 * @property {boolean} [parseDeclarativeShadowDOM=false]
 */

/**
 * 
 * @param {string} htmlString 
 * @param {ParseHTMLOptions} options 
 * @returns 
 */
export function parseHTML(htmlString, options = {}) {
  const { parseDeclarativeShadowDOM: parseDSDOM = false } = options

  const trustedHTMLPolicy = trustedTypes.createPolicy('trustedHTML', {createHTML: string => string})

  const template = document.createElement('template')
  template.innerHTML = trustedHTMLPolicy.createHTML(htmlString)

  if (parseDSDOM) {
    template
    .content
    .querySelectorAll('template[shadowroot]:first-child')
    .forEach(template => {
      parseDeclarativeShadowDOM(template.parentElement)
    })
  }

  return template.content
}

export function parseXML(xmlString) {
  return new DOMParser().parseFromString(xmlString, 'text/xml')
}

/**
 * 
 * @param {HTMLElement} hostElement 
 * @returns {boolean} If `false` that means no <template> tag with 'shadowroot' attribute was found as the first child to generate the Shadow DOM in the host element else `true`
 */
export function parseDeclarativeShadowDOM(hostElement) {
  const template = hostElement.querySelector(':scope > template[shadowroot]:first-child')

  const hasTemplate = template != null

  if (!hasTemplate) return false

  template.remove()

  const mode = template.getAttribute('shadowroot')

  const shadowRoot = hostElement.attachShadow({mode})
  shadowRoot.append(template.content)

  return true
}


/**
 * 
 * @param {string} jsonString 
 * @returns {string}
 */
export function removeCommentsInJSON(jsonString) {
  return jsonString.replace(/\/\*[^]*?\*\//g, '').replace(/\/\/.*/g, '')
}

/**
 * 
 * @param {Response} response 
 * @returns {Promise<object>}
 */
export function parseJSONResponseWithComments(response) {
  return response.text().then(text => removeCommentsInJSON(text)).then(text => JSON.parse(text))
}


export function turnStringIntoTrustedHTML(htmlString) {
  const trustedHTMLPolicy = trustedTypes.createPolicy('trustedHTML', {createHTML: string => string})
  return trustedHTMLPolicy.createHTML(htmlString)
}

export function stringToValidInnerHTML(string) {
  const div = document.createElement('div')

  const trustedHTMLPolicy = trustedTypes.createPolicy('trustedHTML', {createHTML: string => string})

  div.innerHTML = trustedHTMLPolicy.createHTML(string)

  return div.innerHTML
}

/**
 * Options object for 'callFunctionInWorker'
 * @typedef TempWorkerOptions
 * @property {[]}         params          Array of parameters to call 'func'.
 * @property {[]}         transferables   Array of Tranferable objects to transfer to the Worker. See 'https://developer.mozilla.org/en-US/docs/Glossary/Transferable_objects'.
 * @property {function}   messageCallback Callback to execute when the Worker use 'postMessage' method. The data to pass to the callback will be done like this: self.postMessage({message: 'data'}).
 * @property {number}     timeout         Number of miliseconds to cancel the Worker.
 * @property {function[]} imports         Array of functions to be imported in the worker. (They must be normal functions since they are stringify in the process and use as declaration)
 */

/**
 * Execute function in a temporal Worker
 *
 * @param {function} func Callback to execute in the Worker. Its return value will be contained in the Promise returned by the function.
 * @param {TempWorkerOptions} options
 *
 * @return {Promise} Promise that resolves in the value returned by the callback.
 */
export function callFunctionInWorker(func, options = {}) {
  const {params = [], transferables = [], messageCallback = function(message) {}, timeout, imports = []} = options

  if (!(func instanceof Function))            throw new TypeError(`func must be a function`)
  if (!(messageCallback instanceof Function)) throw new TypeError(`messageCallback must be a function`)

  if (!Array.isArray(params))                 throw new TypeError(`params must be an array`)
  if (!Array.isArray(transferables))          throw new TypeError(`transferables must be an array`)

  let funcToString = func.toString()

  const isValidFunctionSyntax = (/function(\s|\(.*\))/).test(funcToString) || (/([a-zñ|A-ZÑ|_|$]|\(.*\))\s*=>/).test(funcToString)

  if (!isValidFunctionSyntax) funcToString = 'function ' + funcToString

  const blobString = // js
  `
  //# sourceURL=temp-worker.js

  const callback = ${funcToString}

  // Imports

  ${imports.join('\n\n')}


  // Main part of the code where execution happens

  self.onmessage = event => {

    try {
      Promise.resolve(callback(...event.data))
      .then(result => {
        const transferables = filterTransferable(event.data)
        self.postMessage({result}, transferables)
      })
      .catch(error => self.postMessage({error}))

    } catch(error) {self.postMessage({error})}


    // Necesary imports to get the transferables in 'event.data'

${filterTransferable}

${isInstanceOfAny}

  } // self.onmessage
  `.trimIndent()

  // Create temporal URI to create a Worker for the function
  const tempBlob = new Blob([blobString], {type: 'application/javascript'})
  const tempURI = URL.createObjectURL(tempBlob)

  const worker = new Worker(tempURI)

  try {
    worker.postMessage(params, transferables)
  } catch(error) {
    worker.terminate()
    URL.revokeObjectURL(tempURI)

    return Promise.reject(error)
  }

  // Terminate Worker and free Blob from memory once the Worker has finished
  // and resolve the Promise with the return value of the function
  return new Promise((resolve, reject) => {

    let workerTimeout

    worker.onmessage = event => {
      if (!event.data) return
      if ('message' in event.data)   return messageCallback(event.data.message)
      if (!('result' in event.data) && !('error' in event.data)) return

      worker.terminate()
      URL.revokeObjectURL(tempURI)

      clearTimeout(workerTimeout)

      if ('result' in event.data) resolve(event.data.result)
      else
      if ('error'  in event.data) reject(event.data.error)
    }

    if (typeof timeout === 'number') {
      workerTimeout = setTimeout(() => {
        worker.terminate()
        URL.revokeObjectURL(tempURI)

        reject(`Timeout of ${timeout} miliseconds was reached`)
      }, timeout)
    }

  })
}

export function filterTransferable(transferables) {
  const {ArrayBuffer, MessagePort, ReadableStream, WritableStream, TransformStream, AudioData, ImageBitmap, VideoFrame, OffscreenCanvas, RTCDataChannel} = self
  const transferableObjects = [
    ArrayBuffer,
    MessagePort,
    ReadableStream,
    WritableStream,
    TransformStream,
    AudioData,
    ImageBitmap,
    VideoFrame,
    OffscreenCanvas,
    RTCDataChannel
  ]
  return transferables.filter(t => isInstanceOfAny(t, transferableObjects))
}

export function decimalToHex(r, g, b, a) {
  let rgba = [r, g, b, a]

  rgba = rgba.map(c => c.toString(16))
  // Añadir 0 a la izquierda si solo hay un carácter
  rgba = rgba.map(c => c.length === 1 ? `0${c}` : c);

  [r, g, b, a] = rgba


  // Si los dígitos están duplicados usar la forma simplificada
  if(
    r[0] === r[1] &&
    g[0] === g[1] &&
    b[0] === b[1] &&
    a[0] === a[1]
  ) {
    rgba = rgba.map(c => c[0])
  }

  return rgba
}


export function getImageData(img) {

  // Creación del canvas
  const canvas = document.createElement('canvas');
  canvas.width  = img.naturalWidth  ?? img.videoWidth  ?? img.width;
  canvas.height = img.naturalHeight ?? img.videoHeight ?? img.height;

  // Creación del contexto de dibujo del canvas
  const ctx = canvas.getContext('2d');

  // Dibujar la imágen en el canvas con su mismo tamaño
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Obtener y almacenar la información de cada pixel
  const dataPixel = ctx.getImageData(0, 0, canvas.width, canvas.height);

  return dataPixel;

}

export function imageToBoxShadow(image, pixelSize, returnGradientCode = false) {
  const pixelData = getImageData(image)

  let cssRule = '';

  let cssData = '';

  let offsetX = 0;
  let offsetY = 0;

  if (pixelSize == null) pixelSize = 1;

  for(let i = 0; i < pixelData.data.length; i += 4, offsetX += pixelSize) {

    // Si el 'offsetX' es igual al ancho de la imagen, reinciarlo a 0
    offsetX == pixelData.width * pixelSize ? [offsetX = 0, offsetY += pixelSize] : "";

    // Si la opacidad del píxel es 0, no añadir al 'box-shadow'
    if(pixelData.data[i + 3] === 0) continue

    // RGBA
    //cssData += `${offsetX}px ${offsetY}px 0px ${pixelSize / 2}px rgba(${pixelData.data[i + 0]}, ${pixelData.data[i + 1]}, ${pixelData.data[i + 2]}, ${pixelData.data[i + 3]}),`;

    /****************************************/
    /****************************************/
    /****************************************/

    const [r, g, b, a] = decimalToHex( ...pixelData.data.slice(i, i + 4) );

    const color = `#${r+g+b+((a !== 'ff' && a !== 'f') ? a : '')}`

    if (!returnGradientCode) cssData += `${offsetX}px ${offsetY}px 0px ${pixelSize / 2}px ${color},`
    else										 cssData += `linear-gradient(0, ${color}, ${color}) ${offsetX}px ${offsetY}px,`;

  }

  cssData = cssData.slice(0,-1);

  if (!returnGradientCode) {
    cssRule =
`
.bg::after {
  content: '';
  width: 1px;
  height: 1px;

  box-shadow:
  ${cssData}
  ;
}
`
  } else {
    cssRule =
`
.bg {
  background:
  ${cssData}
  ;

  background-size: ${pixelSize}px ${pixelSize}px;
  background-repeat: no-repeat;
}
`
  }

  return cssRule
}

export function imageToConsoleLog(image) {
  const pixelData = getImageData(image)

  if (pixelData.width * pixelData.height < 10000) {
    return console.error("ERROR: image size is too large");
  }

  var width = pixelData.width;
  var height = pixelData.height;

  var O = "OO";

  var output = "";
  var pixel = "";
  var color = "";
  var colum = '';

  // Columns Index
  for (let i = 1, c = 1; i <= width; i++) {

    if (c < 10) {
      // Si es menor que 10 el indice poner doble espacio a la derecha, si no un espacio;
      colum += ' ' + c + ' ';
    } else {
      colum += '' + c + ' ';
    }

    c++;

    if (c > 99) {
      // Si supera 99 de ancho se vuelve a empezar contando desde el 0
      c = 0;
    }

  }

  // Escribir variable "O" de pixeles en el "console.log"
  for (let i = 1, h = 1; i <= height; i++) {
    pixel += "/*" + h + "*/\t\t";
    // Raws Index

    for (let j = 1; j <= width; j++) {
      pixel += O + (i == height && j == width ? "" : "+");
    }

    if (i < height) {
      pixel += "'\\n'+";
    }

    if (i != height) {
      pixel += "\n";
    }

    h++;

    if (h > 99) {
      // Si supera 99 de alto se vuelve a empezar contando desde el 0
      h = 0;
    }
  }


  for (let i = 0, w = 1, h = 1; i <= pixelData.data.length - 4; i += 4, w++) {
    if(w == 1) {
      color += "/*" + h + "*/\t\t";
    }
    // Raws Index

    // RGBA
    //color += '"background: rgba(' + data.data[i + 0] + ', ' + data.data[i + 1] + ', ' + data.data[i + 2] + ', ' + data.data[i + 3] + ')",';

    /****************************************/
    /****************************************/
    /****************************************/

    // Hexadecimal
    let r = pixelData.data[i + 0];
    let g = pixelData.data[i + 1];
    let b = pixelData.data[i + 2];
    let a = pixelData.data[i + 3];

    [r, g, b, a] = decimalToHex(r, g, b, a);

    color += `"background: #${r}${g}${b}${(a !== "ff" && a !== "f") ? a : ""}",`;

    if(w === width && h != height) {
      h++;
      color += "\n";
      w = 0;
    }

    //h++;

    if (h > 99) {
      // Si supera 99 de alto se vuelve a empezar contando desde el 0
      h = 0;
    }
  }

  color = color.slice(0,-1);

  // Codigo resultante
  output = `
// Pixel
var OO = '%c  ';

// Colors
var bg = 'background: ';

var tt = bg + 'transparent'; // Pixel Empty


// ${width}x${height} px
console.log(

// Pixels\t${colum}
${pixel}
,

// Colores\t${colum}
${color}

);

`;
  //console.log("Done!!!")
  return output;

}


export function generateHTMLTemplate(doc = document) {
  const css = // css
  `
  /*# sourceURL=stylesheet.temp.css */
  @charset "UTF-8";

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :where(:not(:defined)) {
    display: block;
  }

  :root {
    --fit-content: fit-content;
  }

  @supports (width: -moz-fit-content) {
    :root {
      --fit-content: -moz-fit-content;
    }
  }



  :root {
    color: #fff;
    font-family: Arial;
    user-select: none;
  }

  html, body {
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow: hidden;

    background-color: #111;
  }

  #app, #app-content {
    width: 100%;
    height: 100%;

    background-color: inherit;
  }

  #app-content {
    position: relative;
    padding: 1rem;

    overflow: auto;
  }


  [hidden] {
    display: none !important;
  }

  img, canvas, svg, picture,
  video, audio,
  iframe, object, embed,
  input, select, textarea,
  button,
  progress, meter {
    display: block;
  }

  fieldset {
    margin: 0;
    padding: 0.6rem 0.8rem;
    border: solid 2px #c0c0c0;
  }

  legend {
    border: none;
    padding: 0.3em;
  }

  iframe {
    border: none;
  }

  blockquote {
    margin: 0;
  }

  figure {
    margin: 0;
  }

  source {
    display: none;
  }

  hr {
    border: none;
    background-color: #ccc;
    height: 0.2em;
    margin: 0.5em auto;
  }


  :where(
  td,
  details, summary,
  span, a,
  blockquote, q, cite,
  address,
  li, dt, dd,
  dfn,
  ruby,
  abbr,
  bdi, bdo,
  data, time,
  figcaption,
  p, h1, h2, h3, h4, h5, h6,
  u, s,
  samp,
  b, strong, i, em, mark, small, ins, del, sub, sup,
  pre, code, var, kbd, output
  ) {
    user-select: text;
  }

  .max-z-index {
    z-index: 2147483647;
  }
  `.trimIndent()

  const html = // html
  `
  <!DOCTYPE html>
  <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Document</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
          <meta name="theme-color" content="#444">
          <meta name="color-scheme" content="dark">
          <!--<link rel="stylesheet" href="default.css">-->
          <style class="default-css">${css}</style>
          <script>
          // Always remove text selection when the user clicks on any part of the document
          // This is to avoid those annoying times when you want to remove the selection but you can't
          window.addEventListener('mousedown', event => {
            if (event.button === 0) window.getSelection().empty()
          })
          </script>
          <script type="module" src="chrome-extension://${extensionId}/user-scripts/@all-urls/scripts/main.mjs"></script>
      </head>
      <body>
          <div id="app">
              <div id="app-content">
                  <h1>My Website</h1>
              </div>
          </div>
      </body>
  </html>
  `.trimIndent()


  // Remove adoptedStyleSheets
  doc.adoptedStyleSheets = []

  doc.write(html)
  doc.close()
}

/**
 * 
 * @returns {HTMLIFrameElement}
 */
export function generateOverlayIframe() {
  /**
   * @type {HTMLIFrameElement}
   */
  const iframe = createElement('iframe', {properties: {srcdoc: '<!DOCTYPE html><style>html, body {width:100%; height: 100%; margin: 0; padding: 0;}</style>', style: 'border: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 99999999999;'}})
  document.body.append(iframe)

  promiseDocumentLoad(iframe, {skipReadyStateCheck: true}).then(iframe => {
    // Append color-scheme meta tag to match the parent color-scheme and keep the iframe transparent
    const metaColorScheme = document.querySelector('meta[name="color-scheme"]')

    if (metaColorScheme) {
      iframe.contentDocument.head.append(metaColorScheme.cloneNode())
    }
  })

  return iframe
}


export function downloadURL(url, name = null) {
  const a = document.createElement('a')
  a.href = url
  a.download = name ?? ''
  a.click()
}

export function downloadFile(file, name = null) {
  if (!(file instanceof Blob)) throw new TypeError(`parameter 1 must be an instance of 'Blob`)

  const urlFile = URL.createObjectURL(file)

  const a = document.createElement('a')
  a.href = urlFile
  a.download = name ?? file.name ?? `file.${file.type.split('/')[1] ?? 'unknown'}`
  a.click()

  URL.revokeObjectURL(urlFile)
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
 * @param {string} selector 
 * @param {{onExist: (element: Element) => any, onRemove: () => any}} options 
 */
export async function handleSelectorLifeCycle(selector, options) {
  const {onExist, onRemove} = options

  const element = document.querySelector(selector)

  if (element) onExist?.(element)
  else         onRemove?.()

  await waitForSelector(selector, {checkOpposite: element ? true : false, useSetTimeout: true})
  handleSelectorLifeCycle(selector, {onExist, onRemove})
}



const checkTimeLabelMap = {}

/**
 * Función que devuelve el tiempo que pasa desde que la función
 * es invocada la primera vez con una etiqueta hasta las demás veces que se invoca
 * Poner el segundo parámetro a 'true' hace que se termine de contar con la etiqueta especificada
 */
export function checkTime(label, end = false) {
  if (checkTimeLabelMap[label] == null) {
    checkTimeLabelMap[label] = performance.now()
    return 0
  }

  const time = performance.now() - checkTimeLabelMap[label]
  if(end) delete checkTimeLabelMap[label]

  return time
}


/**
 * 
 * @param {HTMLElement | Document} node 
 * @returns {{[key: string]: HTMLElement}}
 */
export function getAllElementsMapWithId(node = document) {
  if (node == null) throw new TypeError(`param 1 cannot be null or undefined`)
  if (!(node instanceof Element || node instanceof Document)) throw new TypeError(`param 1 must be an instance of Element or Document`)

  const elements = node.querySelectorAll('[id]')

  const map = {}

  elements.forEach(element => {
    const key = hyphenToLowerCase(element.id)

    if (key === '') throw new DOMException(`'id' attribute cannot be empty`)

    if (key in map) throw new DOMException(`'id' attribute must be unique:\n#${element.id}`)

    map[key] = element
  })

  return map
}

/**
 * 
 * @param {Element | Document | DocumentFragment} node 
 * @param {boolean} removeBracketIds
 * @returns {{[key: string]: Element}}
 */
 export function getAllElementsMapWithBracketsId(node = document, removeBracketIds = false) {
  if (node == null) throw new TypeError(`param 1 cannot be null or undefined`)
  if (!(node instanceof Element || node instanceof Document || node instanceof DocumentFragment)) {
    throw new TypeError(`param 1 must be an instance of Element, Document or DocumentFragment`)
  }

  const elements = [...getElementsByAttribute('[id]', {startNode: node})]

  if (node instanceof Element) {
    elements.unshift(node)
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
 * 
 * @param {HTMLElement | Document} node 
 * @returns {{[key: string]: HTMLElement}}
 */
export function getChildElementsMapWithClasses(node) {
  if (node == null) throw new TypeError(`param 1 cannot be null or undefined`)
  if (!(node instanceof Element || node instanceof Document)) throw new TypeError(`param 1 must be an instance of Element or Document`)

  const elements = [...node.children]

  const map = {}

  elements.forEach(child => {
    const classToken = [...child.classList].filter(classToken => /[a-zñA-ZÑ]/.test(classToken))[0]

    if (classToken == null) return

    if (classToken in map)
      map[classToken].push(child)
    else
      map[classToken] = [child]
  })

  return map
}


// http://rscss.io

/**
 * 
 * @param {HTMLElement | Document} node 
 * @returns {{[key: string]: HTMLElement}}
 */
export function getAllElementsMapWithDataJSAttribute(node = document) {
  if (node == null) throw new TypeError(`param 1 cannot be null or undefined`)
  if (!(node instanceof Element || node instanceof Document)) throw new TypeError(`param 1 must be an instance of Element or Document`)

  const elements = node.querySelectorAll('*')

  const map = {}

  elements.forEach(element => {
    const dataJSPrefix = 'data-js-'
    const attribute = [...element.attributes].filter(attribute => attribute.name.startsWith(dataJSPrefix))[0]

    if (attribute == null) return

    const name  = hyphenToLowerCase(attribute.name.slice(dataJSPrefix.length))

    if (name in map) throw new DOMException(`data attribute js must be unique:\n[${attribute.name}]`)

    map[name] = element
  })

  return map
}


export function stringify(object) {

  const isObject = object => object instanceof Object && !Array.isArray(object)

  let typeChar = []

  if (isObject(object)) {
    typeChar = ['{', '}', '{}']
  }
  else if (Array.isArray(object)) {
    typeChar = ['[', ']', '[]']
  }

  else throw new TypeError('paremeter 1 must be an Object or an Array')


  let json = ''

  const entries = Object.entries(object)

  if (entries.length === 0) return typeChar[2]

  json = typeChar[0]

  for (let [property, value] of entries) {

    if (typeof value === 'object') value = stringify(value)
    else
    if (typeof value === 'string') value = `"${value}"`

    if (typeChar[2] === '{}') json += `"${property}":${value},`
    else
    if (typeChar[2] === '[]') json += `${value},`

  }

  json = json.slice(0, -1) + typeChar[1]

  return json

}


export function isInstanceOfAny(obj, parentObjects) {
  for (let i = 0; i < parentObjects.length; i++) {
    try {
      if (obj instanceof parentObjects[i]) return true
    } catch (error) {}
  }

  return false
}

/**
 * 
 * @param {EventTarget} target 
 * @param {string} eventName
 * @param {number} timeout 
 * @returns 
 */
export function promisefyEvent(target, eventName, timeout = null) {
  return new Promise(resolve => {
    const abortController = new AbortController()

    target.addEventListener(eventName, event => resolve(), {once: true, signal: abortController.signal})

    if (typeof timeout === 'number') {
      setTimeout(() => {
        abortController.abort()
        resolve()
      }, timeout)
    }
  })
}


export function showNativeCalculator() {
  const iframe = document.createElement('iframe')
  iframe.src = 'calculator:' // calculator scheme / protocol
  iframe.style.display = 'none'
  document.documentElement.append(iframe)
  window.addEventListener('blur', () => iframe.remove(), {once: true})
}


export function slideArray(arr, n = 1) {
  if (n === 0 || arr.length === 0) return arr

  n = n % arr.length

  const slot = n > 0 ? arr.slice(-n) : arr.slice(0, -n)
  let cursor

  if (n > 0) {
    for (let i = arr.length - 1; i >= 0; i--) {
      cursor = i - n

      if (cursor < 0) {
        cursor = arr.length + cursor
      }

      arr[i] = arr[cursor]
    }

    for (let i = 0; i < slot.length; i++) {
      arr[i] = slot[i]
    }
  } else {
    for (let i = 0; i < arr.length; i++) {
      cursor = i - n

      if (cursor >= arr.length) {
        cursor = cursor - arr.length
      }

      arr[i] = arr[cursor]
    }

    for (let i = 0; i < slot.length; i++) {
      arr[arr.length - slot.length + i] = slot[i]
    }
  }

  return arr
}


export function generateFloatingIframe(addDefaults = true) {
  const mouse = new MouseInfo()

  const containerWrapper = document.createElement('div')
  containerWrapper.classList.add('wrapper-container-float-iframe')

  const shadowRoot = containerWrapper.attachShadow({mode: 'open'})

  const floatIframeContainer = shadowRoot.appendChild(document.createElement('div'))
  floatIframeContainer.classList.add('float-iframe-container')

  ;['mousemove', 'touchmove'].forEach(eventType => {
    document.addEventListener(eventType, evt => {
      if (!mouse.isDown || mouse.mouseDownButton !== 0) return
      if (mouse.target !== floatIframeContainer) return

      const event = evt.touches ? evt.touches[0] : evt
      
      iframe.classList.add('no-user-interaction')
  
      const movementX = event.clientX - mouse.previousClientX
      const movementY = event.clientY - mouse.previousClientY
  
      const rect = containerWrapper.getBoundingClientRect()
  
      containerWrapper.style.left = `${rect.x + rect.width  / 2 + movementX}px`
      containerWrapper.style.top  = `${rect.y + rect.height / 2 + movementY}px`
    })
  })

  ;['mouseup', 'touchend'].forEach(eventType => {
    document.addEventListener(eventType, event => iframe.classList.remove('no-user-interaction'))
  })

  // Share mousdown event from Shadow DOM
  shadowRoot.addEventListener('mousedown', event => mouse.pointerDown(event))

  const iframe = floatIframeContainer.appendChild(document.createElement('iframe'))
  iframe.classList.add('float-iframe')

  const buttonsContainer = floatIframeContainer.appendChild(document.createElement('div'))
  buttonsContainer.classList.add('iframe-buttons')

  const fullscreenButton = buttonsContainer.appendChild(document.createElement('button'))
  fullscreenButton.classList.add('btn-iframe-fullscreen')
  fullscreenButton.innerHTML =
  `
  <svg viewBox="-30 -156 1600 1600">
    <path d="M 1283,995 928,640 1283,285 1427,429 q 29,31 70,14 39,-17 39,-59 V -64 q 0,-26 -19,-45 -19,-19 -45,-19 h -448 q -42,0 -59,40 -17,39 14,69 L 1123,125 768,480 413,125 557,-19 q 31,-30 14,-69 -17,-40 -59,-40 H 64 q -26,0 -45,19 -19,19 -19,45 v 448 q 0,42 40,59 39,17 69,-14 L 253,285 608,640 253,995 109,851 Q 90,832 64,832 52,832 40,837 0,854 0,896 v 448 q 0,26 19,45 19,19 45,19 h 448 q 42,0 59,-40 17,-39 -14,-69 l -144,-144 355,-355 355,355 -144,144 q -31,30 -14,69 17,40 59,40 h 448 q 26,0 45,-19 19,-19 19,-45 V 896 q 0,-42 -39,-59 -13,-5 -25,-5 -26,0 -45,19 z" style="fill: currentColor"/>
  </svg>
  `
  fullscreenButton.addEventListener('click', event => iframe.requestFullscreen())

  const removeButton = buttonsContainer.appendChild(document.createElement('button'))
  removeButton.classList.add('btn-remove-iframe')
  removeButton.innerHTML = 'X'
  removeButton.addEventListener('click', event => containerWrapper.remove())
  

  const stylesheet = new CSSStyleSheet()
  
  shadowRoot.adoptedStyleSheets = [stylesheet]

  const css = // css
  `
  :host {
    all: revert;

    font-size: 16px;

    width: 500px;
    height: 300px;

    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 2147483647;

    transform:
    translateX(-50%)
    translateY(-50%)
    ;

    background-color: #222;
    box-shadow: 0 0 10px 0 #fff9;

    border-radius: 1em;

    overflow: hidden;
    resize: both;

    user-select: none;

    transition: none !important;
    animation: none !important;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .float-iframe-container {
    box-sizing: border-box;

    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    gap: 0.5em;

    padding: 1rem !important;
  }

  .no-user-interaction {
    pointer-events: none;
  }

  .max-z-index {
    z-index: 2147483647;
  }

  iframe {
    display: block;
    border: none;
  }

  svg {
    display: block;
  }

  .float-iframe {
    width: 100%;
    flex-grow: 1;
    /* Let the flex-item shrink */
    min-height: 0;

    outline: solid 2px #ccc;
  }

  .iframe-buttons {
    display: flex;
    align-items: center;
    justify-content: space-around;

    padding: 0.2em;

    pointer-events: none;
  }

  .iframe-buttons > * {
    pointer-events: auto;
  }

  button {
    all: unset;
    background-color: #444;
    color: #fff;
    padding: 0.5em;

    border-radius: 0.2em;

    cursor: pointer;
  }

  .btn-iframe-fullscreen {
    font-size: 1.5em;
    width: 1em;
  }

  .btn-iframe-fullscreen:hover {
    background-color: #666;
  }

  .btn-remove-iframe {
    display: grid;
    place-items: center;
    font-size: 1.5em;
    width: 1em;
    background-color: #f00;

    font-weight: bold;
    font-family: Arial;
  }

  .btn-remove-iframe:hover {
    background-color: #f33;
  }
  `

  stylesheet.replace(css)

  document.body.prepend(containerWrapper)

  if (addDefaults) {
    generateHTMLTemplate(iframe.contentDocument)

    // Wait for iframe load
    promiseDocumentLoad(iframe)
    .then(ifr => {
      const h1 = ifr.contentDocument?.querySelector('h1')
      if (h1) h1.innerHTML = 'Iframe Testing'
    })
  }

  return iframe
}

/**
 * 
 * @param {Document|HTMLIFrameElement} doc 
 * @param {{skipReadyStateCheck}} options
 * @returns {Promise<Document|HTMLIFrameElement>}
 */
export function promiseDocumentLoad(doc, options = {}) {
  const {skipReadyStateCheck = false} = options

  return new Promise((resolve, reject) => {
    if (doc instanceof HTMLIFrameElement) {
      if (doc.contentDocument == null) return reject(new TypeError(`Cannot access document from iframe element`))
      if (!skipReadyStateCheck && (doc.contentDocument.readyState === 'complete' || doc.contentDocument.readyState === 'interactive')) {
        return resolve(doc)
      }
    }
    else {
      if (!(doc instanceof Document)) return reject(new TypeError(`param 1 must be an instance of HTMLIframeElement or Document`))
      if (!skipReadyStateCheck && (doc.readyState === 'complete' || doc.readyState === 'interactive')) {
        return resolve(doc)
      }
    }

    doc.addEventListener('load', event => resolve(doc), {once: true})
  })
}

export function defineObjProperties(obj, propertiesObj = {}) {
  for (const prop in propertiesObj) {
    Object.defineProperty(obj, prop, {value: propertiesObj[prop]})
  }
}


export class EventDispatcherWrapper {

  constructor(target) {
    const Class = EventDispatcherWrapper
    const symbolTarget = Class.#symbolTarget

    this.events          = {[symbolTarget]: target, ...Class.events}
    this.clipboardEvents = {[symbolTarget]: target, ...Class.clipboardEvents}
    this.mouseEvents     = {[symbolTarget]: target, ...Class.mouseEvents}
    this.touchEvents     = {[symbolTarget]: target, ...Class.touchEvents}
    this.pointerEvents   = {[symbolTarget]: target, ...Class.pointerEvents}
    this.keyboardEvents  = {[symbolTarget]: target, ...Class.keyboardEvents}
  }

  static #symbolTarget = Symbol('target')

  static events = {

    scroll(options, forceProperties = false) {
      const event = new Event('click', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    }

  }

  static clipboardEvents = {

    copy(options, forceProperties = false) {
      const event = new ClipboardEvent('copy', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    paste(options, forceProperties = false) {
      const event = new ClipboardEvent('paste', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    }

  }

  static mouseEvents = {

    click(options, forceProperties = false) {
      const event = new MouseEvent('click', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    contextmenu(options, forceProperties = false) {
      const event = new MouseEvent('contextmenu', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    dblclick(options, forceProperties = false) {
      const event = new MouseEvent('dblclick', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    auxclick(options, forceProperties = false) {
      const event = new MouseEvent('auxclick', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    wheel(options, forceProperties = false) {
      const event = new MouseEvent('wheel', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    mousedown(options, forceProperties = false) {
      const event = new MouseEvent('mousedown', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    mouseup(options, forceProperties = false) {
      const event = new MouseEvent('mouseup', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    mousemove(options, forceProperties = false) {
      const event = new MouseEvent('mousemove', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    mouseenter(options, forceProperties = false) {
      const event = new MouseEvent('mouseenter', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    mouseleave(options, forceProperties = false) {
      const event = new MouseEvent('mouseleave', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    mouseover(options, forceProperties = false) {
      const event = new MouseEvent('mouseover', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    mouseout(options, forceProperties = false) {
      const event = new MouseEvent('mouseout', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    }

  }

  static touchEvents = {

    touchstart(options, forceProperties = false) {
      const event = new TouchEvent('touchstart', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    touchmove(options, forceProperties = false) {
      const event = new TouchEvent('touchmove', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    touchend(options, forceProperties = false) {
      const event = new TouchEvent('touchend', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    touchcancel(options, forceProperties = false) {
      const event = new TouchEvent('touchcancel', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    }

  }

  static pointerEvents = {

    click(options, forceProperties = false) {
      const event = new PointerEvent('click', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    pointerenter(options, forceProperties = false) {
      const event = new PointerEvent('pointerenter', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    pointerleave(options, forceProperties = false) {
      const event = new PointerEvent('pointerleave', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    pointermove(options, forceProperties = false) {
      const event = new PointerEvent('pointermove', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    pointerover(options, forceProperties = false) {
      const event = new PointerEvent('pointerover', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    pointerout(options, forceProperties = false) {
      const event = new PointerEvent('pointerout', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    pointerup(options, forceProperties = false) {
      const event = new PointerEvent('pointerup', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    pointerdown(options, forceProperties = false) {
      const event = new PointerEvent('pointerdown', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    pointercancel(options, forceProperties = false) {
      const event = new PointerEvent('pointercancel', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    gotpointercapture(options, forceProperties = false) {
      const event = new PointerEvent('gotpointercapture', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    lostpointercapture(options, forceProperties = false) {
      const event = new PointerEvent('lostpointercapture', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },

  }

  static keyboardEvents = {

    keydown(options, forceProperties = false) {
      const event = new KeyboardEvent('keydown', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    keypress(options, forceProperties = false) {
      const event = new KeyboardEvent('keypress', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },
    keyup(options, forceProperties = false) {
      const event = new KeyboardEvent('keyup', options)
      if (forceProperties) defineObjProperties(event, options)
      return this[EventDispatcherWrapper.#symbolTarget].dispatchEvent(event)
    },

  }

}
