---
id: authentication
title: Authentication
sidebar_position: 2
---

# Authentication

All endpoints authenticate with an `apikey` sent **in the JSON request body**
(not a header). There are three key types; the endpoint determines which one it expects.

## Key types

| Key | Where used | How it identifies |
| --- | --- | --- |
| **Application key** | `core`, `customer`, `kiosk`, `pay` (B2C) | The application/channel; sets `NetworkID` |
| **Business public key** | most `business` endpoints (read) | The business |
| **Business secret key** | `business/parcels/create`, `pay` (B2B) | The business |

```json
{ "apikey": "<your key>", "...": "..." }
```

## Dual-auth endpoints (`/pay/*`)

`/pay/initialize`, `/pay/verify`, and `/pay/status` accept **either**:

- a **Business secret key** (B2B), or
- an **Application key** plus an optional `customerid` (B2C).

The backend resolves the key automatically. For B2C, the payment is attributed to
the application (and customer when provided); for B2B, to the business.

## Paystack webhook

`POST /pay/webhook/paystack` is **not** authenticated with `apikey`. Paystack signs
the raw body with **HMAC-SHA512** using the secret key; the signature is sent in the
`x-paystack-signature` header. See [Paystack webhook](./guides/webhook).

:::warning
Never embed a provider **secret key** in a client (web, mobile, locker app). Only the
backend talks to Paystack. Clients call `/pay/initialize` and `/pay/verify`.
:::
