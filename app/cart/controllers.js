const CartItem = require("./cart-item/model");
const Product = require("../products/model");
const { policyFor } = require("../policy");

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
      const { items } = req.body;

      // ambil _id dari masing2 item product
      const productsId = items.map((item) => item.product._id);

      // cari data product ke database
      const products = await Product.find({ _id: { $in: productsId } });

      // data cartItems
      const cartItems = items.map((item) => {
        /* cari related product dari products berdasarkan
          id product & cek sama atau tidak dengan id dari item product yang ditambahkan */
        const relatedProduct = products.find(
          (product) => product._id.toString() === item.product._id
        );

        // buat objek yang memuat informasi untuk disimpan sebagai CartItem
        return {
          product: relatedProduct._id,
          price: relatedProduct.price,
          image_url: relatedProduct.image_url,
          name: relatedProduct.name,
          user: req.user._id,
          qty: item.qty,
        };
      });

      // lakukan update ke collections cartItems secara bulk/serentak
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

      // respon data ke client
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
    const policy = policyFor(req.user);

    if (!policy.can("read", "Cart")) {
      return res.json({
        error: 1,
        message: `You're not allowed to perform this action`,
      });
    }

    try {
      // cari items cart berdasarkan user yang sedang login
      const items = await CartItem.find({ user: req.user._id }).populate(
        "product" // mengambil data product terkait cart
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
