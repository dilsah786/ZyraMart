const mongoose = require("mongoose");
const { getISTDate } = require("../config/helper");

// ----------------- User Schema -----------------
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String },
    password: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: [/^(\+91)?[6-9]\d{9}$/, "Please enter a valid mobile number"],
    },
    loginType: { type: String, enum: ["password", "otp"] },
    role: {
      type: String,
      enum: ["admin", "customer", "seller"],
      default: "customer",
    },
    isVerified: { type: Boolean, default: false },
    avatar: String,
    dob: Date,
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    cart: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
      },
    ],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    order: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    loyaltyPoints: { type: Number, default: 0 },
    token: String,
    refreshToken: String,
    twoFactorEnabled: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    loginHistory: [
      {
        ip: String,
        userAgent: String,
        device: {
          browser: String,
          os: String,
          device: String,
        },
        loggedInAt: { type: Date, default: getISTDate },
        loggedOutAt: { type: Date },
        loginDuration: { type: String },
      },
    ],
    isLoggedin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ----------------- OTP Schema -----------------
const otpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  code: String,
  createdAt: { type: Date, default: getISTDate(), expires: 300 }, // TTL works here
});

// ----------------- Models -----------------
const UserModel = mongoose.model("User", userSchema);
const OtpModel = mongoose.model("Otp", otpSchema);

module.exports = { userSchema, UserModel, OtpModel };
