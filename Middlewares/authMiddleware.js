const jwt = require("jsonwebtoken");
const { UserModel } = require("../Models/User");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  const authToken = req.headers.authorization;
  if (!authToken) {
    return res.json({
      status: "Un - Authorized",
      message: "Please Login First",
    });
  }
  const token = authToken.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, async function (err, decoded) {
    if (err) {
      return res.json({
        status: "Invalid token",
        message: "Please try to login again with right credential",
      });
    } else {
      if (decoded.id) {
        // check if user still has valid refresh token
        const user = await UserModel.findById(decoded.id);
        if (!user || !user.refreshToken || !token) {
          return res
            .status(401)
            .json({ message: "Session expired, please login again" });
        }
      }
      req.userId = decoded.id;
      next();
    }
  });
};

module.exports = { authMiddleware };
