import { waitForSelector } from "../../@libs/utils-injection.js"


switch (location.hostname) {

  case 'ouo.io':
    ouoAutoClickButton()
  break

  case 'ouo.press':
    ouoAutoClickButton()
  break

  case 'exey.io':
    exeyHideAdds()
  break

  case 'shrinke.me':
    shrinkemeHideAds()
  break

  case 'iir.ai':
    iiraiHideAdds()
  break

  case 'nbyts.online':
    nbytsonlineHideAds()
  break

  case 'stfly.me':
    stflymeHideBanner()
  break

  case 'go.techgeek.digital':
    gotechgeekdigitalHideAds()
  break

  default:

}


function appendCSS(css) {
  const style = document.createElement('style')
  style.dataset.source = 'Chrome Extension'
  style.innerHTML = css

  document.body.append(style)
}

async function ouoAutoClickButton() {
  const imAHumanButton = await waitForSelector('#form-captcha #btn-main, #form-go #btn-main', {useSetTimeout: true})
  imAHumanButton.click()

  const getLinkButton = await waitForSelector('#form-go #btn-main', {useSetTimeout: true})
  getLinkButton.click()
}

function exeyHideAdds() {
  const css = // css
  `
  .adsbygoogle,
  :root div[style*="z-index: 2147483647 !important"],
  :root iframe[style*="z-index: 2147483647 !important"] {
    display: none !important;
    pointer-events: none !important;
    transform: scale(0) !important;
  }
  `

  appendCSS(css)
}


function iiraiHideAdds() {
  const css = // css
  `
  .banner-captcha,
  #link-view > center,
  iframe[style*="z-index: 2147483647 !important"],

  .banner-728x90,
  [id*="sas"],
  .adtrue-div {
    display: none !important;
    transform: scale(0) !important;
    pointer-events: none !important;
  }
  `

  appendCSS(css)
}

function nbytsonlineHideAds() {
  const css = // css
  `
  #content center,
  [id*="google_ads_iframe"],
  [id*="gpt_unit"] {
    display: none !important;
    transform: scale(0);
  }
  `

  appendCSS(css)
}

function stflymeHideBanner() {
  const css = // css
  `
  .banner {
    display: none !important;
  }
  `

  appendCSS(css)
}

function shrinkemeHideAds() {
  // Avoid calls to 'window.open' when clicking on the website
  window.onbeforeunload = () => true
  Object.defineProperty(window, 'onbeforeunload', {value: null})

  const css = // css
  `
  html > iframe,
  #vi-smartbanner,
  #cookie-pop,
  .expop,
  #orquidea-slideup
  [style*="z-index: 2147483647"] {
    display: none !important;
  }
  `

  appendCSS(css)
}

function gotechgeekdigitalHideAds() {
  const css = // css
  `
  :root > iframe,
  :root > div,
  center > :not(center, #captcha, #invisibleCaptchaShortlink, .get-link, #countdown, #timer),
  font,
  .espaciodos,
  [style*="z-index: 2147483647"],
  [style*="pointer-events: none"] {
    display: none !important;
    visibility: hidden !important;
    width: 0 !important;
    height: 0 !important;
    transform: scale(0) !important;
  }
  `


  appendCSS(css)
}
