import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "fr/docusaurus-plugin-content-docs/current/api/write/afribox-api",
    },
    {
      type: "category",
      label: "core",
      link: {
        type: "doc",
        id: "fr/docusaurus-plugin-content-docs/current/api/write/core",
      },
      items: [
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-core-wallettransactiontypes-list",
          label: "Lister les types de transaction du portefeuille",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "customer",
      link: {
        type: "doc",
        id: "fr/docusaurus-plugin-content-docs/current/api/write/customer",
      },
      items: [
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-customer-cards-add",
          label: "Ajouter une carte",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-customer-cards-delete",
          label: "Supprimer une carte",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-customer-cards-setdefault",
          label: "Définir la carte par défaut",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-customer-changepassword",
          label: "Changer le mot de passe",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-customer-edit",
          label: "Modifier le profil",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-customer-forgotpassword",
          label: "Démarrer une réinitialisation de mot de passe",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-customer-login",
          label: "Connexion",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-customer-otp-resend",
          label: "Renvoyer l'OTP",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-customer-otp-verify",
          label: "Vérifier le code d'inscription",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-customer-parcels-cancel",
          label: "Annuler un colis du client",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-customer-parcels-hold",
          label: "Mettre un colis en attente (paiement Paystack)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-customer-parcels-hold-release",
          label: "Lever la mise en attente",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-customer-parcels-new",
          label: "Créer un colis client",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-customer-resetpassword",
          label: "Terminer une réinitialisation de mot de passe",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-customer-signup",
          label: "Inscription",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-customer-support",
          label: "Assistance",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/get-customer-cards-add-complete",
          label: "Retour d'ajout de carte (navigateur)",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "business",
      link: {
        type: "doc",
        id: "fr/docusaurus-plugin-content-docs/current/api/write/business",
      },
      items: [
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-business-parcels-cancel",
          label: "Annuler un colis",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-business-parcels-create",
          label: "Créer un colis d'entreprise",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-business-parcels-retrieve",
          label: "Récupérer un colis",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-business-wallettransaction-new",
          label: "Créer une écriture de portefeuille pour l'entreprise",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "kiosk",
      link: {
        type: "doc",
        id: "fr/docusaurus-plugin-content-docs/current/api/write/kiosk",
      },
      items: [
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-kiosk-parcel-appless-reserve",
          label: "Réserver un casier (appless)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-kiosk-parcel-appless-verify",
          label: "Vérifier la disponibilité et le tarif (appless)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-kiosk-parcel-collect",
          label: "Retrait de colis",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-kiosk-parcel-drop",
          label: "Dépôt de colis",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-kiosk-parcel-snapshot",
          label: "Instantané de colis",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-kiosk-ping",
          label: "Ping du casier",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-kiosk-setup",
          label: "Configuration du casier",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "pay",
      link: {
        type: "doc",
        id: "fr/docusaurus-plugin-content-docs/current/api/write/pay",
      },
      items: [
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-pay-initialize",
          label: "Initialiser un paiement Paystack",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-pay-success",
          label: "Confirmer le paiement d'un colis",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-pay-verify",
          label: "Vérifier un paiement Paystack",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/get-pay-return",
          label: "Page de retour de paiement",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-pay-webhook-paystack",
          label: "Webhook Paystack",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "admin",
      link: {
        type: "doc",
        id: "fr/docusaurus-plugin-content-docs/current/api/write/admin",
      },
      items: [
        {
          type: "doc",
          id: "fr/docusaurus-plugin-content-docs/current/api/write/post-admin-businesses-wallettransaction-new",
          label: "Créer une écriture de portefeuille pour une entreprise (admin)",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
