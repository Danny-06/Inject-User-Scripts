import { ContextMenuManager as ctxM } from '../youtube-utils.js'
import * as ctxMenu  from './resource-data/context-menu-options.js'
import { waitForSelector } from '../../../../@libs/libs/dom-utils.js'

window.addEventListener('youtube-navigate', event => {
  if (!location.pathname.startsWith('/watch')) {
    return
  }

  initCustomContextMenu()
})

async function initCustomContextMenu() {
  // Context Menu

  const ctxMContainer = await ctxM.initCustomContextMenuItems()

  const panels = await waitForSelector('ytd-watch-flexy #panels')

  ctxM.addVideoContextMenuItems([
    ctxMenu.captureScreenshot,
    ctxMenu.flipVideoHorizontally,
    ctxMenu.loopVideo,

    ctxMenu.downloadChaptersAsXML,

    ctxMenu.copyVideoURL,
    ctxMenu.copyVideoURLTime,
    ctxMenu.copyVideoURLEmbed,
    ctxMenu.copyVideoURLEmbedNoCookie
  ])

  ctxMContainer.append(...ctxM.elementItems)
}
