const express = require("express");
const orderRouter = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/auth");
const autoOrderLogger = require("../middleware/autoOrderLogger");

orderRouter.use(authMiddleware("customer"), autoOrderLogger());

orderRouter.post("/", orderController.placeOrder);
orderRouter.get("/", orderController.getUserOrders);
orderRouter.get("/:id", orderController.getOrderById);

module.exports = orderRouter;
