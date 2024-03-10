import { waitForSelector } from '../../../../@libs/libs/dom-utils.js'
import { addEventListener } from '../../../../@libs/libs/event-utils.js'
import { DOMPrimitives } from '../../../../@libs/libs/dom-primitives.js'

const volumeSetter = Object.getOwnPropertyDescriptors(HTMLMediaElement.prototype).volume.set

Object.defineProperties(HTMLMediaElement.prototype, {
  volume: {
    set(value) {}
  }
})


const videoVolumeStep = 0.05


const video = new Proxy({}, {
  get(target, property, receiver) {
    const videoElement = document.querySelector(':is(ytd-watch-flexy, #player) video')

    const value = Reflect.get(videoElement, property)

    if (typeof value === 'function') {
      return value.bind(videoElement)
    }

    return value
  },
  set(target, property, value, receiver) {
    const videoElement = document.querySelector(':is(ytd-watch-flexy, #player) video')

    return Reflect.set(videoElement, property, value)
  }
})

function VolumeContainer(options) {
  const { video } = options.data

  const audioCtx = new AudioContext()
  let source

  // If AudioContext is already attached to the video element
  // an error will be thrown
  try {
    source = audioCtx.createMediaElementSource(video.valueOf());
  } catch {
    return null
  }

  const gainNode = audioCtx.createGain();

  source.connect(gainNode).connect(audioCtx.destination);

  const css = // css
  `
  :host {
    all: revert;
    box-sizing: border-box;

    width: 100% !important;
    height: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    transform: none !important;
    background: none !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
  }

  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }

  .volume-container {
    position: relative;
    z-index: 999;

    pointer-events: none;
    user-select: none;
    opacity: 0;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    width: 100%;
    height: 100% !important;

    padding: 2rem !important;
  }

  .full-opacity {
    opacity: 1;
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
  `

  const stylesheet = new CSSStyleSheet()
  stylesheet.replace(css)

  const { div, ShadowRoot } = DOMPrimitives

  const componentRender = (
    div({attr: {class: 'volume-container-wrapper'}},
      ShadowRoot({adoptedStyleSheets: stylesheet},
        div({attr: {class: 'volume-container'}},
          div({attr: {class: 'volume-count'}}, 0),
          div({attr: {class: 'gain-count'}}, 1),
        )
      )
    )
  )

  const volumeContainer = componentRender.shadowRoot.querySelector('.volume-container')
  const volumeCount = componentRender.shadowRoot.querySelector('.volume-count')
  const volumeGainCount = componentRender.shadowRoot.querySelector('.gain-count')

  let volumeValue = 0.5
  let volumeValuePercent
  let volumeGain
  let isVolumeChanging = false

  let volumeCountTimeOut

  function updateUI() {
    clearTimeout(volumeCountTimeOut)

    if (isVolumeChanging) {
      volumeContainer.classList.add('full-opacity')
    }

    volumeCountTimeOut = setTimeout(() => volumeContainer.classList.remove('full-opacity'), 500)

    volumeCount.innerText = volumeValuePercent
    volumeGainCount.innerText = volumeGain
  }

  // Wait for the element to be conected on the document
  setTimeout(() => {
    addEventListener(componentRender.parentElement, 'wheel', event => {
      event.preventDefault()

      if (event.isTrusted) {
        isVolumeChanging = true
      }

      if (event.deltaY < 0) {
        if ((video.volume + videoVolumeStep) > 1) volumeValue = 1
        else                                      volumeValue = (video.volume + videoVolumeStep).toFixed(2)
      }
      else
      if (event.deltaY > 0) {
        if ((video.volume - videoVolumeStep) < 0) volumeValue = 0
        else                                      volumeValue = (video.volume - videoVolumeStep).toFixed(2)
      }

      volumeSetter.call(video.valueOf(), volumeValue)

      volumeValuePercent = Math.floor(volumeValue * 100)

      updateUI()

      isVolumeChanging = false
    }, {runImmediately: true})
  })

  volumeGain = gainNode.gain.value

  window.addEventListener('keydown', event => {
    if (!event.ctrlKey || event.repeat) {
      return
    }

    isVolumeChanging = true

    switch (event.code) {
      case 'ArrowUp': {
        gainNode.gain.value++
      }
      break

      case 'ArrowDown': {
        gainNode.gain.value--
      }
      break

      case 'Space': {
        gainNode.gain.value = 1

        video.valueOf().addEventListener(video.paused ? 'play': 'pause', event => event.preventDefault(), {once: true})
      }
      break

      default: {
        isVolumeChanging = false
      }
    }

    volumeGain = gainNode.gain.value

    updateUI()

    isVolumeChanging = false
  })

  return componentRender
}



window.addEventListener('youtube-navigate', async event => {
  if (!location.pathname.startsWith('/watch') && !location.pathname.startsWith('/embed')) {
    return
  }

  // /**
  //  * @type {HTMLVideoElement}
  //  */
  // const video = await waitForSelector('ytd-watch-flexy video', {timeout: 1000})

  const html5Container = await waitForSelector(':is(ytd-watch-flexy, #player) .html5-video-container')

  html5Container.append(
    VolumeContainer({data: {video}}) ?? ''
  )
})
