import { getAllElementsMapWithBracketsId, importTemplate } from "../../dom-utils.js"

let isOpen = false

const resetOpenState = () => isOpen = false

const dialogTemplate = await importTemplate('./alert-dialog.html', import.meta.url)

export function showAlertDialog(message = '(No message provided)') {
  if (isOpen) return Promise.resolve()

  isOpen = true

  const dialog = dialogTemplate.clone().firstElementChild
  const mapId = getAllElementsMapWithBracketsId(dialog, {shadowRoot: true})

  const {message: msgDialog, acceptBtn} = mapId

  msgDialog.innerHTML = message

  document.body.append(dialog)

  return new Promise(resolve => {
    acceptBtn.addEventListener('click', event => {
      resolve()
  
      dialog.remove()
      resetOpenState()
    })
  })
}
