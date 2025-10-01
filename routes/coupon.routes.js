const express = require("express");
const couponRouter = express.Router();
const couponController = require("../controllers/couponController");
const authMiddleware = require("../middleware/auth");

couponRouter.use(authMiddleware("admin"));

couponRouter.post("/", couponController.createCoupon);
couponRouter.get("/", couponController.getAllCoupons);
couponRouter.put("/:id", couponController.updateCoupon);
couponRouter.delete("/:id", couponController.deleteCoupon);

module.exports = couponRouter;
