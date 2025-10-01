const { formatISTDate } = require("../config/helper");
const { ProductModel } = require("../Models/Product");

exports.createProduct = async (req, res, next) => {
  try {
    const productData = req.body;
    productData.createdBy = req.userId;
    const newProduct = await ProductModel.create(productData);

    res.json({ message: "New Product added to the list", newProduct });
  } catch (error) {
    next(error);
  }
};

// Get Product with pagination and searching
exports.getProductsPagination = async (req, res, next) => {
  try {
    let { page = 1, limit = 30, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // 🔍 Build search filter
    const searchFilter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } }, // case-insensitive
            { brand: { $regex: search, $options: "i" } },
            { tags: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { specifications: { $regex: search, $options: "i" } },
            { price: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const allProducts = await ProductModel.find(searchFilter)
      .skip(skip)
      .limit(limit)
      .lean();
    const totalRecords = await ProductModel.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalRecords / limit);

    const formattedProducts = allProducts.map((ele) => ({
      ...ele,
      createdAt: formatISTDate(ele.createdAt),
      updatedAt: formatISTDate(ele.updatedAt),
    }));

    res.json({
      message:
        allProducts.length > 0
          ? "Here is all your Products list"
          : "No Product Found",
      totalRecords,
      totalPages,
      allProducts: formattedProducts.length > 0 ? formattedProducts : [],
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Product Details
exports.getSingleProductDetails = async (req, res, next) => {
  try {
    let { id } = req.params;

    const productDetails = await ProductModel.findById({ _id: id });

    res.json({
      message: productDetails
        ? "Here is your Product Details"
        : "No Product Found",
      productDetails,
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Product Details
exports.deleteProduct = async (req, res, next) => {
  try {
    let { id } = req.params;
    const userId = req.userId;

    const deletedProduct = await ProductModel.findOneAndDelete({
      _id: id,
      createdBy: userId,
    });

    if (!deletedProduct) {
      return res
        .json({ success: false, message: "Not authorized or No Product Found" })
        .status(403);
    }

    res.json({
      success: true,
      message: ` ${deletedProduct.name} Product Removed Successfully`,
      deletedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// Update Products
exports.updateProduct = async (req, res, next) => {
  try {
    let productData = req.body;

    const { id } = req.params;
    const userId = req.userId; // make sure you set req.user from JWT middleware

    productData.updatedBy = userId;

    const updatedProduct = await ProductModel.findOneAndUpdate(
      { _id: id, createdBy: userId },
      { $set: productData },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res
        .json({ success: false, message: "Not authorized or No Product found" })
        .status(403);
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};
