import { createPortal } from '../compat.mjs'
import { render } from '../preact.mjs'

export default function appendComponent(component, node) {
  const wrapper = document.createElement('div')

  render(createPortal(component, node), wrapper)

  node.append(wrapper)

  setTimeout(() => wrapper.remove())

  return node
}




// import { render } from '../preact.mjs'

// export default function appendComponent(component, node) {
//   const wrapper = document.createElement('div')

//   render(component, wrapper)

//   node.append(wrapper)

//   return wrapper
// }
