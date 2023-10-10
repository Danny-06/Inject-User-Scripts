import { waitForSelector } from '../../../../@libs/libs/dom-utils.js';
import { auto1080pQuality } from '../youtube-utils.js';

window.addEventListener('youtube-navigate', async event => {
  if (location.pathname !== '/watch') {
    return
  }

  /** @type {HTMLVideoElement} */
  const video = await waitForSelector('ytd-watch-flexy video');

  auto1080pQuality(video)
})
