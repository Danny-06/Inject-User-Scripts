import { createElement, handleSelectorLifeCycle, LocalDB, requestFile, showPromptDialog, StringConversion, waitForSelector } from '../../@libs/utils-injection.js'
import * as discordUtils from './discord-utils.js'
import { findUser, initChatBg } from './discord-utils.js'

window.discordUtils = discordUtils



init()
async function init() {
  initChatBg()

  handleSelectorLifeCycle(`#message[role="menu"] > *:first-child`, {
    onExist: menu => {
      const group = createElement('div', {attributes: {role: 'group'}})

      menu.append(group)

      const bgChatBtn = discordUtils.createContextMenuItem({
        id: 'change-chat-bg',
        name: 'Change Chat Background',
        icon: // html
        `
        <svg viewBox="0 0 1000 1000">
            <g>
                <path fill="currentColor" d="M749.8,993.3H250.2C117.8,993.3,10,884.8,10,751.4V248.6C10,115.2,117.8,6.7,250.2,6.7h499.6C882.2,6.7,990,115.2,990,248.6v502.9C990,884.8,882.2,993.3,749.8,993.3z M250.2,69.8c-97.9,0-177.6,80.2-177.6,178.7v502.9c0,98.6,79.6,178.7,177.6,178.7h499.6c97.9,0,177.6-80.2,177.6-178.7V248.6c0-98.5-79.7-178.7-177.6-178.7H250.2z"></path>
                <path fill="currentColor" d="M958.6,723.9c-7.1,0-14.2-2.4-20-7.3l-207.3-174l-170.9,172c-11.7,11.8-32.6,11.8-44.3,0l-245.4-247L63.5,676.2c-12.2,12.3-32.1,12.3-44.3,0c-12.2-12.3-12.2-32.3,0-44.6l229.3-230.9c12.2-12.3,32.1-12.3,44.3,0l245.4,247l169-170.1c11.4-11.6,29.8-12.4,42.2-1.9l229.3,192.4c13.3,11.1,15.1,31,4,44.4C976.5,720.1,967.6,723.9,958.6,723.9z"></path>
                <path fill="currentColor" d="M633.8,416.1c-70,0-126.9-57.3-126.9-127.7c0-70.4,56.9-127.7,126.9-127.7c70,0,126.9,57.3,126.9,127.7C760.7,358.8,703.7,416.1,633.8,416.1z M633.8,223.7c-35.4,0-64.2,29-64.2,64.6c0,35.6,28.8,64.6,64.2,64.6c35.4,0,64.2-29,64.2-64.6C698,252.7,669.2,223.7,633.8,223.7z"></path>
            </g>
        </svg>
        `,
        action: item => {
          discordUtils.changeChatBackground()
        }
      })

      const bgOverlayChatBtn = discordUtils.createContextMenuItem({
        id: 'change-chat-bg-overlay-color',
        name: 'Change Chat BG Overlay Color',
        icon: // html
        `
        <svg viewBox="0 0 1000 1000">
            <g>
                <path fill="currentColor" d="M749.8,993.3H250.2C117.8,993.3,10,884.8,10,751.4V248.6C10,115.2,117.8,6.7,250.2,6.7h499.6C882.2,6.7,990,115.2,990,248.6v502.9C990,884.8,882.2,993.3,749.8,993.3z M250.2,69.8c-97.9,0-177.6,80.2-177.6,178.7v502.9c0,98.6,79.6,178.7,177.6,178.7h499.6c97.9,0,177.6-80.2,177.6-178.7V248.6c0-98.5-79.7-178.7-177.6-178.7H250.2z"></path>
                <path fill="currentColor" d="M958.6,723.9c-7.1,0-14.2-2.4-20-7.3l-207.3-174l-170.9,172c-11.7,11.8-32.6,11.8-44.3,0l-245.4-247L63.5,676.2c-12.2,12.3-32.1,12.3-44.3,0c-12.2-12.3-12.2-32.3,0-44.6l229.3-230.9c12.2-12.3,32.1-12.3,44.3,0l245.4,247l169-170.1c11.4-11.6,29.8-12.4,42.2-1.9l229.3,192.4c13.3,11.1,15.1,31,4,44.4C976.5,720.1,967.6,723.9,958.6,723.9z"></path>
                <path fill="currentColor" d="M633.8,416.1c-70,0-126.9-57.3-126.9-127.7c0-70.4,56.9-127.7,126.9-127.7c70,0,126.9,57.3,126.9,127.7C760.7,358.8,703.7,416.1,633.8,416.1z M633.8,223.7c-35.4,0-64.2,29-64.2,64.6c0,35.6,28.8,64.6,64.2,64.6c35.4,0,64.2-29,64.2-64.6C698,252.7,669.2,223.7,633.8,223.7z"></path>
            </g>
        </svg>
        `,
        action: async item => {
          const color = await showPromptDialog(`Write the color you want for the overlay of the background chat`, '#000c')
          discordUtils.changeChatBgOverlayColor(color)
        }
      })

      group.append(bgChatBtn, bgOverlayChatBtn)
    }
  })
}



// ID de usuario
const david      = '473950936339841026'
const Angelo     = '339391442919358465'
const Inklingboi = '687280609558528000'


// Usuarios a los que se les aplica algun estilo
requestAnimationFrame(function selectUser() {
  requestAnimationFrame(selectUser)

  // Difunar los mensajes del usuario seleccionado
  for (const u of findUser(david)) {
    if (u.matches('[class*="repliedMessage"]')) continue

    u.style.filter = "blur(10px)";
    u.style.pointerEvents = "none";
  }

  for (const u of findUser(Inklingboi)) {
    if (u.matches('[class*="repliedMessage"]')) continue

    if (u.className.includes('mentioned') ) {
      u.style.background = "#07f7";
    } else {
      u.style.background = "#07f4";
    }
  }

  for (const u of findUser(Angelo)) {
    if (u.matches('[class*="repliedMessage"]')) continue

    if (u.className.includes('mentioned') ) {
      u.style.background = "#561ea077";
    } else {
      u.style.background = "#561ea044";
    }
  }

  for (const u of findUser("780871539825573918")) {
    if (u.matches('[class*="repliedMessage"]')) continue

    u.style.filter = "blur(20px)";
    u.style.pointerEvents = "none";
  }
});





// Reemplazar "Alexelcapo" por "Elise"
// setInterval(() => replaceWord(/Alexelcapo/i, 'Elise'), 1000)

function replaceWord(find, replaceWith) {

  let tags = document.querySelectorAll("a, div, span:not([data-slate-string])");
  for(let i = 0; i < tags.length; i++) {

    // In Chrome 100 'search' method has really bad performance
    if(tags[i].innerText.search(find) >= 0 && tags[i].childElementCount == 0) {
      tags[i].innerText = tags[i].innerText.replace(find, replaceWith);
    }

  }

}



// Validador de Base64
const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/





requestAnimationFrame(codeChatBase64ToText);

// Función que convierte los mensajes Base64 a texto si empiezan en #|' y acaban en '|#' 
function codeChatBase64ToText() {
  requestAnimationFrame(codeChatBase64ToText)

  const textChat = document.querySelectorAll('main [data-list-id="chat-messages"] [id*="message-content"]');

  if (textChat == null) return
  
  for(let i = 0; i < textChat.length; i++) {

    const message = textChat[i]
    const messageNode = textChat[i]?.childNodes[0]

    if (!message || !messageNode?.nodeValue) continue

    if(messageNode.nodeValue.slice(0,2) == '#|' && messageNode.nodeValue.slice(-2) == '|#') {
      if(base64regex.test(messageNode.nodeValue.slice(2,-2))) {
        messageNode.nodeValue = StringConversion.base64ToString(messageNode.nodeValue.slice(2,-2));
        message.style.background = '#222c';
      }
    }
  
  }
  
}
