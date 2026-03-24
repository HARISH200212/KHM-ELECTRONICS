import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../../../shared/constants/api';

const CheckoutForm = ({ amount, customerEmail, onPaymentSuccess, onPaymentProcessing, onRealtimeStatus }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            return;
        }

        setIsLoading(true);

        // First, create the Payment Intent on the server
        try {
            const response = await fetch(`${API_BASE_URL}/api/payment/stripe/create-payment-intent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, customerEmail }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to create payment intent");
            }

            const { clientSecret, paymentIntentId } = data;
            
            // Show payment processing screen
            onPaymentProcessing?.(paymentIntentId, 'card');
            
            onRealtimeStatus?.({
                paymentIntentId,
                status: 'processing',
                metadata: { method: 'Stripe Card' },
            });

            // Confirm the payment with Stripe
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                    // Make sure to change this to your payment completion page
                    return_url: `${window.location.origin}/order-confirmation`,
                },
                redirect: 'if_required'
            });

            if (error) {
                onRealtimeStatus?.({
                    paymentIntentId: paymentIntentId || 'unknown',
                    status: 'failed',
                    metadata: { method: 'Stripe Card', reason: error.message },
                });
                if (error.type === "card_error" || error.type === "validation_error") {
                    setMessage(error.message);
                    toast.error(error.message);
                } else {
                    setMessage("An unexpected error occurred.");
                    toast.error("An unexpected error occurred.");
                }
            } else if (paymentIntent && paymentIntent.status === "succeeded") {
                toast.success("Payment successful!");
                onRealtimeStatus?.({
                    paymentIntentId: paymentIntent.id,
                    status: 'succeeded',
                    metadata: { method: 'Stripe Card' },
                });
                onPaymentSuccess(paymentIntent);
            }

        } catch (err) {
            console.error("Payment error:", err);
            toast.error(err.message || "Payment failed");
            setMessage(err.message);
            onRealtimeStatus?.({
                paymentIntentId: 'unknown',
                status: 'failed',
                metadata: { method: 'Stripe Card', reason: err.message },
            });
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element" />
            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="btn btn-primary pay-btn"
                style={{ marginTop: '20px', width: '100%' }}
            >
                <span id="button-text">
                    {isLoading ? <div className="spinner" id="spinner"></div> : `Pay ₹${amount.toLocaleString('en-IN')}`}
                </span>
            </button>
            {/* Show any error or success messages */}
            {message && <div id="payment-message" style={{ color: 'red', marginTop: '10px', fontSize: '14px' }}>{message}</div>}
        </form>
    );
};

export default CheckoutForm;
