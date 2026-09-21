---
id: intro
title: Introduction
sidebar_position: 1
---

# Afribox API

The Afribox API powers the SmartParcel smart-locker network: lockers, boxes, parcels,
customers, businesses, dispatch, kiosks, and payments.

- **Base URL**: `https://afriboxapi.smartparcel.ng/v2`
- **Format**: JSON over `POST` (a few endpoints are `GET`)
- **Currency**: XOF (Côte d'Ivoire)
- **Payments**: Paystack

:::info Response convention
Every JSON endpoint returns **HTTP 200**. The outcome is in the body:

```json
{ "statuscode": "00", "statusmessage": "Successful", "...": "payload" }
```

`statuscode` `"00"` means success; anything else is an error (see
[Responses & errors](./response-and-errors)).
:::

## Domains

| Domain | Description |
| --- | --- |
| `core` | Reference data: states, cities, boxes, sizes, fees, couriers |
| `customer` | End-user accounts, saved cards, parcels |
| `business` | Business/partner accounts, boxes, parcels, wallet |
| `kiosk` | Locker/device operations (drop, collect, appless, snapshots) |
| `pay` | Parcel payments + Paystack (initialize/verify/status/webhook) |
| `parcel` | Proof-of-delivery snapshots |
| `admin` | Business administration |

Start with [Authentication](./authentication).
