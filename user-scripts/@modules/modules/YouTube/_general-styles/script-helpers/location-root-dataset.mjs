window.addEventListener('youtube-navigate', event => {
  setLocationAttribute()
})

function setLocationAttribute() {
  setTimeout(() => {
    document.documentElement.dataset.pathname = location.pathname
  }, 500)
}
