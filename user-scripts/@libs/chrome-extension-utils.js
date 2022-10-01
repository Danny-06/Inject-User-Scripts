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
  const detail = {...message, timeId}
  const customEvent = new CustomEvent(`extension:${extensionId}`, {detail})

  window.dispatchEvent(customEvent)

  return new Promise(resolve => {

    const abortController = new AbortController()

    window.addEventListener(`extension:${extensionId}`, event => {
      const message = event.detail
      if (message.type !== 'bg-script-response' || message.timeId !== timeId) return

      abortController.abort()
      resolve({message: event.message, timeId})
    }, {signal: abortController.signal})

  })
}

/**
 * Allows cross origin requests with 'fetch' by setting temporaly the 'Access-Control-Allow-Origin' header to '*'
 */
 export async function crossFetch(url, options = null) {
  const {timeId} = await sendMessage({type: 'cross-fetch-start'})

  const response = await fetch(url, options).catch(() => null)

  sendMessage({type: 'cross-fetch-end'}, timeId)

  return response
}
