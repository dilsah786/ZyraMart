const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    altPhone: { type: String },
    landmark: { type: String },
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    label: { type: String, enum: ["Home", "Work", "Other"], default: "Home" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const AddressModel = mongoose.model("Address", addressSchema);

module.exports = { addressSchema, AddressModel };
