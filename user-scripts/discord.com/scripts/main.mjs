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


  // Init Custom ContexMenu

  let ctxMContainer

  window.addEventListener('contextmenu', async event => {
    await delay(0)

    const menu = await waitForSelector(`#message[role="menu"] > *:first-child`)

    if (ctxMContainer === menu) return

    ctxMContainer = menu

    const ctxM = discordUtils.ContextMenuManager

    if (ctxM.isRunning) return


    ctxM.itemsMap.clear()

    ctxM.currentEvent = event

    const separator = parseHTML(`<div role="separator" class="separator-1So4YB"></div>`)
    menu.lastChild.before(separator)

    const group = createElement('div', {attributes: {role: 'group'}})
    menu.lastChild.before(group)


    // Context Menu Options

    ctxM.createContextMenuItems([
      ctxMenu.copyCodeBlockToClipboard,
      ctxMenu.changeChatBackground,
      ctxMenu.changeChatBgOverlayColor,

      ctxMenu.getServerIcon,
      ctxMenu.getServerBanner
    ])

    group.append(...ctxM.items, menu.lastChild)

    menu.style.width = [...menu.children].map(c => c.offsetWidth).sort((a, b) => b - a)[0] + 20 + 'px'
    group.style.position = 'absolute'
  }, {capture: true})
}



// ID de usuario
const Angelo     = '339391442919358465'
const Inklingboi = '687280609558528000'


// Usuarios a los que se les aplica algun estilo
requestAnimationFrame(function selectUser() {
  requestAnimationFrame(selectUser)


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
