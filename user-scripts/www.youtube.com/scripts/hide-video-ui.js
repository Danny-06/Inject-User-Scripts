
document.addEventListener("keyup", function(event) {

  if (event.target.matches('input, [contenteditable="true"]')) return

  if (event.key.toUpperCase() !== 'P') return

  const video = document.querySelector('video')

  if (video === null) return

  const ytdWatch = document.querySelector('ytd-watch-flexy')

  const videoChromeBottom = ytdWatch.querySelector('.ytp-chrome-bottom');
  const videoChromeTop = ytdWatch.querySelector('.ytp-chrome-top');

  const gradientBottom = ytdWatch.querySelector('.ytp-gradient-bottom');
  const gradientTop = ytdWatch.querySelector('.ytp-gradient-top');

  const componentesInterfaz = [videoChromeBottom, videoChromeTop, gradientBottom, gradientTop]

  const isHidden = video.classList.toggle('INTERFACE-HIDDEN')

  componentesInterfaz.forEach(componente => {
    componente.style.setProperty('display', isHidden ? 'none' : '', 'important');
  })

})
