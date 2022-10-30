import { importTemplate, setStyleProperties, turnStringIntoTrustedHTML } from "../../dom-utils.js";

const popup = await importTemplate('./show-popup.html', import.meta.url)

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

  const [{firstElementChild: alertPopupContainer}, popupMapId] = popup.clone(document)

  alertPopupContainer.dataset.message = message

  popupsContainer.append(alertPopupContainer)

  const {alertPopup, alertPopupContent} = popupMapId

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
