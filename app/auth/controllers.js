const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("../config");

const User = require("../user/model");
const { getToken } = require("../utils/get-token");

module.exports = {
  register: async (req, res, next) => {
    try {
      // tangkap payload dari request client
      const payload = req.body;

      // buat objek user baru
      let user = new User(payload);

      // simpan user baru ke mongodb
      await user.save();

      // berikan response ke client
      return res.json({
        message: "Registration is successfull",
        data: user,
      });
    } catch (err) {
      // (1) cek kemungkinan kesalahan terkait validasi
      if (err && err.name === "ValidationError") {
        return res.json({
          error: 1,
          message: err.message,
          fields: err.errors,
        });
      }
      // (2) error lainnya
      next(err);
    }
  },
  localStrategy: async (email, password, done) => {
    try {
      // (1) cari user ke MongoDB
      let user = await User.findOne({ email }).select(
        "-__v -createdAt -updatedAt -cart_items -token"
      );
      // (2) jika user tidak ditemukan, akhiri proses login
      if (!user) return done();
      // (3) sampai sini artinya user ditemukan, cek password sesuai atau tidak
      if (bcrypt.compareSync(password, user.password)) {
        ({ password, ...userWithoutPassword } = user.toJSON());
        // (4) akhiri pengecekkan, user berhasil login
        // berikan data user tanpa password
        return done(null, userWithoutPassword);
      }
    } catch (err) {
      done(err, null); // <--- tangani error
    }

    done();
  },
  login: async (req, res, next) => {
    passport.authenticate("local", async function (err, user) {
      if (err) return next(err);

      if (!user)
        return res.json({
          error: 1,
          message: "incorrect email or password",
        });

      // buat jwt
      let signed = jwt.sign(user, config.secretKey);

      // simpan token tsb ke user terkait
      await User.findOneAndUpdate(
        { _id: user._id },
        { $push: { token: signed } },
        { new: true }
      );

      // response ke client
      return res.json({
        message: "Loggedin successfully",
        user: user,
        token: signed,
      });
    })(req, res, next);
  },
  me: async (req, res, next) => {
    if (!req.user) {
      return res.json({
        error: 1,
        message: "You're not login or token has expired",
      });
    }

    return res.json(req.user);
  },
  logout: async (req, res, next) => {
    // (1) dapatkan token dari request
    let token = getToken(req);

    // (2) hapus token dari user
    let user = await User.findByIdAndUpdate(
      { token: { $in: [token] } },
      { $pull: { token } },
      { useFindAndModify: false }
    );

    // --- cek user atau token ---//
    if (!user || !token) {
      return res.json({
        error: 1,
        message: "User not found",
      });
    }

    return res.json({
      error: 0,
      message: "Logout successfully",
    });
  },
};
