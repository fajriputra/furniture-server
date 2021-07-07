// (1) import package mongoose
const mongoose = require("mongoose");
const { dbUser, dbPass, dbName } = require("../app/config");

// (3) connect to mongodb
mongoose.connect(
  `mongodb+srv://${dbUser}:${dbPass}@cluster0.emeay.mongodb.net/${dbName}?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  }
);

// (4) simpan koneksi dalam variable db
const db = mongoose.connection;

// (5) export db agar bisa digunakan dalam file lain
module.exports = db;
