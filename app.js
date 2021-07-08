var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

// const { decodeToken } = require("./app/auth/middleware");

// (1) import router product
const productRouter = require("./app/products/router");
const categoryRouter = require("./app/category/router");
const tagRouter = require("./app/tags/router");
const authRouter = require("./app/auth/router");
const wilayahRouter = require("./app/wilayah/router");
const deliveryRouter = require("./app/delivery-address/router");
const cartRouter = require("./app/cart/router");
const orderRouter = require("./app/order/router");
const invoiceRouter = require("./app/invoice/router");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// (2) gunakan router disini
app.use("/api", productRouter);
app.use("/api", categoryRouter);
app.use("/api", tagRouter);
app.use("/auth", authRouter);
app.use("/api", wilayahRouter);
app.use("/api", deliveryRouter);
app.use("/api", cartRouter);
app.use("/api", orderRouter);
app.use("/api", invoiceRouter);

app.use(cors());
// app.use(decodeToken());

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
