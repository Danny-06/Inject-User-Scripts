import { waitForSelector } from '../../@libs/utils-injection'

window.addEventListener('load', Executer)
window.addEventListener('yt-navigate-start', Executer)
window.addEventListener('yt-navigate-finish', Executer)


async function Executer(event) {

  if (event.type === 'load') window.removeEventListener('yt-navigate-finish', Executer)

  const thumbnails = ytInitialPlayerResponse?.videoDetails?.thumbnail?.thumbnails

  const video = await waitForSelector('ytd-watch-flexy video')
  const videoID = new URL(location.href).searchParams.get('v')

  const urlFull = `https://i.ytimg.com/vi/${videoID}/maxresdefault.jpg`
  // const urlDefault = `https://i.ytimg.com/vi/${videoID}/hqdefault.jpg`

  const response = await fetch(urlFull)

  if (!thumbnails && response.status === 200) video.poster = urlFull
  else video.poster = thumbnails[thumbnails.length - 1].url

}
