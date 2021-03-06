const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("../config");

const User = require("../user/model");
const { getToken } = require("../utils/get-token");

module.exports = {
  register: async (req, res, next) => {
    try {
      const payload = req.body;

      const user = new User(payload);

      await user.save();

      return res.json({
        message: "Registration is successfull",
        data: user,
      });
    } catch (err) {
      if (err && err.name === "ValidationError") {
        return res.json({
          error: 1,
          message: "Registration is unsuccessful",
          fields: err.errors,
        });
      }

      next(err);
    }
  },

  localStrategy: async (email, password, done) => {
    try {
      const user = await User.findOne({ email }).select(
        "-__v -createdAt -updatedAt -cart_items -token"
      );

      if (!user) return done();

      if (bcrypt.compareSync(password, user.password)) {
        ({ password, ...userWithoutPassword } = user.toJSON());

        return done(null, userWithoutPassword);
      }
    } catch (err) {
      done(err, null);
    }

    done();
  },

  login: async (req, res, next) => {
    passport.authenticate("local", async (err, user) => {
      if (err) return next(err);

      if (!user) {
        return res.json({
          error: 1,
          message: "Incorrect email or password",
        });
      }

      const signed = jwt.sign(user, config.secretKey);

      await User.findOneAndUpdate(
        { _id: user._id },
        { $push: { token: signed } },
        { new: true }
      );

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
    const token = getToken(req);

    const user = await User.findByIdAndUpdate(
      { token: { $in: [token] } },
      { $pull: { token } },
      { useFindAndModify: false }
    );

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
