import { waitForSelector } from "../../@libs/utils-injection.js";



// Modify link of "create pen button" to link it to the template

if (location.pathname.split('/').length < 5) {
  waitForSelector('[class*="SidebarCreate_menu"] [class*="SidebarCreate_createButtonPen"]')
  .then(createPenBtn => createPenBtn.href = '/pen?template=jOZWQOG')
}


const editor_footer = document.querySelector('[class*="PenEditorFooterStatus_editorState"]')

const fs_button = `
<button class="button footer-button" style="line-height: 0.2; background: #07f; color: #fff">
  FULLSCREEN
</button>`;

const resutlFullscreenBtn = document.createElement('div');
resutlFullscreenBtn.innerHTML = fs_button;

if (editor_footer) {
  editor_footer.append(resutlFullscreenBtn)
} else {
  document.querySelector('.footer-right')?.prepend(resutlFullscreenBtn)
}




const result = document.querySelector('.result');

resutlFullscreenBtn.addEventListener('click', event => toggleFullscreen(result));



const selectorForEditorsFullscreen = '#box-html, #box-css, #box-js, .project-editor-editor'

window.addEventListener('mousedown', event => {
  if(!event.ctrlKey || event.button !== 1) return

  event.preventDefault()

  const path = event.composedPath()

  const elementFullscreen = path.filter(element => element.matches?.(selectorForEditorsFullscreen))[0]

  if (!elementFullscreen) return

  toggleFullscreen(elementFullscreen)
})


function toggleFullscreen(element) {
  if(!document.fullscreenElement) return element.requestFullscreen();
  document.exitFullscreen()
}
