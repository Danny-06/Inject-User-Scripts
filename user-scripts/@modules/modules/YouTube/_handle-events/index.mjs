function dispatchNavigateEvent() {
  const customEvent = new CustomEvent('youtube-navigate')
  window.dispatchEvent(customEvent)
}

function dispatchLoadEvent() {
  const customEvent = new CustomEvent('youtube-load')
  window.dispatchEvent(customEvent)
}


window.addEventListener('yt-navigate-finish', event => {
  setTimeout(() => {
    dispatchLoadEvent()
    dispatchNavigateEvent()
  })

  window.addEventListener('yt-navigate-finish', event => {
    dispatchNavigateEvent()
  })
}, {once: true})
