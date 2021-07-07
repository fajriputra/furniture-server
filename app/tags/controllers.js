const Tag = require("./model");
const policyFor = require("../policy");

module.exports = {
  createTag: async (req, res, next) => {
    try {
      // cek policy
      const policy = policyFor(req.user);

      if (!policy.can("create", "Tag")) {
        return res.json({
          error: 1,
          message: "You're not allowed to perform this action",
        });
      }

      const payload = req.body;

      const tag = new Tag(payload);

      await tag.save();

      return res.json({
        message: "Tag successfully added.",
        data: tag,
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
  listTag: async (req, res, next) => {
    try {
      const tag = await Tag.find();

      return res.json(tag);
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
  updateTag: async (req, res, next) => {
    try {
      // cek policy
      const policy = policyFor(req.user);

      if (!policy.can("update", "Tag")) {
        return res.json({
          error: 1,
          message: "You're not allowed to perform this action",
        });
      }

      const payload = req.body;

      const tag = await Tag.findOneAndUpdate({ _id: req.params.id }, payload, {
        new: true,
        runValidators: true,
      });

      await tag.save();

      return res.json({
        message: "Tag successfully updated.",
        data: tag,
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
  deleteTag: async (req, res, next) => {
    try {
      // cek policy
      const policy = policyFor(req.user);

      if (!policy.can("delete", "Tag")) {
        return res.json({
          error: 1,
          message: "You're not allowed to perform this action",
        });
      }

      // cari dan delete category berdasarkan fields _id
      const tag = await Tag.findOneAndDelete({ _id: req.params.id });

      // respon ke client dengan data category yang baru saja dihapus
      return res.json({
        message: "Tag successfully deleted.",
        data: tag,
      });
    } catch (err) {
      next(err);
    }
  },
};
