const { AddressModel } = require("../Models/Addresses");
const { CartModel } = require("../Models/Cart");
const { OrderModel } = require("../Models/Order");

exports.createOrder = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { addressId, paymentMethod = "COD", orderedProductIds } = req.body;

    // Get user's cart
    const cart = await CartModel.findOne({ userId }).populate(
      "items.productId"
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Get selected address
    const address = await AddressModel.findById(addressId);
    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    // Filter cart items to include only ordered items
    const itemsToOrder = cart.items.filter((item) =>
      orderedProductIds.includes(item.productId._id.toString())
    );

    if (itemsToOrder.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No valid items to order" });
    }

    // Prepare order items snapshot (convert arrays to strings)
    const orderItems = itemsToOrder.map((item) => ({
      productId: item.productId._id,
      name: item.productId.name,
      color: Array.isArray(item.productId.color)
        ? item.productId.color.join(", ")
        : item.productId.color || "",
      storage: Array.isArray(item.productId.storage)
        ? item.productId.storage.join(", ")
        : item.productId.storage || "",
      size: Array.isArray(item.productId.size)
        ? item.productId.size.join(", ")
        : item.productId.size || "",
      price: item.productId.price,
      discountPrice: item.productId.discountPrice || 0,
      quantity: item.quantity,
      images: item.productId.images || [],
      sku: item.productId.sku || "",
    }));

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create order
    const order = await OrderModel.create({
      user: userId,
      address: addressId,
      items: orderItems,
      totalAmount,
      paymentMethod,
    });

    // Remove ordered items from cart
    cart.items = cart.items.filter(
      (item) => !orderedProductIds.includes(item.productId._id.toString())
    );
    cart.totalQuantity = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    await cart.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Get all orders for a user
exports.getUserOrders = async (req, res, next) => {
  try {
    const userId = req.userId;
    const orders = await OrderModel.find({ user: userId })
      .populate("address")
      .populate("items.productId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: orders.length,
      orders,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Get a single order by ID
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findById(id)
      .populate("address")
      .populate("items.productId");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Update order status (admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "paid",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!allowedStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const order = await OrderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Cancel an order
exports.cancelOrder = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { orderId } = req.params;

    // Find the order
    const order = await OrderModel.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Check if order is already delivered or cancelled
    if (order.status === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered orders cannot be cancelled",
      });
    }
    if (order.status === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Order is already cancelled" });
    }

    // Update order status to cancelled
    order.status = "cancelled";
    await order.save();

    // Optionally, restore items back to cart
    const cart = await CartModel.findOne({ userId });
    order.items.forEach((item) => {
      const existingItem = cart.items.find(
        (cartItem) =>
          cartItem.productId.toString() === item.productId.toString()
      );
      const subtotal = item.price * item.quantity;

      if (existingItem) {
        existingItem.quantity += item.quantity;
        existingItem.subtotal += subtotal;
      } else {
        cart.items.push({
          productId: item.productId,
          quantity: item.quantity,
          subtotal,
        });
      }
    });

    // Recalculate totals
    cart.totalQuantity = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, i) => sum + i.subtotal, 0);
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully and items restored to cart",
      order,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
