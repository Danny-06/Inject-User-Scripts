// Forzar audio de la nueva previsualización de videos en la pagina principal
// para los videos de solo música

// let clickEvent

// window.addEventListener('click', event => {
//   clickEvent = event
// }, {capture: true})

// function handleAudio() {
//   const mutedSetter = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'muted').set

//   Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
//     set(value) {
//       if (!this.closest('ytd-video-preview')) {
//         mutedSetter.call(this, value)
//         return
//       }

//       if (clickEvent?.isTrusted !== true) {
//         return
//       }

//       clickEvent = null

//       mutedSetter.call(this, value)
//     }
//   })
// }
