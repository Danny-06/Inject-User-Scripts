import { createElement } from '../../@libs/libs/dom-utils.js'
import { LocalDB, requestFile, StringConversion } from '../../@libs/utils-injection.js'


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


// Trick to get the Local and Session Storage instance since Discord remove them from window

// export function getLocalStorage() {
//   let storagePrototypeDescriptor = Object.getOwnPropertyDescriptors(Storage.prototype)

//   return new Promise(resolve => {
//     Object.defineProperty(Storage.prototype, 'setItem', {
//       configurable: true,
//       value() {
//         window.localStorage = this
//         storagePrototypeDescriptor.setItem.value.call(this, ...arguments)

//         Object.defineProperty(Storage.prototype, 'setItem', {
//           configurable: true,
//           value: storagePrototypeDescriptor.setItem.value
//         })
//       }
//     })
//   })
// }


/**
 * @typedef ContextMenuOptions
 * @property {string} id
 * @property {string} name
 * @property {string} icon
 * @property {function} action
 * @property {function} condition
 */



export class ContextMenuManager {

  /**
   * @type {HTMLDivElement}
   */
  static menuElement

  static isRunning = false

  static currentEvent = null

  static itemsMap = new Map()

  /**
   * Get filtered items by condition
   */
  static get items() {
    const items = []

    this.itemsMap.forEach((options, item) => {
      if (typeof options.condition !== 'function' || options.condition(this.currentEvent)) {
        items.push(item)
      }
    })

    return items
  }

  /**
   *
   * @param {ContextMenuOptions} options
   */
  static createContextMenuItem(options) {
    if (options == null) return null

    this.isRunning = true

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
      this.menuElement.remove()

      action?.(item, this.currentEvent)
    })

    item.addEventListener('mouseenter', event => {
      this.menuElement
      .querySelector('.focused-3qFvc8')
      ?.classList.remove('focused-3qFvc8')

      item.classList.add('focused-3qFvc8')
    })

    item.addEventListener('mouseleave', event => item.classList.remove('focused-3qFvc8'))

    this.itemsMap.set(item, options)

    this.isRunning = false

    return item
  }

  /**
   *
   * @param {ContextMenuOptions[]} optionsCollection
   */
  static createContextMenuItems(optionsCollection) {
    return optionsCollection.map(option => this.createContextMenuItem(option))
  }

}


export async function getServerIcon() {
  const serverImg = document.querySelector(`[data-list-id="guildsnav"] .listItem-3SmSlK .blobContainer-ikKyFs.selected-3c78Ai img`)

  if (!serverImg) return null

  const serverImgURL = new URL(serverImg.src)
  serverImgURL.searchParams.set('size', '2048')

  if (!serverImgURL.pathname.endsWith('.gif')) {
    const animatedIconURL = new URL(serverImgURL.href)

    animatedIconURL.pathname = animatedIconURL.pathname.replace(/\.[a-z]*/i, '.gif')

    await fetch(animatedIconURL.href)
    .then(response => {
      if (response.status !== 200) return

      serverImgURL.href = animatedIconURL.href
    })
  }

  return serverImgURL.href
}

export async function getServerBanner() {
  const serverBanner = document.querySelector(`.sidebar-1tnWFu .bannerImage-ubW8K- img`)

  if (!serverBanner) return null

  const serverBannerURL = new URL(serverBanner.src)
  serverBannerURL.searchParams.set('size', '600')

  if (!serverBannerURL.pathname.endsWith('.gif')) {
    const animatedIconURL = new URL(serverBannerURL.href)

    animatedIconURL.pathname = animatedIconURL.pathname.replace(/\.[a-z]*/i, '.gif')

    await fetch(animatedIconURL.href)
    .then(response => {
      if (response.status !== 200) return

      serverBannerURL.href = animatedIconURL.href
    })
  }

  return serverBannerURL.href
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


// Validador de Base64
const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/

/**
 *
 * @param {HTMLDivElement} message
 * @returns
 */
export function decodeBase64Message(message) {
  const messageNode = message?.childNodes[0]

  if (!messageNode?.nodeValue) return

  if (!messageNode.nodeValue.startsWith('#|') || !messageNode.nodeValue.endsWith('|#')) return
  if (!base64regex.test(messageNode.nodeValue.slice(2, -2))) return

  messageNode.nodeValue = StringConversion.base64ToText(messageNode.nodeValue.slice(2,-2))
  message.style.background = '#222c'
}
