
/**
 * @template T
 * @param {T extends keyof HTMLElementTagNameMap ? T : string} tagName 
 * @returns {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLElement}
 */
export function createElement(tagName) {
  /**
   * @type {any}
   */
  const element = document.createElement(tagName)

  return element
}

/**
 * @template {string} T
 * @template {string | 'http://www.w3.org/2000/svg'} R
 * @param {T extends keyof SVGElementTagNameMap ? T : string} tagName 
 * @param {R} namespace
 * @returns {namespace extends 'http://www.w3.org/2000/svg' ? T extends keyof SVGElementTagNameMap ? SVGElementTagNameMap[T] : SVGElement : Element}
 */
export function createElementNS(tagName, namespace) {
  /**
   * @type {any}
   */
  const element = document.createElementNS(namespace, tagName)

  return element
}

/**
 * 
 * @param {HTMLElement} element 
 * @param {string | string[]} classes 
 */
export function setClasses(element, classes) {
  if (Array.isArray(classes)) {
    element.className = classes.join(' ')
  } else if (typeof classes === 'string') {
    element.className = classes
  }
}

/**
 * 
 * @param {HTMLElement} element 
 * @param {import("./core.js").Children} children 
 */
export function setChildren(element, children) {
  // @ts-ignore
  element.append(...children.flat(Infinity))
}


/**
 * 
 * @param {string} string 
 * @returns {string}
 */
const lowerCaseToHyphen = string => string.split(/(?=[A-Z])/).map(str => str.toLowerCase()).join('-')

/**
 *
 * @param {CSSStyleDeclaration} style
 * @param {{[key: string]: string}} properties
 */
export function setStyleProperties(style, properties) {
  for (const property in properties) {

    let propertyName = property

    const isCustomProperty = propertyName.startsWith('--')
    const hasHyphen = propertyName.includes('-')
    if(!isCustomProperty && !hasHyphen) {
      propertyName = lowerCaseToHyphen(propertyName)
    }

    const prefixVendors = propertyName.search(/^(webkit|moz|ms|o)-/) !== -1
    if(prefixVendors) {
      propertyName = `-${propertyName}`
    }

    const priority = properties[property].match(/![a-z]+$/ig)?.[0].slice(1) ?? ''
    const propertyValue = priority ? properties[property].replace(new RegExp(`!${priority}$`, 'i'), '') : properties[property]

    style.setProperty(propertyName, propertyValue, priority)

  }
}



export function $map(length, callback) {
  const collection = new Array(length)

  for (let i = 0; i < length; i++) {
    collection[i] = callback(i)
  }

  return collection
}
