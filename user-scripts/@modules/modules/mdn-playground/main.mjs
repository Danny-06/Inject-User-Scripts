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

/**
 * 
 * @param {Element} element 
 */
function toggleFullscreenElement(element) {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    element.requestFullscreen()
  }
}
