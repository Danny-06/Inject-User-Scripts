import { base64DataURIToBlob } from './libs/binary.js'

export const extensionId = import.meta.url.match(/(?<=(chrome-extension:\/\/))[a-z]*(?=(\/))/)[0]

/**
 * 
 * @param {string} path 
 * @returns {string}
 */
export function getURL(path) {
  if (path.startsWith('./')) {
    path = path.replace('./', '')
  }

  const url = `chrome-extension://${extensionId}/user-scripts/${path}`

  return url
}

/**
 * 
 * @param {{message: any, timeId: number}} message 
 * @returns 
 */
export function sendMessage(message, timeIdParam) {
  // Indentify background-script response with 'perfomance.now()'
  const timeId = timeIdParam ?? performance.now()
  const detail = {message, timeId}
  const customEvent = new CustomEvent(`extension-request:${extensionId}`, {detail})

  window.dispatchEvent(customEvent)

  return new Promise(resolve => {

    const abortController = new AbortController()

    window.addEventListener(`extension-response:${extensionId}`, event => {
      const response = event.detail
      if (response.type !== 'bg-script-response' || response.timeId !== timeId) {
        return
      }

      abortController.abort()
      resolve({response: response.data, timeId})
    }, {signal: abortController.signal})

  })
}

/**
 * 
 * @param {Parameters<fetch>[0]} url 
 * @param {Parameters<fetch>[1]} options 
 */
export async function crossFetchAsBase64DataURI(url, options) {
  const message = await sendMessage({action: 'cross-fetch-as-base64', args: [url, options]})

  const { response } = message

  return response
}

/**
 * 
 * @param {Parameters<fetch>[0]} url 
 * @param {Parameters<fetch>[1]} options 
 */
export async function crossFetchAsBlob(url, options) {
  const base64DataURI = await crossFetchAsBase64DataURI(url, options)

  const blob = base64DataURIToBlob(base64DataURI)

  return blob
}
