---
id: reference-lists
title: Reference lists
sidebar_position: 5
---

# Reference lists

Every closed vocabulary in the API, with its list endpoint. The labels are served by the
`/core/*/list/` endpoints; the values below are the complete sets.

## Parcel status — `/core/parcelstatuses/list/`

| `parcelstatusid` | `parcelstatus` | Meaning |
|---|---|---|
| 1 | New parcel request | Request created; not yet dropped off |
| 2 | Dropped parcel in locker | In the locker, awaiting collection |
| 3 | Enroute to recipient | Collected from the locker by dispatch, travelling to the recipient |
| 4 | Recipient collected parcel from locker | Collected by the recipient |
| 5 | Parcel was cancelled | Cancelled |
| 6 | Archived | Archived / retrieved |
| 7 | Dispatch collected parcel from locker | Collected from the locker by dispatch; picked-up not yet marked |
| 8 | Reservation expired | Awaiting drop-off past the deadline; locker released, fee forfeited |

`parcelstatus` on parcel responses is never empty: if a label were ever missing it falls back
to the id (`"Status 7"`).

## Locker status — `/core/lockerstatuses/list/`

| `lockerstatusid` | `lockerstatus` | Meaning |
|---|---|---|
| 1 | Vacant | Empty; no parcel in it |
| 2 | Reserved | Empty but held for a parcel |
| 3 | Occupied | Holds a parcel |

Returned by the kiosk drop/collect responses as `lockerstatus` (the label).

## Wallet transaction type — `/core/wallettransactiontypes/list/`

`transactions[].type` is **exactly** one of:

| `wallettransactiontypeid` | `wallettransactiontype` |
|---|---|
| 1 | Credit |
| 2 | Debit |

On `/business/wallettransaction/new/` only **Debit** is permitted — **Credit is admin-only**
(`/admin/businesses/wallettransaction/new/`).

## Wallet fund mode — `/core/walletfundmodes/list/`

| `walletfundmodeid` | `walletfundmode` |
|---|---|
| 1 | Online / Card |
| 2 | Back Office |
| 3 | Paystack |

Manual adjustments should use `2` (Back Office). `3` (Paystack) is set automatically by
`/pay/initialize` + `/pay/verify` with `metadata.fulfil="wallet"`. `1` is legacy.

## Wallet write fields — `createdby`

`createdby` is a numeric **`SYS_Users.UserID`** (the staff user performing the action),
discoverable via `/business/users/list/` (`userid`, `fullname`, `email`). It is **optional**
on the wallet write endpoints: when omitted, `/business/wallettransaction/new/` defaults to
the business's primary user and the admin endpoint to `0`. If supplied it must be numeric.

## Reservations and expiry

Two kinds of reservation behave differently:

- **Checkout hold** (`/customer/parcels/hold/`, pay-first): expires in **15 minutes**; the
  locker is released automatically when the hold expires.
- **Created parcel awaiting drop-off** (`/business/parcels/create/`, `/customer/parcels/new/`):
  expires **72 hours** after creation (configurable server-side). The deadline is returned as
  `expiresat` on the create response.

When a created parcel is never dropped off by its deadline, an expiry sweep sets it to status
**8 (Reservation expired)**, releases the locker, and **forfeits the reservation fee — there
is no refund**. A **cancellation** before the deadline, by contrast, is a normal cancel
(status 5) and **refunds** the fee. The sweep runs on whatever scheduler the host provides
(Azure SQL Elastic Job, a scheduled task, etc.) and also opportunistically whenever a parcel
is created.

## Reservation (appless) fee schedule — effective 23 September 2026

The business parcel reservation fee is charged from `FEE_ApplessFees` at
`/business/parcels/create/` (request type 6). The same schedule is published by
`/core/fees/appless/`, `/core/fees/compute/?requesttypeid=6` and
`/core/sizes/fees/?requesttypeid=6` (request type **4** returns the same schedule).

| size | fee (XOF) |
|---|---|
| Petit | 500 |
| Moyen | 750 |
| Grand | 1250 |
| XGrand | 2000 |

This schedule took effect on **23 September 2026** (proposed by the Afribox team) and
**supersedes** the historical 250 / 600 / 1000 schedule that was labelled *"Parcel
reservation fee"*. The current debit is labelled **`Parcel booking Ref: <reference>`** —
that label wins; the old one is retired.

## Insufficient balance — `/business/parcels/create/`

For a **prepaid** business (`billingtypeid` 1) whose wallet balance is below the fee, the
create call returns:

```json
{ "statuscode": "99", "errorcode": "INSUFFICIENT_BALANCE",
  "statusmessage": "Insufficient balance. Required: 500, Available: 200" }
```

No parcel is created and nothing is debited. **Postpaid** businesses (`billingtypeid` 2)
are not balance-checked at create.

## Snapshots — `snapshotevent` / `snapshotsequence`

Upload (`/kiosk/parcel/snapshot/`) validates:

- `snapshotevent` ∈ **`dropoff`** (at drop-off), **`pickup`** (at collection)
- `snapshotsequence` ∈ **`1`** (taken when the locker is unlocked), **`2`** (taken after the
  door is closed)

`/parcel/snapshots/` returns the array ordered by **`DateCreated` then `SnapshotSequence`**
(oldest first; within an event, sequence 1 always precedes 2).

## Billing type — `/core/billingtypes/list/`

| `billingtypeid` | `billingtype` |
|---|---|
| 1 | Prepaid |
| 2 | Postpaid |

## Request type — `/core/requesttypes/list/`

`1` Send parcel, `2` Self-storage, `3` Customer to customer, `4` Locker application (appless),
`5` NIPOST, `6` On-site pickup, `7` Pick up, `8` Doorstep delivery, `9` Locker delivery
(labels are served in French or English — prefer the id).

## Payment status — `/pay/status/` (`transactionstatus`)

`initialized` (created, not yet confirmed), then Paystack's status:

| value | kind | meaning |
|---|---|---|
| `success` | terminal | Payment processed |
| `failed` | terminal | Payment failed |
| `abandoned` | terminal | Customer did not complete it |
| `reversed` | terminal | Refunded / chargeback |
| `ongoing` | non-terminal | Customer is still acting (OTP, transfer) |
| `pending` | non-terminal | In progress |
| `processing` | non-terminal | In progress (direct debit) |
| `queued` | non-terminal | Queued (bulk charge) |

- `/pay/status/` returns `statuscode` `00` for a known reference — read **`transactionstatus`**.
- `/pay/verify/` returns `statuscode` `99` "Payment not successful" for a non-success.
- Polling: no server-enforced interval. Poll every ~5 s with exponential backoff (cap ~30 s),
  stop on a terminal value, give up after ~5 min. Each `/pay/status/` call self-confirms with
  Paystack. Prefer the success webhook where available.

## Payment flow — `flowtype` (request field, `/pay/initialize/`)

Informational and free-form — the API does not validate it. The documented values are
`web` (B2B/B2C web checkout) and `appless` (kiosk appless flow).