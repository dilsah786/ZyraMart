const express = require("express");
const wishlistRouter = express.Router();
const wishlistController = require("../Controllers/wishlist.controllers");
const { decryptData } = require("../utils/securityUtils");
const { decryptRequestBody } = require("../utils/responseEncryptDecrypt");
const decryptMiddleware = require("../Middlewares/decryptMiddleware");

// wishlistRouter.use(authMiddleware("customer"));

wishlistRouter.get(
  "/",
  decryptMiddleware,
  wishlistController.getWishlistProducts
);

wishlistRouter.post("/addproduct", wishlistController.addWishListProduct);
wishlistRouter.patch(
  "/removeproduct",
  wishlistController.removeWishListProduct
);

module.exports = wishlistRouter;
