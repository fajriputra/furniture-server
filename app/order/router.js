const router = require("express").Router();
const multer = require("multer");

const orderController = require("./controllers");

router.post("/orders", multer().none(), orderController.createOrder);
router.get("/orders", orderController.listOrder);

module.exports = router;
