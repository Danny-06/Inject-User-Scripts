import { html } from '../../../../@libs/libs/dom-utils.js'
import { toggleFullscreenElement } from '../utils.js'

const playGroundContainer = document.querySelector('main.play.container')
const iframePreview = playGroundContainer.querySelector(':scope > .preview > iframe')

const playGroundMenu = playGroundContainer.querySelector(':scope > .editors > aside > menu')


const resultFullscreenButton = html`
  <button data-id="fullscreen-result" class="button secondary">
    <span class="button-wrap" style="background-color: #205820">fullscreen</span>
  </button>
`.firstElementChild

resultFullscreenButton.addEventListener('click', event => {
  toggleFullscreenElement(iframePreview)
})

playGroundMenu.prepend(resultFullscreenButton)
