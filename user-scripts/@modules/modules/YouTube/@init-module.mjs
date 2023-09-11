import { getModuleURL, injectCode } from '../../@module-utils.js'
import * as youtubeUtils from './youtube-utils.js'

// Remove elements with id "copy"
// to allow to use the copy() function
// available only in the console
window.copy && [...window.copy].forEach(e => e.remove())

// window.onerror = null

window.youtubeUtils = youtubeUtils



const modulePath = getModuleURL(import.meta.url)

injectCode(modulePath, {
  subModule: '_general-styles',

  scripts: [
    'script-helpers/visual-viewport-zoom-ratio.mjs',
    'script-helpers/location-root-dataset.mjs',
    'script-helpers/root-scroll-padding-navbar.mjs',
  ],
  stylesheets: [
    'main.css',
    'magic-actions-for-youtube-dark-mode.css',
    'fix-yt-new-ui.css',
  ]
})

injectCode(modulePath, {
  subModule: '_handle-events',

  scripts: [
    'index.mjs'
  ]
})

injectCode(modulePath, {
  subModule: 'yt-side-panels',

  scripts: [
    'index.mjs'
  ],
  stylesheets: [
    'main.css'
  ]
})

injectCode(modulePath, {
  subModule: 'yt-playlist-autoscroll-selected',

  scripts: [
    'index.mjs'
  ]
})

// injectCode(modulePath, {
//   subModule: 'list-of-playlists',

//   scripts: [
//     'index.mjs'
//   ]
// })

injectCode(modulePath, {
  subModule: 'video-auto-1080p',

  scripts: [
    'index.mjs'
  ]
})

injectCode(modulePath, {
  subModule: 'clone-yt-playlists',

  scripts: [
    'index.mjs'
  ]
})

injectCode(modulePath, {
  subModule: 'reload-comments',

  scripts: [
    'index.mjs'
  ]
})

injectCode(modulePath, {
  subModule: 'hide-video-ui',

  scripts: [
    'index.mjs'
  ],
  stylesheets: [
    'main.css'
  ]
})

injectCode(modulePath, {
  subModule: 'save-current-comment-onload',

  scripts: [
    'index.mjs'
  ]
})

injectCode(modulePath, {
  subModule: 'video-control',

  scripts: [
    'index.mjs'
  ],
  stylesheets: [
    'main.css'
  ]
})

injectCode(modulePath, {
  subModule: 'enlarge-avatar-pic-on-hover',

  scripts: [
    'index.mjs'
  ]
})

injectCode(modulePath, {
  subModule: 'video-volume-wheel',

  scripts: [
    'index.mjs'
  ]
})

injectCode(modulePath, {
  subModule: 'revert-auto-translation-in-search',

  scripts: [
    'index.mjs'
  ]
})

injectCode(modulePath, {
  subModule: 'video-poster',

  scripts: [
    'index.mjs'
  ]
})

injectCode(modulePath, {
  subModule: 'video-context-menu',

  scripts: [
    'index.mjs'
  ]
})


injectCode(modulePath, {
  subModule: 'open-uncropped-banner',

  scripts: [
    'index.mjs'
  ]
})

injectCode(modulePath, {
  subModule: 'yt-shorts-full-view',

  scripts: [
    'index.mjs'
  ]
})
