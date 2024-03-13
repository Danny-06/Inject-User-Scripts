void function() {
  // Always remove text selection when the user clicks on any part of the document
  // This is to avoid those annoying times when you want to remove the selection when clicking not selectable elements
  window.addEventListener('mousedown', event => {
      if (event.button === 0) window.getSelection().empty()
  }, {capture: true})

  window.addEventListener('touchstart', event => {
      window.getSelection().empty()
  }, {capture: true})
}()


const tab = await getCurrentTab()

const domain = tab.url ? new URL(tab.url).hostname : `Can't access this page`

const h1DomainName = document.querySelector('#domain-name')
h1DomainName.innerHTML = domain

const EXTENSION_ENABLED = 'EXTENSION_ENABLED'


const toggleCodeInjection = document.querySelector('#toggle-code-injection')

getIsExtensionEnabled()
.then(isEnabled => setCodeInjectionToggleState(toggleCodeInjection, isEnabled))

toggleCodeInjection.addEventListener('click', async event => {
  const isEnabled = await toggleExtensionEnabled()
  setCodeInjectionToggleState(toggleCodeInjection, isEnabled)
})


function setCodeInjectionToggleState(button, isEnabled) {
  if (isEnabled) {
    button.classList.remove('disabled')
    button.innerHTML = 'Disable Code Injection'
  } else {
    button.classList.add('disabled')
    button.innerHTML = 'Enable Code Injection'
  }
}

async function getIsExtensionEnabled() {
  const {EXTENSION_ENABLED: isExtensionEnabled} = await chrome.storage.local.get(EXTENSION_ENABLED)
  return isExtensionEnabled
}

async function toggleExtensionEnabled() {
  const isExtensionEnabled = await getIsExtensionEnabled()

  await chrome.storage.local.set({[EXTENSION_ENABLED]: !isExtensionEnabled})

  return !isExtensionEnabled
}

async function getCurrentTab() {
  const queryOptions = {active: true, currentWindow: true};
  const [tab] = await chrome.tabs.query(queryOptions);

  return tab;
}
