import { waitForSelector } from '../../../../@libs/libs/dom-utils.js'

window.addEventListener('youtube-navigate', async event => {
  const ytdApp = await waitForSelector('ytd-app')

  const video = await waitForSelector('ytd-watch-flexy video')
  // const videoID = new URL(location.href).searchParams.get('v')

  const thumbnails = ytdApp.data.playerResponse.videoDetails.thumbnail.thumbnails


  for (let i = thumbnails.length - 1; i >= 0; i--) {
    const url = thumbnails[i].url

    if (await canImageLoad(url)) {
      video.poster = url
      break
    }
  }
})

function canImageLoad(url) {
  const image = new Image()
  image.src = url

  return image.decode().then(() => true, () => false)
}
