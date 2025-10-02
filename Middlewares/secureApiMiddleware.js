// middlewares/secureMiddleware.js
const jwt = require("jsonwebtoken");
const { UserModel } = require("../Models/User");
const {
  encryptData,
  decryptData,
  generateCRC,
} = require("../utils/securityUtils");

const secureMiddleware = ({
  postmanOnlyEndpoints = [],
  bothAccessEndpoints = [],
} = {}) => {
  return async (req, res, next) => {
    try {
      const origin = req.headers.origin || req.headers.referer || "";
      const isPostman = !origin; // No origin = Postman / curl

      // Determine endpoint type
      const endpoint = req.originalUrl;

      // Check Postman/frontend access
      if (
        postmanOnlyEndpoints.some((e) => endpoint.includes(e)) &&
        !isPostman
      ) {
        return res.status(403).json({ message: "Only Postman access allowed" });
      }

      if (bothAccessEndpoints.some((e) => endpoint.includes(e))) {
        // allowed from both
      } else if (isPostman && !postmanOnlyEndpoints.includes(endpoint)) {
        return res
          .status(403)
          .json({ message: "Frontend access only allowed" });
      }

      // JWT validation for protected endpoints
      const authHeader = req.headers.authorization;
      if (!authHeader)
        return res.status(401).json({ message: "Unauthorized: Token missing" });
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await UserModel.findById(decoded.id);
      if (!user || !user.refreshToken) {
        return res
          .status(401)
          .json({ message: "Invalid session, login again" });
      }

      req.userId = decoded.id;

      // Decrypt request if POST/PATCH/PUT
      if (
        ["POST", "PATCH", "PUT",].includes(req.method) &&
        req.body.encryptedReqBody &&
        !req.originalUrl.includes("/api/decrypt")
      ) {
        req.body = JSON.parse(decryptData(req.body.encryptedReqBody));
      }

      // CRC validation
      const requestCrc = req.headers["access-control-allow-oas"];
      if (requestCrc && req.body) {
        const calculatedCrc = generateCRC(JSON.stringify(req.body));
        if (requestCrc !== calculatedCrc) {
          return res.status(400).json({ message: "CRC_VALUE_DOES_NOT_MATCH" });
        }
      }

      // Response handler: encrypt & add CRC
      res.encryptResponse = (data) => {
        const jsonStr = JSON.stringify(data);
        const encrypted = encryptData(jsonStr);
        res.setHeader("Access-Control-Allow-OAS", generateCRC(encrypted));
        return res.json(encrypted);
      };

      next();
    } catch (err) {
      console.error("SecureMiddleware Error:", err.message);
      res.status(401).json({ message: "Unauthorized or Invalid Request" });
    }
  };
};

module.exports = { secureMiddleware };
