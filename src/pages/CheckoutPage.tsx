import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { env } from "../config/env";
import { apiPost } from "../lib/api";

const stripePromise = loadStripe(env.stripePublishableKey);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    try {
      // Step 1: create PaymentIntent on the backend.
      const { clientSecret } = await apiPost<{ clientSecret: string }>(
        "/api/payments/create-intent",
        { amount: Math.round(total * 100) }
      );

      // Step 2: confirm card payment with Stripe.
      const card = elements.getElement(CardElement);
      if (!card) throw new Error("Card element not ready");

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (result.error) {
        setError(result.error.message ?? "Payment failed");
        setLoading(false);
        return;
      }

      // Step 3: create the order with the payment intent id.
      await apiPost("/api/orders", {
        items: items.map((i) => ({ dealId: i.dealId, qty: i.qty })),
        stripePaymentIntentId: result.paymentIntent?.id,
      });

      clearCart();
      navigate("/orders");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return <p className="text-slate-500">Your cart is empty.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order summary */}
      <div className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 font-semibold">Order Summary</h2>
        <ul className="space-y-1 text-sm text-slate-700">
          {items.map((item) => (
            <li key={item.dealId} className="flex justify-between">
              <span>{item.title} × {item.qty}</span>
              <span>${(item.price * item.qty).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Stripe card input */}
      <div className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 font-semibold">Payment</h2>
        <CardElement
          options={{
            style: {
              base: { fontSize: "16px", color: "#1e293b" },
              invalid: { color: "#dc2626" },
            },
          }}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full rounded bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}

export function CheckoutPage() {
  return (
    <section className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-semibold">Checkout</h1>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </section>
  );
}
