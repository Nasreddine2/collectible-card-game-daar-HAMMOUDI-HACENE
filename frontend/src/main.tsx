import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min'
// import './styles.module.css'
// roboto
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

const node = document.getElementById('root') as HTMLElement
node.style.backgroundColor = '#bbb'

const root = ReactDOM.createRoot(node)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)