---
id: paystack-b2b
title: Paystack — B2B (partenaires)
sidebar_position: 1
---

# Paiements Paystack — B2B (partenaires)

Les applications d'entreprises/partenaires collectent les paiements via l'API Paystack partagée.

## 1. Initialiser

`POST /pay/initialize` avec la **clé secrète d'entreprise**.

```json
{
  "apikey": "<CléSecrèteEntreprise>",
  "email": "payeur@exemple.com",
  "phone": "+225...",
  "amount": "5000",
  "currency": "XOF",
  "reference": "ref-unique-facultative",
  "callbackurl": "https://partenaire.exemple/complete",
  "flowtype": "web",
  "metadata": {
    "fulfil": "wallet",
    "narration": "Rechargement du portefeuille",
    "parcelreference": "PRN123"
  }
}
```

Réponse (`00`) : `reference`, `authorizationurl` (paiement hébergé), `accesscode`.

### Traitement (piloté par les métadonnées)

| metadata | Effet en cas de succès |
| --- | --- |
| `fulfil: "wallet"` | Crédite le portefeuille de l'entreprise |
| `parcelreference` | Marque le colis comme payé |
| (aucun) | Enregistrement uniquement |

## 2. Vérifier

Après paiement, appelez `POST /pay/verify`
`{ "apikey": "<CléSecrèteEntreprise>", "reference": "<ref>" }`.
Le traitement s'exécute **une seule fois** (idempotent) ; un succès enregistré n'est
jamais rétrogradé.

## 3. Webhook

Enregistrez `https://afriboxapi.smartparcel.ng/v2/pay/webhook/paystack/` dans le
tableau de bord Paystack. Il confirme/exécute le traitement de manière fiable en arrière-plan.
