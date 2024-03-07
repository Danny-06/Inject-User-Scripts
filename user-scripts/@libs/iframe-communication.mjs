const MESSAGE_TYPE = 'frame-communication'

/**
 * @typedef {typeof MESSAGE_TYPE} MessageType
 */

/**
 * @typedef CommunicationDataSent
 * @property {MessageType} type
 * @property {number} id
 * @property {string} stringifiedCallback
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

const scriptNonce = document.querySelector('script[nonce]')?.nonce

/**
 * 
 * @param {string} scriptContent
 * @returns {HTMLScriptElement} 
 */
function createScriptForTaskFromString(scriptContent) {
  const script = document.createElement('script')

  if (scriptNonce) {
    script.nonce = scriptNonce
  }

  script.innerHTML = /* js */ `
    document.currentScript.addEventListener('message-script-sharing', event => {
      const { type, id, frameWindow } = event.detail

      /**@type {CommunicationDataReceived} */
      const message = {
        type,
        id
      }

      Promise.resolve((${scriptContent})())
      .then(
        value => frameWindow.postMessage({...message, result: {state: 'fulfilled', value}}, {targetOrigin: '*'}),
        reason => frameWindow.postMessage({...message, result: {state: 'rejected', reason}}, {targetOrigin: '*'}),
      )
    }, {once: true})
  `

  return script
}

/**
 * Messages received from other frames
 * @type {(event: MessageEvent<CommunicationDataSent | CommunicationDataReceived>) => void}
 */
const messageFromOtherFramesListener = event => {
  const { stringifiedCallback } = event.data

  if (typeof stringifiedCallback !== 'string') {
    return
  }

  const script = createScriptForTaskFromString(stringifiedCallback)

  document.head.append(script)

  script.remove()

  const eventDetail = {
    type: MESSAGE_TYPE,
    id: event.data.id,
    frameWindow: event.source,
  }

  const customEvent = new CustomEvent('message-script-sharing', {detail: eventDetail})

  script.dispatchEvent(customEvent)
}


window.addEventListener('message', messageFromOtherFramesListener)


/**
 * 
 * @param {Window} frameWindow 
 * @param {(...args: unknown[]) => unknown} callback 
 */
export function runTaskInFrame(frameWindow, callback) {
  return new Promise((resolve, reject) => {
    /**@type {CommunicationDataSent} */
    const message = {
      type: MESSAGE_TYPE,
      id: performance.now(),
      stringifiedCallback: String(callback)
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
