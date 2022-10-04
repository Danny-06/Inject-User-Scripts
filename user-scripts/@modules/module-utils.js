import { getURL } from '../@libs/chrome-extension-utils.js'
import { createElement } from '../@libs/utils-injection.js'

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

  if (match === '*') return true

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
 * @param {string} value 
 * @param {string} match 
 * @returns 
 */
export function _matchesDomain(value, match) {
  if (typeof value !== 'string') {
    throw new TypeError(`'value' must be a string`)
  }

  if (typeof match !== 'string') {
    throw new TypeError(`'match' must be a string`)
  }

  const matchParts = {
    protocol: '*',
    prefix:   '',
    domain:   '',
    sufix:    '',
    port:     '',
    paths:    []
  }

  const valueParts = {...matchParts}

  // Protocol

  if (/^[a-zA-Z*]+:\/\//.test(match)) {
    const protocol = match.slice(0, match.indexOf(':'))

    matchParts.protocol = protocol
  }

  if (/^[a-zA-Z]+:\/\//.test(value)) {
    const protocol = value.slice(0, value.indexOf(':'))

    valueParts.protocol = protocol
  }


  // Prefix

  if (/^[a-zA-Z*]+:\/\/[a-zA-Z*]+\./.test(match)) {
    const prefix = match.slice(match.indexOf('://') + 3, match.indexOf('.'))

    matchParts.prefix = prefix
  }
  else
  if (/^[a-zA-Z*]+\.[a-zA-Z*]+\.[a-zA-Z*]+/.test(match)) {
    const prefix = match.slice(0, match.indexOf('.'))

    matchParts.prefix = prefix
  }

  if (/^[a-zA-Z]+:\/\/[a-zA-Z]+\./.test(value)) {
    const prefix = value.slice(value.indexOf('://') + 3, value.indexOf('.'))

    valueParts.prefix = prefix
  }
  else
  if (/^[a-zA-Z]+\.[a-zA-Z]+\.[a-zA-Z]+/.test(value)) {
    const prefix = value.slice(0, value.indexOf('.'))

    valueParts.prefix = prefix
  }


  // Domain

  if (/^[a-zA-Z*]+:\/\/[a-zA-Z*]+\.[a-zA-Z*]+\.[a-zA-Z*]+/.test(match)) {
    const domain = match.slice(match.indexOf('://') + 3, match.indexOf('.'))

    matchParts.domain = domain
  }

  console.log('valueParts', valueParts)
  console.log('matchParts', matchParts)


  for (const [key, matchValue] of Object.entries(matchParts)) {
    if (key === 'paths') {
      const allPathMatch = matchValue.every((matchPath, index) => {
        if (matchPath === '*') return true

        return matchPath === valueParts[key][index]
      })

      if (!allPathMatch) return false
    }
    else
    if (matchValue === '*') continue

    if (valueParts[key] !== matchValue) {
      return false
    }
  }

  return true
}

/**
 * 
 * @param {{matchExpressions: string | string[], modules: string[]}} options
 * @param {string|string[]} matchExpressions
 * @param {string[]} modules 
 * @returns
 */
export function injectModulesWithDomainMatch(options) {
  let {matchExpressions, modules} = options

  modules = modules.map(moduleName => `@modules/modules/${moduleName}/init-module.mjs`)

  injectCodeWithDomainMatch(matchExpressions, {scripts: modules})
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

  injectCode(null, options)
}

/**
 * @param {string} startPath
 * @param {{stylesheets: string[], scripts: string[]}} options 
 * @returns
 */
export function injectCode(startPath = null, options) {
  let {scripts: scriptsPath = [], stylesheets: stylesheetsPath = []} = options

  if (typeof startPath === 'string') {
    if (Array.isArray(scriptsPath)) {
      scriptsPath     = scriptsPath.map(scriptName => `${startPath}/${scriptName}`)
    }
    if (Array.isArray(stylesheetsPath)) {
      stylesheetsPath = stylesheetsPath.map(styleSheetName => `${startPath}/${styleSheetName}`)
    }
  }

  injectStyleSheets(stylesheetsPath)
  injectScripts(scriptsPath)
}

/**
 * 
 * @param {string[]} scriptsPath 
 * @returns
 */
export function injectScripts(scriptsPath) {
  if (!Array.isArray(scriptsPath)) {
    throw new TypeError(`'scriptsPath' must be an array of strings`)
  }

  scriptsPath.forEach(path => {
    const script = createElement('script', {
      dataset: {
        source: 'Chrome Extension - Domain Matches'
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
 export function injectStyleSheets(styleSheetsPath) {
  if (!Array.isArray(styleSheetsPath)) {
    throw new TypeError(`'scriptsPath' must be an array of strings`)
  }

  styleSheetsPath.forEach(path => {
    const styleSheet = createElement('link', {
      dataset: {
        source: 'Chrome Extension - Domain Matches',
      },
      properties: {
        rel: 'stylesheet',
        href: getURL(path)
      }
    })

    document.head.append(styleSheet)
  })

}

export function getModuleURL(initModuleScriptPath) {
  return initModuleScriptPath.slice(0, -'/init-module.mjs'.length).replace(getURL(''), '')
}
