import { importTemplate } from '../../dom-utils.js'

let isOpen = false

const resetOpenState = () => isOpen = false

const dialogTemplate = await importTemplate('./prompt-dialog.html', import.meta.url)

export function showPromptDialog(message = '(No message provided)', defaultValue = '') {
  if (isOpen) return Promise.resolve()

  isOpen = true

  const [{firstElementChild: dialog}, mapId] = dialogTemplate.clone(document)

  const {message: msgDialog, acceptBtn, cancelBtn, textarea} = mapId

  msgDialog.innerHTML = message

  textarea.innerHTML = defaultValue

  textarea.addEventListener('keydown', event => event.stopPropagation())

  document.body.append(dialog)

  return new Promise(resolve => {
    acceptBtn.addEventListener('click', event => {
      resolve(textarea.value)
  
      dialog.remove()
      resetOpenState()
    })
  
    cancelBtn.addEventListener('click', event => {
      resolve(null)

      dialog.remove()
      resetOpenState()
    })
  })
}
