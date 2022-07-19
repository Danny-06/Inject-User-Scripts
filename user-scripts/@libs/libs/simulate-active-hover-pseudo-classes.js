let hoverElement
let activeElement


// Hover Pseudo-Class

window.addEventListener('mouseover', event => {
  hoverElement = event.target.closest(':not([data-ignore-and-bubble-pseudo-class])')

  addPseudoClassData(hoverElement, 'hover')
})

window.addEventListener('mouseout', event => {
  removePseudoClassData(hoverElement, 'hover')

  hoverElement = null
})


// Active Pseudo-Class

window.addEventListener('mousedown', event => {
  activeElement = event.target.closest(':not([data-ignore-and-bubble-pseudo-class])')

  addPseudoClassData(activeElement, 'active')
})

window.addEventListener('mouseup', event => {
  removePseudoClassData(activeElement, 'active')

  activeElement = null
})






function addPseudoClassData(element, pseudoClass) {
  const token = pseudoClass
  const dataset = element.dataset
  const property = 'pseudoClass'

  addTokenToDOMStringMapProperty({token, dataset, property})
}

function removePseudoClassData(element, pseudoClass) {
  const token = pseudoClass
  const dataset = element.dataset
  const property = 'pseudoClass'

  removeTokenFromDOMStringMapProperty({token, dataset, property})

  if (dataset[property] === '') {
    delete dataset[property]
  }
}


function getTokensFromString(string) {
  if (string == null) return []
  return [...new Set(string.split(' '))].filter(t => t !== '')
}

function addTokenToDOMStringMapProperty(settings) {
  const {token, dataset, property} = settings

  const tokens = getTokensFromString(dataset[property])
  if (!tokens.includes(token)) tokens.push(token)

  return dataset[property] = tokens.join(' ')
}

function removeTokenFromDOMStringMapProperty(settings) {
  const {token, dataset, property} = settings

  if (dataset[property] == null) return ''

  const tokens = getTokensFromString(dataset[property]).filter(t => t !== token)

  return dataset[property] = tokens.join(' ')
}
