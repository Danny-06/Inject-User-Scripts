import { waitForSelector, LocalDB } from '../../@libs/utils-injection.js'

/*
  Comments storage structure

  rootKey = {
    <videoId>: <comment-string>
  }
*/

const rootKey = 'comments-storage'

const storage = await LocalDB.createLocalDB('_personal-storage')

window.addEventListener('youtube-navigate', async event => {
  if (location.pathname !== '/watch') return

  const section = await waitForSelector('ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-comments-section"]')

  const commentBoxSelector =
  `
  ytd-comments
  ytd-comment-simplebox-renderer
  `

  const commentBoxContainer = await waitForSelector(commentBoxSelector, {node: section})

  commentBoxContainer.addEventListener('keyup', event => {
    const commentBoxInput = commentBoxContainer.querySelector('#contenteditable-root')
    const comment         = commentBoxInput.textContent.replaceAll('\r', '')

    updateCurrentCommentStorage(comment)
  })

  window.addEventListener('click', event => {
    if (!event.target.closest('ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-comments-section"] ytd-comment-simplebox-renderer ytd-button-renderer:is(#submit-button, #cancel-button) button')) return

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

    // Set caret selection to end of text
    const selection = window.getSelection()
    selection.empty()

    const range = document.createRange()
    range.setStart(commentBoxInput, 1)

    selection.addRange(range)
  }
})



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
