const { decryptData } = require("../utils/securityUtils");

const decryptMiddleware = (req, res, next) => {
  try {
    // Only decrypt if encryptedReqBody exists
    if (req.body && req.body.encryptedReqBody) {
      req.body = JSON.parse(decryptData(req.body.encryptedReqBody));
    }
    next();
  } catch (err) {
    return res.status(400).json({
      message: "Invalid encrypted request",
      error: err.message,
    });
  }
};

module.exports = decryptMiddleware;
