const mongoose = require("mongoose");

const { model, Schema } = mongoose;

const tagsSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "Tag is required"],
      minlength: [3, "Tag must be at least 3 characters"],
      maxlength: [20, "Tag already exceeds 32 characters"],
    },
  },
  { timestamps: true }
);

module.exports = model("Tag", tagsSchema);
