export const env = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000",
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
};
