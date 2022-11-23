import { waitForSelector, LocalDB } from '../../@libs/utils-injection.js'
import {waitForDocumentReady} from '../../@libs/libs/dom-utils.js'

/*
  Comments storage structure

  rootKey = {
    <videoId>: <comment-string>
  }
*/


waitForDocumentReady(document)
.then(() => main().catch(console.error))

window.addEventListener('yt-navigate-start', event => main().catch(console.error))
window.addEventListener('yt-navigate-error', event => main().catch(console.error))


const rootKey = 'comments-storage'

const storage = await LocalDB.createLocalDB('_personal-storage')

async function main() {
  if (location.pathname !== '/watch') return

  const commentBoxContainer = await waitForSelector('ytd-comments#comments ytd-comment-simplebox-renderer')

  commentBoxContainer.addEventListener('keyup', event => {
    const commentBoxInput = commentBoxContainer.querySelector('#contenteditable-root')
    const comment         = commentBoxInput.textContent.replaceAll('\r', '')

    updateCurrentCommentStorage(comment)
  })

  window.addEventListener('click', event => {
    if (!event.target.closest('ytd-comment-simplebox-renderer ytd-button-renderer:is(#submit-button, #cancel-button) button')) return

    updateCurrentCommentStorage('')
  })

  const comment = await getCurrentStoredMessage()

  if (comment != null) {
    const placeholderArea = commentBoxContainer.querySelector('#placeholder-area')
    placeholderArea.click()

    // Wait for the callback of the click listener to do the DOM manipulation
    await null

    // const cancelButton    = commentBoxContainer.querySelector('#cancel-button')
    const submitBtn       = commentBoxContainer.querySelector('#submit-button')
    const commentBoxInput = commentBoxContainer.querySelector('#contenteditable-root')

    commentBoxInput.innerHTML = turnCommentStringToHTML(comment)
    submitBtn.disabled = false
  }
}



function getVideoIdFromURL() {
  return new URL(location.href).searchParams.get('v')
}

async function getCurrentStoredMessage() {
  const videoId = getVideoIdFromURL()

  const comments = await getCommentsStorage()
  const comment = comments[videoId]

  return comment
}

async function getCommentsStorage() {
  const storageComments = await storage.getItem(rootKey)
  if (storageComments == null) {
    updateCommentStorage({})
    return {}
  }

  return storageComments
}

function updateCommentStorage(commentsStorage) {
  return storage.setItem(rootKey, commentsStorage)
}

async function updateCurrentCommentStorage(comment) {
  const commentsStorage = await getCommentsStorage()
  const videoId = getVideoIdFromURL()

  if (comment !== '') {
    commentsStorage[videoId] = comment
  } else {
    delete commentsStorage[videoId]    
  }

  return updateCommentStorage(commentsStorage)
}

function turnCommentStringToHTML(commentString) {
  return commentString.split('\n').map(s => `<div>${s !== '' ? s : '<br>'}</div>`).join('')
}
