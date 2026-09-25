---
id: authentication
title: Authentification
sidebar_position: 2
---

# Authentification

Tous les points d'accès s'authentifient avec un `apikey` envoyé **dans le corps JSON**
de la requête (pas dans un en-tête). Il existe quatre types de clés ; le point d'accès
détermine lequel est attendu.

```json
{ "apikey": "<votre clé>", "...": "..." }
```

## Types de clés

| Clé | Utilisée pour | Identifie |
| --- | --- | --- |
| **Clé d'application** | `core`, `customer`, `kiosk`, `parcel`, `dispatch`, `pay` (B2C) | L'application/le canal ; définit `NetworkID` |
| **Clé publique d'entreprise** | la plupart des points `business` (**lecture** ; codes d'ouverture masqués) | L'entreprise |
| **Clé secrète d'entreprise** | `business/parcels/create`, `business/parcels/cancel`, `business/parcels/retrieve`, `business/wallettransaction/new`, `pay` (B2B) | L'entreprise |
| **Clé d'administration** | `admin/*` | Le réseau (ou tous les réseaux) |

## Obtenir une clé

- La **clé d'application** et la **clé d'administration** sont délivrées par l'équipe Afribox ;
  elles ne sont pas en libre-service et n'apparaissent pas dans le tableau de bord. Contactez
  votre interlocuteur d'intégration Afribox pour les obtenir ou les renouveler.
- Les clés **publique** et **secrète** d'entreprise figurent sur la fiche de l'entreprise
  (`BusinessDetails.aspx`). Gardez la **clé secrète** côté serveur.

:::warning La bonne clé au bon endroit
- La **clé secrète** ne doit jamais se trouver dans un client (web, mobile, application casier).
- La **clé publique d'entreprise n'est pas une clé client** : traitez-la comme côté serveur.
  Elle lit les colis et le portefeuille de l'entreprise et ne doit pas être embarquée dans un
  navigateur. Elle ne renvoie **jamais** les codes d'ouverture de casier — `dropcode`/
  `collectcode` sont servis en `"****"` sous la clé publique (les vrais codes ne reviennent que
  sous la clé secrète, p. ex. la réponse de création).
- La **clé d'application** est celle destinée aux applications et appareils clients. Elle est
  liée à l'application/réseau, pas à un client en particulier. Les coordonnées sont masquées sur
  `/core/parcels/search/` pour cette clé.
:::

## Jeton de session client

`POST /customer/login/` renvoie un `sessiontoken` daté et révocable (et `sessionexpires`) en
plus du profil. **Les points de lecture `customer` exigent `sessiontoken`** — un `customerid`
seul ne prouve pas l'identité et n'est plus accepté ; un jeton absent, invalide ou expiré
renvoie `98 Authentication Failed`. La session fixe à la fois l'identité et le client, sans
transporter l'identifiant client (non secret).

## Mots de passe client

- **Activation à l'inscription :** `/customer/signup/` envoie un code au contact enregistré ;
  `/customer/otp/verify/` le vérifie et active le compte. Aucun jeton n'est renvoyé — appelez
  `/customer/login/` pour obtenir un `sessiontoken`.
- **Changement (connecté) :** `/customer/changepassword/` avec `sessiontoken` (ou `customerid`)
  + `oldpassword` + `newpassword`.
- **Oublié :** `/customer/forgotpassword/` envoie par e-mail un **code à 6 chiffres** (valide
  **10 minutes**, **5 tentatives max**) et renvoie toujours `00` (aucune divulgation de
  l'existence du compte) ; `/customer/resetpassword/` prend `{email, otp, newpassword}` et
  définit le nouveau mot de passe en une étape.

## Liens d'instantanés

Les images de preuve de livraison ne se récupèrent **pas** avec une clé. `/parcel/snapshots/`
(clé d'application) renvoie, par instantané, une **`snapshoturl` signée HMAC-SHA256 et
expirante** (`/parcel/snapshot/image/?snapshotid=…&expires=…&sig=…`). Le `sig` porte sur
`snapshotid|expires`, avec un secret serveur, et le lien expire après **30 jours**. Le point
d'image n'accepte **que** ce lien signé — il n'y a pas de récupération par `apikey`, donc une
clé d'application ne peut pas énumérer les preuves par identifiant. Une entreprise peut lister
les instantanés de **ses propres** colis avec sa **clé publique** sur
`/business/parcels/snapshots/` (contrôle de propriété), qui renvoie les mêmes liens signés.

## Idempotence

Les points de création (`business/parcels/create`, `customer/parcels/new`, `pay/initialize`,
`kiosk/parcel/appless/reserve`, et d'autres) acceptent un en-tête **`Idempotency-Key`**
facultatif. Répétez le même appel avec la même clé : le serveur renvoie la première réponse
au lieu de créer un second colis/casier/débit. Utilisez un UUID neuf par opération logique.

## Points à double authentification

`/pay/initialize`, `/pay/verify`, `/pay/status` **et `/customer/parcels/hold/`** acceptent
**soit** :

- une **clé secrète d'entreprise** (B2B), soit
- une **clé d'application** avec un `customerid` facultatif (B2C).

Le backend résout la clé automatiquement (clé secrète d'abord, puis clé d'application). En B2C,
le paiement est attribué à l'application (et au client si fourni) ; en B2B, à l'entreprise.
`/customer/parcels/hold/` est le paiement d'abord : il renvoie une `reference` Paystack,
`authorizationurl` et `accesscode` comme `/pay/initialize/`, et la référence est **vérifiée**
(jamais présumée) via `/pay/verify/`, `/pay/return/` ou le webhook.

:::note Authentification `business`, précisément
- Les **lectures `business`** utilisent la clé **publique** ; les **écritures `business`**
  (`parcels/create`, `parcels/cancel`, `parcels/retrieve`, `wallettransaction/new`) utilisent
  la clé **secrète**.
- `/business/boxes/info/` est **limité à l'entreprise** : il ne renvoie une boîte que si elle
  lui est affectée (`BUS_BusinessBoxes`). La recherche de n'importe quelle boîte par le
  propriétaire est `/core/boxes/info/` avec la clé d'application.
- Reliquat connu : les procédures d'authentification d'entreprise résolvent le contexte
  d'application via une clé d'application **codée en dur**. Inoffensif aujourd'hui (les points
  utilisent le réseau de l'entreprise), à nettoyer.
:::

## Webhook Paystack

`POST /pay/webhook/paystack/` n'est **pas** authentifié par `apikey`. Paystack signe le
corps brut en **HMAC-SHA512** avec la clé secrète ; la signature est envoyée dans
l'en-tête `x-paystack-signature`. Voir [Webhook Paystack](./guides/webhook).

## Chemins et en-têtes

- Chaque chemin se termine par un **slash final** (`POST /core/states/list/`).
- Envoyez **`Content-Type: application/json`** ; le serveur répond avec
  `Content-Type: application/json`.
- Un `GET` sur une route `POST` renvoie **HTTP 405**. Seules trois routes sont `GET`
  (`/pay/return/`, `/parcel/snapshot/image/`, `/customer/cards/add/complete/`).
- Un `User-Agent` de navigateur est exigé par la périphérie ; les clients serveur à serveur
  doivent envoyer un `User-Agent` normal (voir [Réponses et erreurs](./response-and-errors)).
