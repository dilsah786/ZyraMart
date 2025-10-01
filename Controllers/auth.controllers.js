const express = require("express");
const { UserModel, OtpModel } = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UAParser = require("ua-parser-js");
const { getISTDate, generateOTP, sendEmailOTP } = require("../config/helper");
authControllers = express.Router();

exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password || !phone) {
      return res.json({ message: "Please fill all fields" });
    }
    const existingUserEmail = await UserModel.findOne({ email: email });
    if (existingUserEmail) {
      return res.json({
        message: `User already exist with this emailId: ${email} !`,
      });
    }
    const existingUserPhone = await UserModel.findOne({ phone: phone });
    if (existingUserPhone) {
      return res.json({
        message: `User already exist with this phone Number: ${phone} !`,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });
    res
      .status(201)
      .json({ success: true, message: `${user.name} registered successfully` });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, phone, password, loginType, otp } = req.body;

    // Find user by email or phone in a single query
    const user = await UserModel.findOne({ $or: [{ email }, { phone }] });
    if (!user) {
      return res.status(404).json({
        message: email
          ? `User does not exist with this email: ${email}`
          : `User does not exist with this phone: ${phone}`,
      });
    }

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // if loginType is password
    if (loginType === "password") {
      if (!password)
        return res.status(400).json({ message: "Password required" });

      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // === OTP Login ===
    if (loginType === "otp") {
      if (!otp) return res.status(400).json({ message: "OTP required" });

      const userOtp = await OtpModel.findOne({ userId: user._id }).sort({
        createdAt: -1,
      });

      if (!userOtp) {
        return res.status(400).json({
          message: "OTP expired or not generated. Please request a new OTP",
        });
      }

      if (userOtp.code !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      // OTP is valid → delete it
      await OtpModel.findByIdAndDelete(userOtp._id);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Parse device info
    const parser = new UAParser(req.headers["user-agent"]);
    const result = parser.getResult();

    const loginEntry = {
      ip: req.headers["x-forwarded-for"]?.split(",")[0] || req.ip,
      userAgent: req.headers["user-agent"], // keep raw if you want
      device: {
        browser: result.browser.name + " " + result.browser.version,
        os: result.os.name + " " + result.os.version,
        device: result.device.model || "Desktop",
      },
      loggedInAt: getISTDate(),
    };

    await UserModel.findByIdAndUpdate(
      user._id,
      {
        $set: { isLoggedin: true, token, refreshToken },
        $push: { loginHistory: loginEntry },
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization;
    if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = bearerToken.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Get last login entry
    const user = await UserModel.findById(userId);
    const lastLoginIndex = user.loginHistory.length - 1;
    const lastLogin = user.loginHistory[lastLoginIndex];

    if (!lastLogin || lastLogin.loggedOutAt) {
      return res.status(400).json({ message: "User not logged in" });
    }

    const loggedOutAt = getISTDate();

    // Calculate login duration
    const durationMs = loggedOutAt - lastLogin.loggedInAt;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const loginDuration = `${hours}h ${minutes}m`;

    // Update the last login entry
    user.loginHistory[lastLoginIndex].loggedOutAt = loggedOutAt;
    user.loginHistory[lastLoginIndex].loginDuration = loginDuration;
    user.isLoggedin = false;
    user.token = null;
    user.refreshToken = null;

    await user.save();

    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};
exports.requestOtp = async (req, res, next) => {
  try {
    const { email, phone } = req.body;

    const user = await UserModel.findOne({ $or: [{ email }, { phone }] });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();

    // Save OTP in separate collection
    const otpDoc = await OtpModel.create({
      userId: user._id,
      code: otp,
      // TTL handled automatically by schema (createdAt + expires: 300)
    });

    // Send OTP via email/SMS
    if (email) await sendEmailOTP(email, otp);
    // TODO: implement SMS sending for phone

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, phone, otp } = req.body;

    // Find user
    const user = await UserModel.findOne({ $or: [{ email }, { phone }] });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find latest OTP for this user
    const otpDoc = await OtpModel.findOne({ userId: user._id }).sort({
      createdAt: -1,
    });
    if (!otpDoc) {
      return res.status(400).json({
        message: "OTP expired or not generated. Please request a new OTP",
      });
    }

    if (otpDoc.code !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP is valid → delete it
    await OtpModel.findByIdAndDelete(otpDoc._id);

    // Issue JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Update login status
    user.isLoggedin = true;
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      token,
      refreshToken,
      message: "Login successful",
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = () => {};
exports.resetPassword = () => {};
