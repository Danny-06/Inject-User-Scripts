import { waitForSelector } from '../../../../@libs/libs/dom-utils.js'
import VolumeContainer from './VolumeContainer/index.js'

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


window.addEventListener('youtube-navigate', async event => {
  if (location.pathname !== '/watch' && location.pathname !== '/embed') {
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
