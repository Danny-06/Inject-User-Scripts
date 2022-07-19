// Make sure that the background code is only runned once per page load
chrome.runtime.sendMessage({type: 'content-script'})


// Send messages from background script to web page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  window.dispatchEvent(new CustomEvent(`extension:${chrome.runtime.id}`, {detail: message}))
  sendResponse({})
})

// Send message from web page to bakground script
window.addEventListener(`extension:${chrome.runtime.id}`, event => {
  chrome.runtime.sendMessage(event.detail)
})
