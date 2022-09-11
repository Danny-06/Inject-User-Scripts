let rememberScrollPosition

window.addEventListener('click', event => {
  rememberScrollPosition = document.documentElement.scrollTop

  setTimeout(() => {
    document.documentElement.scrollTop = rememberScrollPosition
  }, 100)
})
