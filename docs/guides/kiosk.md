---
id: kiosk
title: Kiosk & locker flows
sidebar_position: 3
---

# Kiosk & locker flows

The locker device uses the `kiosk` endpoints (application key).

## Appless reservation (walk-in users)

1. `POST /kiosk/parcel/appless/verify` — returns available sizes and fees.
2. Collect payment for the selected duration:
   - `POST /pay/initialize` (`flowtype: "appless"`, `metadata` with box/locker context).
   - Show `authorizationurl` as a QR; customer pays.
   - Poll `POST /pay/status` until `transactionstatus == "success"`.
3. `POST /kiosk/parcel/appless/reserve` with `paymentreference`.

### Reservation is payment-backed

`appless/reserve` validates `paymentreference`:

- the payment exists and `Status = success`,
- it belongs to the calling application,
- the amount matches,
- then **claims** it atomically.

A reference can fund **one** reservation. Replays are rejected
(`"Payment already used"`).

## Drop / collect

- `POST /kiosk/parcel/drop` — drop a parcel using a drop code.
- `POST /kiosk/parcel/collect` — collect using a collect code.

## Snapshots

- `POST /kiosk/parcel/snapshot` — upload a proof-of-delivery snapshot.
- `POST /parcel/snapshots` / `GET /parcel/snapshot/image` — list/fetch snapshots.
