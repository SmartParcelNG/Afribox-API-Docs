---
id: paystack-b2b
title: Paystack — B2B (partners)
sidebar_position: 1
---

# Paystack payments — B2B (partners)

Business/partner applications collect payments through the shared Paystack API.

## 1. Initialize

`POST /pay/initialize` with the **business secret key**.

```json
{
  "apikey": "<BusinessSecretKey>",
  "email": "payer@example.com",
  "phone": "+225...",
  "amount": "5000",
  "currency": "XOF",
  "reference": "optional-unique-ref",
  "callbackurl": "https://partner.example/complete",
  "flowtype": "web",
  "metadata": {
    "fulfil": "wallet",
    "narration": "Wallet top-up",
    "parcelreference": "PRN123"
  }
}
```

Response (`00`): `reference`, `authorizationurl` (hosted checkout), `accesscode`.

### Fulfilment (metadata-driven)

| metadata | Effect on success |
| --- | --- |
| `fulfil: "wallet"` | Credit the business wallet |
| `parcelreference` | Mark the parcel paid |
| (neither) | Record only |

The three cases are **mutually exclusive**: send `fulfil: "wallet"` **or** `parcelreference`
**or** neither. Do not send both.

### Amounts

`amount` is in **XOF major units** (e.g. `"5000"` = 5,000 F). XOF has **no minor unit**; the
"multiplied by 100" you may read about is internal to Paystack and does not change what you
send or what is debited. `/pay/verify` returns `amount` and `fees` in the **same major unit**.
A wallet credit carries the Paystack `reference` in the ledger (`/business/transactionhistory/`).

## 2. Verify

After the customer pays, call `POST /pay/verify` `{ "apikey": "<BusinessSecretKey>", "reference": "<ref>" }`.
Fulfilment runs **once** (idempotent); a recorded success is never downgraded.

## 3. Webhook

Register `https://afriboxapi.smartparcel.ng/v2/pay/webhook/paystack/` in the
Paystack dashboard. It confirms/fulfils reliably in the background.
