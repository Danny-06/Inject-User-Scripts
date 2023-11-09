window.addEventListener('youtube-load', event => {
  openUncroppedBannerWithClick()
})


function openUncroppedBannerWithClick() {
  window.addEventListener('click', event => {
    const banner = (() => {
      const target = event.target

      return target.matches('tp-yt-app-header-layout .ytd-c4-tabbed-header-renderer')
        ? target
        : null
    })()

    if (banner == null) {
      return
    }

    const bannerURL = (() => {
      let url = getComputedStyle(banner)
                  .getPropertyValue('--yt-channel-banner')
                  .slice(
                    'url('.length,
                    - ')'.length
                  )
                  .replaceAll('\\', '')

      url = url.slice(0, url.indexOf('-fcrop'))

      return url
    })()

    window.open(bannerURL)
  })
}
