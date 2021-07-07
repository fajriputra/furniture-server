const mongoose = require("mongoose");
const { model, Schema } = mongoose;
const AutoIncrement = require("mongoose-sequence")(mongoose);

const Invoice = require("../invoice/model");

const orderSchema = Schema(
  {
    status: {
      type: String,
      enum: ["waiting_payment", "processing", "in_delivery", "delivered"],
      default: "waiting_payment",
    },

    delivery_fee: {
      type: Number,
      default: 0,
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

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    order_items: [{ type: Schema.Types.ObjectId, ref: "OrderItem" }],
  },
  { timestamps: true }
);

orderSchema.plugin(AutoIncrement, { inc_field: "order_number" });

// fungsi untuk menghitung jumlah pesanan
orderSchema.virtual("items_count").get(function () {
  return this.order_items.reduce((total, item) => {
    return total + parseInt(item.qty);
  }, 0);
});

orderSchema.post("save", async () => {
  let sub_total = this.order_items.reduce(
    (sum, item) => (sum += item.price * item.qty),
    0
  );

  // (1) buat objek `invoice` baru
  let invoice = new Invoice({
    user: this.user,
    order: this._id,
    sub_total: sub_total,
    delivery_fee: parseInt(this.delivery_fee),
    total: parseInt(sub_total + this.delivery_fee),
    delivery_address: this.delivery_address,
  });

  // (2) simpan ke MongoDB
  await invoice.save();
});

module.exports = model("Order", orderSchema);
