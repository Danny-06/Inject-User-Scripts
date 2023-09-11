window.addEventListener('youtube-load', event => {
  openUncroppedBannerWithClick()
})


function openUncroppedBannerWithClick() {
  window.addEventListener('click', event => {
    const banner = (() => {
      const target = event.target

      return target.matches('tp-yt-app-header-layout .banner-visible-area')
        ? target
        : null
    })()

    if (banner == null) {
      return
    }

    const tabbedHeader = banner.closest('ytd-c4-tabbed-header-renderer')

    if (tabbedHeader == null) {
      console.error('Parent banner not found', location.pathname)
      return
    }

    const bannerURL = (() => {
      let url = tabbedHeader.style
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
