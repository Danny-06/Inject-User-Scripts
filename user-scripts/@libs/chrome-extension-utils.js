export const extensionId = import.meta.url.match(/(?<=(chrome-extension:\/\/))[a-z]*(?=(\/))/)[0]

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
