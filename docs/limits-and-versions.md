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
