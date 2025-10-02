const { formatISTDate } = require("../config/helper");
const { ProductModel } = require("../Models/Product");
const { WishlistModel, wishlistSchema } = require("../Models/Wishlist");
const {
  sendEncryptedResponse,
  decryptRequestBody,
} = require("../utils/responseEncryptDecrypt");

exports.getWishlistProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.userId;
    const allWishListProducts = await WishlistModel.findOne({
      userId: userId,
    })
      .populate("items.productId")
      .lean();

    if (allWishListProducts.length == 0) {
      return res
        .json({
          success: false,
          message: "No Product found",
          allWishListProducts: [],
        })
        .status(404);
    }

    const totalWishlistProducts = allWishListProducts.items.length;
    const formattedWishlistProducts = allWishListProducts.items.map(
      (wishlistItem) => {
        return {
          ...wishlistItem,
          addedAt: formatISTDate(wishlistItem.addedAt),
          productId: wishlistItem.productId
            ? {
                ...wishlistItem.productId, // spread product details
                createdAt: formatISTDate(wishlistItem.productId.createdAt),
                updatedAt: formatISTDate(wishlistItem.productId.updatedAt),
              }
            : null,
        };
      }
    );

    const totalPages = Math.ceil(totalWishlistProducts / limit);

    return sendEncryptedResponse(res, {
      success: true,
      message: "Here are you wishlist items list",
      totalRecords: totalWishlistProducts,
      totalPages,
      allWishListProducts: formattedWishlistProducts,
    });
  } catch (error) {
    next(error);
  }
};

exports.addWishListProduct = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.userId;

    // If wishlist already exist for a user
    let addedWishlistProduct = await WishlistModel.findOne({ userId });
    let addedProduct = await ProductModel.findOne({ _id: productId });

    if (!addedProduct) {
      return res.json({
        success: false,
        message: "Product not found please try with different product",
      });
    }

    if (addedWishlistProduct) {
      // Step 2: Check if product already exists
      const alreadyInWishlist = addedWishlistProduct.items.some(
        (item) => item.productId.toString() === productId
      );

      if (alreadyInWishlist) {
        return res.status(400).json({
          success: false,
          message: "Product is already in your wishlist",
        });
      }

      addedWishlistProduct.items.push({ productId });
      await addedWishlistProduct.save();
    } else {
      addedWishlistProduct = await WishlistModel.create({
        userId,
        items: [{ productId }],
      });
    }

    await addedWishlistProduct.populate("items.productId");

    const formattedWishlistProducts = addedWishlistProduct.items.map(
      (wishlistItem) => {
        return {
          ...wishlistItem._doc,
          addedAt: formatISTDate(wishlistItem.addedAt),
          productId: wishlistItem.productId
            ? {
                ...wishlistItem.productId._doc, // spread product details
                createdAt: formatISTDate(wishlistItem.productId.createdAt),
                updatedAt: formatISTDate(wishlistItem.productId.updatedAt),
              }
            : null,
        };
      }
    );

    if (!addedWishlistProduct) {
      return res
        .json({ success: false, message: "No product added to wishlist" })
        .status(404);
    }

    return sendEncryptedResponse(res, {
      success: true,
      message: "Product added to wishlist",
      addedWishlistProduct: formattedWishlistProducts,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.removeWishListProduct = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.userId;

    // const removeProduct = { userId: userId, items: [{ productId: productId }] };
    let removedWishlistProduct = [];
    removedWishlistProduct = await WishlistModel.findOneAndUpdate(
      { userId: userId },
      { $pull: { items: { productId } } },
      { new: true }
    )
      .populate("items.productId")
      .lean();

    if (!removedWishlistProduct || removedWishlistProduct.length === 0) {
      return res
        .json({ success: false, message: "No product found in wishlist" })
        .status(404);
    }

    const totalWishlistProducts = removedWishlistProduct.items.length;

    const formattedWishlistProducts = removedWishlistProduct.items.map(
      (wishlistItem) => {
        return {
          ...wishlistItem,
          addedAt: formatISTDate(wishlistItem.addedAt),
          productId: wishlistItem.productId
            ? {
                ...wishlistItem.productId, // spread product details
                createdAt: formatISTDate(wishlistItem.productId.createdAt),
                updatedAt: formatISTDate(wishlistItem.productId.updatedAt),
              }
            : null,
        };
      }
    );

    return sendEncryptedResponse(res, {
      success: true,
      message: "Product removed from the wishlist",
      totalRecords: totalWishlistProducts,
      removedWishlistProduct: formattedWishlistProducts,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
