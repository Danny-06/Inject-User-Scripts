export class StringImageConversion {

  // ASCII

  // Transformar texto en una imagen
  static stringToImageASCII(text) {
    const imageData = StringImageConversion.stringToImageDataASCII(text)

    const canvas = document.createElement('canvas')
    canvas.width = imageData.width
    canvas.height = imageData.height

    const ctx = canvas.getContext('2d')

    ctx.putImageData(imageData, 0, 0)

    const img = new Image()
    img.src = canvas.toDataURL()

    return img
  }



  // Transformar una imagen (procedente de la conversión de texto a imagen)
  // en texto
  static imageToStringASCII(img) {
    const canvas = document.createElement('canvas')
    canvas.width  = img.naturalWidth  ?? img.videoWidth  ?? img.width
    canvas.height = img.naturalHeight ?? img.videoHeight ?? img.height

    const ctx = canvas.getContext('2d')

    ctx.drawImage(img, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    return StringImageConversion.imageDataToStringASCII(imageData)
  }



  // Transforma un texto en el objeto 'ImageData'
  static stringToImageDataASCII(text = '') {

    const width = Math.ceil( Math.sqrt(text.length / 3) )
    const height = width

    const imageData = new ImageData(width, height)

    let i = 0

    for( let data in imageData.data ) {
      data = parseInt(data)

      const charCode = text[i]?.charCodeAt()

      if (!charCode) continue

      if( data === 0 || (data + 1) % 4 !== 0 ) {
        imageData.data[data] = charCode
        i++
      } else {
        imageData.data[data] = 255
      }
    }

    return imageData

  }


  // Transforma el objeto 'ImageData' (procedente de la conversión de texto a 'imageData')
  // en texto
  static imageDataToStringASCII(imageData) {

    let text = ''

    let nullByte = 0

    for(let data of imageData.data) {
      data = parseInt(data)

      // Si hay un byte nulo o se trata del dato de la opacidad del array,
      // saltar al siguiente byte
      if( data === nullByte || data === 255 ) continue
      text += String.fromCharCode(data)
    }

    return text

  }


  // UTF-8

  static stringToImageUTF8(text) {
    const imageData = StringImageConversion.stringToImageDataUTF8(text)

    const canvas = document.createElement('canvas')
    canvas.width = imageData.width
    canvas.height = imageData.height

    const ctx = canvas.getContext('2d')
    ctx.putImageData(imageData, 0, 0)

    const img = new Image()
    img.src = canvas.toDataURL()

    return img
  }


  static imageToStringUTF8(img) {
    const canvas = document.createElement('canvas')
    canvas.width  = img.naturalWidth  ?? img.videoWidth  ?? img.width
    canvas.height = img.naturalHeight ?? img.videoHeight ?? img.height

    const ctx = canvas.getContext('2d')

    ctx.drawImage(img, 0, 0)

    const text = StringImageConversion.imageDataToStringUTF8( ctx.getImageData(0, 0, canvas.width, canvas.height) )

    return text
  }



  static stringToImageDataUTF8(text = '') {

    const width = Math.ceil( Math.sqrt(text.length) )
    const height = Math.ceil( Math.sqrt(text.length) )

    const imageData = new ImageData(width, height)

    for(let d = 0, t = 0; d < imageData.data.length; d += 4, t++) {

      //if(!text[t]) return imageData
      if(!text[t]) continue

      const charCode = text[t].charCodeAt()

      imageData.data[d + 0] =          charCode %   256
      imageData.data[d + 1] = parseInt(charCode /   256) % 256
      imageData.data[d + 2] = parseInt(charCode / 65536)
      imageData.data[d + 3] = 255

    }

    return imageData

  }


  static imageDataToStringUTF8(imageData) {

    if(!imageData) return null

    let text = ''

    const nullCharacter = '\u0000'

    for(let d = 0, t = 0; d < imageData.data.length; d += 4, t++) {

      const charCode = String.fromCharCode(
          imageData.data[d + 0]
        + imageData.data[d + 1] *   256
        + imageData.data[d + 2] * 65536
      )

      if(charCode === nullCharacter) continue

      text += charCode

    }

    return text

  }

}
