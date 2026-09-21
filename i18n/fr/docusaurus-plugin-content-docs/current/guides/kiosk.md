---
id: kiosk
title: Flux kiosque et casier
sidebar_position: 3
---

# Flux kiosque et casier

L'appareil casier utilise les points `kiosk` (clé d'application).

## Réservation appless (visiteurs sans application)

1. `POST /kiosk/parcel/appless/verify` — renvoie les tailles et frais disponibles.
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

- `POST /kiosk/parcel/drop` — déposer un colis avec un code de dépôt.
- `POST /kiosk/parcel/collect` — retirer avec un code de retrait.

## Instantanés

- `POST /kiosk/parcel/snapshot` — téléverser un instantané de preuve de livraison.
- `POST /parcel/snapshots` / `GET /parcel/snapshot/image` — lister/récupérer les instantanés.
