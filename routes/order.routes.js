const express = require("express");
const orderRouter = express.Router();
const orderController = require("../Controllers/order.controllers");

// orderRouter.use(authMiddleware("customer"), autoOrderLogger());

// Place a new order
orderRouter.post("/", orderController.createOrder);

// Get all orders of a user
orderRouter.get("/", orderController.getUserOrders);

// Get a single order
orderRouter.get("/:id", orderController.getOrderById);

// Update order status (admin)
orderRouter.patch("/:id/status", orderController.updateOrderStatus);

// cancel Order
orderRouter.patch("/cancel/:orderId", orderController.cancelOrder);

module.exports = { orderRouter };
