import { delay, waitForSelector, promiseWrapper as pw, createElement } from "../../@libs/utils-injection.js"


  // Execute this script in the live chat iframe too
if (window === parent) {
  waitForSelector('ytd-watch-flexy #chatframe')
  .then(iframe => {
    iframe.addEventListener('load', () => {
      const newScript = document.createElement('script')
      newScript.src = import.meta.url
      newScript.type = 'module'
      newScript.dataset.source = 'Chrome Extension'

      iframe.contentDocument.head.append(newScript)

      // Making click on user name will open a new tab in his channel
      iframe.contentDocument.head.append((() => {
        const style = createElement('style', {properties: {
          innerHTML: `
          #author-name {
            cursor: pointer;
          }

          #author-name:hover {
            text-decoration: underline;
          }
          `
        }})

        return style
      })())

      iframe.contentWindow.addEventListener('click', event => {
        if (!event.target.matches('#author-name')) return

        const messageElement = event.target.closest('yt-live-chat-text-message-renderer')
        const channelID = messageElement.data.authorExternalChannelId

        window.open(`https://youtube.com/channel/${channelID}`)
      })
    })
  })
}

/**
 * @type {HTMLDivElement}
 */
const thumbnailContainer = document.body.appendChild(document.createElement('div'))
thumbnailContainer.classList.add('big-thumbnail')

const thumbnailImg = thumbnailContainer.appendChild(document.createElement('img'))

const imgSize = 500

const css = // css
`
.big-thumbnail {
  display: none;
  pointer-events: none;
  position: fixed;
  transform: translateY(-50%);
  z-index: 99999999999999;

  width: 300px;
  height: 300px;
  padding: 1rem;

  background-color: #333;
  box-shadow: 0 0 1.5em #111;
}

.big-thumbnail.show {
  display: block;
}

.big-thumbnail > img {
  object-fit: contain;
  display: block;
  width: 100%;
  height: 100%;
}

.big-thumbnail > img:not([src]) {
  display: none;
}
`

const style = document.createElement('style')
style.innerHTML = css
thumbnailContainer.append(style)

let promiseDelay

window.addEventListener('mouseover', async event => {
  promiseDelay?.reject('')

  if (!document.hasFocus()) return

  /**
   * @type {HTMLImageElement}
   */
  const img = event.target

  img.closest('#avatar-link')?.removeAttribute('title')

  const avatarThumbnailSelector =
  `
  yt-img-shadow#avatar                   > img,
  yt-img-shadow#author-thumbnail         > img,
  yt-img-shadow#author-photo             > img,
  #author-thumbnail yt-img-shadow        > img,
  #channel-info     yt-img-shadow        > img,
  #thumbnail yt-img-shadow               > img,
  #repost-author-thumbnail yt-img-shadow > img
  `

  // When leaving the mouse out of the image hide the thumbnail container
  if (!event.target.matches(avatarThumbnailSelector)) {
    thumbnailContainer.classList.remove('show')
    return
  }

  promiseDelay = delay(500)

  const [, cancelError] = await pw(promiseDelay)

  if (cancelError != null) return

  thumbnailImg.removeAttribute('src')
  thumbnailContainer.classList.add('show')

  const index = img.src.indexOf('=')

  if (index === -1) return thumbnailImg.src = img.src

  thumbnailImg.src = `${img.src.slice(0, index)}=s${imgSize}`

  const imgRect = img.getBoundingClientRect()
  let left = imgRect.x + imgRect.width + 10
  if ((left + thumbnailContainer.offsetWidth) > window.innerWidth) left = window.innerWidth - thumbnailContainer.offsetWidth - 15

  let top = imgRect.y + imgRect.height / 2
  if (top < thumbnailImg.offsetHeight / 2 + 30)                 top = thumbnailImg.offsetHeight / 2 + 30
  if (top > window.innerHeight - thumbnailImg.offsetHeight / 2) top = window.innerHeight - thumbnailImg.offsetHeight / 2 - 30

  thumbnailContainer.style.setProperty('left', `${left}px`)
  thumbnailContainer.style.setProperty('top',  `${top}px`)
})

// When leaving the mouse out of the window hide the thumbnail container
window.addEventListener('mouseout', event => thumbnailContainer.classList.remove('show'))
