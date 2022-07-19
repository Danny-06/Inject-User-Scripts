(function() {

  window.addEventListener('load', Executer)
  window.addEventListener('yt-navigate-start', Executer)
  window.addEventListener('yt-navigate-finish', Executer)
  
  
  async function Executer(event) {
  
    if (event.type === 'load') window.removeEventListener('yt-navigate-finish', Executer)
  
    const thumbnails = ytInitialPlayerResponse.videoDetails.thumbnail.thumbnails
  
    const video = await elementExists('video')
    const videoID = new URL(location.href).searchParams.get('v')
  
    const urlFull = `https://i.ytimg.com/vi/${videoID}/maxresdefault.jpg`
    // const urlDefault = `https://i.ytimg.com/vi/${videoID}/hqdefault.jpg`
  
    const response = await fetch(urlFull)
  
    if (response.status === 200) video.poster = urlFull
    else video.poster = thumbnails[thumbnails.length - 1].url
  
  }

  // Function that takes a selector as a parameter and return a Promise that resolves in the element when it exists in the DOM
  function elementExists(selector) {
    function checkElement(selector, resolve) {
      const element = document.querySelector(selector)
      if (element) return resolve(element)

      requestAnimationFrame(() => checkElement(selector, resolve))
    }

    return new Promise(resolve => {
      checkElement(selector, resolve)
    })
  }
  
  
  })()
  
  