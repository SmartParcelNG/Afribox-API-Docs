---
id: response-and-errors
title: Réponses et erreurs
sidebar_position: 3
---

# Réponses et erreurs

L'API renvoie toujours **HTTP 200** pour les points JSON. Le résultat est dans le corps.

```json
{
  "statuscode": "00",
  "statusmessage": "Successful",
  "parcel": { "...": "données" }
}
```

## Codes de statut courants

| `statuscode` | Signification |
| --- | --- |
| `00` | Succès |
| `01` | Aucune donnée POST |
| `02` | Données POST invalides (erreur JSON) |
| `03` | Données POST nulles |
| `04` | Champ manquant (voir `statusmessage`) |
| `05`–`11` | Erreurs de validation (par champ) |
| `98` | Échec d'authentification |
| `99` | Erreur générique |

## Conventions

- Les montants et identifiants sont des chaînes (ex. `"grandtotal": "1000"`).
- La devise est le **XOF** ; les montants envoyés à Paystack sont multipliés par 100
  en interne.
- `statusmessage` est lisible par un humain.

:::tip
Vérifiez toujours `statuscode === "00"` avant d'utiliser la réponse.
:::
