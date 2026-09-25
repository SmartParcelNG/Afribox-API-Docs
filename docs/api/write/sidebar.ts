import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "api/write/afribox-api",
    },
    {
      type: "category",
      label: "core",
      link: {
        type: "doc",
        id: "api/write/core",
      },
      items: [
        {
          type: "doc",
          id: "api/write/post-core-wallettransactiontypes-list",
          label: "Wallettransactiontypes List",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "customer",
      link: {
        type: "doc",
        id: "api/write/customer",
      },
      items: [
        {
          type: "doc",
          id: "api/write/post-customer-cards-add",
          label: "Cards Add",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-cards-delete",
          label: "Cards Delete",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-cards-setdefault",
          label: "Cards Setdefault",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-changepassword",
          label: "Customer Changepassword",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-edit",
          label: "Customer Edit",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-forgotpassword",
          label: "Start a password reset",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-login",
          label: "Log in (returns a session token)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-otp-resend",
          label: "Otp Resend",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-otp-verify",
          label: "Verify the signup code",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-parcels-cancel",
          label: "Cancel a customer parcel",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-parcels-hold",
          label: "Parcels Hold",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-parcels-hold-release",
          label: "Hold Release",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-parcels-new",
          label: "Create a customer parcel",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-resetpassword",
          label: "Complete a password reset",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-signup",
          label: "Customer Signup",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-support",
          label: "Customer Support",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/get-customer-cards-add-complete",
          label: "Card add callback (browser)",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "business",
      link: {
        type: "doc",
        id: "api/write/business",
      },
      items: [
        {
          type: "doc",
          id: "api/write/post-business-parcels-cancel",
          label: "Cancel a business parcel",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-business-parcels-create",
          label: "Create a business parcel",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-business-parcels-retrieve",
          label: "Request a dropped-off parcel's retrieval",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-business-wallettransaction-new",
          label: "Create a wallet transaction for the business",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "kiosk",
      link: {
        type: "doc",
        id: "api/write/kiosk",
      },
      items: [
        {
          type: "doc",
          id: "api/write/post-kiosk-parcel-appless-reserve",
          label: "Appless Reserve",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-kiosk-parcel-appless-verify",
          label: "Appless Verify",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-kiosk-parcel-collect",
          label: "Parcel Collect",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-kiosk-parcel-drop",
          label: "Parcel Drop",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-kiosk-parcel-snapshot",
          label: "Parcel Snapshot",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-kiosk-ping",
          label: "Box heartbeat",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-kiosk-setup",
          label: "Set up a box from its code",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "pay",
      link: {
        type: "doc",
        id: "api/write/pay",
      },
      items: [
        {
          type: "doc",
          id: "api/write/post-pay-initialize",
          label: "Initialize a Paystack payment",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-pay-success",
          label: "Confirm a parcel payment",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-pay-verify",
          label: "Verify a Paystack payment",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/get-pay-return",
          label: "Payment return / landing page",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/write/post-pay-webhook-paystack",
          label: "Paystack webhook",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "admin",
      link: {
        type: "doc",
        id: "api/write/admin",
      },
      items: [
        {
          type: "doc",
          id: "api/write/post-admin-businesses-wallettransaction-new",
          label: "Create a wallet transaction for a business (admin)",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
