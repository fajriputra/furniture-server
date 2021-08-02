const mongoose = require("mongoose");
const { model, Schema } = mongoose;
const bcrypt = require("bcrypt");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const HASH_ROUND = 10;

let userSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [32, "Name already exceeds 32 characters"],
    },

    customer_id: {
      type: Number,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      minlengt: [3, "Email must be at least 3 characters"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      maxlength: [32, "Password already exceeds 16 characters"],
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    token: [String],
  },
  { timestamps: true }
);

userSchema.path("email").validate(
  async function (value) {
    try {
      const count = await this.model("User").countDocuments({ email: value });
      return !count;
    } catch (err) {
      throw err;
    }
  },
  (attr) => `${attr.value} already registered`
);

userSchema.path("email").validate(
  function (value) {
    const emailRE = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailRE.test(value);
  },
  (attr) => `${attr.value} must be a valid email address`
);

userSchema.pre("save", function (next) {
  this.password = bcrypt.hashSync(this.password, HASH_ROUND);
  next();
});

userSchema.plugin(AutoIncrement, { inc_field: "customer_id" });

module.exports = model("User", userSchema);
