import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// This code mounts React inside the root HTML element.
createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>,
);
