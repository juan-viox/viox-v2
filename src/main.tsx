import { StrictMode } from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import { Router } from 'wouter'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App'

const root = document.getElementById('root')!

const tree = (
  <StrictMode>
    <HelmetProvider>
      <Router>
        <App />
      </Router>
    </HelmetProvider>
  </StrictMode>
)

// Hydrate only when SSG actually provided element content. The dev shell
// has just a placeholder comment node — that's not real content.
const hasSSGContent = root.firstElementChild !== null

if (hasSSGContent) {
  hydrateRoot(root, tree)
} else {
  // Dev mode (or unprerendered route): clear the placeholder comment, mount fresh.
  root.replaceChildren()
  createRoot(root).render(tree)
}
