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
   - `POST /pay/initialize` with **`flowtype: "appless"` at the top level** (not inside
     `metadata`) and a `metadata` object with the locker context. The context keys the locker
     app sends are **`boxid`**, **`sizeid`** and **`boxlockernumber`**; they are recommended
     but **optional** — the reservation is completed from `paymentreference`, not from
     `metadata` (the server adds `applicationid` and `flow` itself). Sending a
     **`phone`** makes the server SMS the payment link.
   - Show `authorizationurl` as a QR; the customer pays.
   - Poll `POST /pay/status` until `transactionstatus == "success"`.
3. `POST /kiosk/parcel/appless/reserve` with the full body: **`apikey`**, **`boxid`**,
   **`sizeid`**, **`amount`** (must match the payment), **`boxlockernumber`**,
   **`senderphone`**, **`recipientphone`** and **`paymentreference`**. `sendername`,
   `recipientname`, `senderemail` and `recipientemail` are **optional** — send them when
   the customer wants a name on the record or a confirmation by email.

### Reservation is payment-backed

`appless/reserve` validates `paymentreference`:

- the payment exists and `Status = success`,
- it belongs to the calling application,
- the amount matches,
- then **claims** it atomically.

A reference can fund **one** reservation. Replays are rejected (`"Payment already used"`).

### Codes and door opening

The reservation records the parcel as already dropped (status 2): the walk-in customer is at
the box and the compartment is allocated immediately. Open the compartment on the reservation
`00`.

The response carries two codes:

- `dropcode` — a fallback for the replay window. Use it only if the compartment did not open on
  the reservation `00`; the code stops working after the window (see *Kiosk operating rules*).
- `collectcode` — the recipient's collection code.

Both are real 4-character codes. They must not be written to the locker's local log. The
platform API-call log masks them. The reservation reply keeps both codes; the later drop
and collect replies mask them.

A failed reservation releases its payment claim (contract 2.1.18). If the reservation is
refused after payment, correct the request and retry with the **same** `paymentreference`.
The size check does not hold a door: open the `boxlockernumber` returned by the
**reservation reply**, not the one from the size check.

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
