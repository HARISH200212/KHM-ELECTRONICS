import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripeKey = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '').trim();
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const StripePayment = ({ amount, customerEmail, onPaymentSuccess, onRealtimeStatus }) => {
    if (!stripePromise) {
        return (
            <div className="stripe-payment-container" style={{ padding: '12px', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444' }}>
                Stripe is not configured. Set <strong>VITE_STRIPE_PUBLISHABLE_KEY</strong> in your frontend environment.
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
                    onRealtimeStatus={onRealtimeStatus}
                />
            </Elements>
        </div>
    );
};

export default StripePayment;
