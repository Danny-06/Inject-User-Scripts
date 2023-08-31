import { createPortal } from '../compat.mjs'
import { render } from '../preact.mjs'

/**
 * Render the component by appending it in the element specified
 * without overwritting the existing children.
 *
 * It returns the first generated node on render of the component provided.
 * @param {*} component
 * @param {Element} node
 * @returns {Element}
 */
export default function appendComponent(component, node) {
  const wrapper = document.createElement('div')

  render(createPortal(component, node), wrapper)

  // When `render` is used with `createPortal`
  // the element is already appended to the node
  return node.lastElementChild
}




// import { render } from '../preact.mjs'

// export default function appendComponent(component, node) {
//   const wrapper = document.createElement('div')

//   render(component, wrapper)

//   node.append(wrapper)

//   return wrapper
// }
