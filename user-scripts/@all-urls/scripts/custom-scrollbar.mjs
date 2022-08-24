const filterDomainsForCustomScrollbar = [
  'www.google.com',
  'www.google.es',
  'www.netflix.com',
  'link.clashroyale.com',
  'www.reddit.com',
  'stackoverflow.com',
  'github.com',
  'www.facebook.com',
  'www.instagram.com',
  'www.w3schools.com',
  'developer.mozilla.org',
  'beta.crunchyroll.com',
  'www.crunchyroll.com'
]


main()

async function main() {
  if (!filterDomainsForCustomScrollbar.includes(location.hostname)) return

  const {default: scrollbarStyleSheet} = await import(`../stylesheets/custom-scrollbar.css`, {assert: {type: 'css'}})

  document.adoptedStyleSheets = [...document.adoptedStyleSheets, scrollbarStyleSheet]
}
