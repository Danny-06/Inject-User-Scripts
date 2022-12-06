export function getCanvasFromMedia(media, options = {}) {
  const {width, height} = options

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width  = width  ?? media.videoWidth  ?? media.naturalWidth  ?? media.width
  canvas.height = height ?? media.videoHeight ?? media.naturalHeight ?? media.height

  ctx.drawImage(media, 0, 0, canvas.width, canvas.height)

  return canvas
}

export function getDataURLFromMedia(media, options = {}, canvasOptions = {}) {
  const {type, quality} = canvasOptions

  const canvas = getCanvasFromMedia(media, options)

  return canvas.toDataURL(type, quality)
}

export async function getBlobFromMedia(media, options = {}, canvasOptions = {}) {
  const canvas = getCanvasFromMedia(media, options)

  const blob = await getBlobFromCanvas(canvas, canvasOptions)

  return blob
}

export function getBlobFromCanvas(canvas, canvasOptions = {}) {
  const {type, quality} = canvasOptions

  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(blob => resolve(blob), type, quality)
    } catch (error) {
      reject(error)
    }
  })
}


export function getImageDataFromMedia(media, options) {
  const canvas = getCanvasFromMedia(media, options)
  const ctx = canvas.getContext('2d')

  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

export async function getImageFromCanvas(canvas, options = {}) {
  const {type, quality} = options

  const img = new Image()

  const dataURL = canvas.toDataURL(type, quality)

  img.src = dataURL

  await img.decode()

  return img
}

export async function getImageFromMedia(media) {
  const blob = await getBlobFromMedia(media)

  const img = new Image()
  img.src = URL.createObjectURL(blob)

  await img.decode()

  return img
}
