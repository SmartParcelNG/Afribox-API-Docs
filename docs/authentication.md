---
id: authentication
title: Authentication
sidebar_position: 2
---

# Authentication

All endpoints authenticate with an `apikey` sent **in the JSON request body**
(not a header). There are four key types; the endpoint determines which one it expects.

```json
{ "apikey": "<your key>", "...": "..." }
```

## Key types

| Key | Where used | How it identifies |
| --- | --- | --- |
| **Application key** | `core`, `customer`, `kiosk`, `dispatch`, `pay` (B2C) | The application/channel; sets `NetworkID` |
| **Business public key** | most `business` endpoints (**read-only**) | The business |
| **Business secret key** | `business/parcels/create`, `business/parcels/cancel`, `business/parcels/retrieve`, `business/wallettransaction/new`, `pay` (B2B) | The business |
| **Admin key** | `admin/*` | The network (or all networks) |

## Getting a key

- The **application key** and the **admin key** are issued by the Afribox team; they are not
  self-service and are not shown in the dashboard. Contact your Afribox integration contact to
  obtain or rotate one.
- The **business public** and **business secret** keys are on the business record
  (`BusinessDetails.aspx` in the dashboard). The public key is shown as "public"; keep the
  **secret key** server-side.

:::warning Keep the right key in the right place
- The **secret key** must never live in a client (web, mobile, locker app).
- The **business public key is not a client key**: treat it as server-side. It reads the
  business's parcels and wallet, and (with the secret key) drives writes — it must not be
  shipped in a browser bundle.
- The **application key** is the one intended for client apps and devices. It is scoped to the
  application/network, not to a single customer.
:::

## Customer session token

`POST /customer/login/` returns a dated, revocable `sessiontoken` (and `sessionexpires`)
alongside the customer profile. Customer read endpoints accept `sessiontoken` **in place of**
`customerid`, so a client does not have to carry the (non-secret) customer id around. A
customer id by itself is not proof of identity — prefer the session token for real clients. An
invalid or expired token returns `98 Authentication Failed`.

## Idempotency

Creating endpoints (`business/parcels/create`, `customer/parcels/new`, `pay/initialize`,
`kiosk/parcel/appless/reserve`, and others) accept an optional **`Idempotency-Key`** header.
Repeat the same call with the same key and the server returns the first response instead of
creating a second parcel/locker/debit. Use a fresh UUID per logical operation.

## Dual-auth endpoints (`/pay/*`)

`/pay/initialize`, `/pay/verify`, and `/pay/status` accept **either**:

- a **Business secret key** (B2B), or
- an **Application key** plus an optional `customerid` (B2C).

The backend resolves the key automatically. For B2C, the payment is attributed to
the application (and customer when provided); for B2B, to the business.

## Paystack webhook

`POST /pay/webhook/paystack/` is **not** authenticated with `apikey`. Paystack signs
the raw body with **HMAC-SHA512** using the secret key; the signature is sent in the
`x-paystack-signature` header. See [Paystack webhook](./guides/webhook).

## Paths and headers

- Every path ends with a **trailing slash** (`POST /core/states/list/`).
- Send **`Content-Type: application/json`**; the server answers with
  `Content-Type: application/json`.
- A `GET` on a `POST` route returns **HTTP 405**. Only three routes are `GET`
  (`/pay/return/`, `/parcel/snapshot/image/`, `/customer/cards/add/complete/`).
- A browser `User-Agent` is required by the edge; server-to-server clients should send a
  normal `User-Agent` (see [Responses & errors](./response-and-errors)).
