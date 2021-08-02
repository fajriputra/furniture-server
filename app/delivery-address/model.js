const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const deliveryAddress = Schema(
  {
    name: {
      type: String,
      required: [true, "Address is required"],
      minlength: [3, "Address must be at least 3 characters"],
      maxlength: [255, "Address already exceeds 255 characters"],
    },

    kelurahan: {
      type: String,
      required: [true, "Kelurahan is required"],
      maxlength: [16, "Kelurahan already exceeds 16 characters"],
    },

    kecamatan: {
      type: String,
      required: [true, "Kecamatan is required"],
      maxlength: [16, "Kecamatan already exceeds 16 characters"],
    },

    kabupaten: {
      type: String,
      required: [true, "Kabupaten is required"],
      maxlength: [16, "Kabupaten already exceeds 16 characters"],
    },

    provinsi: {
      type: String,
      required: [true, "Provinsi is required"],
      maxlength: [16, "Provinsi already exceeds 16 characters"],
    },

    detail: {
      type: String,
      required: [true, "Detail of address is required"],
      minlength: [3, "Detail of address must be at least 3 characters"],
      maxlength: [1000, "Detail of address already exceeds 1000 characters"],
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = model("DeliveryAddress", deliveryAddress);
