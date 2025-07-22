/**
 * Main entry point for the ESAF Framework React application
 * @fileoverview Bootstraps the React application with Tauri integration
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Get the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Make sure you have a div with id="root" in your HTML.');
}

// Create React root and render the app
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Enable hot module replacement in development
if (import.meta.hot) {
  import.meta.hot.accept();
}
