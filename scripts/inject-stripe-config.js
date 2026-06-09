import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outFile = path.join(root, "public", "stripe-config.js");
const exampleFile = path.join(root, "public", "stripe-config.example.js");

const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

if (publishableKey) {
  const contents = `window.STRIPE_CONFIG = ${JSON.stringify({ publishableKey }, null, 2)};\n`;
  fs.writeFileSync(outFile, contents, "utf8");
  console.log("Wrote public/stripe-config.js from environment variables.");
  process.exit(0);
}

if (fs.existsSync(outFile)) {
  console.log("Using existing local public/stripe-config.js");
  process.exit(0);
}

if (process.env.CI === "true") {
  console.warn(
    "STRIPE_PUBLISHABLE_KEY not set in CI. Copy public/stripe-config.example.js for builds without live payments."
  );
  fs.copyFileSync(exampleFile, outFile);
  process.exit(0);
}

fs.copyFileSync(exampleFile, outFile);
console.warn("Created public/stripe-config.js from example. Add your Stripe publishable key for checkout.");