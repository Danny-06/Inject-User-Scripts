import { handleSelectorLifeCycle, waitForSelector, delay } from '../../@libs/utils-injection.js'
import { calidad1080pAutomatica, ContextMenuManager as ctxM } from './youtube-utils.js'
import * as youtubeUtils from './youtube-utils.js'
import * as ctxMenu  from './resource-data/context-menu-options.js'
import { createWebComponent } from '../../@libs/libs/dom-utils.js'
import _, { buildElement as $ } from '../../@libs/libs/functional-dom/index.js'

window.youtubeUtils = youtubeUtils

function setLocationAttribute() {
  setTimeout(() => {
    document.documentElement.dataset.pathname = location.pathname
    window.dispatchEvent(new Event('resize'))
  }, 500)
}


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

    ctxMenu.downloadChaptersAsXML,

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

async function handleSecondaryInnerWatch() {
  const secondaryInner = await waitForSelector('ytd-watch-flexy #secondary #secondary-inner')

  const panelsContainer = secondaryInner.querySelector(':scope > #panels')

  panelsContainer.after(...panelsContainer.children)

  const panels = {

    'related': secondaryInner.querySelector(':scope > #related'),

    'playlist': secondaryInner.querySelector(':scope > ytd-playlist-panel-renderer:not([hidden])'),

    'live-chat': secondaryInner.querySelector(':scope > ytd-live-chat-frame'),

    'description': secondaryInner.querySelector(':scope > [target-id="engagement-panel-structured-description"]'),

    'comments': secondaryInner.querySelector(':scope > [target-id="engagement-panel-comments-section"]'),

    'chapters': secondaryInner.querySelector(':scope > [target-id="engagement-panel-macro-markers-description-chapters"]'),

    'auto-chapters': secondaryInner.querySelector(':scope > [target-id="engagement-panel-macro-markers-auto-chapters"]'),

    'transcription': secondaryInner.querySelector(':scope > [target-id="engagement-panel-searchable-transcript"]'),

    // createClip: secondaryInner.querySelector(':scope > [target-id="engagement-panel-clip-create"]'),

    *[Symbol.iterator]() {
      yield* Object.values(this).filter(element => element != null)
    }

  }

  class SecondaryTabs extends HTMLElement {

    _constructor_() {
      const shadow = this.attachShadow({mode: 'open'})

      panels.related.slot = 'active'

      const relatedBtn       = panels['related']       ? _.button({dataset: {id: 'related'}, class: 'selected'}, 'Related') : null
      const playlistBtn      = panels['playlist']      ? _.button({dataset: {id: 'playlist'}}, 'Playlist') : null
      const descriptionBtn   = panels['description']   ? _.button({dataset: {id: 'description'}}, 'Description') : null
      const commentsBtn      = panels['comments']      ? _.button({dataset: {id: 'comments'}}, 'Comments') : null
      const chaptersBtn      = panels['chapters']      ? _.button({dataset: {id: 'chapters'}}, 'Chapters') : null
      const autoChaptersBtn  = panels['auto-chapters'] ? _.button({dataset: {id: 'auto-chapters'}}, 'Auto Chapters') : null
      const transcriptionBtn = panels['transcription'] ? _.button({dataset: {id: 'transcription'}}, 'Transcription') : null
      const liveChatBtn      = panels['live-chat']     ? _.button({dataset: {id: 'live-chat'}}, 'Live Chat') : null

      playlistBtn?.addEventListener('click', event => {
        const ytdWatchFlexy = document.querySelector('ytd-watch-flexy')

        const playlistContainer = ytdWatchFlexy.querySelector('ytd-playlist-panel-renderer#playlist')

        const playlistItemsContainer = playlistContainer.querySelector('.playlist-items')
        const header = playlistContainer.querySelector('.header')

        const selectedItem = playlistItemsContainer.querySelector(':scope > [selected]')

        setTimeout(() => {
          playlistItemsContainer.scrollTop = selectedItem.offsetTop - selectedItem.offsetHeight - header.offsetHeight - 50
        })
      })

      const panelButtons = [
        relatedBtn,
        playlistBtn,
        descriptionBtn,
        commentsBtn,
        chaptersBtn,
        autoChaptersBtn,
        transcriptionBtn,
        liveChatBtn,
      ].filter(e => e != null)

      shadow.append(
        _.style({}, // css
          `
          .title {
            font-size: 16px;
          }

          .tab-buttons {
            flex-shrink: 0;

            display: flex;
            flex-wrap: wrap;
            gap: 5px;

            width: 100%;

            padding-block: 1rem;
          }

          .tab-buttons > * {
            flex-shrink: 0;
          }

          .tab-buttons > button {
            all: unset;
            box-sizing: border-box;
            font-size: 13px;
            color: #eee;

            padding-inline: 0.8em;
            padding-block: 0.7em;

            border-radius: 0.3em;

            background-color: #222;
          }

          .tab-buttons > button:is(:hover, :active) {
            background-color: #444;
          }

          .tab-buttons > button:active {
            background-color: #666;
          }

          .tab-buttons > button.selected {
            background-color: #666;
          }
        `),

        _.div({class: 'title'}, 'Tabs'),
        _.div({class: 'tab-buttons'},
          panelButtons
        ),
        _.slot({attributes: {name: 'active'}}),
      )

      function setActiveSlot(event) {
        ;[...panels].forEach(panel => {
          panel.removeAttribute('slot')

          if (panel.localName === 'ytd-engagement-panel-section-list-renderer') {
            // Show all of the panels
            panel.setAttribute('visibility', 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED')
  
            // Reset the `order` value for panels that has one explicitly
            panel.style.order = '0'
          }
        })
    
        panelButtons.forEach(button => {
          button.classList.remove('selected')
        })

        const button = event.target

        button.classList.add('selected')

        panels[button.dataset.id].slot = 'active'
      }

      panelButtons.forEach(panel => {
        panel.addEventListener('click', setActiveSlot)
      })
  
    }

  }

  createWebComponent(SecondaryTabs, secondaryInner)
}



init().catch(console.error)

async function init() {

  // Remove elements with id copy
  window.copy && [...window.copy].forEach(e => e.remove())

  ;(async function() {

    setLocationAttribute()

    window.addEventListener('yt-navigate-start', event => {
      setLocationAttribute()
    })

    window.addEventListener('yt-navigate-finish', event => {
      setLocationAttribute()
    })

    handleSecondaryInnerWatch().catch(console.error)

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
