import { injectCodeWithDomainMatch } from './all-urls-utils.js';



injectCodeWithDomainMatch(
  [
    '*.google.*', 'netflix.com', 'clashroyale.com', 'reddit.com',
    'stackoverflow.com', 'github.com', 'facebook.com', '*.instagram.com', 'w3schools.com',
    'developer.mozilla.org', 'crunchyroll.com'
  ],

  {
  stylesheets: [
    '@all-urls/stylesheets/custom-scrollbar.css'
  ]
})
