export function drawMediaInCanvas(media, options = {}) {
  const {width, height} = options

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width  = width  ?? media.videoWidth  ?? media.naturalWidth  ?? media.width
  canvas.height = height ?? media.videoHeight ?? media.naturalHeight ?? media.height

  ctx.drawImage(media, 0, 0, canvas.width, canvas.height)

  return canvas
}

export function getMediaAsDataURL(media, options = {}) {
  const {type, quality} = options

  const canvas = drawMediaInCanvas(media, options)

  return canvas.toDataURL(type, quality)
}

export function getMediaAsBlob(media, options) {
  const canvas = drawMediaInCanvas(media, options)

  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(blob => resolve(blob))
    } catch (error) {
      reject(error)
    }
  })
}

export function getMediaAsImageData(media, options) {
  const canvas = drawMediaInCanvas(media, options)
  const ctx = canvas.getContext('2d')

  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

export function getImageFromCanvas(canvas, options = {}) {
  const {type, quality} = options

  const image = new Image()

  const dataURL = canvas.toDataURL(type, quality)

  image.src = dataURL

  return image
}
