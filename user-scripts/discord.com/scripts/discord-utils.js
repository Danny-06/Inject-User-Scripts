import { appendMetaViewport, createElement, LocalDB, requestFile } from '../../@libs/utils-injection.js'


function setChatBackgroundFromBlob(blob) {
  if (!blob.type.startsWith('image/')) {
    throw new Error(`Blob must have a MIME Type of 'image/*`)
  }

  const imageUrl = URL.createObjectURL(blob)
  // Root element does not work since Discord resets its inline style
  document.body.style.setProperty('--chat-background', `url('${imageUrl}')`)
}


export async function changeChatBackground() {
  const storage = await LocalDB.createLocalDB('_personal-storage')

  const file = await requestFile('image/*')

  await storage.setItem('chat-background', file)

  setChatBackgroundFromBlob(file)
}

function setChatBgOverlayColor(color) {
  document.body.style.setProperty('--chat-bg-overlay-color', color)
}

export async function changeChatBgOverlayColor(color) {
  const storage = await LocalDB.createLocalDB('_personal-storage')

  await storage.setItem('chat-bg-overlay-color', color)

  setChatBgOverlayColor(color)
}


export async function initChatBg() {
  const storage = await LocalDB.createLocalDB('_personal-storage')
  const file = await storage.getItem('chat-background')
  const overlayBgColor = await storage.getItem('chat-bg-overlay-color')

  if (file != null) {
    setChatBackgroundFromBlob(file)
  }

  if (overlayBgColor != null) {
    setChatBgOverlayColor(overlayBgColor)
  }
}


/**
 * @typedef ContextMenuOptions
 * @property {string} id
 * @property {string} name
 * @property {string} icon
 * @property {function} action
 */

/**
 * 
 * @param {ContextMenuOptions} options 
 */
export function createContextMenuItem(options) {
  const {id, name = 'No name given', icon = '', action} = options

  const item = createElement('div', {
    id,

    classes: ['item-1OdjEX', 'labelContainer-2vJzYL', 'colorDefault-CDqZdO'],

    properties: {
      role: 'menuitem',
      tabindex: -1,
      innerHTML: // html
      `
      <div class="label-2gNW3x">${name}</div>
      <div class="iconContainer-1-SsTR">
          ${icon}
      </div>
      `
    },

    dataset: {
      menuItem: true
    }
  })

  item.addEventListener('click', event => {
    item.closest(`#message[role="menu"] > *:first-child`).remove()

    action?.(item)
  })

  item.addEventListener('mouseenter', event => {
    item
    .closest(`#message[role="menu"]`)
    .querySelector('.focused-3qFvc8')
    ?.classList.remove('focused-3qFvc8')

    item.classList.add('focused-3qFvc8')
  })

  item.addEventListener('mouseleave', event => item.classList.remove('focused-3qFvc8'))

  return item
}


/**
 * Función a la que se le pasa el ID de un usuario y
 * te devuelve un array con los mensajes que ya estan cargados
 */
export function findUser(userID) {
  const userMessagesArray = [];

  const chat = document.querySelector('[data-list-id="chat-messages"]');
  if(chat == null) return []

  for(let i = 3; i < chat.children.length - 1; i++) {

    // Mensaje del usuario
    const messageUser = chat.children[i];

    // Mensaje normal
    const profileImg         = messageUser.querySelector('[class*="contents"] img')
    const isUser             = profileImg?.src.includes?.('/avatars/'+userID+'/')
    const replyMessage       = messageUser.querySelector('[class*="repliedMessage"]')
    const isReplyUser        = replyMessage?.querySelector('img')?.src?.includes?.('/avatars/'+userID+'/')

    if(isReplyUser) userMessagesArray.push(replyMessage)

    // Si la ID de usuario no coincide
    if (!isUser) continue
  

    // Introducir el mensaje detectado del usuario en el array
    userMessagesArray.push(messageUser);
    // Bucle que controla los mensajes que siguen a los que contienen la foto de perfil del usuario
    for(let j = i + 1; j < chat.children.length - 1; j++) {
      const messageUser = chat.children[j];

      const profileImg         = messageUser.querySelector('[class*="contents"] > img')
      const isUser             = profileImg?.src.includes?.('/avatars/'+userID+'/')
      const replyMessage       = messageUser.querySelector('[class*="repliedMessage"]')
      const isReplyUser        = replyMessage?.querySelector('img')?.src?.includes?.('/avatars/'+userID+'/')

      if(isReplyUser) userMessagesArray.push(replyMessage)

      // Si hay imagen de perfil y la ID de usuario no coincide
      if (profileImg && !isUser) break

      // Si no, introducir el mensaje en el array
      // Si es un divisor, no se incluye en el array
      const isDivisor = messageUser.className.includes('divider')
      if(!isDivisor) userMessagesArray.push(messageUser)

    } // for()


  } // for()

  // Devolver array
  return userMessagesArray;
}
