const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const orderItemSchema = Schema({
  name: {
    type: String,
    required: [true, "Product is required"],
    minlength: [3, "Product must be at least 3 characters"],
    maxlength: [16, "Product already exceeds 16 characters"],
  },

  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [1000, "Minimum price is 1000"],
  },

  qty: {
    type: Number,
    required: [true, "Qty is required"],
    min: [1, "Minimum qty is 1"],
  },

  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
  },

  order: {
    type: Schema.Types.ObjectId,
    ref: "Order",
  },
});

module.exports = model("OrderItem", orderItemSchema);
