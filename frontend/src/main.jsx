import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import axios from "axios";
axios.defaults.withCredentials = true;


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    
      <App />
    
  </React.StrictMode>
)