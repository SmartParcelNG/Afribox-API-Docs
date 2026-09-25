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
| **Application key** | `core`, `customer`, `kiosk`, `parcel`, `dispatch`, `pay` (B2C) | The application/channel; sets `NetworkID` |
| **Business public key** | most `business` endpoints (**read-only**; opening codes masked) | The business |
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
  business's parcels and wallet and must not be shipped in a browser bundle. It never returns
  the locker opening codes — `dropcode`/`collectcode` are served as `"****"` under the public
  key (the real codes come back only under the secret key, e.g. the create response).
- The **application key** is the one intended for client apps and devices. It is scoped to the
  application/network, not to a single customer. Contact details are masked on
  `/core/parcels/search/` for this key.
:::

## Customer session token

`POST /customer/login/` returns a dated, revocable `sessiontoken` (and `sessionexpires`)
alongside the customer profile. **Customer read endpoints require `sessiontoken`** — a bare
`customerid` is not proof of identity and is no longer accepted on its own; an absent, invalid
or expired token returns `98 Authentication Failed`. The session fixes both the identity and
the customer, so a client does not carry the (non-secret) customer id around.

## Customer passwords

- **Signup activation:** `/customer/signup/` sends a code to the registered contact;
  `/customer/otp/verify/` verifies it and activates the account. It returns **no token** — call
  `/customer/login/` to get a `sessiontoken`.
- **Change (signed in):** `/customer/changepassword/` with `sessiontoken` (or `customerid`) +
  `oldpassword` + `newpassword`.
- **Forgotten:** `/customer/forgotpassword/` emails a **6-digit code** (valid **10 minutes**,
  **max 5 attempts**) and always returns `00` (no account-existence disclosure);
  `/customer/resetpassword/` takes `{email, otp, newpassword}` and sets the new password in one
  step.

## Snapshot links

Proof-of-delivery images are **not** fetched with a key. `/parcel/snapshots/` (application key)
returns, per snapshot, an **HMAC-SHA256 signed, expiring `snapshoturl`**
(`/parcel/snapshot/image/?snapshotid=…&expires=…&sig=…`). The `sig` is over `snapshotid|expires`
keyed by a server secret, and the link expires after **30 days**. The image endpoint accepts
**only** that signed link — there is no `apikey` fetch, so an application key cannot enumerate
proofs by id. A business can list its **own** parcels' snapshots with its **public key** at
`/business/parcels/snapshots/` (ownership-checked), which returns the same signed links.

## Idempotency

Creating endpoints (`business/parcels/create`, `customer/parcels/new`, `pay/initialize`,
`kiosk/parcel/appless/reserve`, and others) accept an optional **`Idempotency-Key`** header.
Repeat the same call with the same key and the server returns the first response instead of
creating a second parcel/locker/debit. Use a fresh UUID per logical operation.

## Dual-auth endpoints

`/pay/initialize`, `/pay/verify`, `/pay/status` **and `/customer/parcels/hold/`** accept
**either**:

- a **Business secret key** (B2B), or
- an **Application key** plus an optional `customerid` (B2C).

The backend resolves the key automatically (secret key first, then application key). For B2C,
the payment is attributed to the application (and customer when provided); for B2B, to the
business. `/customer/parcels/hold/` is the pay-first checkout: it returns a Paystack
`reference`/`authorizationurl`/`accesscode` like `/pay/initialize/`, and the reference is
**verified** (never trusted) via `/pay/verify/`, `/pay/return/` or the webhook.

:::note Business auth, precisely
- **`business` reads** use the **public** key; **`business` writes** (`parcels/create`,
  `parcels/cancel`, `parcels/retrieve`, `wallettransaction/new`) use the **secret** key.
- `/business/boxes/info/` is **business-scoped**: it returns a box only if it is assigned to
  the calling business (`BUS_BusinessBoxes`). The owner's any-box lookup is `/core/boxes/info/`
  with the application key.
- Known leftover: the business authentication procedures resolve the request's application
  context through a hard-coded application key. It is harmless today (endpoints use the
  business's own network) and is slated for cleanup.
:::

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
