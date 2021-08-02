const mongoose = require("mongoose");
const { dbUser, dbPass, dbName } = require("../app/config");

mongoose.connect(
  `mongodb+srv://${dbUser}:${dbPass}@cluster0.emeay.mongodb.net/${dbName}?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  }
);

const db = mongoose.connection;

module.exports = db;
