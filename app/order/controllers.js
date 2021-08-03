const mongoose = require("mongoose");
const Order = require("./model");
const OrderItem = require("./order-item/model");
const CartItem = require("../cart/cart-item/model");
const DeliveryAddress = require("../delivery-address/model");
const { policyFor } = require("../policy");

module.exports = {
  createOrder: async (req, res, next) => {
    const policy = policyFor(req.user);

    if (!policy.can("create", "Create")) {
      return res.json({
        error: 1,
        message: "You're not allowed to perform this action",
      });
    }

    try {
      const { delivery_fee, delivery_address } = req.body;

      // cari & ambil product dari user yang sedang login
      const items = await CartItem.find({ user: req.user._id }).populate(
        "product"
      );

      // cart kosong
      if (!items.length) {
        return res.json({
          error: 1,
          message: "You don't have an order yet. Let's order now!",
        });
      }

      // mencari data alamat berdasarkan _id dari si address
      const address = await DeliveryAddress.findOne({ _id: delivery_address });

      // buat order baru
      const order = new Order({
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

      // buat order items yang sudah didapat sebelumnya
      const orderItems = await OrderItem.insertMany(
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

      // simpan order
      await order.save();

      // clear cart dari user yang sudah melakukan order
      await CartItem.deleteMany({ user: req.user._id });

      return res.json(order);
    } catch (err) {
      if (err && err.name == "ValidationError") {
        return res.json({
          error: 1,
          message: "Failed to place order",
          fields: err.errors,
        });
      }
      next(err);
    }
  },

  listOrder: async (req, res, next) => {
    let policy = policyFor(req.user);

    if (!policy.can("view", "Order")) {
      return res.json({
        error: 1,
        message: "You're not allowed to perform this action.",
      });
    }

    try {
      // ambil limit, skip dari query
      const { limit = 10, skip = 0 } = req.query;

      // kalkulasi semua order dari user
      const count = await Order.find({ user: req.user._id }).countDocuments();

      // data orders
      const orders = await Order.find({ user: req.user._id })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate("order_items") // mengambil data order items terkait orders
        .sort("-createdAt"); // sortir berdasarkan tanggal pesanan secara desc

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
