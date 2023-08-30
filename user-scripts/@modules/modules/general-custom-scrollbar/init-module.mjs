import { getModuleURL, injectCode } from '../../module-utils.js'

const modulePath = getModuleURL(import.meta.url)

injectCode(modulePath, {
  stylesheets: [
    'custom-scrollbar.css'
  ],
  scripts: [
    'main.mjs'
  ]
})
