import { importTemplate } from '../../dom-utils.js'

let isOpened = false

let dialogStoreReference

const resetOpenState = () => isOpened = false

const dialogTemplate = await importTemplate('./prompt-dialog.html', import.meta.url)

export function showPromptDialog(message = '(No message provided)', defaultValue = '') {
  // If the dialog is "opened" but the element is not in the DOM then reset the "opened" state
  if (isOpened && dialogStoreReference && !dialogStoreReference.isConnected) {
    resetOpenState()
  }

  if (isOpened) {
    return Promise.reject(new Error(`The dialog is still opened`))
  }

  isOpened = true

  const [{firstElementChild: dialog}, mapId] = dialogTemplate.clone(document)

  const {dialogMenu, message: msgDialog, acceptBtn, cancelBtn, textarea} = mapId

  dialogStoreReference = dialogMenu


  msgDialog.innerHTML = message

  textarea.innerHTML = defaultValue

  textarea.addEventListener('keydown', event => event.stopPropagation())

  document.body.append(dialog)

  const promiseResult = new Promise(resolve => {
    acceptBtn.addEventListener('click', event => resolve(textarea.value))
  
    cancelBtn.addEventListener('click', event => resolve(null))
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
