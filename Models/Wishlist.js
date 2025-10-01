const mongoose = require("mongoose");
const { getISTDate } = require("../config/helper");

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Array of products in the wishlist
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variantId: { type: mongoose.Schema.Types.ObjectId }, // optional: specific variant (color, size)
        addedAt: { type: Date, default: getISTDate() }, // timestamp when added
      },
    ],
  },
  { timestamps: true }
);

const WishlistModel = mongoose.model("Wishlist", wishlistSchema);

module.exports = { wishlistSchema, WishlistModel };
