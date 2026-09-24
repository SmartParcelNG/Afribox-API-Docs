---
id: paystack-b2c
title: Paystack — B2C (consumers)
sidebar_position: 2
---

# Paystack payments — B2C (consumers)

Everyday users pay via the customer web app, the locker app, or the WhatsApp bot.
All of them use the **Application key** (no provider secret in the client).

## Web app — Paystack popup

1. `POST /pay/initialize` (application key) with `email`, `phone`, `amount`,
   `metadata.parcelreference`, and optionally `customerid`:

   ```json
   {
     "apikey": "<ApplicationKey>",
     "email": "buyer@example.com",
     "phone": "+225...",
     "amount": "1000",
     "flowtype": "web",
     "metadata": { "parcelreference": "PRN123" }
   }
   ```

2. Open the Paystack popup with the returned `accesscode`
   (Paystack InlineJS v2 `resumeTransaction`).
3. On success, call `POST /pay/verify` `{ "reference": "<ref>" }` and show the
   returned `collectcode`.

For anonymous payers, collect **email** (required by Paystack) and phone first.

`amount` is in **XOF major units** (`"1000"` = 1,000 F); XOF has no minor unit and no factor
of 100 applies on the way in or out.

## Locker app — QR + polling

1. `POST /pay/initialize` with `metadata` carrying the flow context
   (`flowtype: "appless"`, locker/box/size ids).
2. Display `authorizationurl` as a QR code.
3. Poll `POST /pay/status` `{ "reference": "<ref>" }` until `transactionstatus == "success"`.
4. Call `POST /kiosk/parcel/appless/reserve` with `paymentreference` — the backend
   verifies and **claims** the payment (single-use).

## WhatsApp bot

Send the `authorizationurl` in chat; set `callbackurl` to
`https://afriboxapi.smartparcel.ng/v2/pay/return/` (or poll `/pay/status`).
