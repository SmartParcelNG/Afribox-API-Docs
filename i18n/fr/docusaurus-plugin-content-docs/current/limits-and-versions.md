---
id: limits-and-versions
title: Limites, versions et changelog
sidebar_position: 4
---

# Limites, versions et changelog

## Versions

- La version de l'API est dans le chemin : **`/v2`**.
- Le contrat OpenAPI est servi à `https://smartparcelng.github.io/Afribox-API-Docs/openapi.json`
  et à une adresse versionnée, `…/openapi-2.0.0.json`. Importez-le dans vos outils et
  comparez-le entre les versions.
- Les changements additifs (nouveaux points, nouveaux champs facultatifs) peuvent sortir sans
  préavis. Les changements cassants (suppression/renommage d'un champ, changement de sens)
  sont annoncés ici et, dans la mesure du possible, l'ancien nom est conservé le temps d'une
  transition.

## Limites

- Il n'y a actuellement **aucun quota ni limite de débit publiés**, ni en-tête `Retry-After`.
  Traitez l'API comme best-effort et rendez les nouvelles tentatives idempotentes (voir
  [Idempotence](./authentication#idempotence)).
- La latence est variable ; réglez des délais généreux et **rejouez les créations avec un
  `Idempotency-Key`** pour qu'une reprise ne duplique ni colis ni débit.
- Les listes grandissent avec l'usage. Utilisez `page`/`pagesize` (lorsque disponibles) et le
  `total` de l'enveloppe.

## Observabilité

- Il n'y a pas encore de champ de corrélation. Si vous en avez besoin, envoyez un en-tête
  `X-Request-Id` et citez-le (avec l'horodatage UTC et le point d'accès) dans vos demandes.

## Changelog

### 2026-09-28

- **Vide ou erreur :** chaque point d'accès de **liste** renvoie désormais `00` avec un tableau
  vide (`[]`) lorsque la requête est valide et le résultat vide ; les points de **détail**
  renvoient `07` (introuvable) pour une ressource absente. `99` est réservé à un échec
  inattendu.
- **Nouvelles significations** pour `05`–`11` (voir *Réponses et erreurs*) : `04` champ
  manquant, `05` valeur invalide, `06` valeur non autorisée, `07` introuvable, `08` conflit,
  `09` refus métier, `10` solde insuffisant, `11` réservé.
- **Chaque réponse porte désormais `errorcode`, `errorfield` et `retryable`** — un identifiant
  stable et indépendant de la langue, le champ concerné, et si une nouvelle tentative peut
  aider.
- Les refus métier ne sont plus `99` : « Payment already used » → `09` +
  `errorcode PAYMENT_ALREADY_USED` ; aucun casier disponible → `09 LOCKER_NOT_AVAILABLE` ;
  solde insuffisant → `10 INSUFFICIENT_BALANCE` ; crédit entreprise → `09 CREDIT_ADMIN_ONLY`.
- Validation des écritures de portefeuille normalisée (`04` manquant, `05`/`06` invalide).

### 2026-09-27

- **NIPOST supprimé** (type de demande 5 et ses procédures/tables/vues héritées) ; il n'opère
  pas en Côte d'Ivoire.
- `/customer/parcels/new/` n'accepte désormais que `requesttypeid` **1, 2 ou 3** (les autres
  sont refusés).
- `/business/parcels/create/` est documenté comme fixé au type de demande **6**.
- `/business/draft/parceltypes/` et `/business/draft/deliveryareas/` sont **obsolètes** ;
  utilisez `/core/requesttypes/list/` et `/core/deliveryareas/list/`.
- Les libellés des types de demande sont servis sans espaces superflus (plus de CRLF).

### 2026-09-26

- Écritures de portefeuille : `createdby` est désormais **facultatif** (`SYS_Users.UserID`
  numérique ; défaut : utilisateur principal de l'entreprise) ; `wallettransactiontypeid` et
  `walletfundmodeid` sont validés avec des erreurs de champ claires ; **Credit réservé à
  l'admin** sur `/business/wallettransaction/new/`.
- Ajout de `/business/users/list/` (utilisateurs du personnel, pour découvrir `createdby`).
- `/parcel/snapshots/` est désormais trié par `DateCreated` puis `SnapshotSequence`
  (séquence 1 avant 2 au sein d'un événement) ; `snapshotevent`/`snapshotsequence` documentés
  sur la page des listes de référence.
- Barème des frais de réservation (appless) publié par taille, en vigueur le **23 septembre
  2026** : Petit 500, Moyen 750, Grand 1250, XGrand 2000 (remplace le barème 250/600/1000).
  Les types de demande **4 et 6** le renvoient tous deux ; `/core/fees/compute/` et
  `/core/sizes/fees/` ne renvoient plus d'erreur pour le type 4.
- Le refus pour solde insuffisant de `/business/parcels/create/` porte désormais
  `errorcode: "INSUFFICIENT_BALANCE"`.
- Les colis créés en attente de dépôt expirent désormais après **72 h** (configurable) ;
  l'échéance est renvoyée dans `expiresat` sur `/business/parcels/create/` et
  `/customer/parcels/new/`. Un balayage d'expiration les passe au statut de colis **8
  (Reservation expired)**, libère le casier et perd les frais ; l'annulation avant l'échéance
  rembourse toujours.

### 2026-09-25

- Le vocabulaire des statuts de colis inclut désormais **7 — Dispatch collected parcel from
  locker** ; `parcelstatus` sur les réponses de colis n'est jamais vide (repli sur
  `"Status <id>"`).
- Ajout de `/core/lockerstatuses/list/` (1 Vacant, 2 Reserved, 3 Occupied).
- `transactionstatus` documenté comme vocabulaire fermé (`initialized` + les 8 statuts Paystack)
  avec valeurs terminales/non terminales et consignes de sondage.
- `transactions[].type` déclaré `Credit`/`Debit` (ensemble complet).
- Nouvelle page **Listes de référence** énumérant chaque vocabulaire fermé.

### 2026-09-24

- Prise en charge de `Idempotency-Key` sur les points de création.
- `POST /customer/login/` renvoie désormais un `sessiontoken` révocable ; les points de lecture
  `customer` l'acceptent à la place de `customerid`.
- Les résultats vides renvoient désormais `00` avec `[]` (ni `99` ni `null`) sur les listes de
  colis, de transactions et de cartes.
- `page`/`pagesize`/`total` facultatifs ajoutés aux listes de colis et de transactions.
- Ajout de `/core/parcelstatuses/list/`, `/core/wallettransactiontypes/list/`,
  `/core/walletfundmodes/list/`, `/core/billingtypes/list/`, `/business/parcels/search/`,
  `/customer/parcels/cancel/`.
- `boxid` renvoyé sur les réponses de colis ; `lockers[]` et date/réseau/en ligne de la boîte
  ajoutés à `/core/boxes/info/` ; `lockersizes` (minuscule) ajouté à côté de `lockerSizes`.
- Les écritures `business` (`cancel`, `retrieve`, `wallettransaction/new`) exigent désormais la
  clé secrète ; `/admin/*` exige une clé d'administration dédiée.
