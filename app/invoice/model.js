const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const invoiceSchema = Schema(
  {
    sub_total: {
      type: Number,
      required: [true, "sub_total must be filled"],
    },

    delivery_fee: {
      type: Number,
      required: [true, "delivery_fee must be filled"],
    },

    delivery_address: {
      provinsi: { type: String, required: [true, "provinsi must be filled."] },
      kabupaten: {
        type: String,
        required: [true, "kabupaten must be filled."],
      },
      kecamatan: {
        type: String,
        required: [true, "kecamatan must be filled."],
      },
      kelurahan: {
        type: String,
        required: [true, "kelurahan must be filled."],
      },
      detail: { type: String },
    },

    total: {
      type: Number,
      required: [true, "total must be filled"],
    },

    payment_status: {
      type: String,
      enum: ["waiting_payment", "paid"],
      default: "waiting_payment",
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  { timestamps: true }
);

module.exports = model("Invoice", invoiceSchema);
