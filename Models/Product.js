const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, min: 1, required: true },
    discountPrice: { type: Number },
    currency: { type: String, enum: ["USD", "INR"], default: "INR" },
    stock: { type: Number, min: 1, required: true }, // available quantity
    brand: { type: String, required: false },

    // Variants for color, size, storage, etc.
    variants: [
      {
        currentStock: { type: String, min: 1, required: true },
        color: String,
        storage: String, // optional, e.g., "128GB", "256GB"
        size: String, // optional for apparel
        price: { type: Number }, // overrides base price if needed
        discountPrice: { type: Number },
        totalStock: { type: Number, default: 0 },
        images: [String], // specific images for this variant
      },
    ],
    color: [String],
    totalReviews: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },

    // Specifications as array of key-value pairs
    specifications: [
      {
        key: { type: String, required: true },
        value: { type: mongoose.Schema.Types.Mixed, required: true }, // String, Number, or Array
      },
    ],
    images: [String],
    thumbnail: { type: String },
    isActive: { type: Boolean, default: true },
    tags: [String],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("Product", productSchema);

module.exports = { ProductModel };
