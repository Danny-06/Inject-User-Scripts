import { MouseInfo } from '../../@libs/libs/mouse-info.js';
import { createElement, waitForSelector, setStyleProperties, delay, cutDecimals } from '../../@libs/utils-injection.js'

const mouse = new MouseInfo()

Executer().catch(console.error)


// window.addEventListener('load', Executer);
document.addEventListener("yt-navigate-start", () => Executer().catch(console.error));
document.addEventListener("yt-navigate-finish", () => Executer().catch(console.error));

async function Executer() {

  if (location.pathname !== '/watch') return

  let video = [await waitForSelector('ytd-watch-flexy video')];

  if (document.querySelectorAll('video').length === 2) {
    video = [document.querySelectorAll('video')[1]]
  }

  await delay(1000)

  const canvasPlayer = document.querySelector('canvas#player')

  if (canvasPlayer) video.push(canvasPlayer)

  video.forEach(v => {
    setStyleProperties(v.style, {
      '--translateX': '0px',
      '--translateY': '0px',
      '--scale': '1',
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
  player.addEventListener('wheel', event => {
    if (event.target.closest('.ytp-popup.ytp-settings-menu')) return
    event.preventDefault()
  })
  player.addEventListener('mousedown', event => event.preventDefault())

  videoOverlay.addEventListener('mousedown', function (event) {

    if (event.button !== 0) return

    this.isDown = true

  })

  window.addEventListener('mouseup', function (event) {

    videoOverlay.isDown = false

  })

  document.addEventListener('mousemove', function (event) {

    if (!event.ctrlKey) return

    if (!videoOverlay.isDown) return

    let scale = parseFloat(video[0].style.getPropertyValue('--scale')) ?? 1
    if (isNaN(scale)) scale = 1


    if (scale === 0) return

    const tx = parseFloat(video[0].style.getPropertyValue('--translateX'))
    const ty = parseFloat(video[0].style.getPropertyValue('--translateY'))

    const movementX = event.clientX - mouse.previousClientX
    const movementY = event.clientY - mouse.previousClientY

    video.forEach(v => {
      v.style.setProperty('--translateX', `${tx + movementX / scale}px`)
      v.style.setProperty('--translateY', `${ty + movementY / scale}px`)
    })

  })

  videoOverlay.addEventListener('wheel', function (event) {
    if (!event.ctrlKey) return

    // Rotar al presionar 'Shift'
    if (event.shiftKey) {
      const rz = parseFloat(video[0].style.getPropertyValue('--rotateZ'))

      const angleSize = 10
      const sense = event.deltaY < 0 ? -1 : 1

      const finalRotate = rz + angleSize * sense

      video.forEach(v => {
        v.style.setProperty('--rotateZ', `${finalRotate}deg`)
      })

      return
    }

    let s = parseFloat(video[0].style.getPropertyValue('--scale'))

    if (s < 1) s = cutDecimals(s, 1)

    const scaleIncrement = s >= 1 ? s : 1

    video.forEach(v => {
      v.style.setProperty('--scale', `${s - (event.deltaY * scaleIncrement) / 1000}`)
    })
  })

  videoOverlay.addEventListener('mousedown', function (event) {
    if (event.button === 1) {

      video.forEach(v => {
        v.style.setProperty('--translateX', '0px')
        v.style.setProperty('--translateY', '0px')
        v.style.setProperty('--scale', '1')
        v.style.setProperty('--rotateZ', '0deg')
      })

    }
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
