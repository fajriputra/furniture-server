const router = require("express").Router();

const multer = require("multer");

const tagController = require("./controllers");

router.get("/tag", tagController.listTag);
router.post("/tag", multer().none(), tagController.createTag);
router.put("/tag/:id", multer().none(), tagController.updateTag);
router.delete("/tag/:id", tagController.deleteTag);

module.exports = router;
