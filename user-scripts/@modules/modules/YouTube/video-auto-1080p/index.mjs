import { waitForSelector } from '../../../../@libs/libs/dom-utils.js';
import { calidad1080pAutomatica } from '../youtube-utils.js';

window.addEventListener('youtube-navigate', async event => {
  if (location.pathname !== '/watch') {
    return
  }

  /** @type {HTMLVideoElement} */
  const video = await waitForSelector('ytd-watch-flexy video');

  calidad1080pAutomatica(video)
})
