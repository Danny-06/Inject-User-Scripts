import { useRef } from '../../../../@libs/preact/hooks.mjs'
import html from '../../../../@libs/preact/htm/html.mjs'
import { useSignal } from '../../../../@libs/preact/signals.mjs'
import ShadowDOM from '../../../../@libs/preact/util-components/shadow-dom.js'
import appendComponent from '../../../../@libs/preact/util-functions/append-component.js'
import useEffectOnce from '../../../../@libs/preact/util-hooks/use-effect-once.js'
import { waitForSelector } from '../../../../@libs/libs/dom-utils.js'

const volumeSetter = Object.getOwnPropertyDescriptors(HTMLMediaElement.prototype).volume.set

Object.defineProperties(HTMLMediaElement.prototype, {
  volume: {
    set(value) {}
  }
})


let currentVideo
const videoVolumeStep = 0.05


function VolumeContainer(props) {
  const { video } = props

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

  const containerRef = useRef(null)

  const isVolumeChangingSignal = useSignal(false)
  const isVolumeChanging = isVolumeChangingSignal.value

  const volumeCountSignal = useSignal(null)
  const volumeCount = volumeCountSignal.value

  const gainCountSignal = useSignal()
  const gainCount = gainCountSignal.value

  useEffectOnce(() => {
    let volumeCountTimeOut

    const parent = containerRef.current.parentNode.host.parentElement

    // Increase video volume with wheel
    parent.addEventListener('wheel', event => {
      event.preventDefault()

      clearTimeout(volumeCountTimeOut)

      isVolumeChangingSignal.value = true
      volumeCountTimeOut = setTimeout(() => isVolumeChangingSignal.value = false, 500)

      let volumeValue

      if (event.deltaY < 0) {
        if ((video.volume + videoVolumeStep) > 1) volumeValue = 1
        else                                      volumeValue = (video.volume + videoVolumeStep).toFixed(2)
      }
      else
      if (event.deltaY > 0) {
        if ((video.volume - videoVolumeStep) < 0) volumeValue = 0
        else                                      volumeValue = (video.volume - videoVolumeStep).toFixed(2)
      }

      volumeSetter.call(video, volumeValue)

      const volumeValuePercent = Math.floor(volumeValue * 100)

      volumeCountSignal.value = volumeValuePercent
    })

    // Increase video gain with Ctrl + Vertical Arrows

    {
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaElementSource(video);
      const gainNode = audioCtx.createGain();

      source.connect(gainNode).connect(audioCtx.destination);

      gainCountSignal.value = gainNode.gain.value


      window.addEventListener('keydown', event => {
        if (!event.ctrlKey) {
          return
        }

        clearTimeout(volumeCountTimeOut)

        isVolumeChangingSignal.value = true
        volumeCountTimeOut = setTimeout(() => isVolumeChangingSignal.value = false, 500)

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
            isVolumeChangingSignal.value = false
        }

        gainCountSignal.value = gainNode.gain.value
      })
    }
  })


  return html`
    <${ShadowDOM} class="volume-container-wrapper" stylesheets=${[stylesheet]}>
        <div ref=${containerRef} class=${`volume-container ${isVolumeChanging ? 'full-opacity' : ''}`}>
            <div class="volume-count">${volumeCount}</div>
            <div class="gain-count">${gainCount}</div>
        </div>
    <//>
  `
}



window.addEventListener('youtube-navigate', async event => {
  if (location.pathname !== '/watch') return

  /**
   * @type {HTMLVideoElement}
   */
  const video = await waitForSelector('ytd-watch-flexy video')

  // Avoid executing the code more than once
  if (currentVideo === video) {
    return
  }

  currentVideo = video

  const html5Container = await waitForSelector('ytd-watch-flexy .html5-video-container')

  appendComponent(html`<${VolumeContainer} video=${currentVideo} />`, html5Container)
})
