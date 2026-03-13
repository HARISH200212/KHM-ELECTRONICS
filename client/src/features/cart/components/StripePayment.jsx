import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StripePayment = ({ amount, customerEmail, onPaymentSuccess, onRealtimeStatus }) => {
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
