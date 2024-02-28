// Add real links to the stages instead of them being opened with JS

import { getAllShadowRootNodes, waitForDocumentReady, waitForSelector } from '../../../@libs/libs/dom-utils.js'
import { delay } from '../../../@libs/utils-injection.js'

void async function() {
  if (location.pathname !== '/') {
    return
  }

  await waitForDocumentReady(document)

  await delay(1000)

  const myApp = document.querySelector('my-app')

  const shadowRoots = getAllShadowRootNodes(document)

  const stagesContainerShadowRoot = shadowRoots.filter(shadowRoot => shadowRoot.host.nodeName === 'MY-SHARED-STAGES')[0]

  if (!stagesContainerShadowRoot) {
    return
  }

  // Sticky paginator

  const appHeaderLayout = myApp.shadowRoot.querySelector('app-drawer-layout > app-header-layout')

  // Contain `position fixed`
  Object.assign(appHeaderLayout.style, {
    transform: 'scale(1)',
  })

  const paginatorWrapper = stagesContainerShadowRoot.querySelector('div:has(> :first-child > paginator-element)')

  Object.assign(paginatorWrapper.style, {
    position: 'fixed',
    width: '100%',
    bottom: '0',
    zIndex: '10',
    backgroundColor: '#333',
  })

  await waitForSelector('iron-selector > stage-item', {node: stagesContainerShadowRoot})

  const stageItems = [...stagesContainerShadowRoot.querySelectorAll('iron-selector > stage-item')]

  const event = new CustomEvent('navigation-page', {
    detail: {stageItems}
  })

  window.dispatchEvent(event)

  const paginator = stagesContainerShadowRoot.querySelector('paginator-element')

  if (!paginator) {
    console.warn(`Couldn't find <paginator-element />`)

    return
  }

  paginator.shadowRoot.addEventListener('click', async event => {
    if (event.target.matches('.page:not(.iron-selected)')) {
      await delay(0)

      const stageItems = [...stagesContainerShadowRoot.querySelectorAll('iron-selector :is(> stage-item, a > stage-item)')]

      const navigationPageEvent = new CustomEvent('navigation-page', {
        detail: {stageItems}
      })

      window.dispatchEvent(navigationPageEvent)
    }
  }, {capture: true})

  const searchInputShadowRoot = shadowRoots.filter(shadowRoot => shadowRoot.host.nodeName === 'IRON-INPUT' && shadowRoot.host.id === 'input-1')[0]

  if (searchInputShadowRoot) {
    const input = searchInputShadowRoot.host.firstElementChild

    input.addEventListener('input', async event => {
      await delay(0)

      const emptyLinks = stagesContainerShadowRoot.querySelectorAll('a:empty')

      for (const emptyLink of emptyLinks) {
        emptyLink.remove()
      }

      const stageItems = [...stagesContainerShadowRoot.querySelectorAll('iron-selector stage-item')]

      const navigationPageEvent = new CustomEvent('navigation-page', {
        detail: {stageItems}
      })

      window.dispatchEvent(navigationPageEvent)
    })
  }
}()


window.addEventListener('navigation-page', event => {
  const { stageItems } = event.detail

  for (const stageItem of stageItems) {
    const stageId = stageItem.__data.stage._key

    if (stageItem.parentElement instanceof HTMLAnchorElement) {
      const anchor = stageItem.parentElement

      anchor.href = `https://smash-stages.firebaseapp.com/stage?stageId=${stageId}`
    }
    else {
      const anchor = document.createElement('a')
      anchor.href = `https://smash-stages.firebaseapp.com/stage?stageId=${stageId}`

      stageItem.addEventListener('click', event => {
        event.stopPropgation()
      }, {capture: true})

      stageItem.replaceWith(anchor)

      anchor.append(stageItem)
    }

    const nsfwLabel = stageItem.shadowRoot.querySelector('.carta > stage-image + div + div')

    if (nsfwLabel != null && nsfwLabel.innerText.includes('NSFW')) {
      Object.assign(nsfwLabel.style, {
        inset: 'auto',
        right: '0',
        top: '0',
        fontSize: '0.7rem',
        height: 'auto',
        margin: '0.5rem',
      })
    }
  }
})