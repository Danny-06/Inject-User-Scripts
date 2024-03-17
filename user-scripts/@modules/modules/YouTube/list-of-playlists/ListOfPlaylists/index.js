import { DOMPrimitives } from '../../../../../@libs/libs/dom-primitives.js'
import stylesheet from './main.css' assert {type: 'css'}
import LocalDB from '../../../../../@libs/libs/local-db.js'


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


/**
 * 
 * @returns {PlaylistList[]}
 */
async function getListOfPlaylists() {
  const listOfPlaylists = await playlistStore.getItem(LIST_OF_PLAYLISTS_KEY)

  if (!listOfPlaylists) {
    const emptyList = []

    await playlistStore.setItem(LIST_OF_PLAYLISTS_KEY, emptyList)

    return emptyList
  }

  return listOfPlaylists
}

/**
 * 
 * @param {PlaylistList[]} listOfPlaylists 
 */
async function setListOfPlaylists(listOfPlaylists) {
  await playlistStore.setItem(LIST_OF_PLAYLISTS_KEY, listOfPlaylists)
}


const { div, ShadowRoot, For } = DOMPrimitives

export default function ListOfPlaylists() {
  const listOfPlaylists = [
    {
      title: 'SeS',
      playlists: [
        {title: 'Sonic'},
        {title: 'Shadow'},
      ]
    }
  ]

  return div(
    ShadowRoot({adoptedStyleSheets: stylesheet},
      div({attr: {class: 'overlay'}},
        div({attr: {class: 'list-of-playlist'}},
          For(listOfPlaylists[0].playlists, item => div(item.title)),
        ),
      )
    )
  )
}
