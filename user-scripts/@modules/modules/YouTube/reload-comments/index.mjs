document.addEventListener('keydown', refreshComments)

function refreshComments(event) {
  const constrains = [
    event.ctrlKey,
    event.key.toUpperCase() === 'Q'
  ]

  if (constrains.includes(false)) return

  // Selecciona la opción del menu desplegable que esté elegida ("Mejores comentarios", "Más recientes primero")
  const orderButtonSelected = document.querySelector('tp-yt-paper-listbox#menu .iron-selected')
  orderButtonSelected.click();
}
