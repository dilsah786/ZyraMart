const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    description: String,
    image: String,
  },
  { timestamps: true }
);

const CategoryModel = mongoose.Model("Category", categorySchema);

module.exports = { CategoryModel, categorySchema };
