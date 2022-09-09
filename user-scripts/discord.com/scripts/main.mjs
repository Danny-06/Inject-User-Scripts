import { createElement, handleSelectorLifeCycle, parseHTML, showPromptDialog, StringConversion } from '../../@libs/utils-injection.js'
import * as discordUtils from './discord-utils.js'
import { findUser, initChatBg } from './discord-utils.js'
import * as ctxMenu from './resource-data/context-menu-options.js'

window.discordUtils = discordUtils



init()
async function init() {
  initChatBg()

  handleSelectorLifeCycle(`#message[role="menu"] > *:first-child`, {
    onExist: menu => {
      const ctxM = discordUtils.ContextMenuManager

      ctxM.items.clear()

      const separator = parseHTML(`<div role="separator" class="separator-1So4YB"></div>`).firstChild
      menu.lastChild.before(separator)

      const group = createElement('div', {attributes: {role: 'group'}})
      menu.lastChild.before(group)


      // Context Menu Options

      ctxM.createContextMenuItem(ctxMenu.changeChatBackground)

      ctxM.createContextMenuItem(ctxMenu.changeChatBgOverlayColor)

      if (document.querySelector(`[data-list-id="guildsnav"] .listItem-3SmSlK .blobContainer-ikKyFs.selected-3c78Ai img`)) {
        ctxM.createContextMenuItem(ctxMenu.getServerIcon)
      }

      if (document.querySelector(`.sidebar-1tnWFu .bannerImage-ubW8K- img`)) {
        ctxM.createContextMenuItem(ctxMenu.getServerBanner)
      }


      group.append(...ctxM.items, menu.lastChild)

      menu.style.width = [...ctxM.items].map(c => c.offsetWidth).sort((a, b) => b - a)[0] + 20 + 'px'
      group.style.position = 'absolute'
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
