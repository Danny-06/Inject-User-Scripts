import { DOMPrimitives, createSignal } from '../../../../../@libs/libs/dom-primitives.js'
import { addEventListener } from '../../../../../@libs/libs/event-utils.js'
import stylesheet from './main.css' assert {type: 'css'}

const volumeSetter = Object.getOwnPropertyDescriptors(HTMLMediaElement.prototype).volume.set

Object.defineProperties(HTMLMediaElement.prototype, {
  volume: {
    set(value) {}
  }
})


const videoVolumeStep = 0.05

export default function VolumeContainer(options) {
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
      ),
    )
  )
}
