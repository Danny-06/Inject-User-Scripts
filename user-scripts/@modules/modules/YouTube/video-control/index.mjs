import { createElement, setStyleProperties, waitForSelector } from '../../../../@libs/libs/dom-utils.js';
import MouseInfo from '../../../../@libs/libs/mouse-info.js';
import { cssInlinePropertiesProxyWrapper } from '../../../../@libs/libs/proxy-libs.js';
import { cutDecimals, delay } from '../../../../@libs/utils-injection.js';


const mouse = new MouseInfo()

main().catch(console.error)


// window.addEventListener('load', Executer);
document.addEventListener("yt-navigate-start", () => main().catch(console.error));
document.addEventListener("yt-navigate-finish", () => main().catch(console.error));


async function main() {

  if (location.pathname !== '/watch') {
    return
  }

  let videos = [await waitForSelector('ytd-watch-flexy video')];

  if (document.querySelectorAll('video').length === 2) {
    videos = [document.querySelectorAll('video')[1]]
  }

  const videoStyles = videos.map(v => cssInlinePropertiesProxyWrapper(v))

  await delay(1000)

  const canvasPlayer = document.querySelector('canvas#player')

  if (canvasPlayer) videos.push(canvasPlayer)

  videos.forEach(v => {
    setStyleProperties(v.style, {
      '--translateX': '0px',
      '--translateY': '0px',
      '--scale': '1',
      '--rotateY': '0deg',
      '--rotateZ': '0deg'
    })
  })

  const videoWrapper = await waitForSelector("#movie_player")

  if (document.querySelector('#videoOverlay')) return

  const videoOverlay = createElement('div', {id: 'videoOverlay'})

  videoOverlay.addEventListener('mousedown', event => document.querySelector('input#search').blur())

  setStyleProperties(videoOverlay.style, {
    width: '100%',
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: '999'
  })


  videoWrapper.prepend(videoOverlay)

  const player = await waitForSelector('#ytd-player')

  videoOverlay.addEventListener('keydown', event => event.preventDefault())
  // player.addEventListener('wheel', event => {
  //   if (event.target.closest('.ytp-popup.ytp-settings-menu')) return
  //   event.preventDefault()
  // })

  player.addEventListener('mousedown', event => {
    if (event.button !== 1) return
    event.preventDefault()
  })

  videoOverlay.addEventListener('mousedown', function(event) {
    if (event.button !== 0) return

    this.isDown = true
  })

  window.addEventListener('mouseup', function(event) {
    videoOverlay.isDown = false
  })

  document.addEventListener('mousemove', function(event) {

    if (!event.ctrlKey) return

    if (!videoOverlay.isDown) return

    let scale = parseFloat(videoStyles[0]['--scale']) ?? 1
    if (isNaN(scale)) scale = 1


    if (scale === 0) return

    const tx = parseFloat(videoStyles[0]['--translateX'])
    const ty = parseFloat(videoStyles[0]['--translateY'])

    const movementX = event.clientX - mouse.previousClientX
    const movementY = event.clientY - mouse.previousClientY

    const movementXScaled = movementX / parseFloat(videoStyles[0]['--scale'])
    const movementYScaled = movementY / parseFloat(videoStyles[0]['--scale'])

    videoStyles.forEach(video => {
      video['--translateX'] = `${tx + movementXScaled}px`
      video['--translateY'] = `${ty + movementYScaled}px`
    })

  })

  window.addEventListener('wheel', event => {
    if (event.target.closest('#group-custom-options > .options-content.ytp-panel-menu')) return
    if (!event.target.closest('.ytp-popup.ytp-contextmenu')) return

    event.preventDefault()
  }, {passive: false})

  videoOverlay.addEventListener('wheel', function (event) {
    event.preventDefault()

    if (!event.ctrlKey) {
      return
    }

    // Rotar al presionar 'Shift'
    if (event.shiftKey) {
      const rz = parseFloat(videoStyles[0]['--rotateZ'])

      const angleSize = 10
      const sense = event.deltaY < 0 ? -1 : 1

      const finalRotate = rz + angleSize * sense

      videoStyles.forEach(video => {
        video['--rotateZ'] = `${finalRotate}deg`
      })

      return
    }

    let s = parseFloat(videoStyles[0]['--scale'])

    if (s < 1) s = cutDecimals(s, 1)

    const scaleIncrement = s >= 1 ? s : 1

    videoStyles.forEach(video => {
      video['--scale'] = `${s - (event.deltaY * scaleIncrement) / 1000}`
    })
  })

  videoOverlay.addEventListener('mousedown', function (event) {
    if (event.button !== 1) return

    videoStyles.forEach(video => {
      video['--translateX'] = '0px'
      video['--translateY'] = '0px'
      video['--scale'] = '1'
      video['--rotateZ'] = '0deg'
    })
  })

  window.addEventListener('keydown', function (event) {
    if (!event.ctrlKey) return

    videoOverlay.style.pointerEvents = 'auto'
  })

  window.addEventListener('keyup', function (event) {
    if (event.key !== 'Control') return

    videoOverlay.style.pointerEvents = 'none'
  })

  window.addEventListener('blur', function (event) {
    videoOverlay.style.pointerEvents = 'none'
  })

}
