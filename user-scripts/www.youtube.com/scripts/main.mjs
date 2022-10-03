import { handleSelectorLifeCycle, waitForSelector, delay } from '../../@libs/utils-injection.js'
import { calidad1080pAutomatica, ContextMenuManager as ctxM } from './youtube-utils.js'
import * as youtubeUtils from './youtube-utils.js'
import * as ctxMenu  from './resource-data/context-menu-options.js'


window.youtubeUtils = youtubeUtils


const query = selector => document.querySelector(selector)
const getValueIfSelectorMatches = (selector, value) => {
  if (query(selector)) {
    return value
  } else {
    return Array.isArray(value) ? [] : null
  }
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


async function initCustomContextMenu() {
  // Context Menu

  const ctxMContainer = await ctxM.initCustomContextMenuItems()

  const panels = await waitForSelector('ytd-watch-flexy #panels')

  ctxM.addVideoContextMenuItems([
    ctxMenu.captureScreenshot,
    ctxMenu.flipVideoHorizontally,

    getValueIfSelectorMatches(
      `[target-id="engagement-panel-comments-section"]`,
      ctxMenu.showCommentsPanel
    ),
    getValueIfSelectorMatches(
      `[target-id="engagement-panel-structured-description"]`,
      ctxMenu.showDescriptionPanel
    ),
    ...getValueIfSelectorMatches(
      `[target-id="engagement-panel-macro-markers-description-chapters"]`,
      [ctxMenu.showChaptersPanel, ctxMenu.downloadChaptersAsXML]
    ),
    getValueIfSelectorMatches(
      `[target-id="engagement-panel-searchable-transcript"]`,
      ctxMenu.showTranscriptionPanel
    ),

    ctxMenu.copyVideoURL,
    ctxMenu.copyVideoURLTime,
    ctxMenu.copyVideoURLEmbed,
    ctxMenu.copyVideoURLEmbedNoCookie
  ])

  ctxMContainer.append(...ctxM.elementItems)
}

init().catch(console.error)

async function init() {

  ;(async function() {

    // Remove elements with id copy
    window.copy && [...window.copy].forEach(e => e.remove())

    // Open Youtube Shorts in an new tab doing Ctrl + click
    window.addEventListener('click', event => {
      if (!location.pathname.includes('/shorts/')) return
      if (!event.ctrlKey) return

      const target = event.target.closest('ytd-reel-video-renderer')

      if (!target) return

      const videoId = target.data.command.reelWatchEndpoint.videoId

      window.open(`https://youtube.com/watch?v=${videoId}`)
    })


    // Forzar audio de la nueva previsualización de videos en la pagina principal
    if (location.pathname === '/') {
      const video = await waitForSelector('video')

      const mutedSetter = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'muted').set
      Object.defineProperty(HTMLMediaElement.prototype, 'muted', { set: () => null })
      mutedSetter.call(video, false)
    }

    // window.addEventListener('click', event => {
    //   if (event.target.matches('ytd-watch-flexy video'))
    //     event.target.focus()
    // });

    // Ocultar el primer video de recomendados si es un anuncio
    ;(async function() {

      if (location.href !== 'https://www.youtube.com/') return

      const addVideo = await waitForSelector('ytd-rich-item-renderer:has(ytd-display-ad-renderer)')

      addVideo.style.setProperty('display', 'none', 'important');

    })()

    // Set Scroll Padding equal to navbar height
    waitForSelector('#masthead-container').then(navbar => {
      document.documentElement.style.scrollPaddingBlockStart = `${navbar.offsetHeight}px`
    })

    // Eventos de navegación de Youtube para ejecutar el código
    // al cambiar de página (Youtube no recarga la página, la actualiza)
    window.addEventListener('yt-navigate-start', event => initNavigation(event).catch(console.error));
    window.addEventListener('yt-navigate-finish', event => initNavigation(event).catch(console.error));

    initNavigation().catch(console.error)
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

      // Scroll to selected item in playlist
      ;(async function() {

        const ytdWatchFlexy = document.querySelector('ytd-watch-flexy')

        const playlistContainer = await waitForSelector('ytd-playlist-panel-renderer#playlist', {node: ytdWatchFlexy})
        await delay(500)

        const header = playlistContainer.querySelector('.header')
        const playlistItemsContainer = playlistContainer.querySelector('.playlist-items')

        const selectedItem = playlistItemsContainer.querySelector(':scope > [selected]')

        playlistItemsContainer.scrollTop = selectedItem.offsetTop - selectedItem.offsetHeight - header.offsetHeight - 50
        
        window.addEventListener('resize', async event => {
          await delay(500)
          playlistItemsContainer.scrollTop = selectedItem.offsetTop - selectedItem.offsetHeight - header.offsetHeight - 50
        })

      })();


      /**
       * @type {HTMLVideoElement}
       */
      const video = await waitForSelector('ytd-watch-flexy video');

      // Remove video preview
      waitForSelector('ytd-video-preview video')
      .then(video => video.src = '')

      calidad1080pAutomatica(video)

    } // End initNavigation()

  })().catch(console.error) // End IIFE

}
