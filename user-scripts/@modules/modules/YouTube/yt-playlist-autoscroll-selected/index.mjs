import { waitForSelector } from '../../../../@libs/libs/dom-utils.js'
import { delay } from '../../../../@libs/utils-injection.js'

window.addEventListener('youtube-navigate', event => {
  handlePlaylistAutoScroll()
})

async function handlePlaylistAutoScroll() {
  if (location.pathname.startsWith('/embed')) {
    return
  }

  const ytdWatchFlexy = document.querySelector('ytd-watch-flexy')

  const playlistContainer = await waitForSelector('ytd-playlist-panel-renderer#playlist', {node: ytdWatchFlexy})
  await delay(1000)

  const header = playlistContainer.querySelector('.header')
  const playlistItemsContainer = playlistContainer.querySelector('.playlist-items')

  const selectedItem = () => playlistItemsContainer.querySelector(':scope > [selected]')

  const scrollToSelectedItem = () => {
    playlistItemsContainer.scrollTop = selectedItem().offsetTop - selectedItem().offsetHeight - 150
  }

  scrollToSelectedItem()

  window.addEventListener('resize', async event => {
    await delay(500)
    scrollToSelectedItem()
  })

  window.addEventListener('youtube-navigate', async event => {
    await delay(500)
    scrollToSelectedItem()
  })
}
