// netlify/functions/stripe-webhook.js
// Handles Stripe checkout.session.completed events and delivers the
// Liquidity Sweep Mapper v2 files to the buyer via Resend.

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  // Stripe sends webhooks as POST. Reject anything else.
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Netlify sometimes base64-encodes the request body. Handle both cases
  // so the signature verifies against the raw UTF-8 body Stripe signed.
  const body = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;

  // Verify the signature. If it fails, reject the request.
  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  // Only handle successful checkouts. Ignore everything else.
  if (stripeEvent.type !== 'checkout.session.completed') {
    return { statusCode: 200, body: 'ignored' };
  }

  const session = stripeEvent.data.object;
  const customerEmail =
    session.customer_details?.email || session.customer_email;

  if (!customerEmail) {
    console.error('No customer email in session', session.id);
    return { statusCode: 400, body: 'No customer email' };
  }

  // Read attachments from disk. included_files in netlify.toml bundles
  // these .txt files alongside the function when Netlify deploys it.
  let pineScriptBuffer, readmeBuffer;
  try {
    pineScriptBuffer = fs.readFileSync(
      path.join(__dirname, 'liquidity-sweep-mapper-v2.txt')
    );
    readmeBuffer = fs.readFileSync(path.join(__dirname, 'readme.txt'));
  } catch (err) {
    console.error('Failed to read attachment files:', err);
    return { statusCode: 500, body: 'Attachment read failed' };
  }

  try {
    await resend.emails.send({
      from: 'Malloy Labs <noah@malloylabs.net>',
      to: customerEmail,
      subject: 'your liquidity sweep mapper v2 — malloy labs',
      text: `thanks for buying the liquidity sweep mapper v2.

two files attached:

+ liquidity-sweep-mapper-v2.txt — the pine script. paste into tradingview's pine editor (chart view → pine editor → new indicator → paste → save → add to chart).

+ readme.txt — inputs, configuration, and how to read the signals. start here.

it takes about 5 minutes to get it running on your chart. the readme walks through every setting.

if anything breaks or the behavior is unclear, just reply to this email. i read everything.

— noah
malloy labs
malloylabs.net · @malloyalgos`,
      attachments: [
        {
          filename: 'liquidity-sweep-mapper-v2.txt',
          content: pineScriptBuffer,
        },
        {
          filename: 'readme.txt',
          content: readmeBuffer,
        },
      ],
    });

    console.log(`Delivered to ${customerEmail}, session ${session.id}`);
    return { statusCode: 200, body: 'ok' };
  } catch (err) {
    // Returning 500 makes Stripe retry the webhook automatically,
    // which handles transient Resend failures without manual work.
    console.error('Email delivery failed:', err);
    return { statusCode: 500, body: 'Email delivery failed' };
  }
};

