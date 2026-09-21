---
id: authentication
title: Authentification
sidebar_position: 2
---

# Authentification

Tous les points d'accès s'authentifient avec un `apikey` envoyé **dans le corps JSON**
de la requête (pas dans un en-tête). Il existe trois types de clés ; le point d'accès
détermine lequel est attendu.

## Types de clés

| Clé | Utilisée pour | Identifie |
| --- | --- | --- |
| **Clé d'application** | `core`, `customer`, `kiosk`, `pay` (B2C) | L'application/le canal ; définit `NetworkID` |
| **Clé publique d'entreprise** | la plupart des points `business` (lecture) | L'entreprise |
| **Clé secrète d'entreprise** | `business/parcels/create`, `pay` (B2B) | L'entreprise |

```json
{ "apikey": "<votre clé>", "...": "..." }
```

## Points à double authentification (`/pay/*`)

`/pay/initialize`, `/pay/verify` et `/pay/status` acceptent **soit** :

- une **clé secrète d'entreprise** (B2B), soit
- une **clé d'application** avec un `customerid` facultatif (B2C).

Le backend résout la clé automatiquement. En B2C, le paiement est attribué à
l'application (et au client si fourni) ; en B2B, à l'entreprise.

## Webhook Paystack

`POST /pay/webhook/paystack` n'est **pas** authentifié par `apikey`. Paystack signe le
corps brut en **HMAC-SHA512** avec la clé secrète ; la signature est envoyée dans
l'en-tête `x-paystack-signature`. Voir [Webhook Paystack](./guides/webhook).

:::warning
N'intégrez jamais une **clé secrète** de fournisseur dans un client (web, mobile,
application casier). Seul le backend communique avec Paystack. Les clients appellent
`/pay/initialize` et `/pay/verify`.
:::
