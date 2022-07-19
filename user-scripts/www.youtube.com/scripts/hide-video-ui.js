
document.addEventListener("keyup", function(event) {

  if (event.target.matches('input, [contenteditable="true"]')) return

  if (event.key.toUpperCase() !== 'P') return

  const video = document.querySelector('video')

  if (video === null) return

	const barra_tiempo = document.querySelector('.ytp-chrome-bottom');
	const barra_titulo = document.querySelector('.ytp-chrome-top');

	const gradient_bottom = document.querySelector('.ytp-gradient-bottom');
	const gradient_top = document.querySelector('.ytp-gradient-top');

	const componentesInterfaz = [barra_tiempo, barra_titulo, gradient_bottom, gradient_top]

	if(!video.classList.contains('INTERFACE-HIDDEN')) {

    video.classList.add('INTERFACE-HIDDEN')

		componentesInterfaz.forEach(componente => {
		  componente.style.setProperty('display', 'none', 'important');
		})

	} else {

    video.classList.remove('INTERFACE-HIDDEN')

	  componentesInterfaz.forEach(componente => {
	    componente.style.setProperty('display', '');
	  })

	}

})
