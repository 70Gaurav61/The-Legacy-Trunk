import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import App from './App'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { FamilyProvider } from './contexts/FamilyContext'


const queryClient = new QueryClient()


createRoot(document.getElementById('root')).render(
<React.StrictMode>
<QueryClientProvider client={queryClient}>
<AuthProvider>
<FamilyProvider>
<BrowserRouter>
<App />
</BrowserRouter>
</FamilyProvider>
</AuthProvider>
</QueryClientProvider>
</React.StrictMode>
)