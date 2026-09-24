---
id: intro
title: Introduction
sidebar_position: 1
---

# API Afribox

L'API Afribox alimente le réseau de casiers intelligents SmartParcel : casiers, colis,
clients, entreprises, livraison, kiosques et paiements.

- **URL de base** : `https://afriboxapi.smartparcel.ng/v2`
- **Format** : JSON en `POST` (quelques points d'accès en `GET`) ; le JSON est servi en `Content-Type: application/json`
- **Devise** : XOF (Côte d'Ivoire)
- **Paiements** : Paystack
- **Spécification OpenAPI** : servie à `https://smartparcelng.github.io/Afribox-API-Docs/openapi.json` (OpenAPI 3.1), versionnée à `https://smartparcelng.github.io/Afribox-API-Docs/openapi-2.0.0.json`. Importez-la dans votre générateur, Postman ou Insomnia.

:::info Convention de réponse
Chaque point d'accès JSON renvoie **HTTP 200**. Le résultat se trouve dans le corps :

```json
{ "statuscode": "00", "statusmessage": "Successful", "...": "données" }
```

`statuscode` `"00"` signifie succès ; toute autre valeur est une erreur
(voir [Réponses et erreurs](./response-and-errors)). Une **requête valide sans
résultat** renvoie aussi `"00"`, avec un **tableau vide** (`[]`) plutôt que `null`
ou `99` — ainsi « il n'y a rien » n'est jamais confondu avec « quelque chose est cassé ».
:::

## Domaines

| Domaine | Description |
| --- | --- |
| `core` | Données de référence : États, villes, casiers, tailles, frais, coursiers |
| `customer` | Comptes clients, cartes enregistrées, colis |
| `business` | Comptes entreprises/partenaires, casiers, colis, portefeuille |
| `kiosk` | Opérations du casier/appareil (dépôt, retrait, appless, instantanés) |
| `pay` | Paiements de colis + Paystack (initialize/verify/status/webhook) |
| `parcel` | Instantanés de preuve de livraison |
| `admin` | Administration des entreprises |

Commencez par [Authentification](./authentication).
