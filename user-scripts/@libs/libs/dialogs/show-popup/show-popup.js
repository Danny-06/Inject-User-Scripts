import { getAllElementsMapWithBracketsId, importTemplateAndCSS, setStyleProperties, turnStringIntoTrustedHTML } from "../../dom-utils.js";

const [popup, stylesheet] = await importTemplateAndCSS({
  template: './show-popup.html',
  stylesheet: './show-popup.css'
}, import.meta.url)

let popupsContainer

export function showPopup(message, time = 5000, options = {}) {

  const {bgColor = '#0009', userInteraction = true} = options

  if (!popupsContainer) {
    popupsContainer = document.createElement('div')
    popupsContainer.classList.add('popups-container')

    document.documentElement.prepend(popupsContainer)
  }

  setStyleProperties(popupsContainer.style, {
    position: 'fixed !important',
    width: '100%',
    height: '100%',
    top: '0',
    left: '0',
    background: bgColor,
    zIndex: '2147483647',
    pointerEvents: userInteraction ? 'none' : 'auto'
  })

  const {firstElementChild: alertPopupContainer} = popup.clone(document)

  alertPopupContainer.shadowRoot.adoptedStyleSheets = [stylesheet]

  const popupMapId = getAllElementsMapWithBracketsId(alertPopupContainer, {shadowRoot: true})

  const {alertPopup, alertPopupContent} = popupMapId


  alertPopupContainer.dataset.message = message

  popupsContainer.append(alertPopupContainer)

  alertPopupContent.innerHTML = turnStringIntoTrustedHTML(message)

  setTimeout(() => alertPopup.classList.add('-show'), 50)

  return new Promise(resolve => {
    resolve()

    setTimeout(() => {
      alertPopup.classList.remove('-show')
  
      setTimeout(() => {
        alertPopupContainer.remove()
  
        if (popupsContainer.childElementCount === 0) {
          popupsContainer.remove()
          popupsContainer = null
        }
      }, 500)
    }, time)
  })

}
