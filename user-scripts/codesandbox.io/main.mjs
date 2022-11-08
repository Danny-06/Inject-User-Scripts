import { waitForSelector } from "../@libs/utils-injection.js";

const splitPane = await waitForSelector('.SplitPane')
const pane1     = await waitForSelector('[id="workbench.main.container"] .Pane1')
const pane2     = await waitForSelector('[id="workbench.main.container"] .Pane2')


window.addEventListener('mousedown', event => {
  if (!event.ctrlKey || event.button !== 1) return

  if (document.fullscreenElement) return document.exitFullscreen()

  const path = event.path ?? event.composedPath()

  if (path.includes(pane1)) return pane1.requestFullscreen()

  splitPane.requestFullscreen()
})
