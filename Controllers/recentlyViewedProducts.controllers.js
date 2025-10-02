const { formatISTDate } = require("../config/helper");
const { RecentlyViewedModel } = require("../Models/RecentlyViewed");

exports.addRecentlyViewedProducts = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.userId;

    let recViewed = await RecentlyViewedModel.findOne({ userId });
    if (!recViewed) {
      recViewed = new RecentlyViewedModel({ userId, productId: [] });
    }

    await recViewed.addProduct(productId);
    return sendEncryptedResponse(res, {
      success: true,
      message: "Product added to recently viewed",
      recViewed,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Get all recent viewed products

exports.getRecentlyViewedProducts = async (req, res, next) => {
  try {
    // const { productId } = req.body;
    const userId = req.userId;

    const recViewed = await RecentlyViewedModel.findOne({ userId })
      .populate("recViewed.productId")
      .lean();

    if (!recViewed || recViewed.recViewed.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No recently viewed products",
        recViewedProduct: [],
      });
    }

    recViewed.recViewed = recViewed.recViewed.map((item) => ({
      ...item,
      viewedAt: formatISTDate(item.viewedAt),
      productId: item.productId
        ? {
            ...item.productId,
            createdAt: formatISTDate(item.productId.createdAt),
            updatedAt: formatISTDate(item.productId.updatedAt),
          }
        : null,
    }));
    recViewed.createdAt = formatISTDate(recViewed.createdAt);
    recViewed.updatedAt = formatISTDate(recViewed.updatedAt);

    return sendEncryptedResponse(res, {
      success: true,
      message: "All recently viewed product",
      recViewedProducts: recViewed,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
