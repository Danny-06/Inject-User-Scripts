import { useRef } from '../hooks.mjs';
import html from '../htm/html.mjs';
import { Fragment, render } from '../preact.mjs';
import useEffectOnce from '../util-hooks/use-effect-once.js';

export default function DivShadow(props) {
  const { stylesheets = [], ...attributes } = props

  const rootRef = useRef(null)

  useEffectOnce(() => {
    const root = rootRef.current
  
    root.attachShadow({mode: 'open'})
    root.shadowRoot.adoptedStyleSheets = [...stylesheets]

    render(html`<${Fragment}>${props.children}</>`, root.shadowRoot)
  })

  if (rootRef?.current?.shadowRoot) {
    render(html`<${Fragment}>${props.children}</>`, rootRef.current.shadowRoot)
  }

  return html`
    <div ...${attributes} ref=${rootRef}>${null}</div>
  `
}
