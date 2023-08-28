import { render } from '../preact.mjs'

export default function appendComponent(component, node) {
  const wrapper = document.createElement('div')

  render(component, wrapper)

  node.append(wrapper)

  return wrapper
}
