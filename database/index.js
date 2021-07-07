// (1) import package mongoose
const mongoose = require("mongoose");
// const { dbHost, dbPort, dbName } = require("../app/config");

// (3) connect to mongodb
mongoose.connect(`mongodb://localhost:27017/db_furniture`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

// (4) simpan koneksi dalam variable db
const db = mongoose.connection;

// (5) export db agar bisa digunakan dalam file lain
module.exports = db;
