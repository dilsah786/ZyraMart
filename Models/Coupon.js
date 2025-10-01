const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },
    discountValue: { type: Number, required: true },
    minPurchase: { type: Number, default: 999 },
    maxDiscount: Number,
    validFrom: Date,
    validUntil: Date,
    usageLimit: { type: Number, default: 1 }, // per user
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const CouponModel = mongoose.model("Coupon", couponSchema);

module.exports = { CouponModel };
