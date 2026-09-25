---
id: response-and-errors
title: Responses & errors
sidebar_position: 3
---

# Responses & errors

JSON endpoints return **HTTP 200** and put the result in the body. Responses are served as
`Content-Type: application/json`.

```json
{
  "statuscode": "00",
  "statusmessage": "Successful",
  "parcel": { "...": "payload" }
}
```

## Common status codes

| `statuscode` | Meaning |
| --- | --- |
| `00` | Success (including a valid, **empty** result — see below) |
| `01` | No post data |
| `02` | Invalid post data (JSON parse error) |
| `03` | Null post data |
| `04` | Missing or invalid field (see `statusmessage`) |
| `05`–`11` | Validation errors (field-specific); the sentence in `statusmessage` names the field |
| `98` | Authentication failed |
| `99` | Error occurred (generic) |

## Empty result vs. error

A **valid request with no results returns `00`** with an **empty array** (`[]`), not `null`
and not `99`:

```json
{ "statuscode": "00", "statusmessage": "Successful", "parcels": [] }
```

So "there is nothing" is never confused with "something is broken". `99` is reserved for an
actual failure.

## Transport edges

- **Unknown path** and **unexpected server error** return the usual envelope with
  `statuscode` `99` — never an HTML page.
- A `GET` on a `POST` route returns **HTTP 405** with the envelope. Only `/pay/return/`,
  `/parcel/snapshot/image/` and `/customer/cards/add/complete/` are `GET`.
- The edge refuses requests **without a browser `User-Agent`** (Cloudflare error 1010, HTTP
  403). Server-to-server clients should send a normal `User-Agent`.
- Every path ends with a **trailing slash**.

## Values and formats

The contract types most fields as strings. What the strings contain:

- **Amounts** are in the **major unit — XOF francs** (no minor unit), on input and output,
  including `/pay/initialize/` and `/pay/verify/` (`amount`/`fees`). The `×100` mentioned in
  this guide is Paystack's gateway convention (it applies to XOF too — their docs: "developers
  must multiply the amount by 100 regardless") and the API applies it internally; you never
  multiply. Machine amount fields are **unformatted integer strings** (`"250"`, `"7400"`);
  display-only fields are formatted (`balanceformatted` = `"7,400.00"`, `sizedescription`).
- **Dates** — formats, time zone and the ISO 8601 companions are in *Dates and time zones* below.
- **Booleans** are the strings `"True"` / `"False"`.
- **Labels** (sizes, request types) may be French or English; prefer the id next to the label
  (`sizeid`, `requesttypeid`, `courierid`, `deliveryareaid`) rather than matching on text.
- **`boxes` and `fees` change shape by endpoint.** `boxes` is an **array** on the box lists but a
  **string count** in `/business/dashboard/`; `fees` is an **object** (`/core/fees/compute/`), an
  **array** (`/core/fees/service/`, `/core/fees/selfstorage/`, `/core/fees/appless/`), or a
  **string** (`sizes[].fees`, `/pay/verify/`). Model them per endpoint, not by field name.

## Locker counters

The unit is the **compartment** — one locker door. `boxcapacity` counts compartments, and one parcel occupies exactly one. On a box, `lockersinuse` + `lockersfree` = `boxcapacity`; on the dashboard, `lockers` = `lockerstotal` = Σ `boxcapacity`, `lockersvacant` = Σ `lockersfree`, and `lockersreserved` + `lockersoccupied` = Σ `lockersinuse`. Vocabulary:

- `boxcapacity` — the number of compartments the box is configured for.
- `lockers` / `lockerstotal` (dashboard) — the compartments across all the business's boxes (same count).
- `lockersvacant` (dashboard) — compartments across the business's boxes that are free.
- `lockersreserved` — compartments held by a parcel created but not yet dropped off.
- `lockersoccupied` — compartments holding a dropped-off parcel.
- `lockersinuse` (box) — compartments not free: reserved plus occupied.
- `lockersfree` (box) — compartments neither reserved nor occupied.
- `lockersavailable` (box) — a **boolean flag**, not a counter: `"True"` iff the box has at least one free compartment (`lockersfree > 0`), `"False"` at zero. It is independent of whether the box is in service.
- `users` (dashboard) — the staff accounts attached to the business, not its customers.

A `lockersreserved` count higher than `parcelspendingdropoffs` is not a defect: reserved counts compartments by state and includes customer holds and stale reservations, while pending drop-offs counts the business's parcels; the rule is one pending drop-off reserves one compartment.

## Dates and time zones

- **Zone.** All dates are the **server's local time**, with no offset in the value. On the current
  host that is **Lagos (UTC+1)**; the service is being moved to **Côte d'Ivoire (Abidjan, UTC+0)**,
  after which the same fields read one hour earlier. Never assume the zone from the value — use the
  ISO fields.
- **Human format.** `M/d/yyyy h:mm:ss AM/PM` (`8/27/2026 5:27:26 PM`), month first. It is pinned
  (`en-US`) and will not change with the host's regional settings.
- **ISO 8601 companions.** Every date field also has an ISO 8601 value that carries the offset:
  `datecreatediso`, `dropdateiso`, `collectdateiso`, `datelastpingiso`, `imagedatetimeiso` (e.g.
  `2026-08-27T17:27:26+01:00`, and `+00:00` after the move). Prefer these for parsing and
  arithmetic.
- **`paidat`** is ISO 8601 **UTC** (`2026-09-17T18:30:03Z`), as returned by Paystack; `paidatiso`
  is the same value.
- **Input dates** (report windows) accept `YYYY-MM-DD`, the legacy `MM/DD/YYYY` (month first:
  `01/08/2026` is 8 January, not 1 August) and ISO 8601 timestamps. `DD/MM/YYYY` is **not**
  accepted; the error names the accepted formats. Prefer `YYYY-MM-DD`.

## Conventions

- Check `statuscode === "00"` before using the payload.
- `statusmessage` is human-readable; do not match on it (it may change or be localized). Use
  `statuscode`, and for `04` the field named in the message.
