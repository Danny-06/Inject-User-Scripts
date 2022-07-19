import {
  getAllElementsMapWithDataJSAttribute,
  requestBgUrlAndSave,
  getStorageData,
  setStorageData
} from './utils-module.js'

// Always remove text selection when the user clicks on any part of the document
// This is to avoid those annoying times when you want to remove the selection but you can't
window.addEventListener('mousedown', event => {
  if (event.button === 0) window.getSelection().empty()
})


const {
  bgContainer,
  bgImage,
  bgVideo,
  uploadBg
} = getAllElementsMapWithDataJSAttribute()




init()

async function init() {
  const storageData = await getStorageData()

  if (storageData == null) {
    setStorageData({})
  } else {
    const bgBlob = storageData.bgApp

    if (bgBlob != null) {
      setBgAppFromBlob(bgBlob)
    }
  }

  uploadBg.addEventListener('click', async event => {
    const bgBlob = await requestBgUrlAndSave()
    setBgAppFromBlob(bgBlob)
  })
}


function setBgAppFromBlob(bgBlob) {
  const type = bgBlob.type.split('/')[0]

  const tempUrl = URL.createObjectURL(bgBlob)

  switch (type) {
    case 'image': {
      bgContainer.classList.remove('-video')
      bgContainer.classList.add('-image')

      bgImage.src = tempUrl
    }
    break

    case 'video': {
      bgContainer.classList.remove('-image')
      bgContainer.classList.add('-video')

      bgVideo.src = tempUrl
    }
    break
    
    default:
  }
}
