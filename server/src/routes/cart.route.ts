import express, { Router } from "express";
import {
  getUserCart,
  addProductToCart,
  updateCart,
  deleteProductFromCart,
} from "../controllers/cart.controller";

const cartRoute = Router();

// Define here the cart Routes
cartRoute.get("/:userId", getUserCart);
cartRoute.post("/:productId", addProductToCart); // passing userId in body
cartRoute.put("/:productId", updateCart); 
cartRoute.delete("/:productId", deleteProductFromCart);          

export default cartRoute;
