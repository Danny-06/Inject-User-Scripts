import html from '../../../preact/htm/html.mjs'
import ShadowDOM from '../../../preact/util-components/shadow-dom.js'
import appendComponent from '../../../preact/util-functions/append-component.js'
import useEffectOnce from '../../../preact/util-hooks/use-effect-once.js'
import useRefCallback from '../../../preact/util-hooks/use-ref-callback.js'
import stylesheet from './alert-dialog.css' assert {type: 'css'}


/**
 * 
 * @param {{
 *   message?: string,
 *   onAccept?: () => void,
 *   onClose?: () => void
 * }} props 
 * @returns 
 */
function AlertDialog(props) {
  const dialogAnimation = useRefCallback((node, ref) => {
    ref.current = node.animate({
      transform: [
        'translateY(100px) scale(0.2)',
        'scale(0.2)',
        'none'
      ],
      // offset: [0, 0.5, 1]
    }, {
      duration: 350,
      easing: 'ease-in',
      fill: 'both'
    })

    ref.current.cancel()
  })

  const dialogOverlayAnimation = useRefCallback((node, ref) => {
    ref.current = node.animate({
      opacity: [0, 1]
    }, {
      duration: 350,
      easing: 'ease-out',
      fill: 'both'
    })

    ref.current.cancel()
  })

  useEffectOnce(() => {
    dialogAnimation.current.play()
    dialogOverlayAnimation.current.play()
  })

  const onAccept = () => {
    props.onAccept?.()

    dialogAnimation.current.reverse()
    dialogOverlayAnimation.current.reverse()

    dialogAnimation.current.finished.then(() => props.onClose?.())
  }

  return html`
    <${ShadowDOM} stylesheets=${[stylesheet]}>
        <div class="dialog-menu-overlay" ref=${dialogOverlayAnimation.refCallback}>
            <div class="dialog-menu" ref=${dialogAnimation.refCallback}>
                <div class="message" dangerouslySetInnerHTML=${{__html: props.message}}></div>
                <div class="buttons">
                    <button class="accept" onClick=${onAccept}>Accept</button>
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
