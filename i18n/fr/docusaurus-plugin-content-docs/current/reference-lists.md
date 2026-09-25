---
id: reference-lists
title: Listes de référence
sidebar_position: 5
---

# Listes de référence

Chaque vocabulaire fermé de l'API, avec son point d'accès de liste. Les libellés sont servis par
les points d'accès `/core/*/list/` ; les valeurs ci-dessous sont les ensembles complets.

## Statut de colis — `/core/parcelstatuses/list/`

| `parcelstatusid` | `parcelstatus` | Signification |
|---|---|---|
| 1 | New parcel request | Demande créée ; pas encore déposée |
| 2 | Dropped parcel in locker | Dans le casier, en attente de collecte |
| 3 | Enroute to recipient | Collecté du casier par la messagerie, en route vers le destinataire |
| 4 | Recipient collected parcel from locker | Collecté par le destinataire |
| 5 | Parcel was cancelled | Annulé |
| 6 | Archived | Archivé / récupéré |
| 7 | Dispatch collected parcel from locker | Collecté du casier par la messagerie ; ramassage non encore marqué |
| 8 | Reservation expired | En attente de dépôt au-delà de l'échéance ; casier libéré, frais perdus |

`parcelstatus` sur les réponses de colis n'est jamais vide : si un libellé manquait, il
retombe sur l'identifiant (`"Status 7"`).

## Statut de casier — `/core/lockerstatuses/list/`

| `lockerstatusid` | `lockerstatus` | Signification |
|---|---|---|
| 1 | Vacant | Vide ; aucun colis |
| 2 | Reserved | Vide mais réservé pour un colis |
| 3 | Occupied | Contient un colis |

Renvoyé par les réponses de dépôt/collecte au casier comme `lockerstatus` (le libellé).

## Type d'écriture du portefeuille — `/core/wallettransactiontypes/list/`

`transactions[].type` est **exactement** l'un de :

| `wallettransactiontypeid` | `wallettransactiontype` |
|---|---|
| 1 | Credit |
| 2 | Debit |

Sur `/business/wallettransaction/new/` seul **Debit** est permis — **Credit réservé à
l'admin** (`/admin/businesses/wallettransaction/new/`).

## Mode de financement du portefeuille — `/core/walletfundmodes/list/`

| `walletfundmodeid` | `walletfundmode` |
|---|---|
| 1 | Online / Card |
| 2 | Back Office |
| 3 | Paystack |

Les ajustements manuels doivent utiliser `2` (Back Office). `3` (Paystack) est défini
automatiquement par `/pay/initialize` + `/pay/verify` avec `metadata.fulfil="wallet"`.
`1` est hérité.

## Champs d'écriture du portefeuille — `createdby`

`createdby` est un **`SYS_Users.UserID`** numérique (l'utilisateur du personnel qui effectue
l'action), découvrable via `/business/users/list/` (`userid`, `fullname`, `email`). Il est
**facultatif** sur les écritures de portefeuille : omis, `/business/wallettransaction/new/`
prend l'utilisateur principal de l'entreprise et le point d'accès admin prend `0`. S'il est
fourni, il doit être numérique.

## Types de demande de colis — `/core/requesttypes/list/`

| `requesttypeid` | libellé | sélectionnable par |
|---|---|---|
| 1 | Envoyer un colis | **client** (`/customer/parcels/new/` ; requiert destinataire + adresse + `deliveryareaid`) |
| 2 | Self-stockage | **client** (requiert les champs destinataire) |
| 3 | Client à client | **client** (requiert les champs destinataire) |
| 4 | Application de casier | flux appless du casier uniquement |
| 6 | Ramassage sur place | **entreprise** — `/business/parcels/create/` y est fixé |
| 7 | Ramasser | entreprise / dispatch |
| 8 | Doorstep Delivery | entreprise / dispatch |
| 9 | Livraison de casier | entreprise / dispatch |

NIPOST (anciennement id 5) est **supprimé** — il n'opère pas en Côte d'Ivoire. La création
d'entreprise utilise toujours le type **6** et ne prend pas `requesttypeid` ; la création
client n'accepte que **1, 2, 3**. Les points d'accès `/business/draft/*` sont des alias
**obsolètes** de `/core/requesttypes/list/` et `/core/deliveryareas/list/`.

## Réservations et expiration

Deux types de réservation se comportent différemment :

- **Réservation de paiement** (`/customer/parcels/hold/`, paiement d'abord) : expire en
  **15 minutes** ; le casier est libéré automatiquement à l'expiration.
- **Colis créé en attente de dépôt** (`/business/parcels/create/`, `/customer/parcels/new/`) :
  expire **72 heures** après la création (configurable côté serveur). L'échéance est renvoyée
  dans `expiresat` sur la réponse de création.

Lorsqu'un colis créé n'est jamais déposé avant l'échéance, un balayage d'expiration le passe
au statut **8 (Reservation expired)**, libère le casier et **perd les frais de réservation —
sans remboursement**. Une **annulation** avant l'échéance, en revanche, est une annulation
normale (statut 5) et **rembourse** les frais. Le balayage s'exécute sur le planificateur
disponible (Elastic Job Azure SQL, tâche planifiée, etc.) et aussi de façon opportuniste à
chaque création de colis.

## Barème des frais de réservation (appless) — en vigueur le 23 septembre 2026

Les frais de réservation d'un colis d'entreprise sont prélevés depuis `FEE_ApplessFees` à
`/business/parcels/create/` (type de demande 6). Le même barème est publié par
`/core/fees/appless/`, `/core/fees/compute/?requesttypeid=6` et
`/core/sizes/fees/?requesttypeid=6` (le type de demande **4** renvoie le même barème).

| taille | frais (XOF) |
|---|---|
| Petit | 500 |
| Moyen | 750 |
| Grand | 1250 |
| XGrand | 2000 |

Ce barème est en vigueur depuis le **23 septembre 2026** (proposé par l'équipe Afribox) et
**remplace** l'ancien barème 250 / 600 / 1000 libellé *« Parcel reservation fee »*. Le débit
actuel est libellé **`Parcel booking Ref: <reference>`** — c'est ce libellé qui l'emporte ;
l'ancien est retiré.

## Solde insuffisant — `/business/parcels/create/`

Pour une entreprise **prépayée** (`billingtypeid` 1) dont le solde du portefeuille est
inférieur aux frais, l'appel de création renvoie :

```json
{ "statuscode": "99", "errorcode": "INSUFFICIENT_BALANCE",
  "statusmessage": "Insufficient balance. Required: 500, Available: 200" }
```

Aucun colis n'est créé et rien n'est débité. Les entreprises **postpayées** (`billingtypeid`
2) ne sont pas contrôlées à la création.

## Instantanés — `snapshotevent` / `snapshotsequence`

Le dépôt (`/kiosk/parcel/snapshot/`) valide :

- `snapshotevent` ∈ **`dropoff`** (au dépôt), **`pickup`** (à la collecte)
- `snapshotsequence` ∈ **`1`** (prise quand le casier s'ouvre), **`2`** (prise après
  fermeture de la porte)

`/parcel/snapshots/` renvoie le tableau trié par **`DateCreated` puis `SnapshotSequence`**
(du plus ancien au plus récent ; au sein d'un événement, la séquence 1 précède toujours 2).

## Type de facturation — `/core/billingtypes/list/`

| `billingtypeid` | `billingtype` |
|---|---|
| 1 | Prepaid |
| 2 | Postpaid |

## Type de demande — `/core/requesttypes/list/`

`1` Envoyer un colis, `2` Self-stockage, `3` Client à client, `4` Application de casier
(appless), `5` NIPOST, `6` Ramassage sur place, `7` Ramasser, `8` Doorstep Delivery,
`9` Livraison de casier (les libellés sont servis en français ou en anglais — préférez
l'identifiant).

## Statut de paiement — `/pay/status/` (`transactionstatus`)

`initialized` (créé, pas encore confirmé), puis le statut Paystack :

| valeur | type | signification |
|---|---|---|
| `success` | terminale | Paiement traité |
| `failed` | terminale | Paiement échoué |
| `abandoned` | terminale | Le client ne l'a pas terminé |
| `reversed` | terminale | Remboursé / contestation |
| `ongoing` | non terminale | Le client est encore en train d'agir (OTP, virement) |
| `pending` | non terminale | En cours |
| `processing` | non terminale | En cours (prélèvement) |
| `queued` | non terminale | En file (charge groupée) |

- `/pay/status/` renvoie `statuscode` `00` pour une référence connue — lisez
  **`transactionstatus`**.
- `/pay/verify/` renvoie `statuscode` `99` « Payment not successful » pour un non-succès.
- Sondage : aucun intervalle imposé par le serveur. Sondez toutes les ~5 s avec repli
  exponentiel (plafond ~30 s), arrêtez-vous sur une valeur terminale, abandonnez après ~5 min.
  Chaque appel `/pay/status/` se confirme auprès de Paystack. Préférez le webhook de succès
  quand il est disponible.

## Flux de paiement — `flowtype` (champ de requête, `/pay/initialize/`)

Informatif et libre — l'API ne le valide pas. Les valeurs documentées sont `web` (paiement web
B2B/B2C) et `appless` (flux appless au casier).