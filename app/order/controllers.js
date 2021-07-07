const mongoose = require("mongoose");
const Order = require("./model");
const OrderItem = require("../order-item/model");
const CartItem = require("../cart-item/model");
const DeliveryAddress = require("../delivery-address/model");
const { policyFor } = require("../policy");
// const { subject } = require("@casl/ability");

module.exports = {
  createOrder: async (req, res, next) => {
    // dapatkan policy user yang sedang login
    let policy = policyFor(req.user);

    // cek apakah policy mengijinkan user untuk membuat order
    if (!policy.can("create", "Create")) {
      return res.json({
        error: 1,
        message: "You're not allowed to perform this action",
      });
    }

    try {
      // dapatkan delivery_fee dan delivery_address dari client
      let { delivery_fee, delivery_address } = req.body;

      // dapatkan items di cart
      let items = await CartItem.find({ user: req.user._id }).populate(
        "product" //mengambil data produk dari masing2 items
      );

      // cek apakah cart kosong?
      if (!items.length) {
        return res.json({
          error: 1,
          message: "You don't have an order yet. Let's order now!",
        });
      }

      // melakukan pencarian alamat berdasarkan id si alamat
      let address = await DeliveryAddress.findOne({ _id: delivery_address });

      /* buat order tapi tidak di simpan, gunakan mongoose.Types.Object() untuk generate id dan menyimpan ref nya. */
      let order = new Order({
        _id: new mongoose.Types.Object(),
        status: "waiting_payment",
        delivery_fee,
        delivery_address: {
          provinsi: address.provinsi,
          kabupaten: address.kabupaten,
          kecamatan: address.kecamatan,
          kelurahan: address.kelurahan,
          detail: address.detail,
        },
        user: req.user._id,
      });

      // membuat item
      let orderItems = await OrderItem.insertMany(
        items.map((item) => ({
          ...item,
          name: item.product.name,
          qty: parseInt(item.qty),
          price: parseInt(item.product.price),
          order: order._id,
          product: item.product._id,
        }))
      );

      orderItems.forEach((item) => order.order_items.push(item));

      // menyimpan order di MongoDB
      await order.save();

      // hapus semua pesanan dalam cart setelah melakukan order
      await CartItem.deleteMany({ user: req.user._id });

      return res.json(order);
    } catch (err) {
      if (err && err.name == "ValidationError") {
        return res.json({
          error: 1,
          message: err.message,
          fields: err.errors,
        });
      }
      next(err);
    }
  },
  listOrder: async (req, res, next) => {
    let policy = policyFor(req.user);

    // cek apakah policy mengijinkan user untuk melihat order
    if (!policy.can("view", "Order")) {
      return res.json({
        error: 1,
        message: "You're not allowed to perform this action.",
      });
    }

    try {
      // melakukan limit & skip dari query string
      let { limit = 10, skip = 0 } = req.query;

      let count = await Order.find({ user: req.user._id }).countDocuments();

      let orders = await Order.find({ user: req.user._id })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate("order_items")
        .sort("-createdAt");

      return res.json({
        data: orders.map((order) => order.toJSON({ virtuals: true })),
        count,
      });
    } catch (err) {
      if (err && err.name == "ValidationError") {
        return res.json({
          error: 1,
          message: err.message,
          fields: err.erros,
        });
      }

      next(err);
    }
  },
};
