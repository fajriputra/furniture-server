const router = require("express").Router();
const multer = require("multer");

const addressController = require("./controllers");

router.post(
  "/delivery-address",
  multer().none(),
  addressController.createAddress
);
router.get("/delivery-address", addressController.getAddress);
router.put(
  "/delivery-address/:id",
  multer().none(),
  addressController.updateAddress
);
router.delete(
  "/delivery-address/:id",

  addressController.deleteAddress
);

module.exports = router;
