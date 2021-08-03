const fs = require("fs");
const path = require("path");
const config = require("../config");

const Product = require("./model");
const Category = require("../category/model");
const Tag = require("../tags/model");
const policyFor = require("../policy");

module.exports = {
  createProduct: async (req, res, next) => {
    try {
      // cek policy
      const policy = policyFor(req.user);

      if (!policy.can("create", "Product")) {
        return res.json({
          error: 1,
          message: "You're not allowed to perform this action",
        });
      }

      let payload = req.body;

      if (payload.category && payload.category.length) {
        let category = await Category.find({ name: { $in: payload.category } });

        if (category.length) {
          payload = { ...payload, category: category.map((ctg) => ctg._id) };
        }
      }

      if (payload.tags && payload.tags.length) {
        let tags = await Tag.find({ name: { $in: payload.tags } });

        if (tags.length) {
          payload = { ...payload, tags: tags.map((tag) => tag._id) };
        }
      }

      if (req.file) {
        let tmp_path = req.file.path;
        let originalExt =
          req.file.originalname.split(".")[
            req.file.originalname.split(".").length - 1
          ];
        let filename = req.file.filename + "." + originalExt;
        let target_path = path.resolve(
          config.rootPath,
          `public/images/${filename}`
        );

        const src = fs.createReadStream(tmp_path);
        const dest = fs.createWriteStream(target_path);
        src.pipe(dest);

        src.on("end", async () => {
          let product = new Product({ ...payload, image_url: filename });
          await product.save();
          return res.json({
            data: product,
            message: "Product successfully added",
          });
        });

        src.on("error", async () => {
          next(err);
        });
      } else {
        let product = new Product(payload);
        await product.save();
        return res.json({
          data: product,
          message: "Product successfully added",
        });
      }
    } catch (err) {
      if (err && err.name === "ValidationError") {
        return res.json({
          error: 1,
          message: "Product unsuccessful added",
          fields: err.errors,
        });
      }

      next(err);
    }
  },

  listProduct: async (req, res, next) => {
    try {
      let {
        limit = 10,
        skip = 0,
        q = "",
        category = [],
        tags = [],
      } = req.query;

      let criteria = {};

      if (q.length) {
        criteria = { ...criteria, name: { $regex: `${q}`, $options: "i" } };
      }

      if (category.length) {
        category = await Category.find({
          name: { $regex: `${category}`, $options: "i" },
        });

        criteria = {
          ...criteria,
          category: { $in: category.map((ctg) => ctg._id) },
        };
      }

      if (tags.length) {
        tags = await Tag.find({
          name: { $regex: `${tags}`, $options: "i" },
        });

        criteria = { ...criteria, tags: { $in: tags.map((tag) => tag._id) } };
      }

      let count = await Product.find(criteria).countDocuments();

      const products = await Product.find(criteria)
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate("category")
        .populate("tags");
      // .select("-__v");

      return res.json({ data: products, count });
    } catch (err) {
      next(err);
    }
  },

  updateProduct: async (req, res, next) => {
    try {
      const policy = policyFor(req.user);

      if (!policy.can("update", "Product")) {
        return res.json({
          error: 1,
          message: "You're not allowed to perform this action",
        });
      }
      let payload = req.body;

      if (payload.category && payload.category.length) {
        let category = await Category.find({ name: { $in: payload.category } });

        if (category.length) {
          payload = { ...payload, category: category.map((ctg) => ctg._id) };
        }
      }

      if (payload.tags && payload.tags.length) {
        let tags = await Tag.find({ name: { $in: payload.tags } });

        if (tags.length) {
          payload = { ...payload, tags: tags.map((tag) => tag._id) };
        }
      }

      if (req.file) {
        let tmp_path = req.file.path;
        let originalExt =
          req.file.originalname.split(".")[
            req.file.originalname.split(".").length - 1
          ];
        let filename = req.file.filename + "." + originalExt;
        let target_path = path.resolve(
          config.rootPath,
          `public/images/${filename}`
        );

        const src = fs.createReadStream(tmp_path);
        const dest = fs.createWriteStream(target_path);
        src.pipe(dest);

        src.on("end", async () => {
          let product = await Product.findOne({ _id: req.params.id });

          let currentImage = `${config.rootPath}/public/images/${product.image_url}`;

          if (fs.existsSync(currentImage)) {
            fs.unlinkSync(currentImage);
          }

          product = await Product.findOneAndUpdate(
            { _id: req.params.id },
            { ...payload, image_url: filename },
            { new: true, runValidators: true }
          );

          return res.json({
            data: product,
            message: "Product successfully updated",
          });
        });

        src.on("error", async () => {
          next(err);
        });
      } else {
        let product = await Product.findOneAndUpdate(
          { _id: req.params.id },
          payload,
          { new: true, runValidators: true }
        );

        return res.json({
          data: product,
          message: "Product successfully updated",
        });
      }
    } catch (err) {
      if (err && err.name === "ValidationError") {
        return res.json({
          error: 1,
          message: "Product unsuccessful updated",
          fields: err.errors,
        });
      }

      next(err);
    }
  },

  deleteProduct: async (req, res, next) => {
    try {
      const policy = policyFor(req.user);

      if (!policy.can("delete", "Product")) {
        return res.json({
          error: 1,
          message: "You're not allowed to perform this action",
        });
      }

      let product = await Product.findOneAndDelete({ _id: req.params.id });

      let currentImage = `${config.rootPath}/public/images/${product.image_url}`;

      if (fs.existsSync(currentImage)) {
        fs.unlinkSync(currentImage);
      }

      return res.json({
        message: "Product successfully deleted",
        data: product,
      });
    } catch (err) {
      next(err);
    }
  },
};
