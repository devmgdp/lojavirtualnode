import express from 'express';
import dotenv from 'dotenv';
import stripe from 'stripe';
import { fileURLToPath, resolve } from 'url';
import { dirname, join } from 'path';

// Load variables
dotenv.config();

// Start Server
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static('public'));
app.use(express.json());

// Home Route
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Success
app.get("/success", (req, res) => {
  res.sendFile(join(__dirname, 'public', 'success.html'));
});

// Cancel
app.get("/cancel", (req, res) => {
  res.sendFile(join(__dirname, 'public', 'cancel.html'));
});

// Stripe
let stripeGateway = stripe(process.env.stripe_api);
let DOMAIN = process.env.DOMAIN;

app.post('/stripe-checkout', async (req, res) => {
  const lineItems = req.body.items.map((items) => {
    const unitAmount = parseInt(items.price.replace(/[^0-9.-]+/g, '') * 100);
    console.log("item-price:", items.price);
    console.log("unitAmount:", unitAmount);
    return {
      price_data: {
        currency: "brl",
        product_data: {
          name: items.title,
          images: [items.productImg]
        },
        unit_amount: unitAmount,
      },
      quantity: items.quantity,
    };
  });
  console.log("lineItems:", lineItems);

  // Create Checkout Session
  const session = await stripeGateway.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: resolve(DOMAIN, '/success'),
    cancel_url: resolve(DOMAIN, '/cancel'),
    line_items: lineItems,
    // Asking Address in Stripe Checkout Page
    billing_address_collection: "required",
  });
  res.json(session.url);
});



app.listen(3000, () => {
  console.log("listening on port 3000;");
});
