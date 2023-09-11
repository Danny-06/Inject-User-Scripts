import { waitForSelector } from '../../../../../@libs/libs/dom-utils.js'

window.addEventListener('youtube-navigate', event => {
  setScrollPadding()
})

async function setScrollPadding() {
  const navbar = await waitForSelector('#masthead-container')

  document.documentElement.style.scrollPaddingBlockStart = `${navbar.offsetHeight}px`
}
