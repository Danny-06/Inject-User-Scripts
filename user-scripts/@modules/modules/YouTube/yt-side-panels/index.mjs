import { waitForSelector } from '../../../../@libs/libs/dom-utils.js'
import { addEventListener } from '../../../../@libs/libs/event-utils.js'
import _ from '../../../../@libs/libs/functional-dom/index.js'
import { delay } from '../../../../@libs/utils-injection.js'

window.addEventListener('youtube-navigate', async event => {
  if (location.pathname !== '/watch') {
    return
  }

  handleSecondaryInnerWatch().catch(reason => console.error(reason))
})

async function handleSecondaryInnerWatch() {
  const secondaryInner = await waitForSelector('ytd-watch-flexy #secondary #secondary-inner')

  const panelsContainer = secondaryInner.querySelector(':scope > #panels')

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

    get 'create-clip'(){
      return secondaryInner.querySelector(':scope > [target-id="engagement-panel-clip-create"]')
    },

    *[Symbol.iterator]() {
      yield* Object.values(this).filter(element => element != null)
    }

  }

  initSecondaryTabs()

  function initSecondaryTabs() {
    const panelButtons = {
      relatedBtn: _.button({dataset: {id: 'related'}}, 'Related'),
      playlistBtn: _.button({dataset: {id: 'playlist'}}, 'Playlist'),
      descriptionBtn: _.button({dataset: {id: 'description'}}, 'Description'),
      commentsBtn: _.button({dataset: {id: 'comments'}}, 'Comments'),
      chaptersBtn: _.button({dataset: {id: 'chapters'}}, 'Chapters'),
      autoChaptersBtn: _.button({dataset: {id: 'auto-chapters'}}, 'Auto Chapters'),
      transcriptionBtn: _.button({dataset: {id: 'transcription'}}, 'Transcription'),
      liveChatBtn: _.button({dataset: {id: 'live-chat'}}, 'Live Chat'),

      *[Symbol.iterator]() {
        for (const key in this) {
          if (this.hasOwnProperty(key)) {
            yield this[key]
          }
        }
      }
    }

    let shadow

    try {
      shadow = secondaryInner.attachShadow({mode: 'open'})
    } catch {
      return
    }

    if (new URLSearchParams(location.search).get('list') == null) {
      panels.related.slot = 'active'
      panelButtons.relatedBtn.classList.add('selected')
    } else {
      panels.playlist.slot = 'active'
      panelButtons.playlistBtn.classList.add('selected')
    }

    panelButtons.playlistBtn.addEventListener('click', event => {
      const ytdWatchFlexy = document.querySelector('ytd-watch-flexy')

      const playlistContainer = ytdWatchFlexy.querySelector('ytd-playlist-panel-renderer#playlist')

      const playlistItemsContainer = playlistContainer.querySelector('.playlist-items')
      const header = playlistContainer.querySelector('.header')

      const selectedItem = playlistItemsContainer.querySelector(':scope > [selected]')

      setTimeout(() => {
        playlistItemsContainer.scrollTop = selectedItem.offsetTop - selectedItem.offsetHeight - 150
      })
    })


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
          [...panelButtons].filter(button => panels[button.dataset.id] != null)
        ),
        _.slot({attributes: {name: 'active'}}),
      )

      const selectedBtnPanel = shadow.querySelector('.panel-buttons > button.selected')
      setActiveSlot(selectedBtnPanel)

      // Show premiere date in description panel
      {
        const description = panels.description

        const factoIdsRendererChild = description.querySelector('#factoids > :nth-child(3) > :first-child')

        const data = factoIdsRendererChild.ariaLabel

        const value = factoIdsRendererChild.querySelector(':scope > .factoid-value')
        const label = factoIdsRendererChild.querySelector(':scope > .factoid-label')

        ;[...factoIdsRendererChild.children].forEach(e => e.removeAttribute('is-empty'))

        if (data.includes(': ')) {
          value.innerHTML = data.split(': ')[1]
          label.innerHTML = data.split(': ')[0]
        }
      }
    }, {runImmediately: true})

    function setActiveSlot(btn) {
      ;[...panels].forEach(panel => {
        // Hide all of the panels
        panel.removeAttribute('slot')
        panel.setAttribute('visibility', 'ENGAGEMENT_PANEL_VISIBILITY_HIDDEN')
      })

      ;[...panelButtons].forEach(button => {
        button.classList.remove('selected')
      })

      if (btn == null) {
        return
      }

      btn.classList?.add('selected')

      panels[btn.dataset.id].slot = 'active'
      panels[btn.dataset.id].setAttribute('visibility', 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED')
      panels[btn.dataset.id].style.order = '0'
    }

    // Handle buttons click

    ;[...panelButtons].forEach(panelBtn => {
      panelBtn.addEventListener('click', event => setActiveSlot(event.currentTarget))
    })

    // Handle "create clip" button
    window.addEventListener('click', event => {
      const createClipBtn = (() => {
        const target = event.target.closest('ytd-button-renderer, ytd-menu-service-item-renderer')

        if (target?.__data?.data?.icon?.iconType !== 'CONTENT_CUT') {
          return null
        }

        return target
      })()

      if (createClipBtn == null) {
        return
      }

      setActiveSlot({dataset: {id: 'create-clip'}})
    })
  }
}
