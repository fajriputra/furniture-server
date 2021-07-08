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
      const { items } = req.body;

      const productsId = items.map((item) => item._id);

      const products = await Product.find({ _id: { $in: productsId } });

      let cartItems = items.map((item) => {
        let relatedProduct = products.find(
          (product) => product._id.toString() === item._id
        );

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
