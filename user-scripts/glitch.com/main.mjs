import { getZoom } from '../@libs/utils-injection.js'


const onVisualViewportResize = event => {
  document.documentElement.style.setProperty('--visual-viewport-zoom-ratio', 1 / getZoom())
}

onVisualViewportResize()

visualViewport.addEventListener('resize', onVisualViewportResize)
