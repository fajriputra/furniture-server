const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const cartItemSchema = Schema({
  name: {
    type: String,
    required: [true, "Product is required"],
    minlength: [3, "Product must be at least 3 characters"],
    maxlength: [16, "Product already exceeds 16 characters"],
  },

  qty: {
    type: Number,
    required: [true, "Qty is required"],
    min: [1, "Minimum qty is 1"],
  },

  price: {
    type: Number,
    default: 0,
  },

  image_url: String,

  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
  },
});

module.exports = model("CartItem", cartItemSchema);
