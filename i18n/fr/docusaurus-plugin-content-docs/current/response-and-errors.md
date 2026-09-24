---
id: response-and-errors
title: Réponses et erreurs
sidebar_position: 3
---

# Réponses et erreurs

Les points JSON renvoient **HTTP 200** et mettent le résultat dans le corps. Les réponses
sont servies en `Content-Type: application/json`.

```json
{
  "statuscode": "00",
  "statusmessage": "Successful",
  "parcel": { "...": "données" }
}
```

## Codes de statut courants

| `statuscode` | Signification |
| --- | --- |
| `00` | Succès (y compris un résultat **vide** valide — voir ci-dessous) |
| `01` | Aucune donnée POST |
| `02` | Données POST invalides (erreur JSON) |
| `03` | Données POST nulles |
| `04` | Champ manquant ou invalide (voir `statusmessage`) |
| `05`–`11` | Erreurs de validation (par champ) ; la phrase de `statusmessage` nomme le champ |
| `98` | Échec d'authentification |
| `99` | Erreur générique |

## Résultat vide ou erreur

Une **requête valide sans résultat renvoie `00`** avec un **tableau vide** (`[]`), ni `null`
ni `99` :

```json
{ "statuscode": "00", "statusmessage": "Successful", "parcels": [] }
```

Ainsi « il n'y a rien » n'est jamais confondu avec « quelque chose est cassé ». `99` est
réservé à un échec réel.

## Cas limites du transport

- Un **chemin inconnu** et une **erreur serveur** renvoient l'enveloppe habituelle avec
  `statuscode` `99` — jamais une page HTML.
- Un `GET` sur une route `POST` renvoie **HTTP 405** avec l'enveloppe. Seules `/pay/return/`,
  `/parcel/snapshot/image/` et `/customer/cards/add/complete/` sont `GET`.
- La périphérie refuse les requêtes **sans `User-Agent` de navigateur** (Cloudflare erreur
  1010, HTTP 403). Les clients serveur à serveur doivent envoyer un `User-Agent` normal.
- Chaque chemin se termine par un **slash final**.

## Valeurs et formats

Le contrat type la plupart des champs en chaînes. Ce qu'elles contiennent :

- Les **montants** sont en **XOF** (sans unité mineure). Certains sont formatés pour
  l'affichage (`"7,400.00"`, solde), d'autres sont des entiers nus (`"250"`, écritures).
  Analysez-les avec prudence.
- Les **dates** sont servies au format `M/d/yyyy h:mm:ss AM/PM`, **sans fuseau** ; le serveur
  est à **UTC+1** (Lagos). Un colis créé tard le soir à Abidjan peut être daté du lendemain.
  Les **saisies** de date (ex. rapports de colis) sont en `MM/DD/YYYY` ; `YYYY-MM-DD` est
  aussi accepté.
- Les **booléens** sont les chaînes `"True"` / `"False"`.
- Les **libellés** (tailles, types de demande) peuvent être en français ou en anglais ;
  préférez l'identifiant à côté du libellé (`sizeid`, `requesttypeid`, `courierid`,
  `deliveryareaid`) plutôt qu'une comparaison de texte.
- **`boxes` et `fees` changent de forme selon le point d'accès.** `boxes` est un **tableau** sur
  les listes de boîtes mais une **chaîne (nombre)** dans `/business/dashboard/` ; `fees` est un
  **objet** (`/core/fees/compute/`), un **tableau** (`/core/fees/service/`,
  `/core/fees/selfstorage/`, `/core/fees/appless/`) ou une **chaîne** (`sizes[].fees`,
  `/pay/verify/`). Modélisez-les par point d'accès, pas par nom de champ.

## Conventions

- Vérifiez `statuscode === "00"` avant d'utiliser la réponse.
- `statusmessage` est lisible par un humain ; ne vous y fiez pas (il peut changer ou être
  localisé). Utilisez `statuscode`, et pour `04` le champ nommé dans le message.
