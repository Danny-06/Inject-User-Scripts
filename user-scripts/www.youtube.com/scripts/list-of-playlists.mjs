import { LocalDB } from '../../../pages/newtab/libs/localDB.js'


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
