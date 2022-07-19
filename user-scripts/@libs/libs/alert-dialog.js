
let isOpen = false

export function showAlertDialog(message) {
  if (isOpen) return Promise.resolve()

  isOpen = true

  const resetOpenState = () => isOpen = false

  const dialog = parseHTML(// html
  `
  <div class="dialog-menu-overlay">
      <template shadowroot="open">
          <style>
            *,
            *::before,
            *::after {
              box-sizing: border-box;
            }

            :host {
              font-size: initial;

              position: fixed;
              top: 0;
              left: 0;
              z-index: 999999999;

              width: 100%;
              height: 100%;

              display: flex;
              justify-content: center;
              align-items: center;

              background-color: #0009 !important;
              color: #fff;

              user-select: none !important;
            }

            .message {
              max-height: 27rem;
              white-space: pre-wrap;
              overflow: auto;
            }

            .buttons {
              display: flex;
              column-gap: 1rem;
            }

            button {
              all: unset;
              background-color: #333;
              padding: 0.5em;
              border-radius: 1em;
              cursor: pointer;
            }

            button:hover,
            button:active {
              background-color: #555;
            }

            button:active {
              background-color: #777;
            }

            .dialog-menu {
              width: 50rem;

              display: flex;
              flex-direction: column;
              row-gap: 3rem;

              padding: 1.5rem;

              border-radius: 0.6em;
              background-color: #222;
            }

            .dialog-menu > .buttons > .accept {
              background-color: #187538;
            }

            .dialog-menu > .buttons > .accept:hover,
            .dialog-menu > .buttons > .accept:active {
              background-color: #1aa74a;
            }

            .dialog-menu > .buttons > .accept:active {
              background-color: #00581e;
            }
          </style>
          <div class="dialog-menu">
              <div class="message">${message ?? '(No message provided)'}</div>
              <div class="buttons">
                  <button class="accept">Ok</button>
              </div>
          </div>
      </template>
  </div>
  `
  ).firstElementChild

  turnTemplateFromHostElementIntoShadowDOM(dialog)

  const acceptBtn = dialog.shadowRoot.querySelector('.accept')

  document.body.append(dialog)

  return new Promise(resolve => {
    acceptBtn.addEventListener('click', event => {
      resolve()
  
      dialog.remove()
      resetOpenState()
    })
  })
}

function parseHTML(htmlString) {
  const allowInnerHTMLPolicy = trustedTypes.createPolicy('allowInnerHTML', {createHTML: string => string})

  const template = document.createElement('template')
  template.innerHTML = allowInnerHTMLPolicy.createHTML(htmlString)

  return template.content
}

function turnTemplateFromHostElementIntoShadowDOM(hostElement) {
  const template = hostElement.querySelector('template[shadowroot]')

  if (template == null) {
    throw new Error(`No <template> tag with 'shadowroot' attribute was found to generate the Shadow DOM in the host element`)
  }

  template.remove()

  const mode = template.getAttribute('shadowroot')

  const shadowRoot = hostElement.attachShadow({mode})
  shadowRoot.append(template.content)
}
