import { waitForSelector } from '../../../../@libs/libs/dom-utils.js'

/**
 * @type {HTMLVideoElement}
 */
let video

window.addEventListener('youtube-navigate', async event => {
  if (video != null && video === video) {
    return
  }

  video = await waitForSelector('ytd-app ytd-watch-flexy video')

  const playerParent = video.closest('.html5-video-player')

  video.addEventListener('loadeddata', async event => {
    const isVideoAd = playerParent.classList.contains('ad-showing') || playerParent.classList.contains('ad-interrupting')

    if (!isVideoAd) {
      return
    }

    video.currentTime += video.duration

    const skipButton = await waitForSelector('.ytp-ad-skip-button-modern')
    skipButton.click()
  })

})
