const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },

    // Array of items purchased
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variantId: { type: mongoose.Schema.Types.ObjectId }, // Optional: specific color/size variant

        // Snapshot fields
        name: { type: String, required: true },
        color: String,
        storage: String,
        size: String,
        price: { type: Number, required: true }, // Price at the time of purchase
        discountPrice: Number,
        quantity: { type: Number, default: 1 },
        images: [String], // Snapshot of product/variant images
        sku: String, // SKU of the variant
      },
    ],

    totalAmount: { type: Number, required: true }, // Total for the order
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Card", "UPI", "Wallet"],
      default: "COD",
    },
    transactionId: String, // Optional: for online payments
    placedAt: { type: Date, default: Date.now }, // Timestamp for order placement
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("Order", orderSchema);

module.exports = { OrderModel, orderSchema };
