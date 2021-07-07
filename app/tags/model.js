const mongoose = require("mongoose");

const { model, Schema } = mongoose;

const tagsSchema = new Schema(
  {
    name: {
      type: String,
      minlength: [3, "Panjang nama kategori minimal 3 karakter"],
      maxLength: [20, "Panjang nama kategori maksimal 20 karakter"],
      required: [true, "Nama kategori harus diisi"],
    },
  },
  { timestamps: true }
);

module.exports = model("Tag", tagsSchema);
