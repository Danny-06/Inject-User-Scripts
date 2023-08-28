import { useRef } from '../../../preact/hooks.mjs'
import html from '../../../preact/htm/html.mjs'
import { render } from '../../../preact/preact.mjs'
import { useSignal } from '../../../preact/signals.mjs'
import DivShadow from '../../../preact/util-components/shadow-dom.js'
import appendComponent from '../../../preact/util-functions/append-component.js'
import useEffectOnce from '../../../preact/util-hooks/use-effect-once.js'
import stylesheet from './alert-dialog.css' assert {type: 'css'}

let isOpened = false

const resetOpenState = () => isOpened = false


function Dialog(props) {
  const { message, onAccept, onClose, ...attributes } = props

  const isClosingSignal = useSignal(false)
  const isClosing = isClosingSignal.value

  const dialogOverlayRef = useRef(null)

  useEffectOnce(() => {
    const dialogOverlay = dialogOverlayRef.current

    dialogOverlay.addEventListener('animationend', () => {
      setTimeout(() => {
        dialogOverlay.addEventListener('animationend', event => onClose(), {once: true})
      })
    }, {once: true})
  })

  return html`
    <${DivShadow} ...${attributes} stylesheets=${[stylesheet]}>
      <div ref=${dialogOverlayRef} class=${`dialog-menu-overlay ${isClosing ? 'closing' : ''}`}>
          <div class=${`dialog-menu ${isClosing ? 'closing' : ''}`}>
              <div class="message">${message}</div>
              <div class="buttons">
                  <button class="accept"
                    onClick=${async () => {
                      isClosingSignal.value = true

                      onAccept()
                    }}
                  >Accept</button>
              </div>
          </div>
      </div>
    <//>
  `
}

export function showAlertDialog(message = '(No message provided)') {
  // If the dialog is "opened" but the element is not in the DOM or
  // is not in the active document then reset the "opened" state
  // if (!dialogStoreReference || isOpened && (!dialogStoreReference.isConnected || dialogStoreReference.ownerDocument !== document)) {
  //   resetOpenState()
  // }

  if (isOpened) {
    return Promise.reject(new Error(`The dialog is still opened`))
  }

  isOpened = true

  const promiseResult = new Promise(resolve => {
    const dialogWrapper = appendComponent(
      html`
      <${Dialog} message=${message}
        onAccept=${resolve}
        onClose=${() => {
          resetOpenState()
          dialogWrapper.remove()
        }}
      >
      </>`,
      document.body
    )
  })

  return promiseResult
}
