import React from 'react'
import App from './components/App'

import BootstrapLoader from 'bootstrap-loader'

import 'font-awesome/css/font-awesome.css'
import '../html/index.html'

// syntax highlighting
import { registerLanguage } from "react-syntax-highlighter/dist/light"
import js from 'highlight.js/lib/languages/javascript'
registerLanguage('javascript', js)

function initializeApplication(elementId) {
  React.render(<App />, document.getElementById(elementId));
}

module.exports = initializeApplication
