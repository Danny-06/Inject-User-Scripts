/**
 * 
 * @param {Element} element 
 */
export function toggleFullscreenElement(element) {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    element.requestFullscreen()
  }
}
