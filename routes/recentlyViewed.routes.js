const express = require("express");
const recViewedController = require("../Controllers/recentlyViewedProducts.controllers");
const recentlyViewedProdRouter = express.Router();

recentlyViewedProdRouter.get(
  "/",
  recViewedController.getRecentlyViewedProducts
);
recentlyViewedProdRouter.patch(
  "/add-product",
  recViewedController.addRecentlyViewedProducts
);

module.exports = { recentlyViewedProdRouter };
