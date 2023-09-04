function getURLParams(url) {
  const { searchParams } = new URL(url)

  return Object.fromEntries(searchParams.entries())
}

function setURLParams(url, params) {
  const urlObject = new URL(url)

  for (const key of Object.keys(params)) {
    urlObject.searchParams.set(key, params[key])
  }

  return url
}


const {html, css, js} = getURLParams(location.href)

const playGroundContainer = document.querySelector('main.play.container')

const editors = playGroundContainer.querySelectorAll(':scope > .editors > .editor-container')
const editorsContent = [...editors].map(editor => editor.querySelector(':scope .cm-content'))

editorsContent[0].innerText = html
editorsContent[1].innerText = css
editorsContent[2].innerText = js
