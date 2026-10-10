import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { background: '#1f2937', color: '#fff', borderRadius: '10px' },
              success: { style: { background: '#065f46', color: '#fff' } },
              error: { style: { background: '#7f1d1d', color: '#fff' } },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
