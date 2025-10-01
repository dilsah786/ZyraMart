const mongoose = require("mongoose");
const { getISTDate } = require("../config/helper");

const recentlyViewedSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    recViewed: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        viewedAt: { type: Date, default: getISTDate() },
      },
    ],
  },
  { timestamps: true }
);

recentlyViewedSchema.methods.addProduct = async function (productId) {
  this.recViewed = this.recViewed.filter((p) => !p.productId.equals(productId));

  this.recViewed.unshift({ productId, viewedAt: getISTDate() });
  if (this.recViewed.length > 50) {
    this.recViewed = this.recViewed.slice(0, 50);
  }

  await this.save();
};

const RecentlyViewedModel = mongoose.model(
  "RecentlyViewedProduct",
  recentlyViewedSchema
);

module.exports = { recentlyViewedSchema, RecentlyViewedModel };
