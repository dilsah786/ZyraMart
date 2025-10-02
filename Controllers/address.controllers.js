const { AddressModel } = require("../Models/Addresses");

exports.getAllAddresses = async (req, res, next) => {
  try {
    const userId = req.userId;

    const addresses = await AddressModel.find({ userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      total: addresses.length,
      addresses,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getAddressById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const address = await AddressModel.findById(id);

    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    return res.status(200).json({ success: true, address });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.addAddress = async (req, res, next) => {
  try {
    const userId = req.userId;
    const data = req.body;

    // If new address is default, unset other default addresses
    if (data.isDefault) {
      await AddressModel.updateMany(
        { userId, isDefault: true },
        { isDefault: false }
      );
    }

    const address = await AddressModel.create({ userId, ...data });

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      address,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    console.log(req)

    // If updating to default, unset other defaults
    if (data.isDefault) {
      const address = await AddressModel.findById(id);
      if (address) {
        await AddressModel.updateMany(
          { userId: address.userId, isDefault: true },
          { isDefault: false }
        );
      }
    }

    const updatedAddress = await AddressModel.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!updatedAddress) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Address updated", updatedAddress });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedAddress = await AddressModel.findByIdAndDelete(id);

    if (!deletedAddress) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Address deleted", deletedAddress });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
