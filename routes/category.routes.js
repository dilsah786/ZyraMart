const express = require("express");
const categoryRouter = express.Router();
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/auth");

// Admin CRUD categories
categoryRouter.post(
  "/",
  authMiddleware("admin"),
  categoryController.createCategory
);
categoryRouter.get("/", categoryController.getAllCategories);
categoryRouter.put(
  "/:id",
  authMiddleware("admin"),
  categoryController.updateCategory
);
categoryRouter.delete(
  "/:id",
  authMiddleware("admin"),
  categoryController.deleteCategory
);

module.exports = categoryRouter;
