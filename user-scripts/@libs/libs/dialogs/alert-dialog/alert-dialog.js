import { importTemplate } from "../../dom-utils.js"

let isOpened = false

let dialogStoreReference

const resetOpenState = () => isOpened = false

const dialogTemplate = await importTemplate('./alert-dialog.html', import.meta.url)

export function showAlertDialog(message = '(No message provided)') {
  // If the dialog is "opened" but the element is not in the DOM or
  // is not in the active document then reset the "opened" state
  if (isOpened && dialogStoreReference && (!dialogStoreReference.isConnected || dialogStoreReference.ownerDocument !== document)) {
    resetOpenState()
  }

  if (isOpened) {
    return Promise.reject(new Error(`The dialog is still opened`))
  }

  isOpened = true

  const [{firstElementChild: dialog}, mapId] = dialogTemplate.clone(document)

  const {dialogMenu, message: msgDialog, acceptBtn} = mapId

  dialogStoreReference = dialogMenu


  msgDialog.innerHTML = message

  document.body.append(dialog)

  const promiseResult = new Promise(resolve => {
    acceptBtn.addEventListener('click', event => resolve())
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
