const express = require("express");
const { db_connection } = require("./db");
const { authRouter } = require("./routes/auth.routes");
const { errorHandler } = require("./Middlewares/middlewares");
const cors = require("cors");
const { authMiddleware } = require("./Middlewares/authMiddleware");
const productRouter = require("./routes/product.routes");
const wishlistRouter = require("./routes/wishlist.routes");
const { recentlyViewedProdRouter } = require("./routes/recentlyViewed.routes");
const { default: helmet } = require("helmet");
const {
  postmanOnlyEndpoints,
  bothAccessEndpoints,
} = require("./config/helper");
const { secureMiddleware } = require("./Middlewares/secureApiMiddleware");

const debugController = require("./Controllers/debug.controllers");
const { cartRouter } = require("./routes/cart.routes");

require("dotenv").config();

const app = express();
app.use(helmet());

app.use(express.json());

app.use(secureMiddleware({ postmanOnlyEndpoints, bothAccessEndpoints }));
app.post("/api/decrypt", debugController.decryptTest);

app.get("/", (req, res) => {
  res.json("Hello I am here for you");
});

// Routes
app.use("/api/auth", authRouter);
app.use(authMiddleware);
app.use("/api/products", productRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/cart", cartRouter);
app.use("/api/recentproduct", recentlyViewedProdRouter);
// app.use("/api/categories", require("./routes/category.routes"));
// app.use("/api/orders", require("./routes/order.routes"));
// app.use("/api/coupons", require("./routes/coupon.routes"));

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, async (req, res) => {
  try {
    await db_connection;
    console.log("Successfully Connected to databases");
  } catch {
    console.log("Facing issue while connecting to DB");
  }
  console.log(`I am listening on port ${PORT} `);
});
