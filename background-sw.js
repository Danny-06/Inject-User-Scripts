// Run only on page load when the content script send a message
chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {

  if (data.type !== 'content-script') return

  // Wrap the code in an async IIFE because async listener returns a Promise and that is not
  // supported yet what makes logging in the console an
  // 'Unchecked runtime.lastError: The message port closed before a response was received'
  (async function() {
    const tabId = sender.tab.id
    const url   = sender.tab.url

    if (!url) return

    const extensionUrl = location.origin // chrome.runtime.getURL('').slice(0, -1)
    const domain       = new URL(url).hostname

    // Get 'settings.json' from the '@all-urls' folder
    const settingsAllUrl = `${extensionUrl}/user-scripts/@all-urls/settings.json`
    const settingsAll    = await fetch(settingsAllUrl).then(response => response.json()).catch(reason => ({scripts: null, stylesheets: null}))

    // Get 'settings.json' from the current domain folder
    const settingsDomainUrl = `${extensionUrl}/user-scripts/${domain}/settings.json`
    const settingsDomain    = await fetch(settingsDomainUrl).then(response => response.json()).catch(reason => ({scripts: null, stylesheets: null}))


    const injectionSettings = {
      target: {tabId},

      args: [settingsDomain, settingsAll, extensionUrl, domain],
      func: async function(settingsDomain, settingsAll, extensionUrl, domain) {
        // If the document is not an HTMLDocument (XMLDocument) then we need to create our own
        // to be able to create HTMLElements
        const doc = document instanceof HTMLDocument ? document : document.implementation.createHTMLDocument()


        // Inject code for all pages

        settingsAll.stylesheets?.forEach(stylesheetName => {
          if (!stylesheetName) return

          const stylesheet = doc.createElement('link')

          stylesheet.rel = 'stylesheet'
          stylesheet.href = `${extensionUrl}/user-scripts/@all-urls/${stylesheetName}`
          stylesheet.dataset.source = 'Chrome Extension - @all-urls'

          document.head ? document.head.append(stylesheet) : document.documentElement.append(stylesheet)
        })

        settingsAll.scripts?.forEach(scriptName => {
          if (!scriptName) return

          const script = doc.createElement('script')

          if (scriptName.endsWith('.mjs')) script.type = 'module'
          script.defer = true
          script.src = `${extensionUrl}/user-scripts/@all-urls/${scriptName}`
          script.dataset.source = 'Chrome Extension - @all-urls'

          document.head ? document.head.append(script) : document.documentElement.append(script)
        })

        // Inject code for the current domain

        settingsDomain.stylesheets?.forEach(stylesheetName => {
          if (!stylesheetName) return

          const stylesheet = doc.createElement('link')

          stylesheet.rel = 'stylesheet'
          stylesheet.href = `${extensionUrl}/user-scripts/${domain}/${stylesheetName}`
          stylesheet.dataset.source = 'Chrome Extension'

          document.head ? document.head.append(stylesheet) : document.documentElement.append(stylesheet)
        })

        settingsDomain.scripts?.forEach(scriptName => {
          if (!scriptName) return

          const script = doc.createElement('script')

          if (scriptName.endsWith('.mjs')) script.type = 'module'
          script.defer = true
          script.src = `${extensionUrl}/user-scripts/${domain}/${scriptName}`
          script.dataset.source = 'Chrome Extension'

          document.head ? document.head.append(script) : document.documentElement.append(script)
        })
      }
    }

    chrome.scripting.executeScript(injectionSettings)

    // Send response to avoid the
    // 'Unchecked runtime.lastError: The message port closed before a response was received'
    sendResponse({})
  })()

  // Return true to indicate the response will be delayed
  return true

})


// Allow cross-fetch if the website dispatch the specific event
// Handle messages sent from a web page
chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {

  (async function() {
    if (data.type === 'cross-fetch-start') {

      const rule = {
        action: {
          type: 'modifyHeaders',
          responseHeaders: [
            {header: 'access-control-allow-origin', operation: 'set', value: '*'}
          ]
        },
        condition: {urlFilter: '*', resourceTypes: ['xmlhttprequest']}
      }

      const dynaminRules = await chrome.declarativeNetRequest.getDynamicRules()
      const id = Math.max(...dynaminRules.map(rule => rule.id)) + 1

      await chrome.declarativeNetRequest.updateDynamicRules({addRules: [{...rule, id}]})

      chrome.tabs.sendMessage(sender.tab.id, {type: 'bg-script-response', timeId: data.timeId})

      await new Promise(resolve =>
        chrome.runtime.onMessage.addListener(d => {
          if (d.type === 'cross-fetch-end' && d.timeId === data.timeId) {
            chrome.tabs.sendMessage(sender.tab.id, {type: 'bg-script-response', timeId: data.timeId})
            resolve()
          }
        })
      )

      await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds: [id]})

    }

    sendResponse({})
  })()

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
