import { getURL } from '../../@libs/chrome-extension-utils.js'
import { createElement } from '../../@libs/utils-injection.js'

/**
 * 
 * @param {string} value 
 * @param {string} match 
 * @returns 
 */
 export function matchesDomain(value, match) {
  if (typeof value !== 'string') {
    throw new TypeError(`'value' must be a string`)
  }

  if (typeof match !== 'string') {
    throw new TypeError(`'match' must be a string`)
  }

  let valueMatches = true

  const valueParts = value.split('.')
  const matchParts = match.split('.')

  if (valueParts.length === 2) {
    valueParts.unshift('')
  }

  if (matchParts.length === 2) {
    matchParts.unshift('')
  }

  const [prefixP, domainP, sufixP] = valueParts
  const [prefixM, domainM, sufixM] = matchParts

  if (prefixM !== '*' && prefixP !== prefixM) {
    valueMatches = false
  }

  if (domainP !== domainM) {
    valueMatches = false
  }

  if (sufixM !== '*' && sufixP !== sufixM) {
    valueMatches = false
  }

  return valueMatches
}

/**
 * 
 * @param {string|string[]} matchExpressions
 * @param {{stylesheets: string[], scripts: string[]}} options 
 * @returns
 */
export function injectCodeWithDomainMatch(matchExpressions, options) {
  if (Array.isArray(matchExpressions)) {
    if (matchExpressions.length === 0) return
    if (matchExpressions.every(matchExpression => !matchesDomain(location.hostname, matchExpression))) return
  }
  else
  if (typeof matchExpressions === 'string') {
    if (!matchesDomain(location.hostname, matchExpressions)) return
  }
  else {
    throw new TypeError(`'matchExpressions' must be an array of strings or just a string`)
  }

  const {scripts: scriptsPath = [], stylesheets: stylesheetsPath = []} = options

  injectStyleSheets(stylesheetsPath, matchExpressions)
  injectScripts(scriptsPath, matchExpressions)
}

/**
 * 
 * @param {string[]} scriptsPath 
 * @returns
 */
export function injectScripts(scriptsPath, data) {
  if (!Array.isArray(scriptsPath)) {
    throw new TypeError(`'scriptsPath' must be an array of strings`)
  }

  scriptsPath.forEach(path => {
    const script = createElement('script', {
      dataset: {
        source: 'Chrome Extension - Domain Matches',
        matches: data.join?.(' | ') ?? data
      },
      properties: {
        type: path.endsWith('.mjs') ? 'module' : undefined,
        src: getURL(path)
      }
    })

    document.head.append(script)
  })

}

/**
 * 
 * @param {string[]} scriptsPath 
 * @returns
 */
 export function injectStyleSheets(styleSheetsPath, data) {
  if (!Array.isArray(styleSheetsPath)) {
    throw new TypeError(`'scriptsPath' must be an array of strings`)
  }

  styleSheetsPath.forEach(path => {
    const styleSheet = createElement('link', {
      dataset: {
        source: 'Chrome Extension - Domain Matches',
        matches: data.join?.(' | ') ?? data
      },
      properties: {
        rel: 'stylesheet',
        href: getURL(path)
      }
    })

    document.head.append(styleSheet)
  })

}
