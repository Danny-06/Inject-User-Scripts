import { waitForSelector } from "../../@libs/utils-injection.js";

// COLOCAR EL CHAT EN DIRECTO ENCIMA DEL VIDEO 

// Chat en directo
const iframeChat = await waitForSelector('#chatframe');

//var styleIframeContent = document.createElement('style');

//styleIframeContent.innerHTML = `
//#cards {/* Ocultar aviso de las normas de la comunidad */
//    display: none !important;
//}
//`; // No surte efecto el estilo aparentemente por alguna razón

//iframeChat.contentDocument.head.appendChild(styleIframeContent);


const styleIframe = document.createElement('style');
styleIframe.innerHTML = `
/* El chat deja de ser transparente y se alarga el pasar el ratón encima */
#chatframe {
  position: absolute;
  right: 0;
  z-index: 99;

  width: 450px;
  height: 48px;
  min-height: 0;
  opacity: 0.5;

  transition: height 0.7s, min-height 0.7s;
}

#chatframe:hover {
  opacity: 0.8 !important;
  min-height: 370px !important;
  height: 70% !important;
}
`;

document.head.append(styleIframe);

// Contenedor del video y del chat en directo que vamos a añadir
const ytdPlayer = document.getElementById('ytd-player');

ytdPlayer.children[0].before(iframeChat);

// Contenedor del chat original (Modificación de la altura para que no ocupe espacio innecesario)
const chatContainer = document.querySelector('ytd-live-chat-frame#chat');
if (chatContainer) chatContainer.style = "min-height: 0px !important; height: 100%;"


window.addEventListener("yt-navigate-start",  () => iframeChat.remove());
window.addEventListener("yt-navigate-finish", () => iframeChat.remove());
