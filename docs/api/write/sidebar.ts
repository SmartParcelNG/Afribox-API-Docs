import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "api/write/afribox-api",
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
          label: "Customer cards add",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-cards-delete",
          label: "Customer cards delete",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-cards-setdefault",
          label: "Customer cards setdefault",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-changepassword",
          label: "Customer changepassword",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-edit",
          label: "Customer edit",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-forgotpassword",
          label: "Customer forgotpassword",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-login",
          label: "Customer login",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-otp-resend",
          label: "Customer otp resend",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-otp-verify",
          label: "Customer otp verify",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-parcels-cancelled",
          label: "Customer parcels cancelled",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-parcels-hold",
          label: "Customer parcels hold",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-parcels-hold-release",
          label: "Parcels hold release",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-parcels-new",
          label: "Customer parcels new",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-parcels-newrequests",
          label: "Customer parcels newrequests",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-resetpassword",
          label: "Customer resetpassword",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-signup",
          label: "Customer signup",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-customer-support",
          label: "Customer support",
          className: "api-method post",
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
          id: "api/write/post-business-cancelledparcels",
          label: "Business cancelledparcels",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-business-parcels-cancel",
          label: "Business parcels cancel",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-business-parcels-create",
          label: "Business parcels create",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-business-parcels-retrieve",
          label: "Business parcels retrieve",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-business-pendingdropoffs",
          label: "Business pendingdropoffs",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-business-retrievedparcels",
          label: "Business retrievedparcels",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-business-wallettransaction-new",
          label: "Business wallettransaction new",
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
          label: "Parcel appless reserve",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-kiosk-parcel-appless-verify",
          label: "Parcel appless verify",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-kiosk-parcel-collect",
          label: "Kiosk parcel collect",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-kiosk-parcel-drop",
          label: "Kiosk parcel drop",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-kiosk-parcel-snapshot",
          label: "Kiosk parcel snapshot",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-kiosk-setup",
          label: "Kiosk setup",
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
          label: "Pay success",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/write/post-pay-verify",
          label: "Verify a Paystack payment",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "parcel",
      link: {
        type: "doc",
        id: "api/write/parcel",
      },
      items: [
        {
          type: "doc",
          id: "api/write/post-parcel-snapshots",
          label: "Parcel snapshots",
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
          label: "Businesses wallettransaction new",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
