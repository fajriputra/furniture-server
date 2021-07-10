const Category = require("./model");
// const policyFor = require("../policy");

module.exports = {
  createCategory: async (req, res, next) => {
    try {
      // cek policy
      const policy = policyFor(req.user);

      if (!policy.can("create", "Category")) {
        return res.json({
          error: 1,
          message: "You're not allowed to perform this action",
        });
      }

      const payload = req.body;

      const category = new Category(payload);

      await category.save();

      return res.json({
        error: 0,
        message: "Category successfully added.",
        data: category,
      });
    } catch (err) {
      // tangani error dari validasi model
      if (err && err.name === "ValidationError") {
        return res.json({
          error: 1,
          message: err.message,
          fields: err.errors,
        });
      }

      next(err);
    }
  },
  listCategory: async (req, res, next) => {
    try {
      const category = await Category.find();

      return res.json(category);
    } catch (err) {
      if (err && err.name === "ValidationError") {
        return res.json({
          error: 1,
          message: err.message,
          fields: err.errors,
        });
      }
      next(err);
    }
  },
  updateCategory: async (req, res, next) => {
    try {
      // cek policy
      const policy = policyFor(req.user);

      if (!policy.can("update", "Category")) {
        return res.json({
          error: 1,
          message: "You're not allowed to perform this action",
        });
      }

      const payload = req.body;

      const category = await Category.findOneAndUpdate(
        { _id: req.params.id },
        payload,
        { new: true, runValidators: true }
      );

      await category.save();

      return res.json({
        message: "Category successfully updated.",
        data: category,
      });
    } catch (err) {
      if (err && err.name === "ValidationError") {
        return res.json({
          error: 1,
          message: err.message,
          fields: err.errors,
        });
      }
      next(err);
    }
  },
  deleteCategory: async (req, res, next) => {
    try {
      // cek policy
      const policy = policyFor(req.user);

      if (!policy.can("delete", "Category")) {
        return res.json({
          error: 1,
          message: "You're not allowed to perform this action",
        });
      }

      const category = await Category.findOneAndDelete({ _id: req.params.id });

      return res.json({
        message: "Category successfully deleted.",
        data: category,
      });
    } catch (err) {
      next(err);
    }
  },
};
