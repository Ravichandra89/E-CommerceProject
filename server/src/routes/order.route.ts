import express, { Router } from "express";
import {
  createOrder,
  getOrderById,
  cancelOrder,
  returnOrder,
  exchangeOrder
} from "../controllers/order.controller";

const orderRoute = Router();

// Define here all Order Routes
orderRoute.post("/", createOrder);
orderRoute.get("/:orderId", getOrderById);
orderRoute.put("/:orderId/cancel", cancelOrder);
orderRoute.post("/:orderId/return", returnOrder);
orderRoute.post("/:orderId/exchange", exchangeOrder);

export default orderRoute;
