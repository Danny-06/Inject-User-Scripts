import { showAlertDialog } from '../@libs/libs/dialogs/dialogs.js'
import LocalDB from '../@libs/libs/local-db.js'
import { trimIndent } from '../@libs/libs/string-utils.js'
import { delay } from '../@libs/utils-injection.js'

document.querySelector('meta[name="theme-color"]')?.remove()

/**
 * @typedef VRChatUser
 * @property {string} id
 * @property {string} bio
 * @property {string[]} bioLinks
 * @property {string} currentAvatarImageUrl
 * @property {string} currentAvatarThumbnailImageUrl
 * @property {string} developerType
 * @property {string} displayName
 * @property {string} friendKey
 * @property {boolean} isFriend
 * @property {string} last_login
 * @property {string} last_platform
 * @property {string} location
 * @property {string} profilePicOverride
 * @property {string} status
 * @property {string} statusDescription
 * @property {string[]} tags
 * @property {string} travelingToLocation
 * @property {string} userIcon
 */

/**
 * @typedef APIError
 * @property {{message: string, status_code: number}} error
 */

class VRChat {

  constructor() {
    
  }

  /**
   * 
   * @param {{offline: boolean, n?: number, offset?: number}} param0 
   * @returns {Promise<VRChatUser[]>}
   */
  async getFriends({offline = false, n, offset}) {
    try {
      const apiURL = new URL('https://vrchat.com/api/1/auth/user/friends')
      const sp = apiURL.searchParams

      if (typeof offline === 'boolean') {
        sp.set('offline', offline)
      }

      if (typeof n === 'number' && Number.isFinite(n) && n >= 0) {
        sp.set('n', n)
      }

      if (typeof offset === 'number' && Number.isFinite(offset) && offset >= 0) {
        sp.set('offset', offset)
      }

      const response = await fetch(apiURL)

      /**@type {VRChatUser[] | APIError}*/
      const data = response.json()

      if ('error' in data) {
        throw data.error
      }

      return data
    } catch (reason) {
      console.error(reason)
      throw new Error(`Couldn't request VRChat friends`)
    }
  }

  /**
   * 
   * @returns {Promise<VRChatUser[]>}
   */
  async getAllFriends() {
    const friends = await Promise.all([
      this.getFriends({offline: false}),
      this.getFriends({offline: true})
    ])

    return friends.flat()
  }

  /**
   * 
   * @param {VRChatUser[]} lastSavedFriends 
   * @param {VRChatUser[]} currentFriends 
   */
  getMissingFriends(lastSavedFriends, currentFriends) {
    /**@type {VRChatUser[]}*/
    const missingFriends = []

    for (const lastSavedFriend of lastSavedFriends) {
      if (currentFriends.findIndex(friend => friend.id === lastSavedFriend.id) === -1) {
        missingFriends.push(structuredClone(lastSavedFriend))
      }
    }

    return missingFriends
  }

  /**
   * 
   * @param {string} friendId 
   * @returns 
   */
  getURLFromFriendId(friendId) {
    return `https://vrchat.com/home/user/${friendId}`
  }

}


checkMissingFriends()

async function checkMissingFriends() {
  if (location.pathname !== '/home') {
    return
  }

  const vrChat = new VRChat()

    const storage = await LocalDB.createLocalDB('_personal-storage')

    const friendsKeyStorage = 'vrchat-friends'
    const lostFriendsKeyStorage = 'vrchat-lost-friends'


    /**
     * @type {VRChatUser[]}
     */
    const lastSavedFriends = await storage.getItem(friendsKeyStorage) ?? []

    const currentFriends = await vrChat.getAllFriends()

    const missingFriends = vrChat.getMissingFriends(lastSavedFriends, currentFriends)

    storage.setItem(friendsKeyStorage, currentFriends)

    async function updateLostFriends() {
      const lostFriends = await storage.getItem(lostFriendsKeyStorage) ?? []

      await storage.setItem(lostFriendsKeyStorage, lostFriends.concat(missingFriends))
    }

    console.log({lastSavedFriends, currentFriends, missingFriends})

    if (missingFriends.length > 0) {
      updateLostFriends()

      showAlertDialog(trimIndent(
      `
        You lost ${missingFriends.length} friends :(

        ${
          missingFriends
          .map((friend, index) => `${index + 1}. <a target="_blank" href="${vrChat.getURLFromFriendId(friend.id)}">${friend.displayName}</a>`)
          .join('\n')
        }
      `))
    }
}
