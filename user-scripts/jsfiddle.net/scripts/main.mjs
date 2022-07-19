// Poner pantalla completa los editores con el click medio
window.addEventListener('mouseup', function(event) {
  if(event.button !== 1) return

  const panel = event.target.closest('.panel-h')

  if (document.fullscreenElement === panel) document.exitFullscreen()

  if(panel.closest('.panel-h')) panel.requestFullscreen()
})


window.addEventListener('mousedown', () => { if(event.button === 1) event.preventDefault()})


const navbarItems = document.querySelectorAll('.actionCont:first-child .actionItem')
const lastItem = navbarItems[navbarItems.length - 1]

const fullscreenButton = document.createElement('div')
fullscreenButton.id = 'fullscreeResult'
fullscreenButton.className = 'actionItem dropdown'
fullscreenButton.style.cursor = 'pointer'
fullscreenButton.style.background = '#1c2f46'

fullscreenButton.innerHTML =
`
<a class="aiButton dropdownTrigger" title="Fullscreen">
	<svg width="24" height="24" version="1.1" viewBox="5 6 26 22" width="100%" style="fill: #cacbcc;">
		<g class="ytp-fullscreen-button-corner-0">
			<use class="ytp-svg-shadow" xlink:href="#ytp-id-6"></use>
			<path class="ytp-svg-fill" d="m 10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z" id="ytp-id-6"></path>
		</g>
		<g class="ytp-fullscreen-button-corner-1">
			<use class="ytp-svg-shadow" xlink:href="#ytp-id-7"></use>
			<path class="ytp-svg-fill" d="m 20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z" id="ytp-id-7"></path>
		</g>
		<g class="ytp-fullscreen-button-corner-2">
			<use class="ytp-svg-shadow" xlink:href="#ytp-id-8"></use>
			<path class="ytp-svg-fill" d="m 24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z" id="ytp-id-8"></path>
		</g>
		<g class="ytp-fullscreen-button-corner-3">
			<use class="ytp-svg-shadow" xlink:href="#ytp-id-9"></use>
			<path class="ytp-svg-fill" d="M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z" id="ytp-id-9"></path>
		</g>
	</svg>
	Fullscreen
</a>
`

fullscreenButton.addEventListener('mouseup', function(event) {
	if(event.button !== 0) return
	document.querySelector('iframe[name="result"]').requestFullscreen()
})

lastItem.after(fullscreenButton)



function fullscreenThis(event) {
	if(event.button !== 1) return

	if(!document.fullscreen) return this.requestFullscreen()
	return document.exitFullscreen()
}
