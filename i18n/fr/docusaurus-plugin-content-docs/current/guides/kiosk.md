---
id: kiosk
title: Flux kiosque et casier
sidebar_position: 3
---

# Flux kiosque et casier

L'appareil casier utilise les points `kiosk` avec la **clé d'application**.

## Mise en service d'une machine

- `POST /kiosk/setup/` — `{ apikey, boxcode }` ; renvoie la fiche complète de la boîte. À
  appeler une fois pour établir l'identité d'une machine à partir de son code de boîte. C'est
  une **écriture**.
- `POST /kiosk/ping/` — `{ apikey, boxid }` ; battement de cœur. Renvoie seulement
  `statuscode`/`statusmessage` ; le serveur enregistre l'heure de dernière activité (visible
  sur la boîte via `datelastping`).

## Réservation appless (visiteurs sans application)

1. `POST /kiosk/parcel/appless/verify` — prend un **`sizename`** et renvoie **une** taille/frais
   /colis pour cette taille. Pour un menu complet, combinez `/core/fees/appless/` (prix par
   taille) et `/core/boxes/availability/` (casiers libres par taille).
2. Collectez le paiement pour la durée choisie :
   - `POST /pay/initialize` (`flowtype: "appless"`, `metadata` avec le contexte casier).
   - Affichez `authorizationurl` en QR ; le client paie.
   - Sondez `POST /pay/status` jusqu'à `transactionstatus == "success"`.
3. `POST /kiosk/parcel/appless/reserve` avec `paymentreference`.

### La réservation est adossée à un paiement

`appless/reserve` valide `paymentreference` :

- le paiement existe et `Status = success`,
- il appartient à l'application appelante,
- le montant correspond,
- puis il le **consomme** de façon atomique.

Une référence ne peut financer **qu'une seule** réservation. Les rejeux sont rejetés
(`"Payment already used"`).

## Dépôt / retrait

- `POST /kiosk/parcel/drop/` — déposer un colis. Corps : `{ apikey, boxid, unlockcode }`, où
  `unlockcode` est le **`dropcode`** du colis.
- `POST /kiosk/parcel/collect/` — retirer un colis. Même corps ; `unlockcode` est le
  **`collectcode`** du colis.

Les codes sont renvoyés par les points de colis sous `dropcode` / `collectcode` ; les points
kiosque les lisent sous le nom unique `unlockcode`.

Pour un **colis entreprise**, l'entreprise reçoit le **code de dépôt** à la réservation (réponse
et tableau de bord) et dépose avec celui-ci, tandis que le **destinataire** n'est notifié — SMS,
e-mail et WhatsApp, avec le code de retrait — qu'au dépôt du colis dans la boîte.

## Instantanés

- `POST /kiosk/parcel/snapshot/` — téléverser une image de preuve de livraison. Champs clés :
  - `snapshotevent` — **`dropoff`** (au dépôt) ou **`pickup`** (au retrait).
  - `snapshotsequence` — **`1`** quand le casier est déverrouillé, **`2`** après fermeture.
  - `image` — la charge de l'image ; fournissez le type média produit par votre caméra.
  - plusieurs identifiants de colis sont acceptés ; `parceldetailid` fait foi.
- `POST /parcel/snapshots/` — lister les instantanés d'un colis (`snapshoturl` par instantané).
- `GET /parcel/snapshot/image/` — récupérer une image : lien signé
  (`?snapshotid=..&expires=..&sig=..`) ou requête authentifiée simple
  (`?apikey=..&snapshotid=..`).
