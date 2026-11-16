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

- The **application key** and the **admin key** are issued by the Afribox team — they are not
  self-service for production. In the console, **Applications** (Super Administrators) creates an
  application, shows its key masked with a reveal/copy action, and lets you **deactivate** it or
  **rotate** its key. A trial or staging key can be created there without a support request; for
  production, Afribox creates the key and hands it over once.
- The **business public** and **business secret** keys are on the business record
  (`BusinessDetails.aspx`). Both are shown masked with a reveal/copy action, visible to Super
  Administrators only — keep the **secret key** server-side.

:::warning Keep the right key in the right place
- The **secret key** must never live in a client (web, mobile, locker app).
- The **business public key is not a client key**: treat it as server-side. It reads the
  business's parcels and wallet and must not be shipped in a browser bundle. `/business/parcels/info/`
  and `/info/all/` return `dropcode`/`collectcode` masked as `"****"` to the **public key**. The real
  codes are returned only to a signed-in **staff session** (`/business/login/` with a staff
  email/password and a valid `sessiontoken`); the **secret key is refused** on those read endpoints.
  Another business's parcel returns `07` (not found), and the list endpoints keep masking the codes.
- The **application key** is the one intended for client apps and devices. It is scoped to the
  application/network, not to a single customer. Contact details are masked on
  `/core/parcels/search/` for this key.
- An application key can also be **scoped to a kiosk**. A `kiosk` key may call every `/kiosk/`
  operation plus `/core/boxes/info/`, `/core/boxes/availability/`, `/core/boxes/list/`,
  `/core/fees/appless/`, `/pay/initialize/` and `/pay/status/`; any other endpoint returns `98`.
  See [Kiosk operating rules](./guides/kiosk-operations#application-key-scope).
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

## Saved cards

`/customer/cards/add/` starts a **card verification** to tokenise a card: it initialises a
Paystack transaction of **1 XOF** (`metadata.purpose="AddCard"`, `channels=["card"]`) and
returns `cardaddurl`; after the customer completes it, `/customer/cards/add/complete/` stores
the authorization. It does **not** debit the customer. A customer may keep up to **3** cards.
The stored `token` (Paystack `authorization_code`) is **never returned** — card responses
expose only `first6digits`, `last4digits`, `type`, `expiry` and `isdefault`. Cards are reused
for future charges.

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
Repeat the same call with the same key **and the same request body** and the server returns the
first response instead of creating a second parcel/locker/debit. A request with the same key but a
**different body** returns `08` with `errorcode` `IDEMPOTENCY_KEY_REUSED`. Use a fresh UUID per
logical operation. Keys are kept for **seven days**, after which the same key may be used again.

Bulk creation (`/business/parcels/create/bulk/`) does **not** accept `Idempotency-Key` today.
The endpoints that do are listed in the contract with the header parameter.

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
- Business authentication resolves the network from the **business's own network**, so a business
  on a non-Afribox network (for example a Manufacturer test business) sees only its own boxes.
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
