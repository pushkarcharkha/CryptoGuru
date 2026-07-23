import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle2, LoaderCircle, ShieldCheck } from 'lucide-react';
import { supabase, getUserSafe } from './lib/supabase';

import { useParams, useNavigate, useLocation } from 'react-router-dom';

type PlanKey = 'free' | 'pro' | 'pro-plus';
type Billing = 'monthly' | 'yearly';

const planDetails: Record<PlanKey, { title: string; monthly: number; yearly: number; perks: string[] }> = {
    free: {
        title: 'FREE',
        monthly: 0,
        yearly: 0,
        perks: ['5 AI prompts/day', 'Basic portfolio', 'Watchlist', 'Paper trading'],
    },
    pro: {
        title: 'PRO',
        monthly: 999,
        yearly: 799,
        perks: ['Unlimited AI', 'Whale alerts', 'Personalized brief', 'Full sentiment', 'Signal feed access'],
    },
    'pro-plus': {
        title: 'PRO+',
        monthly: 1999,
        yearly: 1599,
        perks: ['Everything in Pro', 'Advanced charts', 'Voice brief', 'Priority compute', 'Backtesting'],
    },
};

export default function PaymentPage() {
    const { plan: planParam } = useParams<{ plan: string }>();
    const plan = (planParam === 'free' || planParam === 'pro' || planParam === 'pro-plus') ? (planParam as PlanKey) : 'free';
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const billing: Billing = query.get('billing') === 'yearly' ? 'yearly' : 'monthly';
    const navigate = useNavigate();

    const data = planDetails[plan];
    const amount = billing === 'yearly' ? data.yearly : data.monthly;
    const [loadingGateway, setLoadingGateway] = useState<boolean>(false);
    const [message, setMessage] = useState('');
    const paymentRequired = amount > 0;

    const title = useMemo(() => `${data.title} (${billing})`, [billing, data.title]);

    const onBack = () => navigate('/');
    const onLaunch = () => navigate('/app');

    const loadRazorpay = () =>
        new Promise<boolean>((resolve) => {
            if ((window as any).Razorpay) return resolve(true);
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

    const handlePay = async () => {
        try {
            setMessage('');
            setLoadingGateway(true);
            const ok = await loadRazorpay();
            if (!ok) {
                setMessage('Unable to load payment checkout. Please try again.');
                return;
            }

            // For simplicity and since we don't have a backend yet, we use Razorpay in client-only mode for this MVP.
            // In a production app, you would use a Supabase Edge Function to verify the payment.
            const razorpay = new (window as any).Razorpay({
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: amount * 100, // Razorpay expects paise
                currency: 'INR',
                name: 'CryptoGuru.ai',
                description: title,
                handler: async (response: any) => {
                    console.log('Payment Success:', response);
                    const { data: { user } } = await getUserSafe();
                    if (user) {
                        await supabase.from('user_data').update({
                            plan: plan
                        }).eq('id', user.id);
                    }
                    onLaunch();
                },
                theme: { color: '#00d4ff' },
            });
            razorpay.open();
        } catch (err: any) {
            setMessage(err.message || 'Payment failed');
        } finally {
            setLoadingGateway(false);
        }
    };

    return (
        <div className="landing-root payment-page-root" style={{ minHeight: '100vh', padding: '48px 5%' }}>
            <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
                <button className="btn-outline" onClick={onBack} style={{ marginBottom: '30px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={16} /> Back to plans
                </button>

                <div className="payment-grid">
                    <section className="pricing-card" style={{ minHeight: '560px' }}>
                        <div className="hero-badge" style={{ marginBottom: '20px' }}>
                            <ShieldCheck size={14} /> Secure checkout
                        </div>
                        <h1 style={{ fontSize: 'clamp(34px, 5vw, 56px)', marginBottom: '8px' }}>Subscribe to {data.title}</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>
                            {paymentRequired
                                ? 'Payment is required to activate this plan. Choose a gateway below.'
                                : 'This plan is free. No payment required.'}
                        </p>

                        <div className="glass-card" style={{ padding: '22px', marginBottom: '24px' }}>
                            <p className="mono" style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>
                                {billing === 'yearly' ? 'Yearly billing' : 'Monthly billing'}
                            </p>
                            <div style={{ fontSize: '44px', fontWeight: 800 }}>
                                ₹{amount}
                                <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/mo</span>
                            </div>
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px', display: 'grid', gap: '12px' }}>
                            {data.perks.map((perk) => (
                                <li key={perk} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                                    <CheckCircle2 size={18} color="#4cffb0" />
                                    {perk}
                                </li>
                            ))}
                        </ul>

                        {paymentRequired ? (
                            <div style={{ marginTop: 'auto', display: 'grid', gap: '10px' }}>
                                <button className="btn-primary" style={{ width: '100%', height: '52px', fontSize: '17px' }} onClick={handlePay} disabled={loadingGateway}>
                                    {loadingGateway ? <><LoaderCircle size={16} className="mono" /> Processing payment...</> : 'Pay now'}
                                </button>
                            </div>
                        ) : (
                            <button className="btn-primary" style={{ width: '100%', marginTop: 'auto', height: '52px', fontSize: '17px' }} onClick={onLaunch}>
                                Continue with Free Plan
                            </button>
                        )}
                        {message && (
                            <div style={{ marginTop: '12px', color: '#ff9db5', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                <AlertTriangle size={16} /> {message}
                            </div>
                        )}
                    </section>

                    <aside className="glass-card" style={{ padding: '28px', height: 'fit-content' }}>
                        <h3 style={{ fontSize: '24px', marginBottom: '14px' }}>Order Summary</h3>
                        <div style={{ display: 'grid', gap: '12px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Plan</span>
                                <span style={{ color: 'var(--text-primary)' }}>{data.title}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Billing</span>
                                <span style={{ color: 'var(--text-primary)' }}>{billing}</span>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 700 }}>
                            <span>Total</span>
                            <span>₹{amount}</span>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
