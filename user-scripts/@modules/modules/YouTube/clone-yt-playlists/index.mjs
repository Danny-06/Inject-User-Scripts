import { showAlertDialog, showConfirmDialog, showPopup, showPromptDialog } from '../../../../@libs/libs/dialogs/dialogs.js'
import { html, waitForSelector } from '../../../../@libs/libs/dom-utils.js'
import LocalDB from '../../../../@libs/libs/local-db.js'
import { trimIndent } from '../../../../@libs/libs/string-utils.js'
import { cloneCurrentPlaylist } from '../youtube-utils.js'



const storage = await LocalDB.createLocalDB('_personal-storage')

const clonePlaylistButton = html`
<fake-ytd-button-renderer class="style-scope ytd-menu-renderer style-default size-default" use-keyboard-focused="" button-renderer="true" is-icon-button="" has-no-text="">
    <a class="yt-simple-endpoint style-scope ytd-button-renderer" tabindex="-1">
        <yt-icon-button id="button" class="style-scope ytd-button-renderer style-default size-default">
            <button id="button" class="style-scope yt-icon-button" aria-label="Compartir">
                <fake-yt-icon class="style-scope ytd-button-renderer">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                        <path fill="currentColor" d="M216,28H88A12,12,0,0,0,76,40V76H40A12,12,0,0,0,28,88V216a12,12,0,0,0,12,12H168a12,12,0,0,0,12-12V180h36a12,12,0,0,0,12-12V40A12,12,0,0,0,216,28ZM156,204H52V100H156Zm48-48H180V88a12,12,0,0,0-12-12H100V52H204Z" />
                    </svg>
                </yt-icon>
            </button>
            <yt-interaction id="interaction" class="circular style-scope yt-icon-button">
                <div class="stroke style-scope yt-interaction"></div>
                <div class="fill style-scope yt-interaction"></div>
            </yt-interaction>
        </yt-icon-button>
        <tp-yt-paper-tooltip class="style-scope ytd-button-renderer" role="tooltip" tabindex="-1">
            <div id="tooltip" class="style-scope tp-yt-paper-tooltip" style-target="tooltip" style="padding: 0; margin: 0">
                Clonar Lista de Reproducción
            </div>
        </tp-yt-paper-tooltip>
    </a>
</ytd-button-renderer>
`.firstElementChild



window.addEventListener('yt-navigate-start', event => {
  main().catch(console.error)
})

main().catch(reason => console.error(reason))

async function main() {
  if (document.querySelector('fake-ytd-button-renderer')) return

  const playlistMenu = await waitForSelector('ytd-playlist-header-renderer .metadata-wrapper .metadata-buttons-wrapper ')

  const clonePlaylistBtn = clonePlaylistButton.cloneNode(true)
  playlistMenu.append(clonePlaylistBtn)

  clonePlaylistBtn.addEventListener('click', async event => {
    const response = await clonePlaylist()

    if (response.status !== 200) {
      showAlertDialog(
        trimIndent(`
        Something went wrong in the request.
        You may exceed your daily playlist creation.

        Or maybe your 'authorization' string is not valid anymore and you have to get it again.
        `)
      )
      return
    }

    
    const data = await response.json()
    const {playlistId} = data
    
    showPopup(`Playlist cloned!!!`, 2000)

    if (playlistId) {
      const url = `https://www.youtube.com/playlist?list=${playlistId}`

      showConfirmDialog(`Do you want to open the playlist in a new tab?\n\n<a href="${url}">${url}</a>`)
      .then(accept => {
        if (!accept) {
          return
        }

        window.open(url)
      })
    }
  })
}



async function clonePlaylist() {
  const authorizationStorage = await storage.getItem('request-authorization') ?? ''

  const authorization = await showPromptDialog(trimIndent(`
  Provide 'authorization' string to clone the playlist.

  You can find it in the Network tab of Devtools.
  Look for a 'log_event' request or you can make your own request
  by adding or removing a video from a playlist.
  When you got the request, check its 'Request Headers'
  and copy the 'authorization' value and paste it here.

  (The default authorization value that may appear below is taken from localStorage from previous value received. If it doesnt work, get it again as mentioned above.)
  `), authorizationStorage)

  if (authorization == null || authorization === '') return

  await storage.setItem('request-authorization', authorization)

  return cloneCurrentPlaylist(authorization)
}
