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

      // membuat instance deliveryaddress berdasarkan payload dan data user
      const address = new DeliveryAddress({ ...payload, user: user._id });

      // simpan instance ke dalam mongodb
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

      // buat payload dan keluarkan _id
      let { _id, ...payload } = req.body;

      // cari address berdasarkan id
      let address = await DeliveryAddress.findOne({ _id: id });

      // cek prop user_id apakah nilainya sama dengan user._id
      let subjectAddress = subject("DeliveryAddress", {
        ...address,
        user_id: address.user,
      });

      // jika tidak, proses error
      if (!policy.can("update", subjectAddress)) {
        return res.json({
          error: 1,
          message: "You're not allowed to modify this resource.",
        });
      }

      // update ke MongoDB
      address = await DeliveryAddress.findOneAndUpdate({ _id: id }, payload, {
        new: true,
      });
      // mengirim response data ke client
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

      // cari address berdasarkan id
      const address = await DeliveryAddress.findOne({ _id: id });

      // buat subject address
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
