// Change language MDN to english

changeLanguageMDN('en-US')


async function changeLanguageMDN(language = 'en-US') {
  const buttonMenu = await waitForSelector('button.languages-switcher-menu')
  buttonMenu.click()

  const list = await waitForSelector('ul.language-menu')

  const langButton = list.querySelector(`:scope > li > a.submenu-item[data-locale="${language}"]`)

  if (langButton) return langButton.click()
  buttonMenu.click()
}


// Function that takes a selector as a parameter and return a Promise that resolves in the element when it exists in the DOM
function waitForSelector(selector, node = document) {
  function checkElement(selector, resolve) {
    const element = node.querySelector(selector)
    if (element) return resolve(element)

    requestAnimationFrame(() => checkElement(selector, resolve))
  }

  return new Promise(resolve => {
    checkElement(selector, resolve)
  })
}
