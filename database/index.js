// (1) import package mongoose
const mongoose = require("mongoose");

// (2) kita import konfigurasi terkait MongoDB dari `app/config.js`
const { dbUser, dbPass, dbName } = require("../app/config");

// (3) connect ke MongoDB menggunakan konfigurasi yang telah kita import
mongoose.connect(
  `mongodb+srv://${dbUser}:${dbPass}@cluster0.emeay.mongodb.net/${dbName}?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  }
);

// (4) simpan koneksi dalam constant `db`
const db = mongoose.connection;

// (5) export `db` supaya bisa digunakan oleh file lain yang membutuhkan
module.exports = db;
