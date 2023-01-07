
document.addEventListener("keyup", function(event) {

  if (event.target.matches('input, [contenteditable="true"]')) return

  if (event.key.toUpperCase() !== 'P') return

  const ytdPlayer = document.querySelector('ytd-watch-flexy ytd-player')

  if (ytdPlayer === null) return

  const ytdWatch = document.querySelector('ytd-watch-flexy')

  ytdPlayer.classList.toggle('INTERFACE-HIDDEN')

})
