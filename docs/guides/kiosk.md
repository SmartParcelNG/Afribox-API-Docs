---
id: kiosk
title: Kiosk & locker flows
sidebar_position: 3
---

# Kiosk & locker flows

The locker device uses the `kiosk` endpoints with the **application key**.

## Bringing a machine into service

- `POST /kiosk/setup/` — `{ apikey, boxcode }`; returns the full box record. Use it once to
  establish a machine's identity from its box code. It is a **write**.
- `POST /kiosk/ping/` — `{ apikey, boxid }`; a heartbeat. Returns only
  `statuscode`/`statusmessage`; the server records the last-seen time (visible on the box as
  `datelastping`).

## Appless reservation (walk-in users)

1. `POST /kiosk/parcel/appless/verify` — takes a **`sizename`** and returns **one** available
   size/fee/parcel for that size. To show a full price/availability menu, combine
   `/core/fees/appless/` (prices by size) and `/core/boxes/availability/` (free lockers by size).
2. Collect payment for the selected duration:
   - `POST /pay/initialize` (`flowtype: "appless"`, `metadata` with box/locker context).
   - Show `authorizationurl` as a QR; the customer pays.
   - Poll `POST /pay/status` until `transactionstatus == "success"`.
3. `POST /kiosk/parcel/appless/reserve` with `paymentreference`.

### Reservation is payment-backed

`appless/reserve` validates `paymentreference`:

- the payment exists and `Status = success`,
- it belongs to the calling application,
- the amount matches,
- then **claims** it atomically.

A reference can fund **one** reservation. Replays are rejected (`"Payment already used"`).

## Drop / collect

- `POST /kiosk/parcel/drop/` — drop a parcel. Body: `{ apikey, boxid, unlockcode }`, where
  `unlockcode` is the parcel's **`dropcode`**.
- `POST /kiosk/parcel/collect/` — collect a parcel. Same body; `unlockcode` is the parcel's
  **`collectcode`**.

The codes are returned by the parcel endpoints as `dropcode` / `collectcode`; the kiosk
endpoints read them under the single name `unlockcode`.

For a **business parcel** the business receives the **drop code** at booking (the response and
the dashboard) and deposits with it, while the **recipient** is notified — SMS, email and
WhatsApp, with the collect code — only when the parcel is dropped off at the box.

## Snapshots

- `POST /kiosk/parcel/snapshot/` — upload a proof-of-delivery image. Key fields:
  - `snapshotevent` — **`dropoff`** (at drop-off) or **`pickup`** (at collection).
  - `snapshotsequence` — **`1`** when the lock is unlocked, **`2`** after the door is closed.
  - `image` — the image payload; provide the media type your camera produces.
  - several parcel identifiers are accepted; `parceldetailid` is authoritative.
- `POST /parcel/snapshots/` — list a parcel's snapshots (`snapshoturl` per snapshot).
- `GET /parcel/snapshot/image/` — fetch an image: a signed link
  (`?snapshotid=..&expires=..&sig=..`) or a plain authenticated
  `?apikey=..&snapshotid=..`.
