import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outFile = path.join(root, "public", "firebase-config.js");
const exampleFile = path.join(root, "public", "firebase-config.example.js");

const envConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const hasEnvConfig = Object.values(envConfig).every(Boolean);

if (hasEnvConfig) {
  const contents = `window.FIREBASE_CONFIG = ${JSON.stringify(envConfig, null, 2)};\n`;
  fs.writeFileSync(outFile, contents, "utf8");
  console.log("Wrote public/firebase-config.js from environment variables.");
  process.exit(0);
}

if (fs.existsSync(outFile)) {
  console.log("Using existing local public/firebase-config.js");
  process.exit(0);
}

if (process.env.CI === "true") {
  console.error(
    "Missing Firebase secrets in CI. Add FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, and FIREBASE_APP_ID to GitHub repository secrets."
  );
  process.exit(1);
}

fs.copyFileSync(exampleFile, outFile);
console.warn("Created public/firebase-config.js from example. Copy real values for local auth.");