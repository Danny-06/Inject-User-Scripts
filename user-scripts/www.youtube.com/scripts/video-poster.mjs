import { waitForSelector } from '../../@libs/utils-injection.js'

window.addEventListener('load', init)
window.addEventListener('yt-navigate-start', init)
window.addEventListener('yt-navigate-finish', init)


async function init(event) {

  if (event.type === 'load') window.removeEventListener('yt-navigate-finish', init)

  const thumbnails = ytInitialPlayerResponse?.videoDetails?.thumbnail?.thumbnails

  const video = await waitForSelector('ytd-watch-flexy video')
  const videoID = new URL(location.href).searchParams.get('v')

  const urlFull = `https://i.ytimg.com/vi/${videoID}/maxresdefault.jpg`
  // const urlDefault = `https://i.ytimg.com/vi/${videoID}/hqdefault.jpg`

  const response = await fetch(urlFull)

  if (!thumbnails && response.status === 200) video.poster = urlFull
  else video.poster = thumbnails[thumbnails.length - 1].url

}
