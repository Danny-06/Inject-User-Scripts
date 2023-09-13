// Avoid using any import to make the module run as soon as posible
// to listen to YouTube events

function dispatchNavigateEvent() {
  const customEvent = new CustomEvent('youtube-navigate')
  window.dispatchEvent(customEvent)
}

function dispatchLoadEvent() {
  const customEvent = new CustomEvent('youtube-load')
  window.dispatchEvent(customEvent)
}

/**
 * 
 * @param {EventTarget} target 
 * @param {string[]} eventNames 
 * @param {() => void} callback 
 */
function addMultipleListeners(target, eventNames, callback, timeout = null) {
  const abortController = new AbortController()

  if (typeof timeout === 'number') {
    setTimeout(() => {
      if (abortController.signal.aborted) {
        return
      }

      abortController.abort()

      callback()
    }, timeout)
  }

  for (const eventName of eventNames) {
    target.addEventListener(eventName, event => {
      abortController.abort()

      callback()
    }, {signal: abortController.signal})
  }
}

addMultipleListeners(window, ['load', 'yt-navigate-finish'], () => {
  dispatchLoadEvent()
  dispatchNavigateEvent()

  window.addEventListener('yt-navigate-finish', event => {
    dispatchNavigateEvent()
  })
}, 1000)
