
document.addEventListener("keyup", function(event) {

  if (event.target.matches('input, [contenteditable="true"]')) return

  if (event.key.toUpperCase() !== 'P') return

  const ytdPlayer = document.querySelector('ytd-watch-flexy ytd-player')

  if (ytdPlayer === null) return

  const ytdWatch = document.querySelector('ytd-watch-flexy')

  const selector = `
  .ytp-chrome-bottom,
  .ytp-chrome-top,
  .ytp-gradient-bottom,
  .ytp-gradient-top,
  .html5-endscreen
  `

  const componentesInterfaz = ytdWatch.querySelectorAll(selector)

  const isHidden = ytdPlayer.classList.toggle('INTERFACE-HIDDEN')

  componentesInterfaz.forEach(componente => {
    componente.style.setProperty('display', isHidden ? 'none' : '', 'important');
  })

})
