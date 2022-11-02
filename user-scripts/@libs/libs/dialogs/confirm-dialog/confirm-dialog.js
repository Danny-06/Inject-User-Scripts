import { getAllElementsMapWithBracketsId, importTemplateAndCSS } from '../../dom-utils.js'

let isOpened = false

let dialogStoreReference

const resetOpenState = () => isOpened = false

const [dialogTemplate, stylesheet] = await importTemplateAndCSS({
  template: './confirm-dialog.html',
  stylesheet: './confirm-dialog.css'
}, import.meta.url)

export function showConfirmDialog(message = '(No message provided)') {
  // If the dialog is "opened" but the element is not in the DOM or
  // is not in the active document then reset the "opened" state
  if (!dialogStoreReference || isOpened && (!dialogStoreReference.isConnected || dialogStoreReference.ownerDocument !== document)) {
    resetOpenState()
  }

  if (isOpened) {
    return Promise.reject(new Error(`The dialog is still opened`))
  }

  isOpened = true

  const {firstElementChild: dialog} = dialogTemplate.clone(document)

  dialog.shadowRoot.adoptedStyleSheets = [stylesheet]

  const mapId = getAllElementsMapWithBracketsId(dialog, {shadowRoot: true})


  const {dialogMenu, message: msgDialog, acceptBtn, cancelBtn} = mapId

  dialogStoreReference = dialogMenu


  msgDialog.innerHTML = message

  document.body.append(dialog)

  const promiseResult = new Promise(resolve => {
    acceptBtn.addEventListener('click', event => resolve(true))
  
    cancelBtn.addEventListener('click', event => resolve(false))
  })

  return promiseResult.finally(() => {
    dialog.classList.add('closing')
    dialogMenu.classList.add('closing')

    dialog.addEventListener('animationend', event => {
      resetOpenState()
      dialog.remove()
    })
  })
}
