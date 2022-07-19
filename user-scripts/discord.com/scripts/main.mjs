import { LocalDB, requestFile, StringConversion, waitForSelector } from '../../@libs/utils-injection.js'

window.discordUtils = {}


discordUtils.changeChatBackground = async function changeChatBackground() {
  const storage = await LocalDB.createLocalDB('_personal-storage')

  const file = await requestFile('image/*')

  await storage.setItem('chat-background', file)

  setChatBackgroundFromBlob(file)
}

function setChatBackgroundFromBlob(blob) {
  if (!blob.type.startsWith('image/')) {
    throw new Error(`Blob must have a MIME Type of 'image/*`)
  }

  const imageUrl = URL.createObjectURL(blob)
  // Root element does not work since Discord resets its inline style
  document.body.style.setProperty('--chat-background', `url('${imageUrl}')`)
}

discordUtils.changeChatBgOverlayColor = async function changeChatBgOverlayColor(color) {
  const storage = await LocalDB.createLocalDB('_personal-storage')

  await storage.setItem('chat-bg-overlay-color', color)

  setChatBgOverlayColor(color)
}

function setChatBgOverlayColor(color) {
  document.body.style.setProperty('--chat-bg-overlay-color', color)
}


init()
async function init() {
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




// Función a la que se le pasa el ID de un usuario y
// te devuelve un array con los mensajes que ya estan cargados
discordUtils.findUser = function findUser(userID) {
  let userMessagesArray = [];

  chat = document.querySelector('[data-list-id="chat-messages"]');
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
} // function findUser()


// Chat
let chat;

// ID de usuario
const david = "473950936339841026";
const Angelo = "339391442919358465";
const Inklingboi = "687280609558528000";


// Usuarios a los que se les aplica algun estilo
requestAnimationFrame(function selectUser() {
  requestAnimationFrame(selectUser)

  const findUser = discordUtils.findUser

  let user;

  // Difunar los mensajes del usuario seleccionado
  user = findUser(david);
  for(let u of user) {
    if (u.matches('[class*="repliedMessage"]')) continue

    u.style.filter = "blur(10px)";
    u.style.pointerEvents = "none";
  }

  user = findUser(Inklingboi);
  for(let u of user) {
    if (u.matches('[class*="repliedMessage"]')) continue

    if( u.className.includes('mentioned') ) {
      u.style.background = "#07f7";
    } else {
      u.style.background = "#07f4";
    }
  }

  user = findUser(Angelo);
  for(let u of user) {
    if (u.matches('[class*="repliedMessage"]')) continue

    if( u.className.includes('mentioned') ) {
      u.style.background = "#561ea077";
    } else {
      u.style.background = "#561ea044";
    }
  }

  user = findUser("780871539825573918");
  for(let u of user) {
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
