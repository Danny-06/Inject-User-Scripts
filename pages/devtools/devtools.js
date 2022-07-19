const cssText = await fetch('styles.css').then(response => response.text())


applyStyleSheet()

// setInterval(applyStyleSheet, 500)

function applyStyleSheet() {
  chrome.devtools.panels.applyStyleSheet(cssText)
}
