const mongoose = require("mongoose");

const { model, Schema } = mongoose;

const productSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "Product is required"],
      minlength: [3, "Product must be at least 3 characters"],
      maxlength: [16, "Product already exceeds 16 characters"],
    },

    description: {
      type: String,
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [1000, "Minimum price is 1000"],
    },

    image_url: String,

    category: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

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
