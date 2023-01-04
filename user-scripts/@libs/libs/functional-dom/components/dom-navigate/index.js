import _ from "../../index.js";
import { sortWildCardRouteToEnd } from "./utils.js";

/**
 * @typedef NavigateRoute
 * @property {string} path
 * @property {() => import("../../libs/core.js").CoreNode} component
 */

/**
 * @typedef DOMNavigateObject
 * @property {HTMLElement} component
 * @property {(pathname: string) => void} update
 */

/**
 * 
 * @param {NavigateRoute[]} navigateRoutes 
 * @returns {DOMNavigateObject}
 */
export default function DOMNavigate(navigateRoutes) {
  const component = _['dom-navigate']()

  navigateRoutes = sortWildCardRouteToEnd(navigateRoutes)  

  return {
    component,

    update(pathname) {
      let renderComponent = null

      for (const route of navigateRoutes) {
        if (route.path === pathname) {
          renderComponent = route.component
          break
        }

        if (route.path === '*') {
          renderComponent = route.component
          break
        }
      }

      component.replaceChildren()

      if (typeof renderComponent !== 'function') {
        return
      }

      // @ts-ignore
      component.append(renderComponent())
    }
  }
}


function dispatchCustomNavigate() {
  const init = {detail: {path: location.pathname}}

  const customNavigate = new CustomEvent('custom-navigate', init)
  window.dispatchEvent(customNavigate)
}

function dispatchCustomHashChange() {
  const init = {detail: {hash: location.hash}}

  const customHashChange = new CustomEvent('custom-hash-change', init)
  window.dispatchEvent(customHashChange)
}


// Fire `custom-navigate` event on `DOMContentLoaded`
window.addEventListener('DOMContentLoaded', event => {
  dispatchCustomNavigate()
  dispatchCustomHashChange()
}, {once: true})


window.addEventListener('popstate', event => {
  dispatchCustomNavigate()
})

window.addEventListener('hashchange', event => {
  dispatchCustomHashChange()
})



/**
 * @typedef {{
 *  'custom-navigate': CustomEvent<CustomNavigateDetail>,
 *  'custom-hash-change': CustomEvent<CustomHashChangeDetail>
 * }} NavigateEventsMap
 */

/**
 * @typedef {keyof NavigateEventsMap} NavigateEvents
 */

/**
 * @typedef CustomNavigateDetail
 * @property {string} path This is the same as using `window.location.pathname`
 */

/**
 * @typedef CustomHashChangeDetail
 * @property {string} hash This is the same as using `window.location.hash`
 */

/**
 * @template {NavigateEvents} T
 * @typedef {(event: NavigateEventsMap[T]) => void} CallbackListener
 */

export const navigation = {

  get state() {
    return history.state
  },

  /**
   * 
   * @param {string} url 
   * @param {History['state']} [state=null] 
   */
  replace(url, state = null) {
    history.replaceState(state, '', url)

    dispatchCustomNavigate()
  },

  /**
   * 
   * @param {string} url 
   * @param {History['state']} [state=null] 
   */
  push(url, state = null) {
    history.pushState(state, '', url)

    dispatchCustomNavigate()
  },

  forward() {
    history.forward()
  },

  back() {
    history.back()
  },

  /**
   * 
   * @param {string} value 
   */
  hash(value) {
    location.hash = value
  },

  /**
   * @template {NavigateEvents} T
   * @param {T} eventType 
   * @param {CallbackListener<T>} callbackListener 
   */
  addEventListener(eventType, callbackListener) {
    window.addEventListener(eventType, callbackListener)
  }

}
