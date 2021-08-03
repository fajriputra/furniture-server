const DeliveryAddress = require("./model");
const { policyFor } = require("../policy");

module.exports = {
  createAddress: async (req, res, next) => {
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

      // buat instance berdasarkan payload dan data dari user
      const address = new DeliveryAddress({ ...payload, user: user._id });

      await address.save();

      return res.json({
        error: 0,
        message: "Address successfully added",
        data: address,
      });
    } catch (err) {
      if (err && err.name === "ValidationError") {
        return res.json({
          error: 1,
          message: "Address unsuccessful added",
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
      const { limit = 10, skip = 0 } = req.query;

      // jumlah data address
      const count = await DeliveryAddress.find({
        user: req.user._id,
      }).countDocuments();

      /* melakukan query data address dari user dengan limit, 
        skip untuk paginate dan sortir dengan desc berdasarkan createdAt */
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

  updateAddress: async (req, res, next) => {
    const policy = policyFor(req.user);

    try {
      // ambil id dari params
      const { id } = req.params;

      // buat payload dan keluarkan _id nya untuk menghindari failed update
      const { _id, ...payload } = req.body;

      // update alamat
      const address = await DeliveryAddress.findOne({ _id: id });

      const subjectAddress = subject("DeliveryAddress", {
        ...address,
        user_id: address.user,
      });

      if (!policy.can("update", subjectAddress)) {
        return res.json({
          error: 1,
          message: "You're not allowed to modify this resource.",
        });
      }

      // update ke database
      address = await DeliveryAddress.findOneAndUpdate({ _id: id }, payload, {
        new: true,
      });

      // response data ke client
      return res.json({
        message: "Address successfully updated",
        data: address,
      });
    } catch (err) {
      if (err && err.name === "ValidationError") {
        return res.json({
          error: 1,
          message: "Address unsuccessful updated",
          fields: err.errors,
        });
      }

      next(err);
    }
  },

  deleteAddress: async (req, res, next) => {
    const policy = policyFor(req.user);

    try {
      // ambil id dari params
      const { id } = req.params;

      // hapus address berdasarkan id
      const address = await DeliveryAddress.findOne({ _id: id });

      // buat subject address
      const subjectAddress = subject({ ...address, user: address.user });

      if (!policy.can("delete", subjectAddress)) {
        return res.json({
          error: 1,
          message: `You're not allowed to delete this resource`,
        });
      }

      // hapus address dari database
      await DeliveryAddress.findOneAndDelete({ _id: id });

      // response ke client
      return res.json({
        message: "Address successfully deleted",
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
