---
id: webhook
title: Paystack webhook
sidebar_position: 4
---

# Paystack webhook

`POST /pay/webhook/paystack/` receives Paystack events server-to-server.

- **URL**: `https://afriboxapi.smartparcel.ng/v2/pay/webhook/paystack/`
- **Auth**: HMAC-SHA512 signature in the `x-paystack-signature` header,
  computed over the **raw body** with the Paystack secret key.
- **Events**: `charge.success`, `charge.failed`.
- **Responses**: `200` acknowledged, `403` invalid signature.

## Behaviour

- On `charge.success`: records the payment and fulfils it (parcel paid / wallet credit).
- Idempotent: duplicate deliveries are ignored once processed.
- A `charge.failed` for an already-successful payment is ignored (never downgrades).

## Local verification example

```bash
BODY='{"event":"charge.success","data":{"reference":"REF","status":"success"}}'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha512 -hmac "$SECRET" | sed 's/^.*= //')
curl -X POST https://afriboxapi.smartparcel.ng/v2/pay/webhook/paystack/ \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: $SIG" \
  -d "$BODY"
```
