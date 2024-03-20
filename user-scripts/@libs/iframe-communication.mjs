/**
 * @typedef {typeof MESSAGE_TYPE} MessageType
 */

/**
 * @typedef CommunicationDataSent
 * @property {MessageType} type
 * @property {number} id
 * @property {string} stringifiedCallback
 * @property {string} stringifiedSharedFunctions
 * @property {unknown[]} args
 */

/**
 * @typedef {(event: MessageEvent<CommunicationDataSent>) => void} CommunicationMessageSentListener
 */

/**
 * @typedef CommunicationDataReceived
 * @property {MessageType} type
 * @property {number} id
 * @property {{state: 'fulfilled', value: unknown} | {state: 'rejected', reason: unknown}} result
 */

/**
 * @typedef {(event: MessageEvent<CommunicationDataReceived>) => void} CommunicationMessageReceivedListener
 */

const MESSAGE_TYPE = 'frame-communication'

const scriptNonce = document.querySelector('script[nonce]')?.nonce


/**
 * 
 * @param {string} scriptContent
 * @returns {HTMLScriptElement} 
 */
function createScriptForTaskFromString(scriptContent, stringifiedSharedFunctions) {
  const script = document.createElement('script')

  if (scriptNonce) {
    script.nonce = scriptNonce
  }

  script.innerHTML = /* js */ `
    document.currentScript.addEventListener('message-script-sharing', event => {
      const { type, id, frameWindow, args } = event.detail

      /**@type {CommunicationDataReceived} */
      const message = {
        type,
        id
      }

      const task = new Promise((resolve, reject) => {
        try {
          const value = (${scriptContent})((args ?? []), ${stringifiedSharedFunctions})
          resolve(value)
        } catch (reason) {
          reject(reason)
        }
      })

      task.then(
        value => frameWindow.postMessage({...message, result: {state: 'fulfilled', value}}, {targetOrigin: '*'}),
        reason => frameWindow.postMessage({...message, result: {state: 'rejected', reason}}, {targetOrigin: '*'}),
      )
    }, {once: true})
  `

  return script
}

/**
 * Messages received from other frames.
 * @type {(event: MessageEvent<CommunicationDataSent | CommunicationDataReceived>) => void}
 */
const messageFromOtherFramesListener = event => {
  const { stringifiedCallback, args, stringifiedSharedFunctions } = event.data

  // If it doesn't contain this property, it is a message answer to `runTaskInFrame()`
  if (typeof stringifiedCallback !== 'string') {
    return
  }

  const script = createScriptForTaskFromString(stringifiedCallback, stringifiedSharedFunctions)

  document.head.append(script)

  script.remove()

  const eventDetail = {
    type: MESSAGE_TYPE,
    id: event.data.id,
    frameWindow: event.source,
    args,
  }

  const customEvent = new CustomEvent('message-script-sharing', {detail: eventDetail})

  script.dispatchEvent(customEvent)
}


window.addEventListener('message', messageFromOtherFramesListener)


/**
 * @typedef RunTaskOptions
 * @property {(...args: unknown[]) => unknown} callback
 * @property {unknown[]} [args] Array of transferable object to pass to the callback
 * @property {{[key: string]: (...args: unknown[]) => unknown}} [sharedFunctions] 
 */

/**
 * 
 * @param {Window} frameWindow 
 * @param {RunTaskOptions} options 
 * @returns {Promise<unknown>}
 */
export function runTaskInFrame(frameWindow, options = {}) {
  const { callback, args = [], sharedFunctions = {} } = options

  const sharedFunctionsToString = (() => {
    if (!sharedFunctions || typeof sharedFunctions !== 'object') {
      return {}
    }

    let result = '{'

    for (const key in sharedFunctions) {
      result += `${key}: ${sharedFunctions[key].toString()},`
    }

    result += '}'

    return result
  })()

  return new Promise((resolve, reject) => {
    /**@type {CommunicationDataSent} */
    const message = {
      type: MESSAGE_TYPE,
      id: performance.now(),
      stringifiedCallback: String(callback),
      stringifiedSharedFunctions: sharedFunctionsToString,
      args,
    }

    frameWindow.postMessage(message, {targetOrigin: '*'})

    /**@type {CommunicationMessageReceivedListener}*/
    const messageListener = event => {
      const { data } = event

      if (data.id !== message.id) {
        return
      }

      window.removeEventListener('message', messageListener)

      if (data.result.state === 'rejected') {
        reject(data.result.reason)
        return
      }

      resolve(data.result.value)
    }

    window.addEventListener('message', messageListener)
  })
}

if (window !== window.top && location.protocol === 'chrome-extension:') {
  window.addEventListener('message', async event => {
    const { type, args } = event.data

    if (type !== 'cross-fetch-request') {
      return
    }

    const [input, init, options] = args

    window.fetch(input, init)
    .then(response => {
      switch (options?.format) {

        case 'text': {
          return response.text()
        }

        case 'blob': {
          return response.blob()
        }

        case 'arrayBuffer': {
          return response.arrayBuffer()
        }

        case 'json': {
          return response.json()
        }

        default: {
          return response.blob()
        }
      }
    })
    .then(
      value => window.top.postMessage({type: 'cross-fetch-response', value}, {targetOrigin: '*'}),
      reason =>  window.top.postMessage({type: 'cross-fetch-response', reason}, {targetOrigin: '*'}),
    )
  })
}

/**
 * @typedef {boolean | string | number} JSONPrimitive
 */

/**
 * @typedef {{[key: string]: JSONPrimitive | JSONObject | JSONArray} | null} JSONObject
 */

/**
 * @typedef {Array<JSONPrimitive | JSONObject>} JSONArray
 */

/**
 * @typedef {JSONPrimitive | JSONObject | JSONArray} JSONData
 */

/**
 * 
 * @template {'text' | 'blob' | 'arrayBuffer' | 'json' | undefined | null} T
 * @param {Parameters<typeof fetch>[0]} input 
 * @param {Parameters<typeof fetch>[1]} [init] 
 * @param {{format?: T}} [options] Default format is `'blob'`
 * @returns {Promise<T extends string ? (T extends 'text' ? string : T extends 'blob' ? Blob : T extends 'arrayBuffer' ? ArrayBuffer : T extends 'json' ? JSONData : never) : Blob>}
 */
export async function crossFetch(input, init, options) {
  // The srcdoc iframe is injected by the content-script
  const iframe = document.createElement('iframe')

  Object.assign(iframe, {
    src: new URL('./cross-fetch-iframe-communication.html', import.meta.url),
  })

  Object.assign(iframe.style, {
    display: 'none',
  })

  document.body.append(iframe)

  await new Promise(resolve => {
    iframe.addEventListener('load', event => {
      resolve()
    })
  })

  return new Promise((resolve, reject) => {
    iframe.contentWindow.postMessage({type: 'cross-fetch-request', args: [input, init, options]}, {targetOrigin: '*'})

    const abortController = new AbortController()

    window.addEventListener('message', event => {
      const { type, value, reason } = event.data

      if (type !== 'cross-fetch-response') {
        return
      }

      if (reason) {
        reject(reason)
      }
      else {
        resolve(value)
      }

      abortController.abort()
    }, {signal: abortController.signal})
  })
  .finally(() => iframe.remove())
}
