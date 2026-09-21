---
id: response-and-errors
title: Responses & errors
sidebar_position: 3
---

# Responses & errors

The API always returns **HTTP 200** for JSON endpoints. The result is in the body.

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
| `00` | Success |
| `01` | No post data |
| `02` | Invalid post data (JSON parse error) |
| `03` | Null post data |
| `04` | Missing field (see `statusmessage`) |
| `05`–`11` | Validation errors (field-specific) |
| `98` | Authentication failed |
| `99` | Error occurred (generic) |

## Conventions

- Amounts and IDs are strings (e.g. `"grandtotal": "1000"`).
- Currency is **XOF**; amounts sent to Paystack are multiplied by 100 internally.
- `statusmessage` is human-readable and may be localized by the server.

:::tip
Always check `statuscode === "00"` before using the payload.
:::
