import { showPopup } from "../../../@libs/libs/dialogs/dialogs.js"
import { createElement, parseXML, turnStringIntoTrustedHTML } from "../../../@libs/libs/dom-utils.js"
import { waitForSelector, delay, promiseWrapper} from "../../../@libs/utils-injection.js"

export class ContextMenuManager {

  static ctxItemsMap = new Map()

  static get elementItems() {
    const items = []

    this.ctxItemsMap.forEach((options, ctxItemInterface) => {
      if (typeof options.condition !== 'function' || options.condition()) {
        items.push(ctxItemInterface.element)
      }
    })

    return items
  }

  static async #removeContextMenuItems() {
    const contextMenuPopup = await waitForSelector('.ytp-popup.ytp-contextmenu > .ytp-panel > .ytp-panel-menu')

    contextMenuPopup.querySelector(`#group-custom-options`)?.remove()

    this.ctxItemsMap.clear()
  }

  static #isContextMenuInitializing = false

  /**
   * 
   * @returns {Promise<HTMLDivElement> | Promise<null>} Container for the custom ContextMenu items
   */
  static async initCustomContextMenuItems() {
    if (this.#isContextMenuInitializing) {
      return null
    }

    this.#isContextMenuInitializing = true

    await this.#removeContextMenuItems()

    const contextMenuPopup = await waitForSelector('.ytp-popup.ytp-contextmenu > .ytp-panel > .ytp-panel-menu')

    const style = createElement('style', {
      id: 'context-menu-styles',
      properties: {
        innerHTML: // css
        `
        /*# sourceURL=custom-context-menu.css */
        .ytp-popup.ytp-contextmenu,
        .ytp-panel-menu,
        .ytp-panel {
          overflow: visible;
        }

        .ytp-popup.ytp-contextmenu > .ytp-panel {}

        .ytp-popup.ytp-contextmenu,
        .ytp-popup.ytp-contextmenu > .ytp-panel,
        .ytp-popup.ytp-contextmenu > .ytp-panel > .ytp-panel-menu {}

        textarea.ytp-html5-clipboard {
          transform: scale(0);
        }

        .ytp-menuitem.group-items:hover > .options-content.ytp-panel-menu {
          visibility: visible;
        }

        .options-content.ytp-panel-menu {
          display: block;
          height: 296px;
          overflow: auto;
          overscroll-behavior: contain;

          visibility: hidden;
          position: absolute;
          left: 10%;
          background-color: #111;
        }

        :fullscreen .options-content.ytp-panel-menu {
          height: 356px;
        }

        #group-custom-options > .ytp-menuitem-content {
          font-size: 2.5rem;
        }

        .ytp-popup.ytp-contextmenu .ytp-menuitem-toggle-checkbox {
          position: static;
          transform: none;
        }
        `
      }
    })

    if (!document.querySelector('#context-menu-styles')) {
      document.body.append(style)
    }

    const groupItems = createElement('div', {
      id: 'group-custom-options',
      classes: ['ytp-menuitem', 'group-items'],
      dataset: {source: 'Chrome Extension'},
      properties: {
        innerHTML: // html
        `
        <div class="ytp-menuitem-icon">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 32.055 32.055" style="pointer-events: auto;" xml:space="preserve">
                <path fill="currentColor" d="M3.968,12.061C1.775,12.061,0,13.835,0,16.027c0,2.192,1.773,3.967,3.968,3.967c2.189,0,3.966-1.772,3.966-3.967   C7.934,13.835,6.157,12.061,3.968,12.061z M16.233,12.061c-2.188,0-3.968,1.773-3.968,3.965c0,2.192,1.778,3.967,3.968,3.967   s3.97-1.772,3.97-3.967C20.201,13.835,18.423,12.061,16.233,12.061z M28.09,12.061c-2.192,0-3.969,1.774-3.969,3.967   c0,2.19,1.774,3.965,3.969,3.965c2.188,0,3.965-1.772,3.965-3.965S30.278,12.061,28.09,12.061z"></path>
            </svg>
        </div>
        <div class="ytp-menuitem-label">Opciones Extras</div>
        <div class="ytp-menuitem-content">&gt;</div>
        <div class="options-content ytp-panel-menu"></div>
        `
      }
    })

    contextMenuPopup.prepend(groupItems)

    const optionsContent = groupItems.querySelector('.options-content.ytp-panel-menu')

    optionsContent.addEventListener('wheel', event => {
      if (optionsContent.offsetHeight === optionsContent.scrollHeight) {
        event.preventDefault()
      }
    })

    await delay(0)

    this.#isContextMenuInitializing = false

    return groupItems.querySelector(':scope > .options-content')
  }


  /**
   * @typedef VideoContextMenuOptions
   * @property {string} id
   * @property {string} name
   * @property {(ctxItem) => void} action
   * @property {string} icon
   */

  /**
   * @param {VideoContextMenuOptions} options
   */
  static addVideoContextMenuItem(options) {
    if (options == null) return

    const {name = 'No Name Defined', action, icon = '', id} = options

    const itemMenu = createElement('div', {
      classes: ['ytp-menuitem'],
      dataset: {source: 'Chrome Extension', id},
      properties: {
        role: 'menuitem',
        tabindex: 0,
        innerHTML: // html
        `
          <div class="ytp-menuitem-icon">
            ${icon}
          </div>
          <div class="ytp-menuitem-label">${name}</div>
          <div class="ytp-menuitem-content"></div>
        `
      }
    })

    const itemIcon    = itemMenu.querySelector('.ytp-menuitem-icon')
    const itemLabel   = itemMenu.querySelector('.ytp-menuitem-label')
    const itemContent = itemMenu.querySelector('.ytp-menuitem-content')

    const ctxItemInterface = {
      element: itemMenu,

      originalIcon: itemIcon.firstElementChild,
      get icon() {
        return itemIcon.firstElementChild
      },
      set icon(value) {
        switch (typeof value) {
          case 'string':
            itemIcon.innerHTML = value
          break

          case 'object':
            if (value != null && value instanceof Element) {
              itemIcon.firstElementChild.replaceWith(value)
            }
          break

          default:
        }
      },

      originalName: itemLabel.innerHTML,
      get name() {
        return itemLabel.innerHTML
      },
      set name(value) {
        itemLabel.innerHTML = turnStringIntoTrustedHTML(value)
      },

      toogleCheck() {
        return this.checked = !this.checked
      },
      get checked() {
        return this.element.ariaChecked === 'true'
      },
      set checked(value) {
        if (typeof value !== 'boolean') throw new Error(`Value must be a boolean`)

        if (value) {
          itemContent.innerHTML = `<div class="ytp-menuitem-toggle-checkbox"></div>`
          this.element.ariaChecked = true
        } else {
          itemContent.innerHTML = ''
          this.element.ariaChecked = false
        }
      }
    }

    itemMenu.addEventListener('click', event => {
      const ytContextMenu = itemMenu.closest('.ytp-popup.ytp-contextmenu')
      if (ytContextMenu) ytContextMenu.style.display = 'none'

      document.documentElement.click()

      action?.(ctxItemInterface)
    })

    this.ctxItemsMap.set(ctxItemInterface, options)
  }

  /**
   * 
   * @param {VideoContextMenuOptions[]} optionsCollection 
   */
  static addVideoContextMenuItems(optionsCollection) {
    optionsCollection.forEach(option => this.addVideoContextMenuItem(option))
  }

}


/**
 * Función que selecciona la calidad 1080p (o le que haya disponible más alta si esta no estuviera)
 * @param {HTMLVideoElement} video
 */
export async function calidad1080pAutomatica(video) {
  // if (video.readyState !== video.HAVE_ENOUGH_DATA) {
  //   await promisefyEvent(video, 'load')
  // }

  const player = video.closest('ytd-player')

  // Esperara a que el botón del menu de ajustes esté disponible
  const settingsButton = await waitForSelector('.ytp-settings-button', {node: player})

  await delay(500)
  settingsButton.click();

  const menuOpciones = player.querySelector('.ytp-settings-menu .ytp-panel-menu')

  await delay(1000)

  await waitForSelector('.ytp-settings-menu .ytp-panel-menu > :last-child:not(:first-child)', {node: player})
  await delay(500)

  const botonCalidadVideo = menuOpciones.lastElementChild
  botonCalidadVideo.click()

  await delay(500)


  const menuOpcionesCalidad = player.querySelector('.ytp-quality-menu .ytp-panel-menu')


  const opcionesCalidad = [...menuOpcionesCalidad.children]

  const resoluciones = [
    '1080p',
    '720p',
    '480p',
    '360p',
    '240p',
    '144p'
  ]

  try {

    opcionesCalidad.forEach(opcion => {

      for (let i = 0; i < resoluciones.length; i++) {
        if (opcion.textContent.includes(resoluciones[i])) {
          opcion.click()
          video.focus()

          throw `'opcionesCalidad.forEach' cancelled`
        }
      }

    })

  } catch (error) {}

  settingsButton.click()
  settingsButton.click()
}


/**
 * @typedef PlaylistMetadaOptions
 * @property {boolean} getCurrentData If set to `true` the function will return the available data instead of throwing an error
 */

/**
 * In order to use the function the page of the playlist must have loaded all the videos
 * to be able to get all the data
 * @param {PlaylistMetadaOptions} options
 */
export async function getCurrentPlaylistMetadata() {
  const playlistId = new URL(location.href).searchParams.get('list')

  if (playlistId == null || playlistId == '') {
    throw new Error(`Couldn't find 'playlistId'`)
  }

  const data = await getPlaylistMetadata({playlistId})

  return data
}


/**
 *
 * @param {string} authorization
 * @returns
 */
export async function cloneCurrentPlaylist(authorization) {
  const playlistData = await getCurrentPlaylistMetadata()

  return createPlaylist({
    authorization: authorization,
    title: playlistData.title,
    videoIds: playlistData.videos.map(v => v.id)
  })
}

/**
 *
 * @param {{authorization: string, videoIds: string[]}} options
 */
export async function appendVideosToCurrentPlaylist(options) {
  const {authorization, videoIds} = options

  const playlistData = getCurrentPlaylistMetadata({getCurrentData: true})

  for (let i = 0; i < videoIds.length; i++) {
    const videoId = videoIds[i]

    const [response, error] = await promiseWrapper(
      editPlaylist({
        authorization,
        playlistId: playlistData.playlistId,
        videoId: videoId,
        method: 'ADD'
      })
    )

    if (error || response.status !== 200) {
      showPopup(`An error occured when trying to fetch`)

      throw error
    }

    showPopup(`video #${i} added to playlist`, 1000)
  }
}

// /**
//  *
//  * @param {string} src
//  * @returns {Promise<HTMLIFrameElement>}
//  */
// function createAndAppendIframe(src) {
//   return new Promise((resolve, reject) => {
//     const iframe = document.createElement('iframe')
//     iframe.src = src
//     iframe.style.width = '100vw'
//     iframe.style.height = '100vh'
//     iframe.style.visibility = 'hidden'
//     iframe.style.position = 'fixed'

//     document.body.append(iframe)

//     iframe.addEventListener('load', event => {
//       resolve(iframe)
//     })
//   })
// }

// export async function getPlaylistMetadataIframe(options = null) {
//   if (options == null) {
//     options = {}

//     if (options.playlistId == null) {
//       options = {
//         get playlistId() {
//           throw new Error(`A 'playlistId' must be specified`)
//         }
//       }
//     }
//   }

//   const {playlistId} = options

//   const iframe = await createAndAppendIframe(`https://www.youtube.com/playlist?list=${playlistId}`)
//   await delay(2000)


//   const win = iframe.contentWindow
//   const doc = iframe.contentDocument

//   const dropdown = doc.querySelector('#button.dropdown-trigger > button')
//   dropdown.click()

//   await delay(0)

//   const showHiddenVideosBtn = doc.querySelector(
//     `ytd-popup-container.ytd-app .ytd-menu-popup-renderer ytd-menu-navigation-item-renderer a[href="/playlist?list=${playlistId}"]`
//   )
//   showHiddenVideosBtn?.click()

//   await delay(0)

//   // const playlistSidebar = doc.querySelector('ytd-playlist-sidebar-renderer')
//   const playlistContainer = doc.querySelector('ytd-playlist-video-list-renderer')
//   const contents = playlistContainer.querySelector('#contents')

//   // const playlistLength = parseInt(playlistSidebar.data.items[0].playlistSidebarPrimaryInfoRenderer.stats[0].runs[0].text)

//   const listIsFinished = () => !contents.querySelector('ytd-playlist-video-list-renderer ytd-continuation-item-renderer')
//   const html = doc.documentElement

//   while (!listIsFinished()) {
//     html.scrollTop = html.scrollHeight

//     await delay(1000)

//     console.log(listIsFinished())
//   }

//   const data = getCurrentPlaylistMetadata({doc: doc})

//   iframe.remove()

//   return data
// }


/**
 * @typedef EditPlaylistOptions
 * @property {string} authorization The `authorization` value can be got using devtools network tab where you can see the `authorization` value from Request Headers after making a request like making click on the `add to playlist option` or adding or removing a video from a playlist
 * @property {string} videoId
 * @property {string} playlistId
 * @property {'ADD' | 'REMOVE'} method
 */

/**
 *
 * @param {EditPlaylistOptions} options
 * @returns
 */
export function editPlaylist(options) {
  const {authorization, videoId, playlistId, method = 'ADD'} = options

  if (authorization == null) throw new Error('Missing authorization')

  const API_KEY        = ytcfg?.data_?.INNERTUBE_API_KEY         ?? yt?.config_?.INNERTUBE_API_KEY
  const clientName     = ytcfg?.data_?.INNERTUBE_CLIENT_NAME     ?? yt?.config_?.INNERTUBE_CLIENT_NAME
  const clientVersion  = ytcfg?.data_?.INNERTUBE_CLIENT_VERSION  ?? yt?.config_?.INNERTUBE_CLIENT_VERSION
  const googleAuthUser = ytcfg?.data_?.SESSION_INDEX             ?? yt?.config_?.SESSION_INDEX

  const videoActions = {
    ADD_VIDEO: 'ACTION_ADD_VIDEO',
    REMOVE_VIDEO: 'ACTION_REMOVE_VIDEO_BY_VIDEO_ID'
  }

  let actions

  switch (method) {
    case 'ADD':
      actions = [
        {
          addedVideoId: videoId,
          action: videoActions.ADD_VIDEO
        }
      ]
    break

    case 'REMOVE':
      actions = [
        {
          removedVideoId: videoId,
          action: videoActions.REMOVE_VIDEO
        }
      ]
    break

    default:
  }

  const body = {
    context: {
      client: {
        clientName: clientName,
        clientVersion: clientVersion
      }
    },

    actions: actions,
    playlistId: playlistId
  }

  return fetch(`https://www.youtube.com/youtubei/v1/browse/edit_playlist?key=${API_KEY}&prettyPrint=false`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',

    headers: {
      authorization: authorization,
      'x-goog-authuser': googleAuthUser,

      'cache-control': 'no-cache',
      'content-type': 'application/json',
      pragma: 'no-cache'
    },

    body: JSON.stringify(body)
  })

}

/**
 * @typedef CreatePlaylistOptions
 * @property {string} authorization
 * @property {string} title
 * @property {string[]} videoIds
 */

/**
 *
 * @param {CreatePlaylistOptions} options
 * @returns
 */
export function createPlaylist(options) {
  const date  = new Date()
  const day   = date.getDate() + 1
  const month = date.getMonth() + 1
  const year  = date.getFullYear()

  const {authorization, title = `New Playlist ${day}-${month}-${year}`, videoIds = []} = options

  if (authorization == null) throw new Error('Missing authorization')

  const API_KEY        = ytcfg?.data_?.INNERTUBE_API_KEY        ?? yt?.config_?.INNERTUBE_API_KEY
  const clientName     = ytcfg?.data_?.INNERTUBE_CLIENT_NAME    ?? yt?.config_?.INNERTUBE_CLIENT_NAME
  const clientVersion  = ytcfg?.data_?.INNERTUBE_CLIENT_VERSION ?? yt?.config_?.INNERTUBE_CLIENT_VERSION
  const googleAuthUser = ytcfg?.data_?.SESSION_INDEX            ?? yt?.config_?.SESSION_INDEX

  const body = {
    context: {
      client: {
        clientName: clientName,
        clientVersion: clientVersion,
      }
    },

    title: title,
    videoIds: videoIds
  }

  return fetch(`https://www.youtube.com/youtubei/v1/playlist/create?key=${API_KEY}&prettyPrint=false`, {
    method: 'POST',
    mode: 'cors',

    headers: {
      authorization: authorization,
      'x-goog-authuser': googleAuthUser,

      'cache-control': 'no-cache',
      "content-type": 'application/json',
      pragma: 'no-cache'
    },

    body: JSON.stringify(body)
  })
}

/**
 * 
 * @param {{playlistId: string}} options 
 * @returns {Promise<{
 *  title: string,
 *  description: string,
 *  playlistId: string,
 *  playlistURL: string,
 *  videos: {
 *    title: string,
 *    url: string,
 *    id: string,
 *    length: string,
 *    thumbnails: string[] | null
 *  }[],
 *  owner: {
 *    name: string,
 *    id: string
 *  },
 *  lastUpdated: string,
 *  views: string
 * }>}
 */
export async function getPlaylistMetadata(options) {
  const {playlistId} = options

  if (playlistId == null || playlistId === '') throw new Error(`Missing 'playlistId'`)

  const data = {
    title: '',
    description: '',
    playlistId: '',
    playlistURL: '',
    videos: [],
    owner: {
      name: '',
      id: ''
    },
    lastUpdated: '',
    views: ''
  }

  data.playlistURL = `https://www.youtube.com/playlist?list=${playlistId}`

  const doc = await fetch(data.playlistURL)
                   .then(r => r.text())
                   .then(text => {
                     const doc = document.implementation.createHTMLDocument()
                     doc.write(text)
                     doc.close()
                     return doc
                   });


  const jsonInitialData = [...doc.querySelectorAll('script')]
                          .filter(s => s.innerHTML.trim().startsWith('var ytInitialData'))[0]
                          .innerHTML.slice('var ytInitialData = '.length, -1)

  const initialData = JSON.parse(jsonInitialData)

  const clientData = initialData.responseContext.serviceTrackingParams
  .filter(st => st.service === 'ECATCHER')[0].params
  .map(d => ({[d.key]: d.value}))
  .reduce((acc, val) => Object.assign(acc, val), {})

  const ytcfgText = [...doc.querySelectorAll('script')]
                  .filter(s => s.innerHTML.trim().startsWith('(function() {window.ytplayer={};\nytcfg.set'))[0]
                  .innerHTML

  const startIndex = ytcfgText.indexOf(`"INNERTUBE_API_KEY":"`) + `"INNERTUBE_API_KEY":"`.length;
  

  const API_KEY = ytcfgText.slice(startIndex, ytcfgText.indexOf(`"`, startIndex))
  const clientName = clientData['client.name']
  const clientVersion = clientData['client.version']
  const googleAuthUser = initialData.responseContext.webResponseContextExtensionData.ytConfigData.sessionIndex


  // const API_KEY        = ytcfg?.data_?.INNERTUBE_API_KEY        ?? yt?.config_?.INNERTUBE_API_KEY
  // const clientName     = ytcfg?.data_?.INNERTUBE_CLIENT_NAME    ?? yt?.config_?.INNERTUBE_CLIENT_NAME
  // const clientVersion  = ytcfg?.data_?.INNERTUBE_CLIENT_VERSION ?? yt?.config_?.INNERTUBE_CLIENT_VERSION
  // const googleAuthUser = ytcfg?.data_?.SESSION_INDEX            ?? yt?.config_?.SESSION_INDEX


  const plspir = initialData.sidebar.playlistSidebarRenderer.items[0].playlistSidebarPrimaryInfoRenderer
  const plssir = initialData.sidebar.playlistSidebarRenderer.items[1].playlistSidebarSecondaryInfoRenderer

  data.title       = plspir.title?.runs[0].text ??
                      plspir.titleForm.inlineFormRenderer.textDisplayed?.simpleText

  data.description = plspir.description?.simpleText ??
                      plspir.description?.runs?.map(s => s.text).join('') ??
                      plspir.descriptionForm?.inlineFormRenderer.textDisplayed?.simpleText ??
                      `(${plspir.descriptionForm?.inlineFormRenderer.placeholder?.runs.map(s => s.text).join('') ?? 'No description'})`

  data.owner = {
    name: plssir.videoOwner.videoOwnerRenderer.title.runs[0].text ?? null,
    id:   plssir.videoOwner.videoOwnerRenderer.navigationEndpoint.browseEndpoint.browseId ?? null
  }

  data.lastUpdated = plspir.stats[2].runs[0].text +
                      plspir.stats[2].runs[1]?.text ?? ''

  data.views       = plspir.stats[1].simpleText

  const playlistVideoListRenderer = initialData.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer
 
  data.playlistId = playlistVideoListRenderer.playlistId
  data.title = initialData.metadata.playlistMetadataRenderer.title

  const contents = playlistVideoListRenderer.contents

  const continuationItem = contents.splice(contents.length - 1, 1)[0]

  let continuationToken = null

  if (!continuationItem.hasOwnProperty('continuationItemRenderer')) {
    contents.push(continuationItem)
  } else {
    continuationToken = continuationItem.continuationItemRenderer.continuationEndpoint.continuationCommand.token
  }

  contents.forEach(c => {
    const video = {
      title: '',
      url: '',
      id: '',
      length: '',
      thumbnails: null
    }

    const plvr = c.playlistVideoRenderer

    video.id = plvr.videoId
    video.title = plvr.title.runs[0].text
    video.length = plvr.lengthText.simpleText
    video.url = `https://www.youtube.com/watch?v=${video.id}`

    video.thumbnails = [
      `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
      `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`
    ]

    data.videos.push(video)
  })

  await (async function fetchContinuation(continuationToken) {

    if (continuationToken == null) return

    const body = {
      context: {
        client: {
          clientName: clientName,
          clientVersion: clientVersion
        }
      },
      continuation: continuationToken
    }

    const dataResponse = await fetch(`https://www.youtube.com/youtubei/v1/browse?key=${API_KEY}&prettyPrint=false`, {
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        'x-goog-authuser': googleAuthUser,
      },
      body: JSON.stringify(body),
      method: 'POST',
      mode: 'cors',
    }).then(r => r.json())

    const continuationItems = dataResponse.onResponseReceivedActions[0].appendContinuationItemsAction.continuationItems

    const continuationItem = continuationItems.splice(continuationItems.length - 1, 1)[0]

    let nextContinuationToken = null

    if (!continuationItem.hasOwnProperty('continuationItemRenderer')) {
      continuationItems.push(continuationItem)
    } else {
      nextContinuationToken = continuationItem.continuationItemRenderer.continuationEndpoint.continuationCommand.token
    }

    continuationItems.forEach(c => {
      const video = {
        title: '',
        url: '',
        id: '',
        length: '',
        thumbnails: null
      }
  
      const plvr = c.playlistVideoRenderer
  
      video.id = plvr.videoId
      video.title = plvr.title.runs[0].text
      video.length = plvr.lengthText.simpleText
      video.url = `https://www.youtube.com/watch?v=${video.id}`
  
      video.thumbnails = [
        `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
        `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`
      ]
  
      data.videos.push(video)
    })

    await fetchContinuation(nextContinuationToken)

  })(continuationToken)


  return data
}



export function getYTChapters() {
  const container = document.querySelector('ytd-watch-flexy .ytd-macro-markers-list-renderer')

  if (container == null) throw new Error(`Chapters container not found`)

  const childNodes = [...container.children]

  const chapters = []

  childNodes.forEach(node => {
    const name      = node.querySelector('#details > h4[title]')?.textContent
    const time      = node.querySelector('#details > #time')?.textContent
    const thumbnail = node.querySelector('#thumbnail > yt-img-shadow > img')?.src

    chapters.push({name, time, thumbnail})
  })

  return chapters
}

function formatTime(time) {
  const tokens = time.split(':').reverse()

  let [
    seconds = '00',
    minutes = '00',
    hours = '00'
  ] = tokens

  if (seconds.length === 1) seconds = '0' + seconds
  if (minutes.length === 1) minutes = '0' + minutes
  if (hours.length === 1) hours = '0' + hours

  const newTime = `${hours}:${minutes}:${seconds}:000`

  return newTime
}

function stringToValidInnerHTML(string) {
  const div = document.createElement('div')

  const trustedHTMLPolicy = trustedTypes.createPolicy('trustedHTML', {createHTML: string => string})

  div.innerHTML = trustedHTMLPolicy.createHTML(string)

  return div.innerHTML
}

export function ytChaptersToSimpleChapterFormat(chapters) {
  let chaptersTXT = ''

  chapters.forEach((chapter, i) => {
    const name = chapter.name
    const time = formatTime(chapter.time)

    const chapterIndex = (i + 1 < 10 ? '00' : (i + 1 < 100 ? '0' : '')) + (i + 1)

    chaptersTXT += `CHAPTER${chapterIndex}=${time}\n`
    chaptersTXT += `CHAPTER${chapterIndex}NAME=${name}\n`
  })

  return chaptersTXT
}

export function ytChaptersToXML(chapters, lang = 'eng') {
  let chaptersXML = ''

  chapters.forEach((chapter, i) => {
    const name = stringToValidInnerHTML(chapter.name)
    const time = formatTime(chapter.time)

    chaptersXML += // xml
`
        <ChapterAtom>
            <ChapterTimeStart>${time}</ChapterTimeStart>
            <ChapterDisplay>
                <ChapterString>${name}</ChapterString>
                <ChapterLanguage>${lang}</ChapterLanguage>
                <!--ChapLanguageIETF>es</ChapLanguageIETF-->
            </ChapterDisplay>
        </ChapterAtom>
`
  })

  const xmlData = // xml
  `
<?xml version="1.0"?>
<!-- <!DOCTYPE Chapters SYSTEM "matroskachapters.dtd"> -->
<Chapters>
    <EditionEntry>
${chaptersXML}
    </EditionEntry>
</Chapters>
  `.trim()

  return xmlData
}

export function simpleChapterFormatToXML(data, lang = 'eng') {
  const rows = data.split('\n')

  let chaptersXML = ''


  for (let i = 0; i < rows.length - 1; i += 2) {
    const name = stringToValidInnerHTML(rows[i + 1].split('=')[1])
    const time = rows[i + 0].split('=')[1].replace('CHAPTER', '')

    chaptersXML += // xml
`
        <ChapterAtom>
            <ChapterTimeStart>${time}</ChapterTimeStart>
            <ChapterDisplay>
                <ChapterString>${name}</ChapterString>
                <ChapterLanguage>${lang}</ChapterLanguage>
                <!--ChapLanguageIETF>es</ChapLanguageIETF-->
            </ChapterDisplay>
        </ChapterAtom>
`
  }

  const xmlData = // xml
  `
<?xml version="1.0"?>
<!-- <!DOCTYPE Chapters SYSTEM "matroskachapters.dtd"> -->
<Chapters>
    <EditionEntry>
        ${chaptersXML}
    </EditionEntry>
</Chapters>
  `.trim()

  return xmlData
}

export function xmlToSimpleChapterFormat(data) {
  const entryNode = parseXML(data).querySelector('Chapters:root > EditionEntry')

  if (entryNode == null) throw new Error(`Couldnt find node root node '<Chapters>'`)

  const chapterNodes = [...entryNode.children]

  let chaptersTXT = ''

  chapterNodes.forEach((node, i) => {
    const name = node.querySelector(':scope > ChapterDisplay > ChapterString')
    const time = node.querySelector(':scope > ChapterTimeStart')

    const chapterIndex = (i + 1 < 10 ? '00' : (i + 1 < 100 ? '0' : '')) + (i + 1)

    chaptersTXT += `CHAPTER${chapterIndex}=${time}\n`
    chaptersTXT += `CHAPTER${chapterIndex}NAME=${name}\n`
  })

  return chaptersTXT
}




/**
 * Currently there are some random playlists that for no reason always miss 1 or 2 videos after cloning
 */
// export async function cloneCurrentPlaylist() {
//   const playlistSidebar = document.querySelector('ytd-playlist-sidebar-renderer')

//   if (playlistSidebar.data == null) {
//     showPopup('Data not accessible, try to reload the page')
//     return
//   }

//   const playlistData = getCurrentPlaylistMetadata()

//   // Add Iframe Overlay to Screen to avoid any interaction

//   const iframeOverlay = generateOverlayIframe()

//   showPopup(`Website won't be interactive during the process`, 1500)

//   await delay(1500)

//   const playlistContainer = document.querySelector('ytd-playlist-video-list-renderer')

//   const contents = playlistContainer.querySelector('#contents')


//   // Create Playlist

//   const button = contents.firstElementChild.querySelector('ytd-menu-renderer > yt-icon-button > button')
//   button.click()

//   const popupListBox = await waitForSelector('ytd-popup-container tp-yt-paper-listbox')
//   popupListBox.querySelector('[has-separator]').click()

//   showPopup(1, 500)


//   const createPlaylistButton = await waitForSelector('tp-yt-paper-dialog #actions ytd-add-to-playlist-create-renderer #endpoint')
//   createPlaylistButton.click()

//   const createPlaylistForm = await waitForSelector('ytd-add-to-playlist-create-renderer #create-playlist-form')

//   const inputPlaylistName = createPlaylistForm.querySelector('yt-text-input-form-field-renderer#name-input input')
//   inputPlaylistName.value = playlistData.name
//   inputPlaylistName.dispatchEvent(new Event('input', {bubbles: true}))

//   const createPlaylistButtonForm = createPlaylistForm.querySelector('#actions ytd-button-renderer a')
//   createPlaylistButtonForm.click()

//   // Wait for playlist to appear in the left side menu
//   const playlistLink = await waitForSelector(`ytd-guide-collapsible-section-entry-renderer #section-items ytd-guide-entry-renderer:has(> [title="${playlistData.name}"])`)
//   const playlistId = playlistLink.data.entryData.guideEntryData.guideEntryId

//   // Wait for the playlist to be ready to add videos
//   await delay(2500)


//   // Add videos to new playlist
//   // Start at the second video since creating the playlist already adds the first video to it
//   for (let i = 1; i < contents.children.length; i++) {
//     const videoData = playlistData.videos[i]

//     await waitForSelector('tp-yt-iron-overlay-backdrop', {checkOpposite: true})

//     const child = contents.children[i]

//     child.scrollIntoView({behavior: 'auto', block: 'start'})

//     // Click '3 dots' button
//     const button = child.querySelector('ytd-menu-renderer > yt-icon-button > button')
//     button.click()

//     await delay(50)

//     // Click `add to playlist` button
//     const popupListBox = document.querySelector('ytd-popup-container tp-yt-paper-listbox')
//     popupListBox.querySelector('[has-separator]').click()

//     showPopup(`${i + 1}. ${videoData.title}`, 500)

//     await waitForSelector('tp-yt-iron-overlay-backdrop')

//     const addToPlaylistRenderer = document.querySelector('ytd-add-to-playlist-renderer')
//     const videoId = addToPlaylistRenderer.data.actions[0].addToPlaylistCreateRenderer.serviceEndpoint.createPlaylistServiceEndpoint.videoIds[0]


//     // Click 'playlist toggle'
//     const playlistsToggles = document.querySelector('ytd-add-to-playlist-renderer #playlists')
//     const playlistToggleButtons = playlistsToggles.querySelectorAll(`:scope > ytd-playlist-add-to-option-renderer:has([title="${playlistData.name}"])`)
//     const playlistToggleButton = [...playlistToggleButtons].filter(n => n.data.playlistId === playlistId)[0]
//     // playlistToggleButton.firstElementChild.click()

//     await delay(0)

//     // Click 'close button'
//     const addToPlaylistCloseButton = document.querySelector('ytd-add-to-playlist-renderer #close-button > button')
//     addToPlaylistCloseButton.click()
//   }

//   // Remove Iframe Overlay
//   iframeOverlay.remove()
// }
