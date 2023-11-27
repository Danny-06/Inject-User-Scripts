import { useEffect, useRef } from '../../../../@libs/preact/hooks.mjs'
import html from '../../../../@libs/preact/htm/html.mjs'
import { useSignal } from '../../../../@libs/preact/signals.mjs'
import ShadowDOM from '../../../../@libs/preact/util-components/shadow-dom.js'
import useEffectOnce from '../../../../@libs/preact/util-hooks/use-effect-once.js'
import { waitForSelector } from '../../../../@libs/libs/dom-utils.js'
import { render } from '../../../../@libs/preact/preact.mjs'
import { addEventListener } from '../../../../@libs/libs/event-utils.js'
import { delay } from '../../../../@libs/utils-injection.js'

const volumeSetter = Object.getOwnPropertyDescriptors(HTMLMediaElement.prototype).volume.set

Object.defineProperties(HTMLMediaElement.prototype, {
  volume: {
    set(value) {}
  }
})


let currentVideo
const videoVolumeStep = 0.05


function VolumeContainer(props) {
  const { video: initialVideo } = props

  const videoSignal = useSignal(initialVideo)

  window.addEventListener('youtube-navigate', async event => {
    if (location.pathname !== '/watch') return

    await delay(1000)

    /**
     * @type {HTMLVideoElement}
     */
    const updatedVideo = await waitForSelector('ytd-watch-flexy video')

    videoSignal.value = updatedVideo
  })

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

  const volumeCountSignal = useSignal(null)

  const gainCountSignal = useSignal()

  useEffect(() => {
    let volumeCountTimeOut

    const parent = containerRef.current.parentNode.host.parentElement

    // Increase video volume with wheel
    const removeListener = addEventListener(parent, 'wheel', event => {
      event.preventDefault()

      clearTimeout(volumeCountTimeOut)

      isVolumeChangingSignal.value = true
      volumeCountTimeOut = setTimeout(() => isVolumeChangingSignal.value = false, 500)

      let volumeValue

      if (event.deltaY < 0) {
        if ((videoSignal.value.volume + videoVolumeStep) > 1) volumeValue = 1
        else                                      volumeValue = (videoSignal.value.volume + videoVolumeStep).toFixed(2)
      }
      else
      if (event.deltaY > 0) {
        if ((videoSignal.value.volume - videoVolumeStep) < 0) volumeValue = 0
        else                                      volumeValue = (videoSignal.value.volume - videoVolumeStep).toFixed(2)
      }

      volumeSetter.call(videoSignal.value, volumeValue)

      const volumeValuePercent = Math.floor(volumeValue * 100)

      volumeCountSignal.value = volumeValuePercent
    })

    // Increase video gain with Ctrl + Vertical Arrows

    {
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaElementSource(videoSignal.value);
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

    return removeListener
  }, [videoSignal])


  return html`
    <${ShadowDOM} class="volume-container-wrapper" stylesheets=${[stylesheet]}>
        <div ref=${containerRef} class=${`volume-container ${isVolumeChangingSignal.value ? 'full-opacity' : ''}`}>
            <div class="volume-count">${volumeCountSignal.value}</div>
            <div class="gain-count">${gainCountSignal.value}</div>
        </div>
    <//>
  `
}



window.addEventListener('youtube-navigate', async event => {
  if (location.pathname !== '/watch') return

  /**
   * @type {HTMLVideoElement}
   */
  const video = await waitForSelector('ytd-watch-flexy video', {timeout: 1000})

  // Avoid executing the code more than once
  if (currentVideo === video) {
    return
  }

  currentVideo = video

  const html5Container = await waitForSelector('ytd-watch-flexy .html5-video-container')

  render(html`<${VolumeContainer} video=${currentVideo} />`, html5Container)
})
