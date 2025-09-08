import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from './lib/SessionContext';
import { inject } from '@vercel/analytics';

const queryClient = new QueryClient();

// Safely inject Vercel analytics with error handling
// This prevents the app from crashing when analytics scripts are blocked
const initializeAnalytics = () => {
  try {
    // Check if we're in a browser environment and analytics is available
    if (typeof window !== 'undefined' && typeof inject === 'function') {
      inject();
    }
  } catch (error) {
    // Silently fail if analytics can't be loaded (e.g., due to script blocking)
    console.warn('Vercel analytics could not be loaded:', error);
  }
};

// Initialize analytics asynchronously to not block app loading
setTimeout(initializeAnalytics, 0);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <App />
        </SessionProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
