import { waitForSelector } from '../../../../@libs/libs/dom-utils.js'
import { eventsInfo } from '../_handle-events/index.mjs'


/**
 * @type {HTMLVideoElement}
 */
let video

window.addEventListener('youtube-navigate', async event => {
  if (video != null && video === video) {
    return
  }

  video = await waitForSelector('ytd-app ytd-watch-flexy video')

  video.addEventListener('yt-video-ad-start', event => {
    skipVideoAd(video)
  })

  const dispatchYtVideoAdStart =  async event => {
    if (!isVideoAd(video)) {
      return
    }

    const ytVideoAdStartEvent = new CustomEvent('yt-video-ad-start')
    video.dispatchEvent(ytVideoAdStartEvent)
  }

  dispatchYtVideoAdStart()

  video.addEventListener('loadeddata', dispatchYtVideoAdStart)
})

/**
 * 
 * @param {HTMLDivElement} ytVideo 
 * @returns 
 */
function isVideoAd(ytVideo) {
  const ytPlayerParent = ytVideo.closest('.html5-video-player')

  if (!ytPlayerParent) {
    throw new Error(`Couldn't find player parent of the video`)
  }

  return ytPlayerParent.classList.contains('ad-showing') || ytPlayerParent.classList.contains('ad-interrupting')
}

async function skipVideoAd(ytVideo) {
  ytVideo.currentTime += ytVideo.duration

  const skipButton = await waitForSelector('.ytp-ad-skip-button-modern')
  skipButton.click()
}
