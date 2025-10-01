const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URL = process.env.MONGO_URL;

const db_connection = mongoose.connect(`${MONGO_URL}/QuickMart`);

module.exports = { db_connection };
