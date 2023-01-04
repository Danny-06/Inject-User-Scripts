import { handleSelectorLifeCycle, waitForSelector, delay } from '../../@libs/utils-injection.js'
import { calidad1080pAutomatica, ContextMenuManager as ctxM } from './youtube-utils.js'
import * as youtubeUtils from './youtube-utils.js'
import * as ctxMenu  from './resource-data/context-menu-options.js'

window.youtubeUtils = youtubeUtils

function setLocationAttribute() {
  setTimeout(() => {
    document.documentElement.dataset.pathname = location.pathname
    window.dispatchEvent(new Event('resize'))
  }, 500)
}

setLocationAttribute()

window.addEventListener('yt-navigate-start', event => {
  setLocationAttribute()
})

window.addEventListener('yt-navigate-finish', event => {
  setLocationAttribute()
})


// Set Scroll Padding equal to navbar height
function setScrollPadding() {
  waitForSelector('#masthead-container').then(navbar => {
    document.documentElement.style.scrollPaddingBlockStart = `${navbar.offsetHeight}px`
  })
}


// Scroll to selected item in playlist
async function handlePlaylistAutoScroll() {
  const ytdWatchFlexy = document.querySelector('ytd-watch-flexy')

  const playlistContainer = await waitForSelector('ytd-playlist-panel-renderer#playlist', {node: ytdWatchFlexy})
  await delay(1000)

  const header = playlistContainer.querySelector('.header')
  const playlistItemsContainer = playlistContainer.querySelector('.playlist-items')

  const selectedItem = () => playlistItemsContainer.querySelector(':scope > [selected]')

  playlistItemsContainer.scrollTop = selectedItem.offsetTop - selectedItem.offsetHeight - header.offsetHeight - 50

  window.addEventListener('resize', async event => {
    await delay(500)
    playlistItemsContainer.scrollTop = selectedItem().offsetTop - selectedItem().offsetHeight - header.offsetHeight - 50
  })

  window.addEventListener('yt-navigate-start', async event => {
    await delay(500)
    playlistItemsContainer.scrollTop = selectedItem().offsetTop - selectedItem().offsetHeight - header.offsetHeight - 50
  })

  window.addEventListener('yt-navigate-finish', async event => {
    await delay(500)
    playlistItemsContainer.scrollTop = selectedItem().offsetTop - selectedItem().offsetHeight - header.offsetHeight - 50
  })
}


document.addEventListener("keydown", refreshComments);

// Función que actualiza los comentarios
function refreshComments(event) {
  const constrains = [
    event.ctrlKey,
    event.key.toUpperCase() === 'Q'
  ]

  if (constrains.includes(false)) return

  // Selecciona la opción del menu desplegable que esté elegida (Mejores comenetario, Más recientes primero)
  const orderButtonSelected = document.querySelector('tp-yt-paper-listbox#menu .iron-selected')
  orderButtonSelected.click();
}

// Open Youtube Shorts in an new tab doing Ctrl + click
function handleYTShorts() {
  window.addEventListener('click', event => {
    if (!location.pathname.includes('/shorts/')) return
    if (!event.ctrlKey) return

    const target = event.target.closest('ytd-reel-video-renderer')

    if (!target) return

    const videoId = target.data.command.reelWatchEndpoint.videoId

    window.open(`https://youtube.com/watch?v=${videoId}`)
  })
}

// Forzar audio de la nueva previsualización de videos en la pagina principal
// para los videos de solo música

let clickEvent

window.addEventListener('click', event => {
  clickEvent = event
}, {capture: true})

function handleAudio() {
  const mutedSetter = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'muted').set

  Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
    set(value) {
      if (!this.closest('ytd-video-preview')) {
        mutedSetter.call(this, value)
        return
      }

      if (clickEvent?.isTrusted !== true) {
        return
      }

      clickEvent = null

      mutedSetter.call(this, value)
    }
  })
}

async function initCustomContextMenu() {
  // Context Menu

  const ctxMContainer = await ctxM.initCustomContextMenuItems()

  const panels = await waitForSelector('ytd-watch-flexy #panels')

  ctxM.addVideoContextMenuItems([
    ctxMenu.captureScreenshot,
    ctxMenu.flipVideoHorizontally,
    ctxMenu.loopVideo,

    ctxMenu.showCommentsPanel,
    ctxMenu.showDescriptionPanel,
    ctxMenu.showChaptersPanel,
    ctxMenu.downloadChaptersAsXML,
    ctxMenu.showTranscriptionPanel,

    ctxMenu.copyVideoURL,
    ctxMenu.copyVideoURLTime,
    ctxMenu.copyVideoURLEmbed,
    ctxMenu.copyVideoURLEmbedNoCookie
  ])

  ctxMContainer.append(...ctxM.elementItems)
}

async function initNavigation(event) {
  if (location.pathname !== '/watch') {
    if (location.pathname === '/') {
      // Make a recursion for the youtube main page to detect the preview video
      // and change its resolution
      handleSelectorLifeCycle('ytd-video-preview video[src]', {onExist: calidad1080pAutomatica})
    }
    return
  }

  initCustomContextMenu()


  /** @type {HTMLVideoElement} */
  const video = await waitForSelector('ytd-watch-flexy video');

  // Remove video preview
  waitForSelector('ytd-video-preview video')
  .then(video => video.src = '')

  calidad1080pAutomatica(video)
}

init().catch(console.error)

async function init() {

  // Remove elements with id copy
  window.copy && [...window.copy].forEach(e => e.remove())

  ;(async function() {

    handleYTShorts()

    handleAudio()

    setScrollPadding()

    handlePlaylistAutoScroll()
    
    // Eventos de navegación de Youtube para ejecutar el código
    // al cambiar de página (Youtube no recarga la página, la actualiza)
    window.addEventListener('yt-navigate-start', event => initNavigation(event).catch(console.error));
    window.addEventListener('yt-navigate-finish', event => initNavigation(event).catch(console.error));

    initNavigation().catch(console.error)

  })().catch(console.error) // End IIFE

}
