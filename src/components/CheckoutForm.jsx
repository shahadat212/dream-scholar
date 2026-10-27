import React, { useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { FiLock } from 'react-icons/fi';
import Spinner from './Spinner';

const cardStyle = {
    style: {
        base: {
            fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
            fontSize: '16px',
            color: '#14141F',
            '::placeholder': { color: 'rgba(20, 20, 31, 0.35)' },
        },
        invalid: { color: '#C7452F', iconColor: '#FF6B57' },
    },
    hidePostalCode: true,
};

const isTestMode = (import.meta.env.VITE_Payment_Gateway_PK || '').startsWith('pk_test_');

const CheckoutForm = ({ clientSecret, amount, billingName, billingEmail, paidIntentId, onPaid }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [cardError, setCardError] = useState('');
    const [isCardComplete, setIsCardComplete] = useState(false);
    const [isPaying, setIsPaying] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCardError('');

        if (paidIntentId) {
            setIsPaying(true);
            await onPaid(paidIntentId);
            setIsPaying(false);
            return;
        }

        if (!stripe || !elements) return;
        const card = elements.getElement(CardElement);
        if (!card) return;

        setIsPaying(true);
        try {
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card,
                    billing_details: { name: billingName || undefined, email: billingEmail || undefined },
                },
            });

            if (error) {
                setCardError(error.message || 'Your card was declined. Please try another card.');
                return;
            }
            if (paymentIntent?.status !== 'succeeded') {
                setCardError('The payment did not complete. Please try again.');
                return;
            }
            await onPaid(paymentIntent.id);
        } catch {
            setCardError('Something went wrong while processing the payment. Please try again.');
        } finally {
            setIsPaying(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            {!paidIntentId && (
                <>
                    <label className="mb-1.5 block text-sm font-bold text-ink">Card details</label>
                    <div className={`rounded-2xl border bg-cream px-4 py-4 transition-colors ${cardError ? 'border-coral' : 'border-black/10 focus-within:border-violet'}`}>
                        <CardElement
                            options={cardStyle}
                            onChange={(event) => {
                                setIsCardComplete(event.complete);
                                setCardError(event.error?.message || '');
                            }}
                        />
                    </div>
                    {cardError && <span className="mt-1 block text-xs font-semibold text-coral">{cardError}</span>}
                    {isTestMode && (
                        <p className="mt-2 text-xs text-ink/50">
                            Test mode: use card <span className="font-mono font-semibold text-ink/70">4242 4242 4242 4242</span>, any future date and any CVC.
                        </p>
                    )}
                </>
            )}

            <button
                type="submit"
                disabled={isPaying || (!paidIntentId && (!stripe || !isCardComplete))}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-violet py-3.5 text-sm font-bold text-white shadow-lg shadow-violet/25 transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isPaying ? <Spinner /> : <FiLock />}
                {isPaying ? 'Processing…' : paidIntentId ? 'Finish submitting application' : `Pay $${Number(amount).toLocaleString('en-US')} & submit`}
            </button>
            <p className="mt-3 text-center text-[11px] text-ink/40">Payments are processed securely by Stripe. Your card details never touch our servers.</p>
        </form>
    );
};

export default CheckoutForm;
