import { useEffect, useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';
import { API_BASE_URL } from '../../../shared/constants/api';

const envStripeKey = (
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    || import.meta.env.VITE_STRIPE_KEY
    || ''
).trim();

// Publishable keys are safe for frontend exposure; this fallback avoids a hard checkout block
// when deployment env variables are not injected correctly.
const fallbackStripeKey = 'pk_test_51T2vEDKFfleubrEIiWyO700lsUScbywCy0SXXHl1tZleyMFeRIAxII1RZcYIkqQSrZxtJcOlbYgjL3kdJRqrrnCD00Xgpqtwo5';

const StripePayment = ({ amount, customerEmail, onPaymentSuccess, onPaymentProcessing, onRealtimeStatus }) => {
    const [runtimeStripeKey, setRuntimeStripeKey] = useState(envStripeKey || fallbackStripeKey);

    useEffect(() => {
        if (runtimeStripeKey) return;

        const fetchStripeConfig = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/payment/stripe/config`);
                const data = await response.json();

                if (data?.success && data?.publishableKey) {
                    setRuntimeStripeKey(String(data.publishableKey).trim());
                }
            } catch (err) {
                console.error('Failed to fetch Stripe config:', err);
            }
        };

        fetchStripeConfig();
    }, [runtimeStripeKey]);

    const stripePromise = useMemo(() => {
        return runtimeStripeKey ? loadStripe(runtimeStripeKey) : null;
    }, [runtimeStripeKey]);

    if (!stripePromise) {
        return (
            <div className="stripe-payment-container" style={{ padding: '12px', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444' }}>
                Stripe is not configured. Set <strong>VITE_STRIPE_PUBLISHABLE_KEY</strong> in frontend env or
                <strong> STRIPE_PUBLISHABLE_KEY</strong> in server env.
            </div>
        );
    }

    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#4f46e5',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            fontFamily: 'Outfit, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
        },
    };

    const loader = 'auto';

    return (
        <div className="stripe-payment-container">
            <Elements
                stripe={stripePromise}
                options={{
                    mode: 'payment',
                    amount: Math.round(amount * 100),
                    currency: 'inr',
                    appearance,
                    loader
                }}
            >
                <CheckoutForm
                    amount={amount}
                    customerEmail={customerEmail}
                    onPaymentSuccess={onPaymentSuccess}
                    onPaymentProcessing={onPaymentProcessing}
                    onRealtimeStatus={onRealtimeStatus}
                />
            </Elements>
        </div>
    );
};

export default StripePayment;
