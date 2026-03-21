import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import LandingPage from './LandingPage.tsx'
import PaymentPage from './PaymentPage.tsx'

const Root = () => {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const handleLaunch = () => {
    window.history.pushState({}, '', '/app');
    setPath('/app');
  };

  const openLanding = () => {
    window.history.pushState({}, '', '/');
    setPath('/');
  };

  if (path.startsWith('/payment/')) {
    const planPath = path.replace('/payment/', '');
    const plan = (planPath === 'free' || planPath === 'pro' || planPath === 'pro-plus') ? planPath : 'free';
    const query = new URLSearchParams(window.location.search);
    const billingParam = query.get('billing');
    const billing = billingParam === 'yearly' ? 'yearly' : 'monthly';
    return <PaymentPage plan={plan} billing={billing} onBack={openLanding} onLaunch={handleLaunch} />;
  }

  if (path === '/app') {
    return <App />;
  }

  return <LandingPage onLaunch={handleLaunch} />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
