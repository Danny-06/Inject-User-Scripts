import { promiseDocumentLoad, waitForSelector, LocalDB } from '../../@libs/utils-injection.js'

/*
  Comments storage structure

  rootKey = {
    <videoId>: <comment-string>
  }
*/


promiseDocumentLoad(document)
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
    const comment         = commentBoxInput.innerText.trim().replaceAll('\r', '')

    updateCurrentCommentStorage(comment)
  })

  window.addEventListener('click', event => {
    if (!event.target.matches('ytd-comment-simplebox-renderer ytd-button-renderer#submit-button #button')) return

    updateCurrentCommentStorage('')
  })

  const comment = await getCurrentStoredMessage()

  if (comment != null) {
    const placeholderArea = commentBoxContainer.querySelector('#placeholder-area')
    placeholderArea.click()

    // Wait for the callback of the click listener to do the DOM manipulation
    await null

    const submitBtn           = commentBoxContainer.querySelector('#submit-button')
    const commentBoxInput     = commentBoxContainer.querySelector('#contenteditable-root')

    commentBoxInput.innerHTML = turnCommentStringToHTML(comment)
    submitBtn.disabled = false
  }
}



function getVideoId() {
  return new URL(location.href).searchParams.get('v')
}

async function getCurrentStoredMessage() {
  const videoId = getVideoId()

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
  const videoId = getVideoId()

  if (comment !== '') {
    commentsStorage[videoId] = comment
  } else {
    delete commentsStorage[videoId]    
  }

  return updateCommentStorage(commentsStorage)
}

function turnCommentStringToHTML(commentString) {
  return commentString.split('\n').map(s => {
    return `<div>${s !== '' ? s : '<br>'}</div>`
  }).join('')
}
