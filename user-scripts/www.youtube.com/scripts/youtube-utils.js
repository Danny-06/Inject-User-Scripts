import { waitForSelector, delay, showPopup, generateOverlayIframe, promiseWrapper } from "../../@libs/utils-injection.js"

/**
 * @typedef PlaylistMetadaOptions
 * @property {boolean} getCurrentData If set to `true` the function will return the available data instead of throwing an error 
 */

/**
 * In order to use the function the page of the playlist must have loaded all the videos
 * to be able to get all the data
 * @param {PlaylistMetadaOptions} options
 */
export function getCurrentPlaylistMetadata(options = {}) {
  const {getCurrentData = false} = options

  const playlistSidebar = document.querySelector('ytd-playlist-sidebar-renderer')
  const playlistContainer = document.querySelector('ytd-playlist-video-list-renderer')
  const ytdBrowse = document.querySelector('ytd-browse')

  const {data: data1} = playlistSidebar
  const {data: data2} = playlistContainer
  const {data: data3} = ytdBrowse

  if (data1 == null || data2 == null) {
    showPopup('Data not accessible, try to reload the page')
    return
  }


  const playlistLength     = parseInt(data1.items[0].playlistSidebarPrimaryInfoRenderer.stats[0].runs[0].text)
  const hiddenVideosLength = parseInt(data3.alerts?.[0].alertWithButtonRenderer.text.simpleText ?? 0) || 0

  const contents = data2.contents

  if (!getCurrentData && contents.length !== (playlistLength - hiddenVideosLength)) {
    const message = `The playlist is not fully loaded, scroll down to load it completely`
    showPopup(message, 5000)

    throw new Error(message)
  }

  const videos = []

  const title       = data1.items[0].playlistSidebarPrimaryInfoRenderer.title?.runs[0].text ??
                      data1.items[0].playlistSidebarPrimaryInfoRenderer.titleForm.inlineFormRenderer.textDisplayed?.simpleText

  const description = data1.items[0].playlistSidebarPrimaryInfoRenderer.description?.simpleText ??
                      data1.items[0].playlistSidebarPrimaryInfoRenderer.description?.runs?.map(s => s.text).join('') ??
                      data1.items[0].playlistSidebarPrimaryInfoRenderer.descriptionForm?.inlineFormRenderer.textDisplayed?.simpleText ??
                      `(${data1.items[0].playlistSidebarPrimaryInfoRenderer.descriptionForm?.inlineFormRenderer.placeholder?.runs.map(s => s.text).join('') ?? 'No description'})`

  const owner = {
    name: data1.items[1]?.playlistSidebarSecondaryInfoRenderer.videoOwner.videoOwnerRenderer.title.runs[0].text ?? null,
    id:   data1.items[1]?.playlistSidebarSecondaryInfoRenderer.videoOwner.videoOwnerRenderer.navigationEndpoint.browseEndpoint.browseId ?? null
  }

  const lastUpdated = data1.items[0].playlistSidebarPrimaryInfoRenderer.stats[2].runs[0].text +
                      (data1.items[0].playlistSidebarPrimaryInfoRenderer.stats[2].runs[1]?.text ?? '')

  const views       = data1.items[0].playlistSidebarPrimaryInfoRenderer.stats[1].simpleText

  const {playlistId} = data2

  const playlist = {
    title,
    description,
    playlistId,
    playlistURL: `https://www.youtube.com/playlist?list=${playlistId}`,
    videos,
    owner,
    lastUpdated,
    views,
    hiddenVideosLength
  }


  for (let i = 0; i < contents.length; i++) {
    const videoData = contents[i].playlistVideoRenderer

    if (videoData == null) continue

    const videoId = videoData.videoId
    const length  = videoData.lengthText?.simpleText ?? null

    const thumbnails = [
      `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    ]

    const title =  videoData.title.runs[0].text
    const url = `https://youtube.com/watch?v=${videoId}`

    const owner = {
      name: videoData.shortBylineText?.runs[0].text ?? null,
      id:   videoData.shortBylineText?.runs[0].navigationEndpoint.browseEndpoint.browseId ?? null
    }

    videos.push({title, url, videoId, length, thumbnails, owner})
  }

  return playlist
}


export function cloneCurrentPlaylist(authorization) {
  const playlistData = getCurrentPlaylistMetadata()

  return createPlaylist({
    authorization: authorization,
    title: playlistData.title,
    videoIds: playlistData.videos.map(v => v.videoId)
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

/**
 * @typedef EditPlaylistOptios
 * @property {string} authorization The `authorization` value can be got using devtools network tab where you can see the `authorization` value from Request Headers after making a request like making click on the `add to playlist option` or adding or removing a video from a playlist
 * @property {string} videoId
 * @property {string} playlistId
 * @property {'ADD' | 'REMOVE'} method
 */

/**
 * 
 * @param {EditPlaylistOptios} options 
 * @returns 
 */
export function editPlaylist(options) {
  const {authorization, videoId, playlistId, method = 'ADD'} = options

  if (authorization == null) throw new Error('Missing authorization')

  const API_KEY        = ytcfg?.data_?.INNERTUBE_API_KEY         ?? yt?.config_?.INNERTUBE_API_KEY
  const clientName     = ytcfg?.data_?.INNERTUBE_CLIENT_NAME     ?? yt?.config_?.INNERTUBE_CLIENT_NAME
  const clientVersion  = ytcfg?.data_?.INNERTUBE_CLIENT_VERSION  ?? yt?.config_?.INNERTUBE_CLIENT_VERSION
  const googleAuthUser = ytcfg?.data_?.SESSION_INDEX           ?? yt?.config_?.SESSION_INDEX

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
      "content-type": 'application/json',
      pragma: 'no-cache'
    },

    body: JSON.stringify(body)
  })

}

export async function createPlaylist(options) {
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
