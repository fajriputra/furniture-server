const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  rootPath: path.resolve(__dirname, ".."),
  serviceName: process.env.SERVICE_NAME,
  secretKey: process.env.SECRET_KEY,
  dbName: process.env.DB_NAME,
  dbUser: process.env.DB_USER,
  dbPass: process.env.DB_PASS,
};
