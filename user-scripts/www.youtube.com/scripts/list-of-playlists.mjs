import LocalDB from '../../@libs/libs/localDB.js'
import html from '../../@libs/preact/htm/html.mjs'
import { render } from '../../@libs/preact/preact.mjs'
import { useSignal } from '../../@libs/preact/signals.mjs'
import DivShadow from '../../@libs/preact/util-components/shadow-dom.js'
import useEffectOnce from '../../@libs/preact/util-hooks/use-effect-once.js'


/**
 * @typedef Playlist
 * @property {string} title
 * @property {string} id
 */

/**
 * @typedef PlaylistList
 * @property {string} title
 * @property {Playlist[]} playlists
 */

const DATABASE_NAME = '_playlist-store'
const LIST_OF_PLAYLISTS_KEY = 'list-of-playlists'

const playlistStore = await LocalDB.createLocalDB(DATABASE_NAME)


async function getListOfPlaylists() {
  const listOfPlaylists = await playlistStore.getItem(LIST_OF_PLAYLISTS_KEY)

  if (!listOfPlaylists) {
    const emptyList = []

    await playlistStore.setItem(LIST_OF_PLAYLISTS_KEY, emptyList)

    return emptyList
  }

  return listOfPlaylists
}



async function setListOfPlaylists(listOfPlaylists) {
  await playlistStore.setItem(LIST_OF_PLAYLISTS_KEY, listOfPlaylists)
}


function ListOfPlaylists(props) {

  const listOfPlaylistsSignal = useSignal([])
  const listOfPlaylists = listOfPlaylistsSignal.value

  useEffectOnce(() => {
    getListOfPlaylists().then(list => listOfPlaylistsSignal.value = list)
  })

  return html`
    <${DivShadow}>
      <style>
        :host {
          all: unset;

          display: block;
        }


        .overlay {
          position: fixed;
          inset: 0;
          margin: auto;
          z-index: 9999;

          display: flex;

          background-color: #0008;
        }

        .list-of-playlist {
          margin: auto;

          width: 500px;
          height: 500px;

          background-color: #06f;
        }
      </style>
      <div class="overlay">
        <div class="list-of-playlist">
          ${listOfPlaylists.map(playlist => html`<div>${playlist.name}</div>`)}
        </div>
      </div>
    <//>
  `
}


// render(html`<${ListOfPlaylists} />`, document.body)
