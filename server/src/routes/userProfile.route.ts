import express, { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  FetchUserWishlist,
  updateUserWishlist,
  deleteProductFromWishlist,
  getUserOrders,
  getUserLoyaltiPoints,
  RedeeemLoyaltiPoints,
  FetchUserNotification,
  getUserOrderHistory
} from "../controllers/userprofile.controller";
import authMiddleware from "../middlewares/authMiddleware";
import { get } from "http";

const profileRoute = Router();

// User Profile management
profileRoute.get("/:userId/profile", authMiddleware, getUserProfile);
profileRoute.patch("/:userId/profile", authMiddleware, updateUserProfile);

// User Profile Wishlist Api's
profileRoute.get("/:userId/wishlist", authMiddleware, FetchUserWishlist);
profileRoute.patch("/:userId/wishlist", authMiddleware, updateUserWishlist);
profileRoute.delete("/:userId/wishlist/:productId", authMiddleware, deleteProductFromWishlist);

// User Profile Order Api's
profileRoute.get("/:userId/orders", authMiddleware, getUserOrders);
profileRoute.get("/:userId/orders/history", authMiddleware, getUserOrderHistory);

// User Profile Loyalti Points
profileRoute.get("/:userId/loyalti", authMiddleware, getUserLoyaltiPoints);
profileRoute.patch("/:userId/loyalti", authMiddleware, RedeeemLoyaltiPoints);

// User Profile Notification Fetching model
profileRoute.get("/:userId/notification", authMiddleware, FetchUserNotification);

export default profileRoute;
