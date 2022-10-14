// Save Module in the window object
import('../../../@libs/utils-injection.js').then(module => {
  window._customModule = module
})


// // Always remove text selection when the user clicks on any part of the document
// // This is to avoid those annoying times when you want to remove the selection but you can't
// window.addEventListener('mousedown', event => {
//   if (event.button === 0) window.getSelection().empty()
// })


Object.defineProperties(String.prototype, {

  trimIndent: {
    configurable: true,
    value: function() {
      // Get indent
      const splitNewLine = this.split('\n')
      const minIndent = splitNewLine[splitNewLine.length - 1]
  
      // Remove indent
      let newString = this.replaceAll('\n' + minIndent, '\n')
      // Remove start and end new lines
      newString = newString.slice(1, -1)
  
      return newString
    }
  }

})

// Object.defineProperties(Object.prototype, {

//   also: {
//     value: function(callback) {
//       callback(this)
//       return this
//     }
//   },

//   let: {
//     value: function(callback) {
//       return callback(this)
//     }
//   }

// })

// Object.defineProperty(Function.prototype, 'try', {
//   value() {
//     let result = null
//     let error = null

//     try {
//       result = this(...arguments)
//     } catch (err) {
//       error = err
//     }

//     if (result instanceof Promise) {
//       return result.then(
//         value  => [value, null],
//         reason => [null, reason]
//       )
//     }

//     return [result, error]
//   }
// })







// Añadir al conjunto de funciones de la consola, una función para
// mostrar imágenes en consola
console.image = (url, width = 100, height = 100, bgColor = 'transparent') => {

  console.log(`%c  `,
  `
  background-image: url(${url});
  background-color: ${bgColor};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  padding: ${(height - 14) / 2}px ${(width - 13.2) / 2}px;
  `);

}



console.string = function(object) {
  if(typeof object === 'string') return console.log(`%c${object}`, 'color: rgb(242 139 84)')
  console.log(object)
}

console.number = function(object) {
  if(typeof object === 'string') return console.log(`%c${object}`, 'color: rgb(153 128 255)')
  console.log(object)
}




// Utilizar la capacidad de imprimir elementos html en la consola para imprimir código
console.html = function(htmlCode, type = 'text/html') {
  const dp = new DOMParser()
  const doc = dp.parseFromString(htmlCode, type)

  console.log(doc)
}


console.css = function(cssCode) {
  const snippetContainer = document.createElement('style')
  snippetContainer.className = 'code-logged'

  snippetContainer.innerHTML =
`/* Start of CSS code logged to the console */

${cssCode}

/* End of CSS code logged to the console */`

  console.log(snippetContainer)
}


console.js = function(jsCode) {
  const snippetContainer = document.createElement('script')
  snippetContainer.className = 'code-logged'

  snippetContainer.innerHTML =
`/* Start of JS code logged to the console */

${jsCode}

/* End of JS code logged to the console */`

  console.log(snippetContainer)
}
