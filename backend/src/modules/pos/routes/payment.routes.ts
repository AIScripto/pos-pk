// =============================================================================
// Payment routes — Stripe payment intent creation
// =============================================================================

import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { env } from '../../../config/env';
import * as R from '../../../shared/lib/response';

export const paymentRoutes = Router();

paymentRoutes.post('/create-intent', async (req: Request, res: Response) => {
  if (!env.STRIPE_SECRET_KEY) {
    return R.serverError(res, 'Stripe is not configured on this server');
  }

  const { amount } = req.body;
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return R.badRequest(res, 'amount must be a positive number');
  }

  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      // amount is in paisa (smallest currency unit) — send as-is to Stripe
      amount:   Math.round(amount),
      currency: 'pkr',
      automatic_payment_methods: { enabled: true },
    });
    R.ok(res, { clientSecret: paymentIntent.client_secret });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Stripe error';
    R.serverError(res, msg);
  }
});
