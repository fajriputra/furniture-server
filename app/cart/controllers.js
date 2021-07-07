const CartItem = require("../cart-item/model");
const { policyFor } = require("../policy");
const Product = require("../products/model");

module.exports = {
  updateCart: async (req, res, next) => {
    const policy = policyFor(req.user);

    if (!policy.can("update", "Cart")) {
      return res.json({
        error: 1,
        message: `You're not allowed to perform this action`,
      });
    }

    try {
      // dapatkan payload items
      const { items } = req.body;

      // ekstrak _id dari masing2 items
      const productsId = items.map((item) => item._id);

      // cari data produk dan simpan sebagai products
      const products = await Product.find({ _id: { $in: productsId } });

      let cartItems = items.map((item) => {
        // cari related product dari `products` berdasarkan  `product._id` dan `item._id`
        let relatedProduct = products.find(
          (product) => product._id.toString() === item._id
        );

        // buat objek yang memuat informasi untuk disimpan sbg `CartItem`
        return {
          _id: relatedProduct._id,
          product: relatedProduct._id,
          price: relatedProduct.price,
          image_url: relatedProduct.image_url,
          name: relatedProduct.name,
          user: req.user._id,
          qty: item.qty,
        };
      });

      // update / simpan ke MongoDB semua item pada `cartItems`
      await CartItem.bulkWrite(
        cartItems.map((item) => {
          return {
            updateOne: {
              filter: { user: req.user._id, product: item.product },
              update: item,
              upsert: true,
            },
          };
        })
      );
      // response ke client
      return res.json({
        message: "Succesfully added to cart",
        data: cartItems,
      });
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

  listCart: async (req, res, next) => {
    let policy = policyFor(req.user);

    if (!policy.can("read", "Cart")) {
      return res.json({
        error: 1,
        message: `You're not allowed to perform this action`,
      });
    }

    try {
      // cari items di MongoDB berdasarkan user
      let items = await CartItem.find({ user: req.user._id }).populate(
        "product"
      );

      //   response ke client
      return res.json(items);
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
};
