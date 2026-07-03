import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { runtime } from './config/runtime.js'
import css from './styles.css?inline'

// <folk-designer lang="en|uz|ru" model="/path/to.glb"></folk-designer>
// A self-contained, client-side custom element. React mounts inside a shadow
// root with isolated styles — drop the built file onto any page.
class FolkDesigner extends HTMLElement {
  static get observedAttributes() {
    return ['lang', 'model']
  }

  connectedCallback() {
    if (this._root) return
    const model = this.getAttribute('model')
    if (model) runtime.modelUrl = model

    const shadow = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = css
    shadow.appendChild(style)

    const host = document.createElement('div')
    host.className = 'folk-host'
    shadow.appendChild(host)

    this._root = createRoot(host)
    this._render()
  }

  attributeChangedCallback(name, _old, val) {
    if (name === 'model' && val) runtime.modelUrl = val
    if (this._root) this._render()
  }

  disconnectedCallback() {
    // Defer so we never unmount synchronously during React render (e.g. when the
    // element is moved in the DOM), which React 18 errors on.
    const root = this._root
    this._root = null
    queueMicrotask(() => root?.unmount())
  }

  _render() {
    this._root.render(<App lang={this.getAttribute('lang') || undefined} />)
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('folk-designer')) {
  customElements.define('folk-designer', FolkDesigner)
}

export default FolkDesigner
