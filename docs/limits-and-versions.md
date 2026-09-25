---
id: limits-and-versions
title: Limits, versions & changelog
sidebar_position: 4
---

# Limits, versions & changelog

## Versioning

- The API version is in the path: **`/v2`**, which we commit to for several years.
- The contract is versioned with **SemVer** (`2.MINOR.PATCH`); `info.version` is **bumped on
  every changelog entry below**, and each release is archived immutably at
  `…/openapi-<version>.json` (e.g. `openapi-2.1.0.json`) while `…/openapi.json` is always the
  current one — diff two readings or pin one.
- **Additive** changes (new endpoints, new optional fields) may ship at any time with **no
  notice**; ignore fields you do not know.
- **Breaking** changes (removing, renaming or retyping a field, or changing a meaning) are
  announced in the changelog below and flagged `deprecated` in the spec, and the **old name
  keeps working for at least 90 days** — both are served during the window where possible.
  Nothing is removed before the window ends.
- The spec is generated **on push** from the backend, so the contract cannot change between
  releases without a changelog entry.

## Limits

- **Per-key quota.** Each API key is limited to **600 requests / minute** (application and kiosk
  keys: **900**), counted in fixed 60-second windows. Exceeding it returns **HTTP 429** with
  `errorcode RATE_LIMITED` and `retryable: "True"`.
- Every response carries `X-RateLimit-Limit`, `X-RateLimit-Remaining` and `X-RateLimit-Reset`
  (UTC epoch seconds); a `429` also carries `Retry-After` (seconds).
- There is no other quota. Latency is variable; set generous timeouts and **retry creates with
  an `Idempotency-Key`** so a retry cannot duplicate a parcel or a debit (see
  [Idempotency](./authentication#idempotency)).
- List endpoints grow with usage. Use the optional `page`/`pagesize` (when available) and the
  `total` in the envelope.

## Observability

- There is no request-correlation field yet. If you need one, send an `X-Request-Id` header
  and quote it (with the UTC timestamp and the endpoint) in support requests.

## Changelog

### 2026-10-06

- **Payment `metadata` and `flowtype` documented.** `flowtype` is a **top-level** field of
  `/pay/initialize/` (mirrored to `metadata.flow`); the appless locker flow's context keys are
  `boxid`, `sizeid`, `boxlockernumber` (**optional**). A new *Payment metadata and `flowtype`*
  section in *Reference lists* lists every server-acted `metadata` key (`parcelreference`,
  `fulfil`, `holdtoken`, `returnurl`, `narration`).

### 2026-10-05

- **Type-6 parcels now have a single upfront charge.** The reservation fee debited at
  `/business/parcels/create/` is the **only** charge; the collect-time duration fee
  (`FEE_BusinessFees` free/lump/hourly, narrated "Parcel … stayed in locker for …") has been
  removed from `/kiosk/parcel/collect/` (`SQL/AfriboxFixParcelCollectFee.sql`). Collection still
  sets the parcel to status 4 and frees the locker, but no longer debits the wallet. Types 2/3
  (and the rest) are unchanged — they charge when the customer first pays.

### 2026-10-04

- **`/business/parcels/retrieve/` documented and fixed:** it is a **retrieval request** (secret
  key) — it does not change the parcel status, does **not** release the locker and does **not**
  refund the fee, and it is **one-way**. It now **returns the parcel** (same contract as
  `/business/parcels/info/`, including the real `collectcode`), and a non-retrievable parcel is
  refused with `09 PARCEL_NOT_RETRIEVABLE`. Completion (status 4, `RetrieveCompleted=1`, locker
  released) happens at the kiosk with the parcel's `collectcode`.

### 2026-10-03

- **Authentication docs clarified:** the page now lists **all four** dual-auth endpoints
  (`/pay/initialize/`, `/pay/verify/`, `/pay/status/`, `/customer/parcels/hold/`), states that
  `business` reads use the **public** key and writes the **secret** key, notes that
  `/business/boxes/info/` is **business-scoped**, and records the hard-coded application
  context in the business auth procedures as a known leftover.

### 2026-10-02

- **Transport edges:** an unknown path now returns the JSON envelope with **HTTP 404** instead
  of an HTML page, and a `GET` on an unknown path is a `404` (only an existing `POST` route
  answers `405`). The Paystack webhook returns the envelope on an invalid signature.
  Confirmed live: JSON `Content-Type`, `Strict-Transport-Security`, CORS, **port 80 → 301
  HTTPS**, no browser `User-Agent` required, and `X-RateLimit-*` on every response.

### 2026-10-01

- **Per-key quota and rate-limit headers.** Each API key is limited to **600 requests/minute**
  (application/kiosk keys: **900**), in fixed 60-second windows; exceeding it returns **HTTP
  429** with `errorcode RATE_LIMITED`. Every response now carries `X-RateLimit-Limit`,
  `X-RateLimit-Remaining` and `X-RateLimit-Reset`, and a `429` also carries `Retry-After`.
- **Versioning policy published:** SemVer (`2.MINOR.PATCH`) bumped per release with immutable
  archived specs (`openapi-<version>.json`); additive changes ship without notice, breaking
  changes get a `deprecated` flag and a **90-day** dual-serve window. The spec is generated on
  push only.

### 2026-09-30

- **Customer password reset is now a one-time emailed code.** `/customer/forgotpassword/` emails a
  **6-digit code** (10-minute expiry, max 5 attempts) and always answers `00` — the old
  `99 "Email not found"` is gone (no account-existence disclosure). The old behaviour of emailing
  a new **plaintext password** is removed.
- **Breaking:** `/customer/resetpassword/` now takes `{email, otp, newpassword}` — `oldpassword`
  was **removed**; use `/customer/changepassword/` to change a known password while signed in.
- `/customer/otp/verify/` remains **signup activation** (no token) — sign in via
  `/customer/login/` for a `sessiontoken`. The same reset flow applies to the dispatch endpoints.

### 2026-09-29

- **Kiosk snapshot identity:** on `/kiosk/parcel/snapshot/`, `parceldetailid` is
  **authoritative** — the server now verifies `parcelid`, `parcelreferencenumber`, `boxid` and
  `boxlockernumber` agree with it (`09 PARCEL_IDENTIFIERS_MISMATCH` on conflict, `07` if the
  parcel is unknown), and a retry of the same `(parceldetailid, snapshotevent,
  snapshotsequence)` is **idempotent** (a unique key prevents duplicate rows).

- **Snapshot images are signed-link only.** `/parcel/snapshot/image/` now accepts only the
  HMAC-signed, expiring link (`?snapshotid=…&expires=…&sig=…`, TTL reduced to **30 days**); the
  `apikey`/POST fetch was removed so an application key cannot enumerate proofs by id, and the
  now-unused `SnapshotFetch` schema was dropped. Errors are returned as `application/json`.
- **Added `/business/parcels/snapshots/`** — a business lists its **own** parcels' snapshots
  with its **public key** (ownership-checked), receiving the same signed `snapshoturl`s.
- The snapshot signature secret was **rotated**.
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
