/**
 * Local dev: copy to stripe-config.js and paste your pk_test_ key.
 * Production: GitHub Secret STRIPE_PUBLISHABLE_KEY (injected at build).
 * Stripe Dashboard → Developers → API keys → Publishable key
 */
window.STRIPE_CONFIG = {
  publishableKey: "pk_test_YOUR_PUBLISHABLE_KEY",
};