const router = require("express").Router();
const multer = require("multer");
const os = require("os");

const productController = require("./controllers");

// (3) gunakan endpoint dengan method "createProduct", multer sebagai middleware
// menerima file upload dengan nama image dan menyimpan pada direct temp dengan kode os.tmpdir()
router.get("/products", productController.listProduct);
router.post(
  "/products",
  multer({ dest: os.tmpdir() }).single("image"),
  productController.createProduct
);
router.put(
  "/products/:id",
  multer({ dest: os.tmpdir() }).single("image"),
  productController.updateProduct
);
router.delete("/products/:id", productController.deleteProduct);

module.exports = router;
