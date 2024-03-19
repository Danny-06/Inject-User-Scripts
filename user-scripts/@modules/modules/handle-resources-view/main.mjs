const doc = document.implementation.createHTMLDocument()

;(function() {
  const contentType = document.contentType

  if (contentType === 'image/svg+xml')  return changeBgSVG(customScrollbar)
  if (contentType.startsWith('image/')) {
    removeBgImage(customScrollbar)
    changeBgImage()
    return
  }
})()


async function customScrollbar() {
  const {default: scrollbarStyleSheet} = await import(`./custom-scrollbar.css`, {assert: {type: 'css'}})
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, scrollbarStyleSheet]
}

function decimalToHex(r, g, b, a) {
  let rgba = [r, g, b, a]

  rgba = rgba.map(c => c.toString(16))
  // Añadir 0 a la izquierda si solo hay un carácter
  rgba = rgba.map(c => c.length === 1 ? `0${c}` : c);

  [r, g, b, a] = rgba


  // Si los dígitos están duplicados usar la forma simplificada
  if(
    r[0] === r[1] &&
    g[0] === g[1] &&
    b[0] === b[1] &&
    a[0] === a[1]
  ) {
    rgba = rgba.map(c => c[0])
  }

  return rgba
}


function setMetaColorScheme(callback) {
  callback?.()

  const colorScheme = document.createElement('meta')
  colorScheme.name = 'color-scheme'
  colorScheme.content = 'light dark'

  document.head.append(colorScheme)
}

function removeBgImage(callback) {
  callback?.()

  const css = // css
  `
  img {
    background: none !important;
  }
  `

  const style = document.createElement('style')
  style.innerHTML = css

  document.head.append(style)
}


function changeBgImage(callback) {
  callback?.()

  const inputColor = doc.createElement('input')
  inputColor.type = 'color'

  const color = document.body.style.backgroundColor === '' ? [0, 0, 0] : document.body.style.backgroundColor.replace('rgb(', '').replace(')', '').split(', ').map(n => parseInt(n))

  inputColor.value = `#${decimalToHex(...color, 255).join('').slice(0, -2)}`
  inputColor.style.position = 'fixed'
  inputColor.style.opacity = '0'
  inputColor.style.border = 'none'
  inputColor.style.pointerEvents = 'none'

  document.body.append(inputColor)

  window.addEventListener('mousedown', event => {
    if (event.button !== 1) return

    inputColor.style.left = `${event.clientX}px`
    inputColor.style.top  = `${event.clientY - 20}px`

    document.body.style.pointerEvents = 'none'

    setTimeout(() => inputColor.showPicker())
  })

  window.addEventListener('mouseup', event => {
    if (event.button !== 0) return
    document.body.style.pointerEvents = 'auto'
  })

  inputColor.addEventListener('change', event => {
    document.body.style.backgroundColor = inputColor.value
  })
}


function changeBgSVG(callback) {
  callback?.()

  /**
   * @type {SVGSVGElement}
   */
  const svg = document.documentElement

  const inputColor = doc.createElement('input')
  inputColor.type = 'color'
  inputColor.value = '#ffffff'
  inputColor.style.position = 'fixed'

  const foreignObject = doc.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
  svg.append(foreignObject)

  foreignObject.setAttribute('width', window.innerWidth)
  foreignObject.setAttribute('height', 0)

  foreignObject.append(inputColor)

  window.addEventListener('mousedown', event => {
    if (event.button !== 1) return

    const left = event.clientX      - foreignObject.getBoundingClientRect().x
    const top  = event.clientY - 20 - foreignObject.getBoundingClientRect().y
    
    inputColor.style.left = `${left * svg.viewBox.baseVal.height / svg.height.baseVal.value}px`
    inputColor.style.top  = `${top  * svg.viewBox.baseVal.height / svg.height.baseVal.value}px`

    svg.style.pointerEvents = 'none'

    setTimeout(() => inputColor.showPicker())
  })

  window.addEventListener('mouseup', event => {
    if (event.button !== 0) return
    svg.style.pointerEvents = 'auto'
  })

  inputColor.addEventListener('change', event => {
    svg.style.backgroundColor = inputColor.value
  })
}
