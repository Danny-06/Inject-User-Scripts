import { setStyleProperties } from '../utils-injection.js'

export function showPopup(message, time = 5000, bgColor = '#0009', userInteraction = true, callback = function() {}) {

  const css = // css
  `
  :root {
  background: #000 !important;
  }

  .alert-popup-2147483647 {
  all: unset;
  transform: translateY(-150%);
  transition: transform 0.5s;
  color: #fff;

  overscroll-behavior: contain;

  box-sizing: border-box;
  font-family: Arial;

  display: flex;
  justify-content: center;
  align-items: center;

  width: fit-content;
  width: -moz-fit-content;

  min-width: 150px;
  min-height: 50px;
  max-width: 450px;
  max-height: 150px;

  position: fixed;
  top: 1rem;
  left: 0;
  right: 0;
  margin: auto;
  z-index: 2147483647;

  background: #222;
  border: solid #828282 2px;
  /*   box-shadow: #fff9 0 0 5px 2px; */
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 16px;
  }

  .alert-popup-2147483647.show {
  transform: translateY(0%);
  }

  .alert-popup-content-2147483647 {
  overflow: auto;
  width: 100%;
  height: 100%;
  max-width: calc(45rem - 2 * 2rem);
  max-height: calc(15rem - 2 * 1rem);
  }

  body {
  opacity: 0.7 !important;
  }
  `

  let popupsContainer = document.querySelector('#PopupsContainer-2147483647');


  if (!popupsContainer) {
    popupsContainer = document.createElement('div')
    popupsContainer.id = 'PopupsContainer-2147483647'
    document.documentElement.prepend(popupsContainer)
  }

  setStyleProperties(popupsContainer.style, {
    position: 'fixed !important',
    width: '100vw',
    height: '100vh',
    top: '0',
    left: '0',
    background: bgColor,
    zIndex: '2147483647',
    pointerEvents: userInteraction ? 'none' : 'auto'
  })

  const trustedHTMLPolicy = trustedTypes.createPolicy('trustedHTML', {createHTML: string => string})

  const alertPopupContainer = document.createElement('div')
  alertPopupContainer.className = 'alert-popup-container-2147483647'
  alertPopupContainer.dataset.message = message

  popupsContainer.append(alertPopupContainer)

  const shadowAlert = alertPopupContainer.attachShadow({mode: 'open'})
  const shadowStylesheet = new CSSStyleSheet()
  shadowStylesheet.replace(css)
  shadowAlert.adoptedStyleSheets = [shadowStylesheet]

  popupsContainer.append(alertPopupContainer)

  const alertPopup = document.createElement('div')
  alertPopup.className = 'alert-popup-2147483647'

  shadowAlert.append(alertPopup)

  const alertPopupContent = document.createElement('div')
  alertPopupContent.className = 'alert-popup-content-2147483647'
  alertPopupContent.innerHTML = trustedHTMLPolicy.createHTML(message)
  alertPopup.append(alertPopupContent)

  setTimeout( () => alertPopup.classList.add('show'), 50)

  setTimeout(() => {
    alertPopup.classList.remove('show')
    setTimeout(() => {
      alertPopupContainer.remove()
      if (popupsContainer.children.length === 0) popupsContainer.remove()
    }, 500)

    callback()
  }, time)

  return alertPopupContainer

}
