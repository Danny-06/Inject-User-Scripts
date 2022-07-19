import { waitForSelector, createElement } from "../../@libs/utils-injection.js"

// Eventos de navegación de Youtube para ejecutar el código
// al cambiar de página (Youtube no recarga la página, la actualiza)
window.addEventListener("yt-navigate-start", main);
window.addEventListener("yt-navigate-finish", main);

let currentVideo
const videoVolumeStep = 0.05

main()

async function main() {
  if (location.pathname !== '/watch') return

  /**
  * @type {HTMLVideoElement}
  */
  const video          = await waitForSelector('ytd-watch-flexy video')

  // Avoid executing the code more than once
  if (currentVideo === video) return
  currentVideo = video

  const html5Container = await waitForSelector('ytd-watch-flexy .html5-video-container')

  const volumeContainer = html5Container.appendChild(document.createElement('div'))
  volumeContainer.classList.add('volume-container')

  const volumeCount = volumeContainer.appendChild(document.createElement('div'))
  volumeCount.classList.add('volume-count')
  volumeCount.innerHTML = video.volume * 100

  const css = // css
  `
  .volume-container {
    box-sizing: border-box;
    position: relative;
    z-index: 999;

    pointer-events: none;
    opacity: 0;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    width: 100%;
    height: 100%;

    padding: 2rem;
  }

  .volume-count, .gain-count {
    color: #fff;
    text-shadow:
    0 0 0.2em #000,
    0 0 0.2em #000
    ;
  }

  .volume-count {
    font-size: 4rem;
  }

  .gain-count {
    color: #35f4ff;
    font-size: 3rem;
  }

  .full-opacity {
    opacity: 1;
  }
  `.trimIndent()

  const style = document.createElement('style')
  style.innerHTML = css

  volumeContainer.append(style, volumeCount)

  let volumeCountTimeOut

  // Increase video volume with wheel
  html5Container.addEventListener('wheel', event => {
    event.preventDefault()

    clearTimeout(volumeCountTimeOut)

    volumeContainer.classList.add('full-opacity')
    volumeCountTimeOut = setTimeout(() => volumeContainer.classList.remove('full-opacity'), 500)

    if (event.deltaY < 0) {
      if ((video.volume + videoVolumeStep) > 1) video.volume = 1
      else                                      video.volume = (video.volume + videoVolumeStep).toFixed(2)
    }
    else
    if (event.deltaY > 0) {
      if ((video.volume - videoVolumeStep) < 0) video.volume = 0
      else                                      video.volume = (video.volume - videoVolumeStep).toFixed(2)
    }

    volumeCount.innerHTML = Math.floor(video.volume * 100)
  })

  // Increase video gain with Ctrl + Vertical Arrows

  ;(function() {
    const audioCtx = new AudioContext();
  
    const source = audioCtx.createMediaElementSource(video);
  
    const gainNode = audioCtx.createGain();
  
    source.connect(gainNode).connect(audioCtx.destination);
  
    const gainCount = volumeContainer.appendChild(createElement('div', {classes: ['gain-count'], properties:{innerHTML: gainNode.gain.value}}))
  
  
    window.addEventListener('keydown', event => {
  
      if (!event.ctrlKey) return
  
      clearTimeout(volumeCountTimeOut)
  
      volumeContainer.classList.add('full-opacity')
      volumeCountTimeOut = setTimeout(() => volumeContainer.classList.remove('full-opacity'), 500)
    
      switch (event.key) {
        case 'ArrowUp': {
          gainNode.gain.value++
          break
        }
        case 'ArrowDown': {
          gainNode.gain.value--
          break
        }
        case ' ': {
          gainNode.gain.value = 1
          break
        }
    
        default:
          volumeContainer.classList.remove('full-opacity')
      }
  
      gainCount.innerHTML = gainNode.gain.value
    
    })
  })()
}
