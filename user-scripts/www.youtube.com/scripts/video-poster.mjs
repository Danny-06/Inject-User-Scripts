import { delay, waitForSelector } from '../../@libs/utils-injection.js'

window.addEventListener('load', catchInit)
window.addEventListener('yt-navigate-start', catchInit)
window.addEventListener('yt-navigate-finish', catchInit)

const ytdApp = await waitForSelector('ytd-app')


function catchInit() {
  return init().catch(console.error)
}

async function init(event) {
  // await delay(500)

  // if (event.type === 'load') window.removeEventListener('yt-navigate-finish', init)

  const video = await waitForSelector('ytd-watch-flexy video')
  const videoID = new URL(location.href).searchParams.get('v')

  const thumbnails = ytdApp.data.playerResponse.videoDetails.thumbnail.thumbnails

  for (let i = thumbnails.length - 1; i >= 0; i--) {
    const url = thumbnails[i].url

    if (!canImageLoad(url)) {
      continue
    } else {
      video.poster = url
      break
    }
  }
}


function canImageLoad(url) {
  const image = new Image()
  image.src = url

  return image.decode().then(() => true, () => false)
}
