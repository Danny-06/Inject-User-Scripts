import { createElement, delay, handleSelectorLifeCycle, parseHTML, waitForSelector } from '../../@libs/utils-injection.js'
import * as discordUtils from './discord-utils.js'
import { findUser, initChatBg } from './discord-utils.js'
import * as ctxMenu from './resource-data/context-menu-options.js'

window.discordUtils = discordUtils

const query = selector => document.querySelector(selector)
const getValueIfSelectorMatches = (selector, value) => {
  if (query(selector)) {
    return value
  } else {
    return Array.isArray(value) ? [] : null
  }
}


init()
async function init() {
  initChatBg()

  let ctxMContainer

  window.addEventListener('contextmenu', async event => {
    await delay(0)

    const menu = await waitForSelector(`#message[role="menu"] > *:first-child`)

    if (ctxMContainer === menu) return

    ctxMContainer = menu

    const ctxM = discordUtils.ContextMenuManager

    if (ctxM.isRunning) return


    ctxM.items.clear()

    const separator = parseHTML(`<div role="separator" class="separator-1So4YB"></div>`)
    menu.lastChild.before(separator)

    const group = createElement('div', {attributes: {role: 'group'}})
    menu.lastChild.before(group)


    // Context Menu Options

    ctxM.createContextMenuItems([
      ctxMenu.changeChatBackground,
      ctxMenu.changeChatBgOverlayColor,

      getValueIfSelectorMatches(
        `[data-list-id="guildsnav"] .listItem-3SmSlK .blobContainer-ikKyFs.selected-3c78Ai img`,
        ctxMenu.getServerIcon
      ),

      getValueIfSelectorMatches(
        `.sidebar-1tnWFu .bannerImage-ubW8K- img`,
        ctxMenu.getServerBanner
      )
    ])

    group.append(...ctxM.items, menu.lastChild)

    menu.style.width = [...menu.children].map(c => c.offsetWidth).sort((a, b) => b - a)[0] + 20 + 'px'
    group.style.position = 'absolute'
  }, {capture: true})
}



// ID de usuario
const david      = '473950936339841026'
const Angelo     = '339391442919358465'
const Inklingboi = '687280609558528000'


// Usuarios a los que se les aplica algun estilo
requestAnimationFrame(function selectUser() {
  requestAnimationFrame(selectUser)

  // Difunar los mensajes del usuario seleccionado
  // findUser(david).forEach(e => {
  //   if (e.matches('[class*="repliedMessage"]')) return

  //   e.style.filter = "blur(10px)";
  //   e.style.pointerEvents = "none";
  // })

  findUser(Inklingboi).forEach(e => {
    if (e.matches('[class*="repliedMessage"]')) return

    if (e.className.includes('mentioned') ) {
      e.style.background = "#07f7";
    } else {
      e.style.background = "#07f4";
    }
  })

  findUser(Angelo).forEach(e => {
    if (e.matches('[class*="repliedMessage"]')) return

    if (e.className.includes('mentioned') ) {
      e.style.background = "#561ea077";
    } else {
      e.style.background = "#561ea044";
    }
  })
});





// Reemplazar "Alexelcapo" por "Elise"
// setInterval(() => replaceWord(/Alexelcapo/i, 'Elise'), 1000)

function replaceWord(find, replaceWith) {
  const tags = document.querySelectorAll("a, div, span:not([data-slate-string])");
  tags.forEach(tag => {

    // In Chrome 100 'search' method has really bad performance
    if(tag.innerText.search(find) >= 0 && tag.childElementCount == 0) {
      tag.innerText = tag.innerText.replace(find, replaceWith);
    }

  })
}








requestAnimationFrame(codeChatBase64ToText);

// Función que convierte los mensajes Base64 a texto si empiezan en #|' y acaban en '|#'
function codeChatBase64ToText() {
  requestAnimationFrame(codeChatBase64ToText)

  const textChat = document.querySelectorAll('main [data-list-id="chat-messages"] [id*="message-content"]');

  textChat?.forEach(discordUtils.decodeBase64Message)
}
