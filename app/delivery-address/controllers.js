const DeliveryAddress = require("./model");
const { policyFor } = require("../policy");

module.exports = {
  createDelivAddress: async (req, res, next) => {
    const policy = policyFor(req.user);

    if (!policy.can("create", "DeliveryAddress")) {
      return res.json({
        error: 1,
        message: "You're not allowed to perform this action.",
      });
    }

    try {
      const payload = req.body;
      const user = req.user;

      const address = new DeliveryAddress({ ...payload, user: user._id });

      await address.save();

      return res.json({
        error: 0,
        message: "Address successfully added.",
        data: address,
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

  getAddress: async (req, res, next) => {
    const policy = policyFor(req.user);

    if (!policy.can("create", "DeliveryAddress")) {
      return res.json({
        error: 1,
        message: "You're not allowed to perform this action.",
      });
    }

    try {
      let { limit = 10, skip = 0 } = req.query;

      const count = await DeliveryAddress.find({
        user: req.user._id,
      }).countDocuments();

      const deliveryAddress = await DeliveryAddress.find({
        user: req.user._id,
      })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort("-createdAt");

      return res.json({
        data: deliveryAddress,
        count: count,
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

  updateDeliveryAddress: async (req, res, next) => {
    const policy = policyFor(req.user);

    try {
      let { id } = req.params;

      let { _id, ...payload } = req.body;

      let address = await DeliveryAddress.findOne({ _id: id });

      let subjectAddress = subject("DeliveryAddress", {
        ...address,
        user_id: address.user,
      });

      if (!policy.can("update", subjectAddress)) {
        return res.json({
          error: 1,
          message: "You're not allowed to modify this resource.",
        });
      }

      address = await DeliveryAddress.findOneAndUpdate({ _id: id }, payload, {
        new: true,
      });

      return res.json({
        message: "Address successfully updated.",
        data: address,
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

  deleteDeliveryAddress: async (req, res, next) => {
    const policy = policyFor(req.user);

    try {
      const { id } = req.params;

      const address = await DeliveryAddress.findOne({ _id: id });

      const subjectAddress = subject({ ...address, user: address.user });

      if (!policy.can("delete", subjectAddress)) {
        return res.json({
          error: 1,
          message: `You're not allowed to delete this resource`,
        });
      }

      await DeliveryAddress.findOneAndDelete({ _id: id });

      return res.json({
        message: "Address successfully deleted.",
        data: address,
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
};
