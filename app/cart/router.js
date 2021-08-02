const router = require("express").Router();
const multer = require("multer");

const cartController = require("./controllers");

router.put("/carts", multer().none(), cartController.updateCart);
router.get("/carts", cartController.listCart);

module.exports = router;
