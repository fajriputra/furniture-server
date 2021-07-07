// (1) import package mongoose
const mongoose = require("mongoose");

// menggunakan model dan schema dari package mongoose
const { model, Schema } = mongoose;

const productSchema = Schema(
  {
    name: {
      type: String,
      minlength: [3, "Panjang nama makanan minimal 3 karakter"],
      required: [true, "Nama makanan harus diisi"],
    },

    description: {
      type: String,
    },

    price: {
      type: Number,
      default: 0,
    },

    image_url: String,

    // relation dengan Category
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    // relation one to many dengan tag
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("Product", productSchema);
