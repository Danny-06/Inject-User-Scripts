import { getURL } from '../@libs/chrome-extension-utils.js'
import { createElement } from '../@libs/utils-injection.js'


function regExpContentToString(regExp) {
  return regExp.toString().slice(1, -1)
}

function templateRegex(strings, ...args) {
  let regExpStringResult = ''

  for (let i = 0; i < strings.length; i++) {
    const string = strings[i]
    const regExpString = regExpContentToString(args[i] ?? '')

    regExpStringResult += `${string}${regExpString}`
  }

  return regExpStringResult
}


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

  if (match === '*') {
    return true
  }

  const matchParts = {
    protocol: null,
    domain:   [],
    port:     null,
    paths:    []
  }

  const valueParts = structuredClone(matchParts)

  const regExpProtocol = /^[a-zA-Z*-]+/
  const regExpDomain = /[a-zA-Z0-9*]+(\.[a-zA-Z0-9*]+)+/
  const regExpPort = /(:([0-9]{4}|\*))/
  const regExpPath = /((\/[a-zA-Z0-9*-]*)+)?$/
  const regExpURL = new RegExp(templateRegex`${regExpProtocol}://${regExpDomain}${regExpPort}?${regExpPath}`)

  // Protocol

  {
    const protocol = match.match(regExpProtocol)?.[0] ?? null
    matchParts.protocol = protocol
  }

  {
    const protocol = value.match(regExpProtocol)?.[0] ?? null
    valueParts.protocol = protocol
  }


  // Domain


  {
    const domain = match.match(regExpDomain)?.[0] ?? null
    matchParts.domain = domain.split('.')
  }

  {
    const domain = value.match(regExpDomain)?.[0] ?? null
    valueParts.domain = domain.split('.')

    if (matchParts.domain.length === valueParts.domain.length + 1 && matchParts.domain[0] === '*') {
      matchParts.domain = matchParts.domain.slice(1)
    }
  }

  // Port

  {
    const port = match.match(regExpPort)?.[0] ?? null
    matchParts.port = port !== '' && port != null ? port.slice(1) : null
  }

  {
    const port = value.match(regExpPort)?.[0] ?? null
    valueParts.port = port !== '' && port != null ? port.slice(1) : null
  }

  // Path

  {
    const paths = match.match(regExpPath)?.[0] ?? null
    matchParts.paths = paths !== '' && paths != null ? paths.split('/') : '*'
  }

  {
    const paths = value.match(regExpPath)?.[0] ?? null
    valueParts.paths = paths !== '' && paths != null ? paths.split('/') : '*'
  }

  const regExpDomainOnly = /^[a-zA-Z0-9*]+(\.[a-zA-Z0-9*]+)+$/

  if (regExpDomainOnly.test(match)) {
    const domainValue = [...valueParts.domain]
    let domainMatch = match.split('.')

    if (domainMatch.length === domainValue.length + 1 && domainMatch[0] === '*') {
      domainMatch = domainMatch.slice(1)
    }
    else
    if (domainMatch.length !== domainValue.length) {
      return false
    }

    for (let i = 0; i < domainMatch.length; i++) {
      if (domainMatch[i] !== domainValue[i]) {
        return false
      }
    }

    return true
  }

  if (!regExpURL.test(match)) {
    return false
  }

  for (const [key, matchValue] of Object.entries(matchParts)) {
    if (valueParts[key] == null && matchParts[key] == null) {
      continue
    }

    if (valueParts[key] != null && matchParts[key] == null) {
      return false
    }

    if (key !== 'paths' && key !== 'domain') {
      if (matchValue === '*') {
        continue
      }

      if (valueParts[key] !== matchValue) {
        return false
      }
    }
    else
    if (key === 'paths') {
      if (matchValue === '*') {
        continue
      }

      if (valueParts[key].length !== matchValue.length) {
        return false
      }

      const allPathsMatch = matchValue.every((matchPath, index) => {
        if (matchPath === '*') {
          return true
        }

        return matchPath === valueParts[key][index]
      })

      if (!allPathsMatch) {
        return false
      }
    }
    else
    if (key === 'domain') {
      if (matchValue === '*') {
        continue
      }

      if (valueParts[key].length !== matchValue.length) {
        return false
      }

      const allDomainMatch = matchValue.every((matchDomain, index) => {
        if (matchDomain === '*') {
          return true
        }

        return matchDomain === valueParts[key][index]
      })

      if (!allDomainMatch) {
        return false
      }
    }
  }

  return true
}

/**
 * `matchExpressions` can be a string like
 * ```js
 * 'www.example.com'
 * '*.example.com'
 * 'https://*.example.com'
 * '*://*.example.com'
 * '*://*.example.com/path/*'
 * ```
 *
 * `modules` must be an array of the names of the modules
 * @param {{matchExpressions: string | string[], modules: string[]}} options
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
    if (!matchesDomain(location.href.replace(location.search, ''), matchExpressions)) return
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
      namespace: 'http://www.w3.org/1999/xhtml',
      dataset: {
        source: 'Chrome Extension - Domain Matches'
      },
      properties: {
        type: path.endsWith('.mjs') ? 'module' : undefined,
        src: getURL(path)
      }
    })

    if (document.head) {
      document.head.append(script)
    } else {
      document.documentElement.append(script)
    }
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
      namespace: 'http://www.w3.org/1999/xhtml',
      dataset: {
        source: 'Chrome Extension - Domain Matches',
      },
      properties: {
        rel: 'stylesheet',
        href: getURL(path)
      }
    })

    if (document.head) {
      document.head.append(styleSheet)
    } else {
      document.documentElement.append(styleSheet)
    }
  })

}

/**
 *
 * @param {string} initModuleScriptPath
 * @returns
 */
export function getModuleURL(initModuleScriptPath) {
  return initModuleScriptPath.slice(0, -'/init-module.mjs'.length).replace(getURL(''), '')
}
