import { waitForSelector } from '../../../../@libs/libs/dom-utils.js'
import { addEventListener } from '../../../../@libs/libs/event-utils.js'
import { DOMPrimitives, createSignal } from '../../../../@libs/libs/dom-primitives.js'

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
    source = audioCtx.createMediaElementSource(video.valueOf())
  } catch {
    return null
  }

  const gainNode = audioCtx.createGain()

  source.connect(gainNode).connect(audioCtx.destination)

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

  const volumeValue = createSignal(0.5)
  const volumeValuePercent = volumeValue.createDerivedSignal(() => Math.floor(volumeValue() * 100))
  const volumeGain = createSignal(gainNode.gain.value)
  const isVolumeChanging = createSignal(false)

  /**
   * 
   * @param {HTMLElement} componentRoot 
   */
  function componentEffect(componentRoot) {
    const volumeContainer = componentRoot.shadowRoot.querySelector('.volume-container')

    let volumeCountTimeOut

    function updateUI() {
      clearTimeout(volumeCountTimeOut)

      if (isVolumeChanging()) {
        volumeContainer.classList.add('full-opacity')
      }

      volumeCountTimeOut = setTimeout(() => volumeContainer.classList.remove('full-opacity'), 500)
    }

    // Wait for the element to be conected on the document
    setTimeout(() => {
      addEventListener(componentRoot.parentElement, 'wheel', event => {
        event.preventDefault()

        if (event.isTrusted) {
          isVolumeChanging(true)
        }

        if (event.deltaY < 0) {
          if ((video.volume + videoVolumeStep) > 1) volumeValue(1)
          else                                      volumeValue((video.volume + videoVolumeStep).toFixed(2))
        }
        else
        if (event.deltaY > 0) {
          if ((video.volume - videoVolumeStep) < 0) volumeValue(0)
          else                                      volumeValue((video.volume - videoVolumeStep).toFixed(2))
        }

        volumeSetter.call(video.valueOf(), volumeValue())

        updateUI()

        isVolumeChanging(false)
      }, {runImmediately: true})
    })

    window.addEventListener('keydown', event => {
      if (!event.ctrlKey || event.repeat) {
        return
      }

      isVolumeChanging(true)

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

          // Prevent playing/pausing the video when reseting the gain value
          video.valueOf()
          .addEventListener(
            video.paused ? 'play': 'pause',
            event => {
              if (video.paused) {
                video.play()
              }
              else {
                video.pause()
              }
            },
            {once: true}
          )
        }
        break

        default: {
          isVolumeChanging(false)
        }
      }

      volumeGain(gainNode.gain.value)

      updateUI()

      isVolumeChanging(false)
    }, {capture: true})
  }

  const { div, ShadowRoot } = DOMPrimitives

  return (
    div({run: componentEffect, attr: {class: 'volume-container-wrapper'}},
      ShadowRoot({adoptedStyleSheets: stylesheet},
        div({attr: {class: 'volume-container'}},
          div({attr: {class: 'volume-count'}}, volumeValuePercent),
          div({attr: {class: 'gain-count'}}, volumeGain),
        ),
        // Switch(matchingExpression,
        //   [
        //     value1, () => div(),
        //     value2, () => span(),
        //   ],
        //   () => defaultTag()
        // ),
        // For(items, (item, index, array) => div(item.value)),
        // Repeat(length, (index) => div()),
        // Range({initialValue: 0, step: 1, until: 10}, () => div()),
      ),
    )
  )
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
