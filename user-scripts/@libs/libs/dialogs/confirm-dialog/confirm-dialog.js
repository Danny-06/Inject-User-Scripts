import html from '../../../preact/htm/html.mjs'
import ShadowDOM from '../../../preact/util-components/shadow-dom.js'
import appendComponent from '../../../preact/util-functions/append-component.js'
import useEffectOnce from '../../../preact/util-hooks/use-effect-once.js'
import useRefCallback from '../../../preact/util-hooks/use-ref-callback.js'
import stylesheet from './confirm-dialog.css' assert {type: 'css'}


function ConfirmDialog(props) {
  const dialogAnimation = useRefCallback((node, ref) => {
    ref.current = node.animate({
      transform: [
        'translateY(100px) scale(0.2)',
        'scale(0.2)',
        'none'
      ],
      offset: [0, 0.5, 1]
    }, {
      duration: 350,
      easing: 'ease-in',
      fill: 'forwards'
    })

    ref.current.cancel()
  })

  const dialogOverlayAnimation = useRefCallback((node, ref) => {
    ref.current = node.animate({
      opacity: [0, 1]
    }, {
      duration: 350,
      easing: 'ease-out',
      fill: 'forwards'
    })

    ref.current.cancel()
  })

  useEffectOnce(() => {
    dialogAnimation.current.play()
    dialogOverlayAnimation.current.play()
  })

  const onEnd = () => {
    dialogAnimation.current.reverse()
    dialogOverlayAnimation.current.reverse()

    dialogAnimation.current.finished.then(() => props.onClose?.())
  }

  const onAccept = () => {
    props.onAccept?.()

    onEnd()
  }

  const onCancel = () => {
    props.onCancel?.()

    onEnd()
  }

  return html`
    <${ShadowDOM} stylesheets=${[stylesheet]}>
        <div class="dialog-menu-overlay" ref=${dialogOverlayAnimation.refCallback}>
            <div class="dialog-menu" ref=${dialogAnimation.refCallback}>
                <div class="message" dangerouslySetInnerHTML=${{__html: props.message}}></div> 
                <div class="buttons">
                    <button class="accept" onClick=${onAccept}>Accept</button>
                    <button class="cancel" onClick=${onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    <//>
  `
}

let isOpen = false

let dialogWrapper = null

export function showConfirmDialog(message = '(No message provided)') {
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
      <${ConfirmDialog} message=${message}
        onAccept=${() => resolve(true)}
        onCancel=${() => resolve(false)}

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
