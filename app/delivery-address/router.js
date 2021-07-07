const router = require("express").Router();
const multer = require("multer");

const addressController = require("./controllers");

router.get("/delivery-address", addressController.getAddress);
router.post(
  "/delivery-address",
  multer().none(),
  addressController.createDelivAddress
);
router.put(
  "/delivery-address/:id",
  multer().none(),
  addressController.updateDeliveryAddress
);
router.delete(
  "/delivery-address/:id",

  addressController.deleteDeliveryAddress
);

module.exports = router;
