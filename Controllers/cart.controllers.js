const { formatISTDate } = require("../config/helper");
const { CartModel } = require("../Models/Cart");
const { ProductModel } = require("../Models/Product");
const { sendEncryptedResponse } = require("../utils/responseEncryptDecrypt");

exports.getAllCartItems = async (req, res, next) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const userId = req.userId;

    // Find user cart
    const cart = await CartModel.findOne({ userId })
      .populate("items.productId")
      .lean();

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "No cart found for this user",
        allCartProducts: [],
      });
    }

    if (!cart.items || cart.items.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found in cart",
        allCartProducts: [],
      });
    }

    const totalCartProducts = cart.items.length;

    // Apply pagination
    const paginatedItems = cart.items.slice(skip, skip + limit);

    // Format items
    const formattedCartProducts = paginatedItems.map((cartItem) => ({
      ...cartItem,
      addedAt: formatISTDate(cartItem.addedAt),
      productId: cartItem.productId
        ? {
            ...cartItem.productId,
            createdAt: formatISTDate(cartItem.productId.createdAt),
            updatedAt: formatISTDate(cartItem.productId.updatedAt),
          }
        : null,
    }));

    const totalPages = Math.ceil(totalCartProducts / limit);

    return res.json({
      success: true,
      message: "Here are your cart items",
      totalRecords: totalCartProducts,
      totalPages,
      page,
      allCartProducts: formattedCartProducts,
      cartSummary: {
        totalQuantity: cart.totalQuantity,
        totalPrice: cart.totalPrice,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.addCartItem = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.userId;

    // Check if product exists
    const addedProduct = await ProductModel.findById(productId);
    if (!addedProduct) {
      return res.status(404).json({
        success: false,
        message:
          "No such product available, please try with a different product",
      });
    }

    // Find or create cart for the user
    let cart = await CartModel.findOne({ userId });

    if (cart) {
      // Check if product already exists in cart
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      console.log(addedProduct.price);

      if (existingItem) {
        // Update quantity & subtotal
        existingItem.quantity += quantity;
        existingItem.subtotal = existingItem.quantity * addedProduct.price;
        console.log(existingItem.subtotal);
      } else {
        // Add new item
        cart.items.push({
          productId,
          quantity,
          subtotal: addedProduct.price * quantity,
        });
      }
    } else {
      // Create new cart
      cart = await CartModel.create({
        userId,
        items: [
          {
            productId,
            quantity,
            subtotal: addedProduct.price * quantity,
          },
        ],
      });
    }

    // Recalculate totals
    cart.totalQuantity = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

    await cart.save();

    // Populate product details for response
    const populatedCart = await cart.populate("items.productId");

    return res.json({
      success: true,
      message: "Product added to cart",
      addedcartProduct: populatedCart,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.userId;

    // Remove product from cart
    let cart = await CartModel.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "No cart found for this user",
      });
    }

    // Remove the product
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    // Recalculate totals
    cart.totalQuantity = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

    await cart.save();

    const formattedCartProducts = cart.items.map((cartItem) => ({
      ...cartItem._doc,
      addedAt: formatISTDate(cartItem.addedAt),
      productId: cartItem.productId
        ? {
            ...cartItem.productId._doc,
            createdAt: formatISTDate(cartItem.productId.createdAt),
            updatedAt: formatISTDate(cartItem.productId.updatedAt),
          }
        : null,
    }));

    return sendEncryptedResponse(res, {
      success: true,
      message: "Product removed from the cart",
      totalRecords: cart.items.length,
      removedCartProduct: formattedCartProducts,
      cartSummary: {
        totalQuantity: cart.totalQuantity,
        totalPrice: cart.totalPrice,
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
