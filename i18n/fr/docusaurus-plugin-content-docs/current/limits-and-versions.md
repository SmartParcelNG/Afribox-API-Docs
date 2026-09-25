---
id: limits-and-versions
title: Limites, versions et changelog
sidebar_position: 4
---

# Limites, versions et changelog

## Versions

- La version de l'API est dans le chemin : **`/v2`**, que nous maintenons pendant plusieurs
  années.
- Le contrat est versionné en **SemVer** (`2.MINOR.PATCH`) ; `info.version` est **incrémenté à
  chaque entrée de changelog ci-dessous**, et chaque version est archivée de façon immuable à
  `…/openapi-<version>.json` (p. ex. `openapi-2.1.0.json`) tandis que `…/openapi.json` est
  toujours la version courante — comparez deux relevés ou épinglez-en un.
- Les changements **additifs** (nouveaux points, nouveaux champs facultatifs) peuvent sortir à
  tout moment **sans préavis** ; ignorez les champs que vous ne connaissez pas.
- Les changements **cassants** (suppression, renommage ou changement de type d'un champ, ou de
  son sens) sont annoncés dans le changelog ci-dessous et marqués `deprecated` dans la
  spécification, et **l'ancien nom continue de fonctionner au moins 90 jours** — les deux sont
  servis pendant la fenêtre lorsque c'est possible. Rien n'est retiré avant la fin de la
  fenêtre.
- La spécification est générée **au push** depuis le backend : le contrat ne peut donc pas
  changer entre deux versions sans une entrée de changelog.

## Limites

- **Quota par clé.** Chaque clé d'API est limitée à **600 requêtes / minute** (clés
  d'application et de casier : **900**), sur des fenêtres fixes de 60 secondes. Le dépassement
  renvoie **HTTP 429** avec `errorcode RATE_LIMITED` et `retryable: "True"`.
- Chaque réponse porte `X-RateLimit-Limit`, `X-RateLimit-Remaining` et `X-RateLimit-Reset`
  (epoch UTC en secondes) ; un `429` porte aussi `Retry-After` (secondes).
- Aucun autre quota. La latence est variable ; réglez des délais généreux et **rejouez les
  créations avec un `Idempotency-Key`** pour qu'une reprise ne duplique ni colis ni débit (voir
  [Idempotence](./authentication#idempotence)).
- Les listes grandissent avec l'usage. Utilisez `page`/`pagesize` (lorsque disponibles) et le
  `total` de l'enveloppe.

## Observabilité

- Il n'y a pas encore de champ de corrélation. Si vous en avez besoin, envoyez un en-tête
  `X-Request-Id` et citez-le (avec l'horodatage UTC et le point d'accès) dans vos demandes.

## Changelog

### 2026-10-08

- **Cartes enregistrées documentées :** ajouter une carte (`/customer/cards/add/`) est une
  **vérification de carte de 1 XOF** qui la tokenise (`metadata.purpose="AddCard"`) — cela **ne
  débite pas**. Un client peut conserver **3** cartes ; le `token` Paystack n'est **jamais
  renvoyé** (les réponses de cartes portent uniquement `first6digits`, `last4digits`, `type`,
  `expiry`, `isdefault`). Voir *Authentification* → **Cartes enregistrées**.

### 2026-10-07

- **`dispatch` clarifié :** il existe dans le backend mais **ne fait pas encore partie de ce
  contrat** — la livraison par dispatch sera intégrée plus tard par Afribox, et l'API commence
  par le **dépôt/retrait** pour limiter le périmètre au lancement. L'introduction ne le liste
  plus comme domaine et l'indique désormais explicitement.

### 2026-10-06

- **Métadonnées de paiement et `flowtype` documentés.** `flowtype` est un champ de **niveau
  supérieur** de `/pay/initialize/` (recopié dans `metadata.flow`) ; les clés de contexte du flux
  appless sont `boxid`, `sizeid`, `boxlockernumber` (**facultatives**). Une nouvelle section
  *Métadonnées de paiement et `flowtype`* dans *Listes de référence* recense chaque clé
  `metadata` traitée par le serveur (`parcelreference`, `fulfil`, `holdtoken`, `returnurl`,
  `narration`).

### 2026-10-05

- **Les colis de type 6 n'ont plus qu'un seul débit, à l'avance.** Les frais de réservation
  débités à `/business/parcels/create/` sont le **seul** débit ; les frais de durée facturés à
  la collecte (`FEE_BusinessFees` libre/forfait/horaire, narration « Parcel … stayed in locker
  for … ») ont été retirés de `/kiosk/parcel/collect/` (`SQL/AfriboxFixParcelCollectFee.sql`).
  La collecte passe toujours le colis au statut 4 et libère le casier, mais ne débite plus le
  portefeuille. Les types 2/3 (et les autres) sont inchangés — ils facturent au premier
  paiement du client.

### 2026-10-04

- **`/business/parcels/retrieve/` documenté et corrigé :** c'est une **demande de
  récupération** (clé secrète) — elle ne change pas le statut du colis, ne libère **pas** le
  casier et ne rembourse **pas** les frais, et elle est **sans retour arrière**. Elle
  **renvoie désormais le colis** (même contrat que `/business/parcels/info/`, avec le vrai
  `collectcode`), et un colis non récupérable est refusé avec `09 PARCEL_NOT_RETRIEVABLE`. La
  récupération (statut 4, `RetrieveCompleted=1`, casier libéré) s'achève au casier avec le
  `collectcode` du colis.

### 2026-10-03

- **Documentation d'authentification clarifiée :** la page liste désormais **les quatre**
  points à double authentification (`/pay/initialize/`, `/pay/verify/`, `/pay/status/`,
  `/customer/parcels/hold/`), indique que les lectures `business` utilisent la clé **publique**
  et les écritures la clé **secrète**, précise que `/business/boxes/info/` est **limité à
  l'entreprise**, et consigne le contexte d'application codé en dur dans les procédures
  d'authentification d'entreprise comme reliquat connu.

### 2026-10-02

- **Cas limites du transport :** un chemin inconnu renvoie désormais l'enveloppe JSON avec
  **HTTP 404** au lieu d'une page HTML, et un `GET` sur un chemin inconnu est un `404` (seule
  une route `POST` existante répond `405`). Le webhook Paystack renvoie l'enveloppe en cas de
  signature invalide. Confirmé en direct : `Content-Type` JSON, `Strict-Transport-Security`,
  CORS, **port 80 → 301 HTTPS**, aucun `User-Agent` de navigateur requis, et `X-RateLimit-*`
  sur chaque réponse.

### 2026-10-01

- **Quota par clé et en-têtes de limite.** Chaque clé d'API est limitée à **600 requêtes /
  minute** (clés d'application et de casier : **900**), sur des fenêtres fixes de 60 secondes ;
  le dépassement renvoie **HTTP 429** avec `errorcode RATE_LIMITED`. Chaque réponse porte
  désormais `X-RateLimit-Limit`, `X-RateLimit-Remaining` et `X-RateLimit-Reset`, et un `429`
  porte aussi `Retry-After`.
- **Politique de version publiée :** SemVer (`2.MINOR.PATCH`) incrémenté à chaque version, avec
  des archives immuables (`openapi-<version>.json`) ; les changements additifs sortent sans
  préavis, les changements cassants portent un marqueur `deprecated` et une fenêtre de double
  service de **90 jours**. La spécification est générée uniquement au push.

### 2026-09-30

- **La réinitialisation du mot de passe client se fait désormais par un code à usage unique
  envoyé par e-mail.** `/customer/forgotpassword/` envoie un **code à 6 chiffres** (expiration
  10 minutes, 5 tentatives max) et renvoie toujours `00` — l'ancien `99 « Email not found »`
  disparaît (aucune divulgation de l'existence du compte). L'ancien comportement qui envoyait un
  **mot de passe en clair** est supprimé.
- **Changement incompatible :** `/customer/resetpassword/` prend désormais
  `{email, otp, newpassword}` — `oldpassword` est **retiré** ; utilisez
  `/customer/changepassword/` pour changer un mot de passe connu en étant connecté.
- `/customer/otp/verify/` reste l'**activation d'inscription** (sans jeton) — connectez-vous via
  `/customer/login/` pour un `sessiontoken`. Le même flux s'applique aux points dispatch.

### 2026-09-29

- **Identité des instantanés au casier :** sur `/kiosk/parcel/snapshot/`, `parceldetailid` est
  **autoritaire** — le serveur vérifie désormais que `parcelid`, `parcelreferencenumber`,
  `boxid` et `boxlockernumber` concordent (`09 PARCEL_IDENTIFIERS_MISMATCH` en cas de
  discordance, `07` si le colis est inconnu), et rejouer le même `(parceldetailid,
  snapshotevent, snapshotsequence)` est **idempotent** (une clé unique empêche les doublons).

- **Les images d'instantanés se servent uniquement via un lien signé.**
  `/parcel/snapshot/image/` n'accepte plus que le lien signé HMAC et expirant
  (`?snapshotid=…&expires=…&sig=…`, expiration réduite à **30 jours**) ; la récupération par
  `apikey`/POST a été retirée, donc une clé d'application ne peut plus énumérer les preuves par
  identifiant, et le schéma `SnapshotFetch` devenu inutile a été supprimé. Les erreurs sont
  renvoyées en `application/json`.
- **Ajout de `/business/parcels/snapshots/`** — une entreprise liste les instantanés de **ses
  propres** colis avec sa **clé publique** (contrôle de propriété), avec les mêmes
  `snapshoturl` signées.
- Le secret de signature des instantanés a été **renouvelé**.
- **Durcissement de la clé publique d'entreprise :** les codes d'ouverture de casier
  (`dropcode`/`collectcode`) sont désormais masqués en `"****"` aussi sur
  `/business/parcels/info/` et `/business/parcels/info/all/` (ils l'étaient déjà sur les cinq
  listes). Les vrais codes ne reviennent que sous la **clé secrète**. La clé publique reste
  réservée au côté serveur.
- **`/core/parcels/search/`** (clé d'application) ne renvoie plus les coordonnées
  destinataire/expéditeur — elles sont masquées ; seuls les champs de suivi sont renvoyés.
- **Les lectures client exigent désormais `sessiontoken` :** `/customer/parcels/*` (et lectures
  associées) n'acceptent plus un `customerid` seul ; un jeton absent/invalide renvoie
  `98 Authentication Failed`. Cela ferme la faille « n'importe qui avec un identifiant client
  (non secret) peut lire codes/OTP/données personnelles ».
- **Corrections `x-readonly` :** `/business/pendingdropoffs/` et `/parcel/snapshots/` sont des
  **lectures** (ce sont des listes) et `/kiosk/ping/` est une **écriture** (il enregistre le
  ping). Ils sont désormais triés dans la bonne barre latérale, et la console interactive n'est
  activée que là où c'est sûr.
- **Variation de forme `boxes` / `fees` documentée** comme stable et intentionnelle : `boxes`
  est un tableau sur les listes de boîtes mais une chaîne (nombre) sur `/business/dashboard/` ;
  `fees` est un objet sur `/core/fees/compute/`, un tableau sur les autres points
  `/core/fees/*`, et une chaîne sur `/core/sizes/fees/` et `/pay/verify/`. Aucun renommage.

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
