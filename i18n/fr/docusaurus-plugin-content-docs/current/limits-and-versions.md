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
