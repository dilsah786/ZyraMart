const express = require("express");
const cartRouter = express.Router();
const cartController = require("../Controllers/cart.controllers");

cartRouter.get("/", cartController.getAllCartItems);

cartRouter.post("/addproduct", cartController.addCartItem);
cartRouter.patch("/removeproduct", cartController.removeCartItem);

module.exports = { cartRouter };
