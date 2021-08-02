const mongoose = require("mongoose");

const { model, Schema } = mongoose;

const categorySchema = Schema(
  {
    name: {
      type: String,
      required: [true, "Category is required"],
      minlength: [3, "Category must be at least 3 characters"],
      maxlength: [20, "Category already exceeds 32 characters"],
    },
  },
  { timestamps: true }
);

module.exports = model("Category", categorySchema);
