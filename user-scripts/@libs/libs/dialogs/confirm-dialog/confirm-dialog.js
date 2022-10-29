import { getAllElementsMapWithBracketsId, importTemplate } from '../../dom-utils.js'

let isOpen = false

const resetOpenState = () => isOpen = false

const dialogTemplate = await importTemplate('./confirm-dialog.html', import.meta.url)

export function showConfirmDialog(message = '(No message provided)') {
  if (isOpen) return Promise.resolve()

  isOpen = true

  const [{firstElementChild: dialog}, mapId] = dialogTemplate.clone()

  const {message: msgDialog, acceptBtn, cancelBtn} = mapId

  msgDialog.innerHTML = message

  document.body.append(dialog)

  return new Promise(resolve => {
    acceptBtn.addEventListener('click', event => {
      resolve(true)
  
      dialog.remove()
      resetOpenState()
    })
  
    cancelBtn.addEventListener('click', event => {
      resolve(false)

      dialog.remove()
      resetOpenState()
    })
  })
}
