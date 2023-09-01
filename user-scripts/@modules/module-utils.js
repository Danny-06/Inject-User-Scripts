import { getURL } from '../@libs/chrome-extension-utils.js'
import { createElement } from '../@libs/utils-injection.js'

const initModuleFile = '@init-module.mjs'

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
 * @returns {boolean}
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
    protocol: '*',
    domain:   [],
    port:     '*',
    paths:    []
  }

  const valueParts = {
    protocol: null,
    domain:   [],
    port:     null,
    paths:    []
  }

  const regExpProtocol = /^[a-zA-Z*-]+/
  const regExpDomain = /[a-zA-Z0-9*]+(\.[a-zA-Z0-9*]+)+/
  const regExpPort = /(:([0-9]{4}|\*))/
  const regExpPath = /((\/[a-zA-Z0-9*-]*)+)?$/
  const regExpURL = new RegExp(templateRegex`(${regExpProtocol}://)?${regExpDomain}${regExpPort}?${regExpPath}`)

  // Protocol

  {
    const protocol = match.match(new RegExp(templateRegex`${regExpProtocol}(?=://)`))?.[0] ?? '*'
    matchParts.protocol = protocol
  }

  {
    const protocol = value.match(regExpProtocol)?.[0] ?? null
    valueParts.protocol = protocol
  }


  // Domain


  {
    const domain = match.match(regExpDomain)?.[0] ?? null
    matchParts.domain = domain?.split('.') ?? null
  }

  {
    const domain = value.match(regExpDomain)?.[0] ?? null
    valueParts.domain = domain?.split('.') ?? null

    if (matchParts.domain != null && valueParts.domain != null && matchParts.domain.length === valueParts.domain.length + 1 && matchParts.domain[0] === '*') {
      matchParts.domain = matchParts.domain.slice(1)
    }
  }

  // Port

  {
    const port = match.match(regExpPort)?.[0] ?? ':*'
    matchParts.port = port.slice(1)
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
 * `modules` must be an array of the names of the modules.  
 *  You could also save modules in a subfolder if you need it.
 * @param {{matchExpressions: string | string[], modules: string[]}} options
 * @returns
 */
export function injectModulesWithDomainMatch(options) {
  let {matchExpressions, modules} = options

  modules = modules.map(moduleName => `@modules/modules/${moduleName}/${initModuleFile}`)

  injectCodeWithDomainMatch(matchExpressions, {scripts: modules})
}


/**
 *
 * @param {string|string[]} matchExpressions
 * @param {{stylesheets: string[], scripts: string[]}} options
 * @returns
 */
export function injectCodeWithDomainMatch(matchExpressions, options) {
  const url = location.href.replace(location.search, '')

  if (Array.isArray(matchExpressions)) {
    if (matchExpressions.length === 0) return
    if (matchExpressions.every(matchExpression => !matchesDomain(url, matchExpression))) return
  }
  else
  if (typeof matchExpressions === 'string') {
    if (!matchesDomain(url, matchExpressions)) return
  }
  else {
    throw new TypeError(`'matchExpressions' must be an array of strings or just a string`)
  }

  injectCode(null, options)
}

/**
 * Used to inject the scripts and stylesheets of a module inside a `@init-module.mjs` file
 * and also it's used internally by the `injectCodeWithDomainMatch()` function to inject the `@init-module.mjs` files
 * ```js
 * import { getModuleURL, injectCode } from '../../module-utils.js'
 *
 * const modulePath = getModuleURL(import.meta.url)
 *
 * injectCode(modulePath, {
 *  scripts: [
 *    'scripts/main.mjs'
 *  ],
 *  stylesheets: [
 *    'stylesheets/main.css'
 *  ]
 * })
 * ```
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
  return initModuleScriptPath.slice(0, -`/${initModuleFile}`.length).replace(getURL(''), '')
}
