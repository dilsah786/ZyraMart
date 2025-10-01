const express = require("express");
const productRouter = express.Router();
// const authMiddleware = require("../middleware/auth");
// const upload = require("../middleware/upload");
const productController = require("../Controllers/product.controllers");

// Admin adds product
productRouter.post(
  "/create",
  // authMiddleware("admin"),
  // upload.array("images", 5),
  productController.createProduct
);

// Get all products
productRouter.get("/", productController.getProductsPagination);

// Get single product
productRouter.get("/:id", productController.getSingleProductDetails);

// Admin updates product
productRouter.patch(
  "/:id",
  // authMiddleware("admin"),
  productController.updateProduct
);

// Admin deletes product
productRouter.delete(
  "/:id",
  // authMiddleware("admin"),
  productController.deleteProduct
);

module.exports = productRouter;
