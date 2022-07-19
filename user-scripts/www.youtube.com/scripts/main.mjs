import { handleSelectorLifeCycle, waitForSelector, delay, createElement, cloneScript } from "../../@libs/utils-injection.js";
import * as youtubeUtils from "./youtube-utils.js";


window.youtubeUtils = youtubeUtils

try {

  (async function () {

    // Open Youtube Shorts in an new tab doing Ctrl + click
    window.addEventListener('click', event => {
      if (!location.pathname.includes('/shorts/')) return
      if (!event.ctrlKey) return
    
      const target = event.target.closest('ytd-reel-video-renderer')
    
      if (!target) return
    
      const videoId = target.data.command.reelWatchEndpoint.videoId
    
      window.open(`https://youtube.com/watch?v=${videoId}`)
    })
    

    // Forzar audio de la nueva previsualización de videos en la pagina principal
    if (location.pathname === '/') {
      const video = await waitForSelector('video')

      const mutedSetter = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'muted').set
      Object.defineProperty(HTMLMediaElement.prototype, 'muted', { set: () => null })
      mutedSetter.call(video, false)
    }

    window.addEventListener('click', event => {
      if (event.target.matches('ytd-watch-flexy video'))
        event.target.focus()
    });

    // Ocultar el primer video de recomendados si es un anuncio
    (async function () {

      if (location.href !== 'https://www.youtube.com/') return

      const addVideo = await waitForSelector('ytd-display-ad-renderer').then(addContent => addContent.closest('ytd-rich-item-renderer'))

      addVideo.style.setProperty('display', 'none', 'important');

    })();

    // Set Scroll Padding equal to navbar height
    waitForSelector('#masthead-container').then(navbar => {
      document.documentElement.style.scrollPaddingBlockStart = `${navbar.offsetHeight}px`
    })

    // Eventos de navegación de Youtube para ejecutar el código
    // al cambiar de página (Youtube no recarga la página, la actualiza)
    window.addEventListener("yt-navigate-start", Executer);
    window.addEventListener("yt-navigate-finish", Executer);

    window.addEventListener('mousedown', (event) => {
      if (event.target.matches('ytd-watch-flexy video')) event.preventDefault()
    });




    window.calidad1080pAutomatica = calidad1080pAutomatica


    Executer()
    async function Executer(event) {

      if (location.pathname !== '/watch') {
        if (location.pathname === '/') {
          // Make a recursion for the youtube main page to detect the preview video
          // and change its resolution
          handleSelectorLifeCycle('ytd-video-preview video[src]', {onExist: calidad1080pAutomatica})
        }
        return
      }


      if (event.type === 'yt-navigate-finish') window.removeEventListener('load', Executer);

      /**
       * @type {HTMLVideoElement}
       */
      const video = await waitForSelector('ytd-watch-flexy video');

      // Remove video preview
      waitForSelector('ytd-video-preview video')
      .then(video => video.src = '')

      calidad1080pAutomatica(video)


      video.addEventListener('canplay', event => calidad1080pAutomatica(video), { once: true });


      // Capture Screenshot button contextmenu

      const contextMenuPopup = await waitForSelector('.ytp-popup.ytp-contextmenu > .ytp-panel > .ytp-panel-menu')


      const itemMenu = createElement('div', {
        classes: ['ytp-menuitem'],
        dataset: {source: 'Chrome Extension'},
        properties: {
          role: 'menuitem',
          tabindex: 0,
          innerHTML: // html 
          `
            <div class="ytp-menuitem-icon">
              <svg viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000">
                <g>
                  <path fill="#FFF" d="M908.4,908.4H91.7c-45.2,0-81.7-36.5-81.7-81.7V336.6c0-45,36.5-81.6,81.7-81.6H255v-81.7c0-45.2,36.5-81.7,81.6-81.7h326.7c45.2,0,81.8,36.5,81.8,81.7V255h163.3c45.1,0,81.6,36.5,81.6,81.6v490.1C990,871.9,953.5,908.4,908.4,908.4L908.4,908.4z M132.4,336.6c-22.5,0-40.8,18.4-40.8,40.9s18.4,40.8,40.8,40.8s40.8-18.3,40.8-40.8S155,336.6,132.4,336.6L132.4,336.6z M550,336.6h-92c-114.5,21.6-201.1,121.8-201.1,242.6c0,136.4,110.6,247.1,247.1,247.1c136.5,0,247.1-110.7,247.1-247.1C751.1,458.3,664.6,358.2,550,336.6L550,336.6z M494.1,706.1c-68.2,0-123.7-55.5-123.7-123.7c0-68.3,55.4-123.5,123.7-123.5c68.2,0,123.5,55.2,123.5,123.5C617.5,650.7,562.3,706.1,494.1,706.1L494.1,706.1z"/>
                </g>
              </svg>
            </div>
            <div class="ytp-menuitem-label">Capturar fotograma actual</div>
            <div class="ytp-menuitem-content"></div>
          `
        }
      })

      itemMenu.addEventListener('click', async event => {
        const ytContextMenu = itemMenu.closest('.ytp-popup.ytp-contextmenu')
        if (ytContextMenu) ytContextMenu.style.display = 'none'

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        canvas.width  = video.videoWidth
        canvas.height = video.videoHeight

        ctx.drawImage(video, 0, 0)

        const blob = await new Promise(resolve => canvas.toBlob(resolve))
        const url = URL.createObjectURL(blob)

        const blobWindow = window.open(url)
        const extensionScripts = document.querySelectorAll('[data-source="Chrome Extension - @all-urls"]')

        URL.revokeObjectURL(url)

        await delay(0)

        extensionScripts.forEach(s => {
          if (s instanceof HTMLScriptElement)
            blobWindow.document.head.append(cloneScript(s))
          else
            blobWindow.document.head.append(s.cloneNode(true))
        })

      })

      if (!document.querySelector('.ytp-menuitem[data-source="Chrome Extension"]'))
        contextMenuPopup.prepend(itemMenu)
      

      // Original title translation
      // (async function() {
      //   const videoTitle = await waitForSelector("#container > h1 > yt-formatted-string")
      //   await new Promise(resolve => window.addEventListener('load', resolve, {once: true}))
      //   videoTitle.innerHTML = document.title.replace(/ - YouTube$/, '')
      // })()

    } // End Executer()

  })().catch(console.error); // End IIFE

  document.addEventListener("keydown", RefreshComments);

  // Función que actualiza los comentarios
  function RefreshComments(event) {
    const constrains = [
      event.ctrlKey,
      event.key.toUpperCase() === 'Q'
    ]

    if (constrains.includes(false)) return

    // Selecciona la opción del menu desplegable que esté elegida (Mejores comenetario, Más recientes primero)
    let orderButtonSelected = document.querySelector('tp-yt-paper-listbox#menu .iron-selected')
    orderButtonSelected.click();
  }







  // Función que selecciona la calidad 1080p (o le que haya disponible más alta si esta no estuviera)
  async function calidad1080pAutomatica(video) {

    await delay(1000)

    const player = video.closest('ytd-player')

    // Esperara a que el botón del menu de ajustes esté disponible
    const settingsButton = await waitForSelector('.ytp-settings-button', {node: player})
    settingsButton.click();

    const menuOpciones = player.querySelector('.ytp-settings-menu .ytp-panel-menu')

    await waitForSelector('.ytp-settings-menu .ytp-panel-menu > :last-child:not(:first-child)', {node: player})

    const botonCalidadVideo = menuOpciones.lastElementChild
    botonCalidadVideo.click()


    const menuOpcionesCalidad = player.querySelector('.ytp-quality-menu .ytp-panel-menu')


    const opcionesCalidad = [...menuOpcionesCalidad.children]

    const resoluciones = [
      '1080p',
      '720p',
      '480p',
      '360p',
      '240p',
      '144p'
    ]

    try {

      opcionesCalidad.forEach(opcion => {

        for (let i = 0; i < resoluciones.length; i++) {
          if (opcion.textContent.includes(resoluciones[i])) {
            opcion.click()
            video.focus()

            throw `'opcionesCalidad.forEach' cancelled`
          }
        }

      })

    } catch (error) { }

  }


} catch (error) {
  console.error(error)
}
