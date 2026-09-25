---
id: limits-and-versions
title: Limits, versions & changelog
sidebar_position: 4
---

# Limits, versions & changelog

## Versioning

- The API version is in the path: **`/v2`**.
- The OpenAPI contract is served at `https://smartparcelng.github.io/Afribox-API-Docs/openapi.json`
  and at a versioned address, `…/openapi-2.0.0.json`. Import it into your tooling and diff it
  between releases.
- Additive changes (new endpoints, new optional fields) may ship without notice. Breaking
  changes (removing/renaming a field, changing a meaning) are announced here and, where
  possible, the old name is kept for a transition period.

## Limits

- There is currently **no published per-key quota or rate limit**, and no `Retry-After`
  header. Treat the API as best-effort and keep client retries idempotent (see
  [Idempotency](./authentication#idempotency)).
- Latency is variable; set generous timeouts and **retry creates with an `Idempotency-Key`** so
  a retry cannot duplicate a parcel or a debit.
- List endpoints grow with usage. Use the optional `page`/`pagesize` (when available) and the
  `total` in the envelope.

## Observability

- There is no request-correlation field yet. If you need one, send an `X-Request-Id` header
  and quote it (with the UTC timestamp and the endpoint) in support requests.

## Changelog

### 2026-09-29

- **Business public key hardening:** the locker opening codes (`dropcode`/`collectcode`) are
  now masked as `"****"` on `/business/parcels/info/` and `/business/parcels/info/all/` too
  (they were already masked on the five list endpoints). Real codes are returned only under
  the **secret key**. The public key remains server-side only.
- **`/core/parcels/search/`** (application key) no longer returns recipient/sender contact
  details — they are masked; only tracking fields are returned.
- **Customer reads now require `sessiontoken`:** `/customer/parcels/*` (and related reads) no
  longer accept a bare `customerid`; an absent/invalid token returns `98 Authentication Failed`.
  This closes the "anyone with a (non-secret) customer id can read codes/OTP/PII" hole.
- **`x-readonly` corrections:** `/business/pendingdropoffs/` and `/parcel/snapshots/` are
  **read** (they are lists) and `/kiosk/ping/` is **write** (it records the ping). They now sort
  into the correct sidebar, and the interactive console is enabled only where it is safe.
- **`boxes` / `fees` shape variance documented** as stable and intentional: `boxes` is an array
  on the box lists but a string count on `/business/dashboard/`; `fees` is an object on
  `/core/fees/compute/`, an array on the other `/core/fees/*` endpoints, and a string on
  `/core/sizes/fees/` and `/pay/verify/`. No rename.

### 2026-09-28

- **Empty vs. error:** every **list** endpoint now returns `00` with an empty array (`[]`) when
  the request is valid and the result is empty; **detail** endpoints return `07` (not found)
  for a missing resource. `99` is reserved for an unexpected failure.
- **New status-code meanings** for `05`–`11` (see *Responses & errors*): `04` missing field,
  `05` invalid value, `06` not an allowed value, `07` not found, `08` conflict, `09`
  business-rule refusal, `10` insufficient balance, `11` reserved.
- **Every response now carries `errorcode`, `errorfield` and `retryable`** — a stable,
  language-invariant identifier, the offending field, and whether a retry may help.
- Business-rule refusals are no longer `99`: `Payment already used` → `09` +
  `errorcode PAYMENT_ALREADY_USED`; no locker available → `09 LOCKER_NOT_AVAILABLE`;
  insufficient balance → `10 INSUFFICIENT_BALANCE`; business credit → `09 CREDIT_ADMIN_ONLY`.
- Wallet write validation normalized (`04` missing, `05`/`06` invalid).

### 2026-09-27

- **NIPOST removed** (request type 5 and its legacy procedures/tables/views); it does not
  operate in Côte d'Ivoire.
- `/customer/parcels/new/` now accepts only `requesttypeid` **1, 2 or 3** (others are refused).
- `/business/parcels/create/` is documented as fixed to request type **6**.
- `/business/draft/parceltypes/` and `/business/draft/deliveryareas/` are **deprecated**;
  use `/core/requesttypes/list/` and `/core/deliveryareas/list/`.
- Request-type labels are served trimmed (no embedded CRLF).

### 2026-09-26

- Wallet writes: `createdby` is now **optional** (numeric `SYS_Users.UserID`; defaults to the
  business's primary user); `wallettransactiontypeid` and `walletfundmodeid` are validated
  with clear field errors; **Credit is admin-only** on `/business/wallettransaction/new/`.
- Added `/business/users/list/` (business staff users, for `createdby` discovery).
- `/parcel/snapshots/` is now ordered by `DateCreated` then `SnapshotSequence` (sequence 1
  before 2 within an event); `snapshotevent`/`snapshotsequence` documented on the reference
  lists page.
- Reservation (appless) fee schedule published by size, effective **23 September 2026**:
  Petit 500, Moyen 750, Grand 1250, XGrand 2000 (supersedes the 250/600/1000 schedule).
  Request types **4 and 6** both return it; `/core/fees/compute/` and `/core/sizes/fees/`
  no longer error on type 4.
- `/business/parcels/create/` insufficient-balance refusal now carries
  `errorcode: "INSUFFICIENT_BALANCE"`.
- Created parcels awaiting drop-off now expire after **72 h** (configurable); the deadline is
  returned as `expiresat` on `/business/parcels/create/` and `/customer/parcels/new/`. An
  expiry sweep moves them to parcel status **8 (Reservation expired)**, releases the locker
  and forfeits the fee; cancellation before the deadline still refunds.

### 2026-09-25

- Parcel status vocabulary now includes **7 — Dispatch collected parcel from locker**;
  `parcelstatus` on parcel responses is never empty (falls back to `"Status <id>"`).
- Added `/core/lockerstatuses/list/` (1 Vacant, 2 Reserved, 3 Occupied).
- `transactionstatus` documented as a closed vocabulary (`initialized` + Paystack's 8 statuses)
  with terminal/non-terminal values and polling guidance.
- `transactions[].type` declared as `Credit`/`Debit` (complete set).
- New **Reference lists** page enumerating every closed vocabulary.

### 2026-09-24

- Added `Idempotency-Key` support to creating endpoints.
- `POST /customer/login/` now returns a revocable `sessiontoken`; customer read endpoints
  accept it in place of `customerid`.
- Empty results now return `00` with `[]` (not `99`/`null`) on parcel, transaction and card
  lists.
- Optional `page`/`pagesize`/`total` added to parcel and transaction lists.
- Added `/core/parcelstatuses/list/`, `/core/wallettransactiontypes/list/`,
  `/core/walletfundmodes/list/`, `/core/billingtypes/list/`, `/business/parcels/search/`,
  `/customer/parcels/cancel/`.
- `boxid` returned on parcel responses; `lockers[]` and box date/network/online added to
  `/core/boxes/info/`; `lockersizes` (lower-case) added alongside `lockerSizes`.
- Business writes (`cancel`, `retrieve`, `wallettransaction/new`) now require the secret key;
  `/admin/*` requires a dedicated admin key.
