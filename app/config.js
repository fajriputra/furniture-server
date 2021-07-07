const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  serviceName: process.env.SERVICE_NAME,
  dbUser: process.env.DB_USER,
  dbPass: process.env.DB_PASS,
  dbName: process.env.DB_NAME,
};
