// Ponto de entrada da aplicação: monta o componente App dentro da div #root do index.html
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// StrictMode ativa verificações extras do React em desenvolvimento (não muda nada no build final)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
