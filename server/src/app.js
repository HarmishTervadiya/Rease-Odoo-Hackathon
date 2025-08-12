import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

// Routes Imports
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import categoryRouter from "./routes/category.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import wishlistRouter from "./routes/wishlist.routes.js";
import pricelistRouter from "./routes/pricelist.routes.js";
import rentalQuotationRouter from "./routes/rentalQuotation.routes.js";
import rentalOrderRouter from "./routes/rentalOrder.routes.js";
import rentalOrderLineRouter from "./routes/rentalOrderLine.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/notification", notificationRouter);
app.use("/api/v1/wishlist", wishlistRouter);
app.use("/api/v1/pricelist", pricelistRouter);
app.use("/api/v1/rentalQuotation", rentalQuotationRouter);
app.use("/api/v1/rentalOrder", rentalOrderRouter);
app.use("/api/v1/rentalOrderLine", rentalOrderLineRouter);


app.get("/healthcheck", (req, res) => {
  res.send("Successfully connected");
});

export { app };
