import { getModuleURL, injectCode } from '../../@module-utils.js'

const modulePath = getModuleURL(import.meta.url)

injectCode(modulePath, {
  stylesheets: [
    'styles/main.css'
  ],
  scripts: [
  'scripts/main.mjs',
  'scripts/fullscreen-editor.mjs',
  'scripts/fullscreen-result.mjs',
  'scripts/insert-code-from-url-params.mjs'
  ]
})
