import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/public-sans/400.css'
import '@fontsource/public-sans/500.css'
import '@fontsource/public-sans/600.css'
import '@fontsource/public-sans/700.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ReloadPrompt } from "./Prompt";
import { GoogleOAuthProvider } from '@react-oauth/google';
// import 'jsvectormap/dist/css/jsvectormap.css';

const queryClient = new QueryClient()
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-id'}>
        <Toaster/>
        <ReloadPrompt />
        <App />
      </GoogleOAuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
