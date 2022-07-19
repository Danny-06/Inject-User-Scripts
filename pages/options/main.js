import { fillDeclarativeTemplate } from './utils-module.js'
import { getAllElementsMapWithDataJSAttribute, getAllElementsMapWithId } from './utils-module.js'


// Always remove text selection when the user clicks on any part of the document
// This is to avoid those annoying times when you want to remove the selection but you can't
window.addEventListener('mousedown', event => {
  if (event.button === 0) window.getSelection().empty()
})


const {
  appContent
} = getAllElementsMapWithId()

const {
  addNewRuleBtn,
  createRuleMenuTemplate,
  overlayContent
} = getAllElementsMapWithDataJSAttribute()


addNewRuleBtn.addEventListener('click', event => {
  showCreateRuleMenu()
})



async function showRules() {
  const rules = await chrome.declarativeNetRequest.getDynamicRules()


}

async function showCreateRuleMenu() {
  const nextRuleId = await chrome.declarativeNetRequest.getDynamicRules()
                     .then(rules => rules.map(rule => rule.id))
                     .then(ids => ids.length ? Math.max(...ids) + 1 : 1)

  const createRuleMenu = fillDeclarativeTemplate(createRuleMenuTemplate, {
    DNR: chrome.declarativeNetRequest,
    nextRuleId
  }).firstElementChild

  overlayContent.classList.add('-active')
  overlayContent.append(createRuleMenu)

  const { createRuleBtn } = getAllElementsMapWithDataJSAttribute(createRuleMenu)

  overlayContent.addEventListener('click', event => {
    if (event.target !== overlayContent) return
    
    overlayContent.classList.remove('-active')
    overlayContent.innerHTML = ''
  })

  createRuleBtn.addEventListener('click', event => {
    overlayContent.classList.remove('-active')
    overlayContent.innerHTML = ''
  })

}


// const dynamicRules = {

//   remove_ContentSecurityPolicy__main_frame: {
//     id: 1,
//     action: {
//       type: 'modifyHeaders',
//       responseHeaders: [
//         {header: 'content-security-policy', operation: 'remove'}
//       ]
//     },
//     condition: {urlFilter: '*', resourceTypes: ['main_frame']}
//   }

// }


// const dynamicRequestRules = await chrome.declarativeNetRequest.getDynamicRules()
// const dynamicRequestRulesIds = dynamicRequestRules.map(rule => rule.id)

// Object.values(dynamicRules).forEach(rule => {

//   if (!dynamicRequestRulesIds.includes(rule.id)) return

//   if (rule.id === dynamicRules.remove_ContentSecurityPolicy__main_frame.id) {
//     buttonCSP.innerHTML = 'Remove Content-Security-Policy Rule'
//   }

// })


// buttonCSP?.addEventListener('click', async event => {
//   const rule = dynamicRules.remove_ContentSecurityPolicy__main_frame
//   const dynamicRequestRules = await chrome.declarativeNetRequest.getDynamicRules()

//   const hasRule = dynamicRequestRules.map(rule => rule.id).includes(rule.id)
//   if (hasRule) {
//     await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds: [rule.id]})
//     buttonCSP.innerHTML = 'Add Content-Security-Policy Rule'
//   } else {
//     await chrome.declarativeNetRequest.updateDynamicRules({addRules: [rule]})
//     buttonCSP.innerHTML = 'Remove Content-Security-Policy Rule'
//   }
// })
