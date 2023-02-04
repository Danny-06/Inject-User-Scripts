import { handleSelectorLifeCycle, waitForSelector, delay } from '../../@libs/utils-injection.js'
import { calidad1080pAutomatica, ContextMenuManager as ctxM } from './youtube-utils.js'
import * as youtubeUtils from './youtube-utils.js'
import * as ctxMenu  from './resource-data/context-menu-options.js'
import _, { buildElement as $ } from '../../@libs/libs/functional-dom/index.js'
import { addEventListener } from '../../@libs/libs/event-utils.js'
import { run } from '../../@libs/extension-methods/object-extension.js'

window.youtubeUtils = youtubeUtils


function dispatchNavigateEvent() {
  const customEvent = new CustomEvent('youtube-navigate')
  window.dispatchEvent(customEvent)
}

function dispatchLoadEvent() {
  const customEvent = new CustomEvent('youtube-load')
  window.dispatchEvent(customEvent)
}

window.addEventListener('yt-navigate-finish', event => {
  dispatchNavigateEvent()
})

setTimeout(() => {
  dispatchLoadEvent()
  dispatchNavigateEvent()
})

window.addEventListener('youtube-load', event => {
  handleSecondaryInnerWatch().catch(console.error)
})


window.addEventListener('youtube-navigate', async event => {
  // Remove elements with id copy
  window.copy && [...window.copy].forEach(e => e.remove())


  setLocationAttribute()

  handleYTShorts()

  // handleAudio()

  setScrollPadding()

  handlePlaylistAutoScroll()

  initCustomContextMenu()

  // if (location.pathname === '/') {
  //   // Make a recursion for the youtube main page to detect the preview video
  //   // and change its resolution
  //   handleSelectorLifeCycle('ytd-video-preview video[src]', {onExist: calidad1080pAutomatica})
  // }

  if (location.pathname === '/watch') {
    /** @type {HTMLVideoElement} */
    const video = await waitForSelector('ytd-watch-flexy video');

    calidad1080pAutomatica(video)
  }
})


async function handleSecondaryInnerWatch() {
  const secondaryInner = await waitForSelector('ytd-watch-flexy #secondary #secondary-inner')

  const panelsContainer = secondaryInner.querySelector(':scope > #panels')

  // panelsContainer.after(...panelsContainer.children)

  const panels = {

    get 'related'() {
      return secondaryInner.querySelector(':scope > #related')
    },

    get 'playlist'(){
      return secondaryInner.querySelector(':scope > ytd-playlist-panel-renderer:not([hidden])')
    },

    get 'live-chat'() {
      return secondaryInner.querySelector(':scope > ytd-live-chat-frame')
    },

    get 'description'() {
      return secondaryInner.querySelector(':scope > [target-id="engagement-panel-structured-description"]')
    },

    get 'comments'() {
      return secondaryInner.querySelector(':scope > [target-id="engagement-panel-comments-section"]')
    },

    get 'chapters'() {
      return secondaryInner.querySelector(':scope > [target-id="engagement-panel-macro-markers-description-chapters"]')
    },

    get 'auto-chapters'() {
      return secondaryInner.querySelector(':scope > [target-id="engagement-panel-macro-markers-auto-chapters"]')
    },

    get 'transcription'() {
      return secondaryInner.querySelector(':scope > [target-id="engagement-panel-searchable-transcript"]')
    },

    // get 'create-clip'(){
    //   return secondaryInner.querySelector(':scope > [target-id="engagement-panel-clip-create"]')
    // },

    *[Symbol.iterator]() {
      yield* Object.values(this).filter(element => element != null)
    }

  }

  initSecondaryTabs()

  function initSecondaryTabs() {
    const shadow = secondaryInner.attachShadow({mode: 'open'})

    const relatedBtn       = _.button({dataset: {id: 'related'}}, 'Related')
    const playlistBtn      = _.button({dataset: {id: 'playlist'}}, 'Playlist')
    const descriptionBtn   = _.button({dataset: {id: 'description'}}, 'Description')
    const commentsBtn      = _.button({dataset: {id: 'comments'}}, 'Comments')
    const chaptersBtn      = _.button({dataset: {id: 'chapters'}}, 'Chapters')
    const autoChaptersBtn  = _.button({dataset: {id: 'auto-chapters'}}, 'Auto Chapters')
    const transcriptionBtn = _.button({dataset: {id: 'transcription'}}, 'Transcription')
    const liveChatBtn      = _.button({dataset: {id: 'live-chat'}}, 'Live Chat')

    if (new URLSearchParams(location.search).get('list') == null) {
      panels.related.slot = 'active'
      relatedBtn.classList.add('selected')
    } else {
      panels.playlist.slot = 'active'
      playlistBtn.classList.add('selected')
    }

    playlistBtn?.addEventListener('click', event => {
      const ytdWatchFlexy = document.querySelector('ytd-watch-flexy')

      const playlistContainer = ytdWatchFlexy.querySelector('ytd-playlist-panel-renderer#playlist')

      const playlistItemsContainer = playlistContainer.querySelector('.playlist-items')
      const header = playlistContainer.querySelector('.header')

      const selectedItem = playlistItemsContainer.querySelector(':scope > [selected]')

      setTimeout(() => {
        playlistItemsContainer.scrollTop = selectedItem.offsetTop - selectedItem.offsetHeight - 150
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
    ]


    const style = _.style({}, // css
    `
    .title {
      font-size: 16px;
    }

    .panel-buttons {
      flex-shrink: 0;

      display: flex;
      flex-wrap: wrap;
      gap: 5px;

      width: 100%;

      padding-block: 1rem;
    }

    .panel-buttons > button {
      all: unset;

      flex-shrink: 0;
      box-sizing: border-box;
      font-size: 13px;
      color: #eee;

      padding-inline: 0.8em;
      padding-block: 0.7em;

      border-radius: 0.3em;

      background-color: #222;

      user-select: none;
    }

    .panel-buttons > button:is(:hover, :active) {
      background-color: #444;
    }

    .panel-buttons > button:active {
      background-color: #666;
    }

    .panel-buttons > button.selected {
      background-color: #666;
    }
    `
    )

    addEventListener(window, 'youtube-navigate', async event => {
      await waitForSelector('ytd-watch-flexy #secondary #secondary-inner #panels')
      await delay(500)

      const oldPanels = secondaryInner.querySelectorAll(':scope > ytd-engagement-panel-section-list-renderer')

      oldPanels.forEach(panel => panel.remove())

      panelsContainer.after(...panelsContainer.children)

      shadow.replaceChildren()

      shadow.append(
        style,

        _.div({class: 'title'}, 'Panels'),
        _.div({class: 'panel-buttons'},
          panelButtons.filter(button => panels[button.dataset.id] != null)
        ),
        _.slot({attributes: {name: 'active'}}),
      )

      // Show premiere date in description panel
      panels[run](panels => {
        const description = panels.description

        const factoidRendererChild = description.querySelector('#factoids > :nth-child(3) > :first-child')

        const data = factoidRendererChild.ariaLabel

        const value = factoidRendererChild.querySelector(':scope > .factoid-value')
        const label = factoidRendererChild.querySelector(':scope > .factoid-label')

        ;[...factoidRendererChild.children].forEach(e => e.removeAttribute('is-empty'))

        if (data.includes(': ')) {
          value.innerHTML = data.split(': ')[1]
          label.innerHTML = data.split(': ')[0]
        }
      })
    }, {runImmediately: true})

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
