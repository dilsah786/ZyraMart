// utils/securityUtils.js
const crypto = require("crypto");
const CRC32 = require("crc-32");
require("dotenv").config();

const ENC_DEC_SECRET_KEY =
  process.env.ENC_DEC_SECRET_KEY || "32charsecretkeyforaes256!!!"; // must be 32 chars
if (ENC_DEC_SECRET_KEY.length !== 32)
  throw new Error("ENC_DEC_SECRET_KEY must be 32 characters");

const IV_LENGTH = 16; // AES block size

// Encrypt
const encryptData = (plainText) => {
  const iv = crypto.randomBytes(16);
  const key = Buffer.alloc(32);
  Buffer.from(ENC_DEC_SECRET_KEY).copy(key);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(plainText, "utf8", "base64");
  encrypted += cipher.final("base64");

  return `${iv.toString("base64")}:${encrypted}`;
};

// Decrypt
const decryptData = (encryptedData) => {
  const [ivBase64, encrypted] = encryptedData.split(":");
  const iv = Buffer.from(ivBase64, "base64");
  const key = Buffer.alloc(32);
  Buffer.from(ENC_DEC_SECRET_KEY).copy(key);

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

// Generate CRC
const generateCRC = (data = "") => {
  const dataWithSecret = data + ENC_DEC_SECRET_KEY;
  const crcValue = CRC32.str(dataWithSecret);
  return (crcValue >>> 0).toString(16);
};

module.exports = { encryptData, decryptData, generateCRC };
