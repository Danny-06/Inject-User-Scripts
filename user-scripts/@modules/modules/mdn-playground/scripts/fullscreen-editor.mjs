import { toggleFullscreenElement } from '../utils.js'

document.addEventListener('click', event => {
  if (!event.ctrlKey) {
    return
  }

  const editorContainer = event.target.closest('details.editor-container')

  if (!editorContainer) {
    return
  }

  toggleFullscreenElement(editorContainer)
})
