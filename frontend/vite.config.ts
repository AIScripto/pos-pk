import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";
import Stripe from 'stripe';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env from the frontend root.
  // Vite does NOT expose these to process.env inside vite.config.ts itself,
  // so we use loadEnv. The third arg '' means "include ALL variables, not
  // just those prefixed with VITE_".
  const env = loadEnv(mode, __dirname, '');

  return {
    server: {
      host: "::",
      port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      {
        name: 'stripe-mock-api',
        configureServer(server: any) {
          server.middlewares.use('/api/create-payment-intent', async (req: any, res: any) => {
            if (req.method === 'POST') {
              const stripeSecretKey = env.STRIPE_SECRET_KEY;
              if (!stripeSecretKey) {
                res.statusCode = 501;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: { message: 'Stripe is not configured for local development' } }));
                return;
              }

              const stripe = new Stripe(stripeSecretKey);
              let body = '';
              req.on('data', (chunk: any) => {
                body += chunk.toString();
              });
              req.on('end', async () => {
                try {
                  const { amount } = JSON.parse(body);
                  // Stripe expects amounts in the smallest currency unit (e.g., cents)
                  const paymentIntent = await stripe.paymentIntents.create({
                    amount: Math.round(amount * 100),
                    currency: 'usd',
                    automatic_payment_methods: {
                      enabled: true,
                    },
                  });
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ clientSecret: paymentIntent.client_secret }));
                } catch (e: any) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: { message: e.message } }));
                }
              });
            } else {
              res.statusCode = 405;
              res.end();
            }
          });

          server.middlewares.use('/api/inventory', async (req: any, res: any) => {
            const dataPath = path.resolve(__dirname, './src/data/data.json');

            if (req.method === 'GET') {
              try {
                const data = fs.readFileSync(dataPath, 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(data);
              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Failed to read data.json', message: e.message }));
              }
            } else if (req.method === 'POST') {
              let body = '';
              req.on('data', (chunk: any) => {
                body += chunk.toString();
              });
              req.on('end', () => {
                try {
                  // Ensure the body is valid JSON before saving
                  JSON.parse(body);
                  fs.writeFileSync(dataPath, body, 'utf-8');
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true }));
                } catch (e: any) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'Invalid JSON or write error', message: e.message }));
                }
              });
            } else {
              res.statusCode = 405;
              res.end();
            }
          });
        }
      }
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
