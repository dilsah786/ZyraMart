const { decryptData } = require("../utils/securityUtils");

exports.decryptTest = (req, res) => {
  try {
    const { encryptedReqBody } = req.body;
    if (!encryptedReqBody) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide `encryptedReqBody` in request body or Requestbody has been already decrypted please check with console",
      });
    }

    const decrypted = JSON.parse(decryptData(encryptedReqBody));

    res.json({
      success: true,
      decryptedData: decrypted,
    });
  } catch (err) {
    console.error("Decryption error:", err);
    res.status(400).json({
      success: false,
      message: "Failed to decrypt data",
      error: err.message,
    });
  }
};
