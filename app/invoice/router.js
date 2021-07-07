const router = require("express").Router();

const controller = require("./controllers");

router.get("/invoices/:order_id", controller.showInvoice);

module.exports = router;
