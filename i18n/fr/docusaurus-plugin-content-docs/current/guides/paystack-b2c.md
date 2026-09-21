---
id: paystack-b2c
title: Paystack — B2C (particuliers)
sidebar_position: 2
---

# Paiements Paystack — B2C (particuliers)

Les utilisateurs paient via l'application web client, l'application casier ou le bot
WhatsApp. Tous utilisent la **clé d'application** (aucune clé secrète de fournisseur
dans le client).

## Application web — popup Paystack

1. `POST /pay/initialize` (clé d'application) avec `email`, `phone`, `amount`,
   `metadata.parcelreference`, et éventuellement `customerid` :

   ```json
   {
     "apikey": "<CléApplication>",
     "email": "acheteur@exemple.com",
     "phone": "+225...",
     "amount": "1000",
     "flowtype": "web",
     "metadata": { "parcelreference": "PRN123" }
   }
   ```

2. Ouvrez la popup Paystack avec l'`accesscode` renvoyé
   (Paystack InlineJS v2 `resumeTransaction`).
3. En cas de succès, appelez `POST /pay/verify` `{ "reference": "<ref>" }` et affichez
   le `collectcode` renvoyé.

Pour les payeurs anonymes, collectez d'abord **l'e-mail** (requis par Paystack) et le téléphone.

## Application casier — QR + sondage

1. `POST /pay/initialize` avec `metadata` contenant le contexte du flux
   (`flowtype: "appless"`, identifiants casier/boîte/taille).
2. Affichez `authorizationurl` sous forme de QR code.
3. Sondez `POST /pay/status` `{ "reference": "<ref>" }` jusqu'à
   `transactionstatus == "success"`.
4. Appelez `POST /kiosk/parcel/appless/reserve` avec `paymentreference` — le backend
   vérifie et **consomme** le paiement (usage unique).

## Bot WhatsApp

Envoyez l'`authorizationurl` dans la conversation ; définissez `callbackurl` sur
`https://afriboxapi.smartparcel.ng/v2/pay/return/` (ou sondez `/pay/status`).
