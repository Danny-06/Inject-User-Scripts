window.addEventListener('youtube-navigate', event => {
  handleYTShorts()
})

function handleYTShorts() {
  window.addEventListener('click', event => {
    if (!location.pathname.includes('/shorts/')) {
      return
    }
    if (!event.ctrlKey) {
      return
    }

    const target = event.target.closest('ytd-reel-video-renderer')

    if (!target) {
      return
    }

    const videoId = target.data.command.reelWatchEndpoint.videoId

    window.open(`https://youtube.com/watch?v=${videoId}`)
  })
}
