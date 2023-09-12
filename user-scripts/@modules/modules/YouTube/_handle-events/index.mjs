import { waitForDocumentReady } from '../../../../@libs/libs/dom-utils.js'

function dispatchNavigateEvent() {
  const customEvent = new CustomEvent('youtube-navigate')
  window.dispatchEvent(customEvent)
}

function dispatchLoadEvent() {
  const customEvent = new CustomEvent('youtube-load')
  window.dispatchEvent(customEvent)
}

waitForDocumentReady(document).then(() => {
  setTimeout(() => {
    dispatchLoadEvent()
    dispatchNavigateEvent()
  })

  window.addEventListener('yt-navigate-finish', event => {
    dispatchNavigateEvent()
  })
})
