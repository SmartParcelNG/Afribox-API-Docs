---
id: kiosk-operations
title: Kiosk operating rules
sidebar_position: 4
---

# Kiosk operating rules

This page is for the locker application (the software running on the box), not for an
end user. It explains what the API records, what the locker must do, and what to do
after a timeout or network cut.

## The box

- `boxcode` format is **`BOX` + three digits**, for example `BOX006`.
- The box is configured once with `POST /kiosk/setup/` using its `boxcode`.
- Send `POST /kiosk/ping/` **every 10 minutes** with the `boxid`.
- The API marks a box offline after **15 minutes** without a ping.
- A box that has never pinged is not reliable for booking.

## Drop: `/kiosk/parcel/drop/`

The request carries `boxid` and the 4-character `unlockcode` (the drop code).

Sequence:

1. Send the drop request.
2. The API returns `00` only after it has recorded the drop: parcel status 2,
   `DropDate`, drop code used, locker occupied.
3. After `00`, the locker may open the door.
4. If the door does not open, retry the **same** request with the same code.
   The API now returns `00` with `statusmessage = "Already dropped"` and the
   original parcel payload. It does not create a second drop or resend notifications.
5. If the door still does not open, keep the parcel reserved for maintenance and
   raise an alert. Do not issue or accept a new drop code for that parcel.

Door-open timeout and “door left open” handling are **locker responsibilities**. The
API has no door sensor. The locker must close the door after its configured timeout
and report the fault locally.

## Collect: `/kiosk/parcel/collect/`

The request carries `boxid` and the 4-character collect code.

1. Send the collect request.
2. `00` means the collection is recorded and the parcel is no longer in the locker.
3. Open the door after `00`.
4. A retry with the same code returns `00` with `statusmessage = "Already collected"`
   and the existing parcel payload.
5. If the door does not open, follow the same maintenance/retry rule as drop.

## Network cuts and offline behaviour

- Do **not** open the door before the API confirms a drop or collect.
- If the API is unreachable, keep the request queued and retry with the **same code**.
- Do not invent a new code or a new parcel to get around a timeout.
- The API is idempotent for the same `boxid` + `unlockcode`; the retry is safe.
- If the locker cannot reach the API for an extended period, put itself in a safe
  state: no new drops, no collections, display a clear “offline” message.

## What `00` means

`00` means the server recorded the action. It does **not** prove that the physical
door opened. Door state is local to the locker.

## Notifications

When notifications are enabled, drop/collect actions queue SMS, email and WhatsApp
messages. In a test network the server records the notification with
`Suppressed = 1` and does not deliver it.

## Error handling

| Case | What the locker should do |
|---|---|
| `00` | Proceed with the door action |
| `07` | Code not found for this box: show “invalid or expired code” |
| `98` | Authentication failed: do not retry until configuration is fixed |
| `99` | Transient server error: retry the same request with backoff |
| timeout / no response | Retry the same request; the action may already have been recorded |

## Responsibilities

| Area | Owner |
|---|---|
| Code validation and record of drop/collect | API |
| Door motor, door sensor, timeout, jam detection | Locker |
| Box ping cadence and offline display | Locker |
| Application key and API base URL | Locker configuration |
| Retry queue across network loss | Locker |
| Suppressing test notifications | API / console |
