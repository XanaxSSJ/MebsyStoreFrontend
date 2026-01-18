import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './contexts/CartContext'
import { SearchProvider } from './contexts/SearchContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SearchProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </SearchProvider>
  </StrictMode>,
)
