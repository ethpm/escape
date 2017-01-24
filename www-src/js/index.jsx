import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'

import 'bootstrap-loader/extractStyles'
import 'font-awesome/css/font-awesome.css'
import 'bootstrap/dist/css/bootstrap.css'
import '../html/index.html'

// syntax highlighting
import { registerLanguage } from "react-syntax-highlighter/dist/light"
import js from 'highlight.js/lib/languages/javascript'
registerLanguage('javascript', js)

function initializeApplication(elementId) {
  ReactDOM.render(<App />, document.getElementById(elementId))
}

module.exports = initializeApplication
