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
| `04` | Champ requis manquant |
| `05` | Valeur de champ invalide |
| `06` | Valeur hors de l'ensemble autorisé |
| `07` | Introuvable |
| `08` | Conflit (nouvelle tentative possible) |
| `09` | Refus métier (non réessayable) |
| `10` | Solde insuffisant |
| `11` | Réservé |
| `429` | Limité — quota par clé dépassé (voir `Retry-After`) |
| `98` | Échec d'authentification |
| `99` | Erreur serveur inattendue (réessayable) |

## Erreurs : `errorcode`, `errorfield`, `retryable`

Chaque réponse porte aussi :

- **`errorcode`** — un identifiant stable et indépendant de la langue ; vide en cas de succès.
  Préférez-le à `statusmessage`, qui peut être reformulé ou localisé.
- **`errorfield`** — le champ de requête concerné, le cas échéant (vide sinon).
- **`retryable`** — `"True"`/`"False"` : si renvoyer la même requête peut réussir.

`errorcode` est dérivé de `statuscode`, sauf si le point d'accès est plus spécifique :

| `errorcode` | `statuscode` | `retryable` |
| --- | --- | --- |
| `MISSING_FIELD` | `04` | False |
| `INVALID_FIELD` | `05` | False |
| `NOT_ALLOWED_VALUE` | `06` | False |
| `NOT_FOUND` | `07` | False |
| `CONFLICT` | `08` | True |
| `BUSINESS_RULE` | `09` | False |
| `INSUFFICIENT_BALANCE` | `10` | False |
| `RESERVED` | `11` | False |
| `AUTHENTICATION_FAILED` | `98` | False |
| `INTERNAL_ERROR` | `99` | True |
| `PAYMENT_ALREADY_USED` | `09` | False |
| `LOCKER_NOT_AVAILABLE` | `09` | True |
| `CREDIT_ADMIN_ONLY` | `09` | False |
| `INVALID_RESET_CODE` | `09` | False |
| `RATE_LIMITED` | `429` | True |

## Résultat vide ou erreur

Une **requête valide sans résultat renvoie `00`** avec un **tableau vide** (`[]`), ni `null`
ni `99` :

```json
{ "statuscode": "00", "statusmessage": "Successful", "parcels": [] }
```

Ainsi « il n'y a rien » n'est jamais confondu avec « quelque chose est cassé ». `99` est
réservé à un échec réel.

## Cas limites du transport

- Un **chemin inconnu** renvoie **HTTP 404** avec l'enveloppe — jamais une page HTML ; une
  **erreur serveur** renvoie aussi l'enveloppe.
- Un `GET` sur une route `POST` existante renvoie **HTTP 405** avec l'enveloppe. Seules
  `/pay/return/`, `/parcel/snapshot/image/` et `/customer/cards/add/complete/` sont `GET`.
- Les réponses JSON sont servies avec `Content-Type: application/json`.
- **HSTS** est défini (`Strict-Transport-Security: max-age=31536000; includeSubDomains`) et le
  **port 80 redirige (`301`) vers HTTPS**.
- **CORS** : l'origine de la console de documentation (`https://smartparcelng.github.io`) est
  autorisée pour `POST, GET, OPTIONS`.
- **Limitation de débit** : chaque réponse porte `X-RateLimit-Limit`/`-Remaining`/`-Reset`, et
  un `429` porte aussi `Retry-After` (voir *Limites, versions et changelog*).
- Aucun `User-Agent` de navigateur n'est requis. Les clients serveur à serveur peuvent tout de
  même envoyer un `User-Agent` normal — un pis-aller inoffensif.
- Chaque chemin se termine par un **slash final**.

## Valeurs et formats

Le contrat type la plupart des champs en chaînes. Ce qu'elles contiennent :

- Les **montants** sont en **unité majeure — francs XOF** (sans unité mineure), en entrée comme
  en sortie, y compris `/pay/initialize/` et `/pay/verify/` (`amount`/`fees`). Le `×100` évoqué
  dans ce guide est la convention de la passerelle Paystack (elle s'applique aussi à XOF — docs :
  « developers must multiply the amount by 100 regardless ») et l'API l'applique en interne ;
  vous ne multipliez jamais. Les champs de montant machine sont des **chaînes entières non
  formatées** (`"250"`, `"7400"`) ; seuls les champs d'affichage sont formatés
  (`balanceformatted` = `"7,400.00"`, `sizedescription`).
- Les **dates** — formats, fuseau et companions ISO 8601 : voir *Dates et fuseaux horaires*
  ci-dessous.
- Les **booléens** sont les chaînes `"True"` / `"False"`.
- Les **libellés** (tailles, types de demande) peuvent être en français ou en anglais ;
  préférez l'identifiant à côté du libellé (`sizeid`, `requesttypeid`, `courierid`,
  `deliveryareaid`) plutôt qu'une comparaison de texte.
- **`boxes` et `fees` ont une forme propre à chaque point d'accès** (stable, hérité — les noms ne
  changent pas ; un client typé doit brancher sur le point d'accès, pas sur le nom du champ) :

  | point d'accès | champ | forme |
  | --- | --- | --- |
  | les listes de boîtes (p. ex. `/business/boxes/all/`, `/core/boxes/list/`) | `boxes` | **tableau** de `BoxData` |
  | `/business/dashboard/` | `boxes` | **chaîne** — un nombre, p. ex. `"5"` |
  | `/core/fees/compute/` | `fees` | **objet** `{servicefee, storagefee, totalfees}` |
  | `/core/fees/service/` | `fees` | **tableau** de lignes de frais de service |
  | `/core/fees/selfstorage/` | `fees` | **tableau** de lignes de stockage |
  | `/core/fees/appless/` | `fees` | **tableau** de lignes appless |
  | `/core/sizes/fees/` | `sizes[].fees` | **chaîne** — un montant |
  | `/pay/verify/` | `fees` | **chaîne** — le **montant** des frais de la passerelle (pas un catalogue) |

## Compteurs de casiers

L'unité est le **compartiment** — une porte de casier. `boxcapacity` compte les compartiments, et un colis occupe exactement un. Sur une boîte, `lockersinuse` + `lockersfree` = `boxcapacity` ; sur le tableau de bord, `lockers` = `lockerstotal` = Σ `boxcapacity`, `lockersvacant` = Σ `lockersfree`, et `lockersreserved` + `lockersoccupied` = Σ `lockersinuse`. Vocabulaire :

- `boxcapacity` — le nombre de compartiments pour lesquels la boîte est configurée.
- `lockers` / `lockerstotal` (tableau de bord) — les compartiments de toutes les boîtes de l'entreprise (même nombre).
- `lockersvacant` (tableau de bord) — les compartiments libres des boîtes de l'entreprise.
- `lockersreserved` — les compartiments détenus par un colis créé mais pas encore déposé.
- `lockersoccupied` — les compartiments contenant un colis déposé.
- `lockersinuse` (boîte) — les compartiments non libres : réservés plus occupés.
- `lockersfree` (boîte) — les compartiments ni réservés ni occupés.
- `lockersavailable` (boîte) — un **indicateur booléen**, pas un compteur : `"True"` si et seulement si la boîte a au moins un compartiment libre (`lockersfree > 0`), `"False"` à zéro. Indépendant de l'état de service de la boîte.
- `users` (tableau de bord) — les comptes du personnel rattachés à l'entreprise, pas ses clients.

Un `lockersreserved` supérieur à `parcelspendingdropoffs` n'est pas un défaut : réservé compte les compartiments par état et inclut les réservations client et les réservations périmées, alors que les dépôts en attente comptent les colis de l'entreprise ; la règle est qu'un dépôt en attente réserve un compartiment.

## Dates et fuseaux horaires

- **Fuseau.** Toutes les dates sont à l'**heure locale du serveur**, sans décalage dans la valeur.
  Sur l'hôte actuel : **Lagos (UTC+1)** ; le service est transféré en **Côte d'Ivoire (Abidjan,
  UTC+0)**, après quoi les mêmes champs liront une heure plus tôt. Ne déduisez pas le fuseau de
  la valeur : utilisez les champs ISO.
- **Format humain.** `M/d/yyyy h:mm:ss AM/PM` (`8/27/2026 5:27:26 PM`), mois d'abord. Il est figé
  (`en-US`) et ne changera pas avec les paramètres régionaux de l'hôte.
- **Companions ISO 8601.** Chaque champ de date possède aussi une valeur ISO 8601 portant le
  décalage : `datecreatediso`, `dropdateiso`, `collectdateiso`, `datelastpingiso`,
  `imagedatetimeiso` (ex. `2026-08-27T17:27:26+01:00`, puis `+00:00` après le transfert).
  Préférez-les pour l'analyse et les calculs.
- **`paidat`** est en ISO 8601 **UTC** (`2026-09-17T18:30:03Z`), tel que renvoyé par Paystack ;
  `paidatiso` est identique.
- **Saisies de dates** (fenêtres de rapport) : `YYYY-MM-DD`, l'ancien `MM/DD/YYYY` (mois d'abord :
  `01/08/2026` = 8 janvier, pas le 1er août) et les horodatages ISO 8601. `DD/MM/YYYY` n'est
  **pas** accepté ; l'erreur indique les formats valides. Préférez `YYYY-MM-DD`.

## Conventions

- Vérifiez `statuscode === "00"` avant d'utiliser la réponse.
- `statusmessage` est lisible par un humain ; ne vous y fiez pas (il peut changer ou être
  localisé). Utilisez `statuscode`, et pour `04` le champ nommé dans le message.
