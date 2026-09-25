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