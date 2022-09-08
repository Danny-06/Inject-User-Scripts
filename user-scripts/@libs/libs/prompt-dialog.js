
let isOpen = false

export function showPromptDialog(message, defaultValue = '') {
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

            a:link {
              color: #06f;
            }

            :host {
              font-size: initial;

              position: fixed;
              top: 0;
              left: 0;
              z-index: 2147483647;

              width: 100%;
              height: 100%;

              display: flex;
              justify-content: center;
              align-items: center;

              background-color: #0009 !important;
              color: #fff;

              user-select: none !important;
            }

            .input {
              width: 100%;
              height: 8rem;
              padding: 0.5rem;

              background-color: #444;
              color: #ccc;

              border-radius: 0.6em;
              border: none;
              resize: none;
              white-space: pre;
            }

            .input:focus {
              outline: none;
            }

            .message {
              max-height: 27rem;
              white-space: pre-wrap;
              overflow: auto;
              line-height: normal;
            }

            .buttons {
              display: flex;
              justify-content: flex-end;
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
              row-gap: 1.5rem;

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

            .dialog-menu > .buttons > .cancel {
              background-color: #af1515;
            }

            .dialog-menu > .buttons > .cancel:hover,
            .dialog-menu > .buttons > .cancel:active {
              background-color: #b52d2d;
            }

            .dialog-menu > .buttons > .cancel:active {
              background-color: #eb5c5c;
            }
          </style>
          <div class="dialog-menu">
              <div class="message">${message ?? '(No message provided)'}</div>
              <textarea class="input" placeholder="(Type here)">${defaultValue}</textarea>
              <div class="buttons">
                  <button class="accept">Accept</button>
                  <button class="cancel">Cancel</button>
              </div>
          </div>
      </template>
  </div>
  `
  ).firstElementChild

  turnTemplateFromHostElementIntoShadowDOM(dialog)

  const acceptBtn = dialog.shadowRoot.querySelector('.accept')
  const cancelBtn = dialog.shadowRoot.querySelector('.cancel')
  const textarea = dialog.shadowRoot.querySelector('.input')

  textarea.addEventListener('keydown', event => event.stopPropagation())

  document.body.append(dialog)

  return new Promise(resolve => {
    acceptBtn.addEventListener('click', event => {
      resolve(textarea.value)
  
      dialog.remove()
      resetOpenState()
    })
  
    cancelBtn.addEventListener('click', event => {
      resolve(null)

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
