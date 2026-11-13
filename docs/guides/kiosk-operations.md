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

## Application key scope

A locker should use an application key with **scope `kiosk`**. That scope is limited to the
locker surface: every `/kiosk/` operation plus the read and payment endpoints the locker needs.
Any other endpoint returns `98 Authentication Failed`.

| Allowed for a `kiosk` key | Purpose |
|---|---|
| `/kiosk/*` | setup, ping, drop, collect, appless reserve/verify, snapshots |
| `/core/boxes/info/` | box, lockers, service state |
| `/core/boxes/availability/` | free lockers by size |
| `/core/boxes/list/` | active boxes in the key's network only |
| `/core/fees/appless/` | walk-in fee schedule |
| `/pay/initialize/` | start the walk-in payment |
| `/pay/status/` | poll the payment |

Business, customer, admin and other core endpoints are not available to a `kiosk` key.
`/core/boxes/list/` is network-scoped: a Network 3 key sees only Network 3 boxes.

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

**Replay window.** The replay answer is limited to a short window after the first
successful drop: **2 minutes** by default, configurable with
`KioskReplayWindowMinutes`. Inside the window the same `boxid` + `unlockcode`
returns `00` with the original payload. After the window it returns
`07 NOT_FOUND`; the locker must not open the door. The window is measured from the
first success and is not extended by retries.

Door-open timeout and “door left open” handling are **locker responsibilities**. The
API has no door sensor. The locker must close the door after its configured timeout
and report the fault locally. The locker should only retry a code while its own
door-fault handling is still in progress; once the door has been seen open and
closed, a repeated code must not reopen it.

## Collect: `/kiosk/parcel/collect/`

The request carries `boxid` and the 4-character collect code.

1. Send the collect request.
2. `00` means the collection is recorded and the parcel is no longer in the locker.
3. Open the door after `00`.
4. A retry with the same code within the replay window returns `00` with
   `statusmessage = "Already collected"` and the existing parcel payload.
5. After the window, the same code returns `07 NOT_FOUND` and must not reopen the
   door.
6. If the door does not open, follow the same maintenance/retry rule as drop.

## Snapshot upload: `/kiosk/parcel/snapshot/`

The locker uploads four proof photos per parcel: `dropoff` / `1`, `dropoff` / `2`,
`pickup` / `1`, `pickup` / `2`. `image` is a **raw base64 JPEG** (no `data:` URI
prefix), and the decoded image must be **2 MB or less**.

- Take the parcel identifiers (`parcelid`, `parceldetailid`,
  `parcelreferencenumber`) from the drop or collect response. `boxid` is the
  numeric id returned by `/kiosk/setup/`, not the `boxcode` (`BOX006`).
- Use a **read timeout of at least 30–60 seconds** for the snapshot call. The
  image upload is much larger than the other calls; a 5-second timeout will
  abort a request the server is still processing.
- On a timeout or network cut, **retry the same request**. The API is idempotent
  for the same `parceldetailid` + `snapshotevent` + `snapshotsequence`: the retry
  returns the existing snapshot, stores no duplicate and does not send the proof
  notification again.
- `imagedatetime` is server local time in `M/d/yyyy h:mm:ss AM/PM` format. Keep
  the box clock synchronised with NTP and make the time zone a setting. The
  server is currently UTC+1 and is moving to UTC+0.
- The API stores the image file and the snapshot metadata. The base64 image is
  redacted from the API-call log.

Retry the upload when there is no answer, when `retryable` is `"True"`, or when
`statuscode` is `"99"`. Do not retry on `04`, `05`, `07` or `09` until the
request is corrected; those are validation, not-found or business-rule
refusals.

## Network cuts and offline behaviour

- Do **not** open the door before the API confirms a drop or collect.
- If the API is unreachable, keep the request queued and retry with the **same code**.
- Do not invent a new code or a new parcel to get around a timeout.
- The API is idempotent for the same `boxid` + `unlockcode` only inside the replay
  window (2 minutes by default). A retry after the window returns `07 NOT_FOUND`.
- If the locker cannot reach the API for an extended period, put itself in a safe
  state: no new drops, no collections, display a clear “offline” message.

## What `00` means

`00` means the server recorded the action. It does **not** prove that the physical
door opened. Door state is local to the locker.

## Notifications

When notifications are enabled, drop/collect actions queue SMS, email and WhatsApp
messages. In a test network the server records the notification with
`Suppressed = 1` and does not deliver it.

## Logging

New platform API-call log entries are redacted. They keep the endpoint, time,
`statuscode`, `errorcode`, parcel reference/identifiers, door and result, but
never the application key, opening codes, payment credentials, names, phone
numbers or e-mail addresses. Entries written before this rule are unchanged.

On the locker, keep only the parcel reference, the compartment, the time and
the result of each operation. Never keep opening codes, names or phone numbers
in the local log. If a masked code is needed for support, keep only its first
character. The platform can trace the operation from the parcel reference.

## Error handling

| Case | What the locker should do |
|---|---|
| `00` | Proceed with the door action |
| `07` | Code not found for this box, or the replay window has expired: show “invalid or expired code” and do not open the door |
| `98` | Authentication failed: do not retry until configuration is fixed |
| `99` | Transient server error: retry the same request with backoff |
| timeout / no response | Retry the same request within the replay window; the action may already have been recorded |

## Responsibilities

| Area | Owner |
|---|---|
| Code validation and record of drop/collect | API |
| Snapshot storage, validation and idempotent replay | API |
| Camera capture, JPEG base64 encoding, upload timeout/retry | Locker |
| Door motor, door sensor, timeout, jam detection | Locker |
| Box ping cadence and offline display | Locker |
| Application key and API base URL | Locker configuration |
| Retry queue across network loss | Locker |
| Suppressing test notifications | API / console |
