const mongoose = require("mongoose");
const Order = require("./model");
const OrderItem = require("../order-item/model");
const CartItem = require("../cart-item/model");
const DeliveryAddress = require("../delivery-address/model");
const { policyFor } = require("../policy");
// const { subject } = require("@casl/ability");

module.exports = {
  createOrder: async (req, res, next) => {
    let policy = policyFor(req.user);

    if (!policy.can("create", "Create")) {
      return res.json({
        error: 1,
        message: "You're not allowed to perform this action",
      });
    }

    try {
      let { delivery_fee, delivery_address } = req.body;

      // dapatkan items di cart
      let items = await CartItem.find({ user: req.user._id }).populate(
        "product"
      );

      if (!items.length) {
        return res.json({
          error: 1,
          message: "You don't have an order yet. Let's order now!",
        });
      }

      let address = await DeliveryAddress.findOne({ _id: delivery_address });

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

      await order.save();

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

    if (!policy.can("view", "Order")) {
      return res.json({
        error: 1,
        message: "You're not allowed to perform this action.",
      });
    }

    try {
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
