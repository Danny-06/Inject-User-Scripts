import { useRef } from '../../../preact/hooks.mjs'
import html from '../../../preact/htm/html.mjs'
import { useSignal } from '../../../preact/signals.mjs'
import DivShadow from '../../../preact/util-components/shadow-dom.js'
import appendComponent from '../../../preact/util-functions/append-component.js'
import useEffectOnce from '../../../preact/util-hooks/use-effect-once.js'
import stylesheet from './alert-dialog.css' assert {type: 'css'}


function AlertDialog(props) {
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
                <div class="message" dangerouslySetInnerHTML=${{__html: message}}></div>
                <div class="buttons">
                    <button class="accept"
                      onClick=${() => {
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

let isOpen = false

let dialogWrapper = null

export function showAlertDialog(message = '(No message provided)') {
  // If the dialog is "opened" but the element is not in the DOM or
  // is not in the active document then reset the "opened" state
  if (!dialogWrapper || isOpen && (!dialogWrapper.isConnected || dialogWrapper.ownerDocument !== document)) {
    isOpen = false
  }

  if (isOpen) {
    return Promise.reject(new Error(`The dialog is still opened`))
  }

  isOpen = true

  return new Promise(resolve => {
    dialogWrapper = appendComponent(
      html`
      <${AlertDialog} message=${message}
        onAccept=${resolve}
        onClose=${() => {
          isOpen = false
          dialogWrapper.remove()
        }}
      />
      `,
      document.body
    )
  })
}
