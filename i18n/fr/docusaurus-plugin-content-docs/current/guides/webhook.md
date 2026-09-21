---
id: webhook
title: Webhook Paystack
sidebar_position: 4
---

# Webhook Paystack

`POST /pay/webhook/paystack/` reçoit les événements Paystack de serveur à serveur.

- **URL** : `https://afriboxapi.smartparcel.ng/v2/pay/webhook/paystack/`
- **Auth** : signature HMAC-SHA512 dans l'en-tête `x-paystack-signature`, calculée sur
  le **corps brut** avec la clé secrète Paystack.
- **Événements** : `charge.success`, `charge.failed`.
- **Réponses** : `200` acquitté, `403` signature invalide.

## Comportement

- Sur `charge.success` : enregistre le paiement et exécute le traitement (colis payé /
  crédit portefeuille).
- Idempotent : les livraisons en double sont ignorées une fois traitées.
- Un `charge.failed` pour un paiement déjà réussi est ignoré (aucune rétrogradation).

## Exemple de vérification locale

```bash
BODY='{"event":"charge.success","data":{"reference":"REF","status":"success"}}'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha512 -hmac "$SECRET" | sed 's/^.*= //')
curl -X POST https://afriboxapi.smartparcel.ng/v2/pay/webhook/paystack/ \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: $SIG" \
  -d "$BODY"
```
