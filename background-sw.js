import { blobToBase64, parseJSONResponseWithComments } from './utils-extension.js'

const EXTENSION_ENABLED = 'EXTENSION_ENABLED'

chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.local.set({[EXTENSION_ENABLED]: true})
})

// Run only on page load when the content script send a message
chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {

  if (data.type !== 'content-script') {
    return
  }

  // Wrap the code in an async IIFE because async listener returns a Promise and that is not
  // supported yet what makes logging in the console an
  // 'Unchecked runtime.lastError: The message port closed before a response was received'
  void async function() {
    if (!sender?.tab) {
      return
    }

    const tabId = sender.tab.id
    const frameURL = sender.url

    if (tabId == null || !frameURL) {
      return
    }

    const extensionUrl = location.origin // chrome.runtime.getURL('').slice(0, -1)
    const domain       = new URL(frameURL).hostname

    // File and folder names
    const userScriptsFolder = 'user-scripts'
    const settingsJSON = '@settings.json'

    // Get 'settings.json' from the current domain folder
    const settingsDomainUrl = `${extensionUrl}/${userScriptsFolder}/${domain}/${settingsJSON}`
    const settingsDomain    = await fetch(settingsDomainUrl).then(parseJSONResponseWithComments).catch(reason => ({scripts: null, stylesheets: null}))


    /**@type {chrome.scripting.ScriptInjection<any[], any>} */
    const injectionSettings = {
      target: {
        tabId,
        frameIds: [sender.frameId],
      },

      args: [{settingsDomain, extensionUrl, domain, userScriptsFolder}],
      func: async function(params) {
        const {settingsDomain, extensionUrl, domain, userScriptsFolder} = params

        // If the document is not an HTMLDocument (XMLDocument) then we need to create our own
        // to be able to create HTMLElements
        const doc = document instanceof HTMLDocument ? document : document.implementation.createHTMLDocument()


        // Inject Modules

        void function() {
          const script = doc.createElement('script')

          script.type = 'module'
          script.dataset.source = 'Chrome Extension - Modules'
          script.src = `${extensionUrl}/${userScriptsFolder}/@modules/@domain-match-injection.mjs`

          if (document.head) {
            document.head.append(script)
          }
          else {
            document.documentElement.append(script)
          }

          script.remove()
        }()

        // Inject code for the current domain

        settingsDomain.stylesheets?.forEach(stylesheetName => {
          if (!stylesheetName) return

          const stylesheet = doc.createElement('link')

          stylesheet.rel = 'stylesheet'
          stylesheet.dataset.source = 'Chrome Extension'
          stylesheet.href = `${extensionUrl}/${userScriptsFolder}/${domain}/${stylesheetName}`

          document.head ? document.head.append(stylesheet) : document.documentElement.append(stylesheet)
        })

        settingsDomain.scripts?.forEach(scriptName => {
          if (!scriptName) return

          const script = doc.createElement('script')

          if (scriptName.endsWith('.mjs')) script.type = 'module'
          else                             script.defer = true

          script.dataset.source = 'Chrome Extension'
          script.src = `${extensionUrl}/${userScriptsFolder}/${domain}/${scriptName}`

          document.head ? document.head.append(script) : document.documentElement.append(script)

          script.remove()
        })
      }
    }

    chrome.scripting.executeScript(injectionSettings)

    // Send response to avoid the
    // 'Unchecked runtime.lastError: The message port closed before a response was received'
    sendResponse({})
  }()

  // Return true to indicate the response will be delayed
  return true

})


// Allow cross-fetch if the website dispatch the specific event
// Handle messages sent from a web page
chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {

  void async function() {
    if (data?.message?.action === 'cross-fetch-as-base64') {

      if (sender == null || sender.tab == null || sender.tab.id == null) {
        return
      }

      const [ url, options ] = data.message.args

      const response = await fetch(url, options).catch(reason => null)

      const blob = await response.blob()

      const base64Blob = await blobToBase64(blob)

      chrome.tabs.sendMessage(sender.tab.id, {type: 'bg-script-response', data: base64Blob, timeId: data.timeId})
    }

    sendResponse({})
  }()

  return true

})










// Manifest v2

// Modify Response Headers

// https://developer.chrome.com/docs/extensions/reference/webRequest/
// https://developer.chrome.com/docs/extensions/mv2/match_patterns/

// chrome.webRequest.onBeforeRequest.addListener(callback, filter, opt_extraInfoSpec);

// chrome.webRequest.onHeadersReceived.addListener(function(details) {

//   const contentSecurityPolicy = details.responseHeaders.filter(header => header.name === 'content-security-policy')

//   contentSecurityPolicy.forEach(header => {
//     header.value = header.value.replace(/script-src .*;/g, '')
//                                .replace(/default-src .*;/g, '')
//                                .replace(/require-trusted-types-for .*;/g, '')
//   })

//   console.log(details)

//   return {responseHeaders: details.responseHeaders}

// }, {urls: ['<all_urls>'], types: ['main_frame']},  ['blocking', 'responseHeaders', 'extraHeaders'])



// async function getCurrentTab() {
//   const queryOptions = {active: true, currentWindow: true};
//   const [tab] = await chrome.tabs.query(queryOptions);

//   return tab;
// }
