import { LocalDB } from './libs/localDB.js'


const storageKey = 'appStorage'

const storageManager = await LocalDB.createLocalDB('personal-storage')

export async function requestBGFileAndSave() {
  const file = await requestFile('image/*, video/*')
  setBgFromStorage(file)

  return file
}

export async function getStorageData() {
  return await storageManager.getItem(storageKey) ?? {}
}

export function setStorageData(value) {
  return storageManager.setItem(storageKey, value)
}


export async function setBgFromStorage(bgBlob) {
  const storageData = await getStorageData()
  storageData.bgApp = bgBlob
  await setStorageData(storageData)
}













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
    if (element.id === '') throw new DOMException(`'id' attribute cannot be empty`)

    if (element.id in map) throw new DOMException(`'id' attribute must be unique:\n#${element.id}`)

    map[element.id] = element
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
