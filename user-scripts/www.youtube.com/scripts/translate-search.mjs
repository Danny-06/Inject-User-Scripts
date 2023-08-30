import { waitForDocumentReady } from '../../@libs/libs/dom-utils.js'

// Modificar titulos de las miniaturas de YouTube al nombre original


waitForDocumentReady(document)
.then(() => {
  if (location.pathname === '/results') revertAllVideoTitleTranslations()
})

window.addEventListener('yt-navigate-start', event => {
  if (location.pathname === '/results') revertAllVideoTitleTranslations()
})

window.addEventListener('yt-navigate-finish', event => {
  if (location.pathname === '/results') revertAllVideoTitleTranslations()
})



function revertAllVideoTitleTranslations() {
  requestAnimationFrame(revertAllVideoTitleTranslations)

  if (!location.href.includes('youtube.com/result')) return

  const videoList = document.querySelectorAll('ytd-video-renderer[inline-title-icon="yt-icons:g_translate"]:not([translation-reverted])')
  
  if (videoList == null) return


  videoList.forEach(revertVideoTitleTranslation)
}


async function revertVideoTitleTranslation(videoElement) {

  const videoTitle = getVideoTitleElement(videoElement)
  
  const videoDescription = getVideoDescriptionElement(videoElement)

  const videoURL = getVideoURL(videoElement)


  videoElement.setAttribute('translation-reverted', '')

  // Propiedad que controla la URL a la que te diriges
  // al hacer click al video (navegación)
  // Modificandola eliminando el parámetro sobrante 'pp'
  // hace que se acceda a la versión normal del video y no a la traducida
  videoElement.data.navigationEndpoint.commandMetadata.webCommandMetadata.url = videoURL

  const textFetched = await getVideoTextFetched(videoURL)

  videoTitle.innerHTML = getOriginalVideoTitle(textFetched)

  videoDescription.innerHTML = getOriginalVideoDescription(textFetched)

}


// function isTitleTranslated(videoElement) {
//   return videoElement.getAttribute('inline-title-icon') === 'yt-icons:g_translate'
// }

function getVideoTitleElement(videoElement) {
  return videoElement.querySelector('#video-title > yt-formatted-string')
}

function getVideoDescriptionElement(videoElement) {
  return videoElement.querySelector('.metadata-snippet-text')
}

function getVideoURL(videoElement) {
  const url = new URL(videoElement.querySelector('a#thumbnail').href)

  return `${url.origin}${url.pathname}?v=${url.searchParams.get('v')}&t=${url.searchParams.get('t')}`
}


async function getVideoTextFetched(videoURL) {
  const response = await fetch(videoURL)

  return response.text()
}

function getOriginalVideoTitle(textFetched) {
  const contentBetweenTitleTag = '(?<=<title>)(.*?)(?=</title>)'

  return textFetched.match(contentBetweenTitleTag)[0].replace(/ - YouTube$/, '')
}


function getOriginalVideoDescription(textFetched) {
  const contentMetaDescription = '(?<=<meta name="description" content=")(.*?)(?=">)'

  return textFetched.match(contentMetaDescription)[0]
}
