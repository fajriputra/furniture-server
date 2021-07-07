const router = require("express").Router();
const multer = require("multer");

const categoryController = require("./controllers");

router.get("/categories", categoryController.listCategory);
router.post("/categories", multer().none(), categoryController.createCategory);
router.put(
  "/categories/:id",
  multer().none(),
  categoryController.updateCategory
);
router.delete("/categories/:id", categoryController.deleteCategory);

module.exports = router;
