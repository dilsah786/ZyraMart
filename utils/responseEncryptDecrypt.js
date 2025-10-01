const { encryptData, decryptData, generateCRC } = require("./securityUtils");

// Encrypt before sending response
const sendEncryptedResponse = (res, data) => {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = encryptData(jsonString);
    const crc = generateCRC(encrypted);

    res.setHeader("Access-Control-Allow-OAS", crc);
    res.json({ encryptedReqBody: encrypted });
  } catch (err) {
    res.status(500).json({ message: "Encryption error", error: err.message });
  }
};

// Decrypt request body in middleware
const decryptRequestBody = (req, res, next) => {
  try {

    console.log(req)

    if (req.body.encryptedReqBody) {
      req.body = JSON.parse(decryptData(req.body.encryptedReqBody));
    }
    next();
  } catch (err) {
    res
      .status(400)
      .json({ message: "Invalid encrypted request", error: err.message });
  }
};

module.exports = { sendEncryptedResponse, decryptRequestBody };
