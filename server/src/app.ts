import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoute from "./routes/user.route";
import profileRoute from "./routes/userProfile.route";
import productRoute from "./routes/product.route";
import orderRoute from "./routes/order.route";
import cartRoute from "./routes/cart.route";

const app = express();

// middleware uses
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

// Define the routes here
app.use("/api/v1/user", userRoute);
app.use("/api/v1/users", profileRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/orders", orderRoute);
app.use("/api/v1/cart", cartRoute);
export default app;

