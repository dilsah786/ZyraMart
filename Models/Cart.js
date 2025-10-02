const mongoose = require("mongoose");
const { getISTDate, getRandomDeliveryDate } = require("../config/helper");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true, default: 1, min: 1 },
        subtotal: { type: Number, required: true }, // quantity * price
        variant: { type: String }, // optional
        addedAt: { type: Date, default: getISTDate },
        deliverBy: { type: String, default: getRandomDeliveryDate },
      },
    ],
    totalQuantity: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    couponCode: { type: String },
    discount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const CartModel = mongoose.model("cart", cartSchema);

module.exports = { CartModel };
