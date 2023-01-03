import { delay, waitForSelector } from '../../@libs/utils-injection.js'

window.addEventListener('load', init)
window.addEventListener('yt-navigate-start', init)
window.addEventListener('yt-navigate-finish', init)

async function init(event) {
  // await delay(500)

  // if (event.type === 'load') window.removeEventListener('yt-navigate-finish', init)

  const video = await waitForSelector('ytd-watch-flexy video')
  const videoID = new URL(location.href).searchParams.get('v')

  const thumbnails = [
    {
      url: `https://i.ytimg.com/vi/${videoID}/hqdefault.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLDiGpJmFn2jHznc6HEH-LRJf_9o0w`,
      width: 168,
      height: 94
    },
    {
      url: `https://i.ytimg.com/vi/${videoID}/hqdefault.jpg?sqp=-oaymwEbCMQBEG5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLD9ri-LM_GTscnG7CyhFc2n_W9BKQ`,
      width: 196,
      height: 110
    },
    {
      url: `https://i.ytimg.com/vi/${videoID}/hqdefault.jpg?sqp=-oaymwEcCPYBEIoBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLATTHe9fL3ky8Gui8ZDZWhZdBXSzQ`,
      width: 246,
      height: 138
    },
    {
      url: `https://i.ytimg.com/vi/${videoID}/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAw-732g01EauOmh8Xd3IPyT2Zw_w`,
      width: 336,
      height: 188
    },
    {
      url: `https://i.ytimg.com/vi/${videoID}/maxresdefault.jpg`,
      width: 1920,
      height: 1080
    }
  ]

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
