import { injectModulesWithDomainMatch } from './module-utils.js'


injectModulesWithDomainMatch({
  matchExpressions: '*',
  modules: [
    '_injection-utils',
    'handle-resources-view',
    'handle-shortener-url-add-services',
    'google-translate'
  ]
})


injectModulesWithDomainMatch({
  matchExpressions: '*.twitter.com',
  modules: [
    'twitter-and-mobile'
  ]
})


injectModulesWithDomainMatch({
  matchExpressions: [
    '*.google.*', 'netflix.com', 'clashroyale.com', '*.reddit.com',
    'stackoverflow.com', 'github.com', '*.facebook.com', '*.instagram.com', '*.w3schools.com',
    'developer.mozilla.org', '*.crunchyroll.com'
  ],
  modules: [
    'general-custom-scrollbar'
  ]
})


injectModulesWithDomainMatch({
  matchExpressions: 'developer.mozilla.org/*/play',
  modules: [
    'mdn-playground'
  ]
})
