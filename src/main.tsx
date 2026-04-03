import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import LandingPage from './LandingPage.tsx';
import PaymentPage from './PaymentPage.tsx';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/payment/:plan" element={<PaymentPage />} />
        <Route path="/app/*" element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        } />
        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
