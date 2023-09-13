import { injectModulesWithDomainMatch } from './@module-utils.js'

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
    'developer.mozilla.org', '*.crunchyroll.com', '*.kotlinlang.org', 'developer.android.com',
    'www.chess.com', 'web.dev'
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


injectModulesWithDomainMatch({
  matchExpressions: 'youtube.com',
  modules: [
    'YouTube'
  ]
})
