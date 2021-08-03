const router = require("express").Router();

const controller = require("./controllers");

router.get("/invoices/:order_id", controller.showInvoice);
router.get("/invoices/:order_id/payment", controller.initiatePayment);

module.exports = router;
