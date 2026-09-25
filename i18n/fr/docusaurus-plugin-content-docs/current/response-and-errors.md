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
- **`boxes` et `fees` changent de forme selon le point d'accès.** `boxes` est un **tableau** sur
  les listes de boîtes mais une **chaîne (nombre)** dans `/business/dashboard/` ; `fees` est un
  **objet** (`/core/fees/compute/`), un **tableau** (`/core/fees/service/`,
  `/core/fees/selfstorage/`, `/core/fees/appless/`) ou une **chaîne** (`sizes[].fees`,
  `/pay/verify/`). Modélisez-les par point d'accès, pas par nom de champ.

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
