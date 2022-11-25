import { createElement, waitForSelector, delay } from '../../@libs/utils-injection.js'
import {waitForDocumentLoad} from '../../@libs/libs/dom-utils.js'


waitForDocumentLoad(document)
.then(main)
.catch(console.error)



window.addEventListener('yt-navigate-start', event => main().catch(console.error))

window.addEventListener('yt-navigate-finish', event => main().catch(console.error))


async function main() {
  await delay(0)

  const ytdApp = document.querySelector('ytd-app')
  
  if (!ytdApp?.data?.response?.metadata?.channelMetadataRenderer) return

  const channelId = ytdApp.data?.response.metadata.channelMetadataRenderer.externalId

  if (!channelId) return setTimeout(main)

  const videoCountExists = document.querySelector('.video-count-injected')
  if (videoCountExists) {
    videoCountExists.innerHTML = '?? videos'

    const numberOfVideos = await getVideoCountFromChannel(channelId)

    if (channelId !== ytdApp.data.response.metadata.channelMetadataRenderer.externalId) return

    videoCountExists.innerHTML = `${numberOfVideos} ${numberOfVideos === 1 ? 'video' : 'videos'}`

    return
  }

  const metaChannelHeader = await waitForSelector('tp-yt-app-header #channel-header #meta')
  const videoCount = createElement('div', {
    classes: ['video-count-injected'],
    dataset: {channelId},
    properties: {
      innerHTML: '?? videos',
      style: 'display: block; font-size: 14px; font-weight: bold; margin-top: 5px;'
    }
  })

  metaChannelHeader.append(videoCount)

  const numberOfVideos = await getVideoCountFromChannel(channelId)

  if (channelId !== ytdApp.data.response.metadata.channelMetadataRenderer.externalId) return

  videoCount.innerHTML = `${numberOfVideos} ${numberOfVideos === 1 ? 'video' : 'videos'}`
}



async function getVideoCountFromChannel(channelId) {
  const iframe = document.createElement('iframe')
  
  document.head.prepend(iframe)

  iframe.src = `https://youtube.com/channel/${channelId}/videos?view=57`

  await waitForDocumentLoad(iframe)

  const winIframe1 = iframe.contentWindow

  const {ytInitialData: data1} = winIframe1

  const playlistAllInfo = data1
                          .contents
                          .twoColumnBrowseResultsRenderer
                          .tabs
                          .filter(e => e.tabRenderer?.content)[0]
                          .tabRenderer
                          .content
                          .sectionListRenderer
                          .contents
                          .filter(e => e.itemSectionRenderer?.contents[0]?.shelfRenderer?.playAllButton)
                          .map(e => e.itemSectionRenderer.contents[0].shelfRenderer.playAllButton)[0]


  if (!playlistAllInfo) return 0


  const playlistAllVideosId = playlistAllInfo.buttonRenderer.navigationEndpoint.watchEndpoint.playlistId

  iframe.src = `https://youtube.com/playlist?list=${playlistAllVideosId}`

  await waitForDocumentLoad(iframe)

  const winIframe2 = iframe.contentWindow

  const {ytInitialData: data2} = winIframe2

  const numberOfVideos = data2.sidebar.playlistSidebarRenderer.items[0].playlistSidebarPrimaryInfoRenderer.stats[0].runs[0].text

  iframe.remove()

  return parseInt(numberOfVideos)
}
