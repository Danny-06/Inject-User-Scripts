export const lowerCaseToHyphen = string => string.split(/(?=[A-Z])/).map(str => str.toLowerCase()).join('-')

export const hyphenToLowerCase = string => string.split('-').map((str, index) => index !== 0 ? str[0].toUpperCase() + str.slice(1) : str).join('')



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
 * @param {HTMLElement | Document | DocumentFragment} node 
 * @returns {{[key: string]: HTMLElement}}
 */
export function getAllElementsMapWithDataJSAttribute(node = document) {
  if (node == null) throw new TypeError(`param 1 cannot be null or undefined`)
  if (!(node instanceof Element || node instanceof Document || node instanceof DocumentFragment)) throw new TypeError(`param 1 must be an instance of Element, Document or DocumentFragment`)

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

/**
 * 
 * @param {string} accept 
 * @param {boolean} multiple 
 * @returns {File | File[]}
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

  return new Promise(resolve => reader.onloadend = () => resolve(reader.result));
}

export function promiseWrapper(promise) {
  if (!('then' in promise)) throw new TypeError(`param 1 must be a thenable`)

  return new Promise(resolve => {
    promise
    .then(
      value => resolve([value, null]),
      reason => resolve([null, reason])
    )
  })
}

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
    const div = document.createElement('div')
    div.innerHTML = `<div ${attrName}="${attrValue}"></div>`
  
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

