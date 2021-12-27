const router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const apiProduct = require("../api/productApi");

router.post("/", verifyToken, apiProduct.createProduct());

router.get("/", verifyToken, apiProduct.getProducts());

router.get("/:id", verifyToken, apiProduct.getProductById());

router.patch("/:id", verifyToken, apiProduct.updateProduct());

router.delete("/:id", verifyToken, apiProduct.deleteProduct());

router.get("/all/users", verifyToken, apiProduct.getProductsAllUsers());

module.exports = router;