const express = require("express");
const addressRouter = express.Router();
const addressController = require("../Controllers/address.controllers");

addressRouter.post("/", addressController.addAddress);
addressRouter.get("/", addressController.getAllAddresses);
addressRouter.get("/:id", addressController.getAddressById);
addressRouter.patch("/:id", addressController.updateAddress);
addressRouter.delete("/:id", addressController.deleteAddress);

module.exports = { addressRouter };
