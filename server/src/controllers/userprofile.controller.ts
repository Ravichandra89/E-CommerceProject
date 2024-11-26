import userModel from "../models/User.model";
import profileModel from "../models/Profile.model";
import apiResponse from "../utils/ApiResponse";
import { Response, Request } from "express";
import wishlistModel from "../models/WishList";
import mongoose from "mongoose";
import orderModel from "../models/Order.model";
import LoyaltyPointModel from "../models/LoyaltyPoint.model";
import NotificationModel from "../models/Notification.model";
import { triggerAsyncId } from "async_hooks";
import historyModel from "../models/History.model";

// User Profile Routes
const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return apiResponse(res, 400, false, "Please provide a userId");
    }

    // Find user by userId
    const user = await userModel.findById(userId);
    if (!user) {
      return apiResponse(res, 404, false, "User not found");
    }

    // Fetch the profile using the user's ID
    const profileExist = await profileModel.findOne({
      user_id: user._id,
    });

    if (!profileExist) {
      return apiResponse(res, 404, false, "Profile not found");
    }

    // Combine both user and profile data
    const userProfile = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: profileExist.profileImage, // Corrected typo
      shoppingAddress: profileExist.shoppingAddress,
      orderList: profileExist.orderList,
      wishlist: profileExist.wishList, // Assuming 'wishlist' field is correctly named
    };

    return apiResponse(
      res,
      200,
      true,
      "User profile fetched successfully",
      userProfile
    );
  } catch (error) {
    console.error("Error while fetching user profile", error);
    return apiResponse(res, 500, false, "Internal server error");
  }
};

// UpdateUserProfile
const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return apiResponse(res, 400, false, "Please provide a userId");
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      profileImage,
      shoppingAddress,
    } = req.body;

    // Check the user exist with this userid or not
    const userExist = await userModel.findById(userId);
    if (!userExist) {
      return apiResponse(res, 404, false, "User not found");
    }

    // Fetch the profile for this user
    const profileExist = await profileModel.findOne({
      user_id: userExist._id,
    });

    if (!profileExist) {
      return apiResponse(res, 404, false, "Profile not found");
    }

    if (first_name) userExist.first_name = first_name;
    if (last_name) userExist.last_name = last_name;
    if (email) userExist.email = email;
    if (phone) userExist.phone = phone;

    // Prepare the profile data
    if (profileImage) userExist.profimeImage = profileImage;
    if (shoppingAddress)
      profileExist.shoppingAddress = {
        ...profileExist.shoppingAddress,
        ...shoppingAddress,
      };

    // save both models
    await userExist.save();
    await profileExist.save();

    return apiResponse(res, 200, true, "User profile updated Successfully");
  } catch (error) {
    console.error("Error while Updating userProfile", error);
    return apiResponse(res, 500, false, "Internal server error");
  }
};

// User Profile Wishlist Fetch Api's

const FetchUserWishlist = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return apiResponse(res, 404, false, "Invalid user id");
    }

    const userExist = await userModel.findById(userId);
    if (!userExist) {
      return apiResponse(res, 404, false, "User not found");
    }

    const wishlistForUser = await wishlistModel
      .findOne({
        user_id: userExist._id,
      })
      .populate("product_id");

    if (!wishlistForUser && wishlistForUser.length === 0) {
      return apiResponse(res, 404, false, "Wishlist not found");
    }

    return apiResponse(
      res,
      200,
      true,
      "Wishlist Fetched Successfully!",
      wishlistForUser
    );
  } catch (error) {
    console.error("Error while Fetching Wishlist", error);
    return apiResponse(res, 500, false, "Internal server error");
  }
};

// update user's wishlist
const updateUserWishlist = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { productIds } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return apiResponse(res, 404, false, "Invalid user id");
    }

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return apiResponse(
        res,
        400,
        false,
        "Product IDs must be a non-empty array"
      );
    }

    const userExist = await userModel.findById(userId);
    if (!userExist) {
      return apiResponse(res, 404, false, "User not found");
    }

    let wishlist = await wishlistModel.findOne({
      user_id: userExist._id,
    });

    if (wishlist) {
      const updatedProductIds = [
        ...new Set([
          ...wishlist.product_id,
          ...productIds.map((id) => new mongoose.Types.ObjectId(id)),
        ]),
      ]; // Ensures no duplicates
      wishlist.product_id = updatedProductIds;
      wishlist = await wishlist.save();
    } else {
      wishlist = await wishlistModel.create({
        user_id: userExist._id,
        product_id: productIds.map((id) => new mongoose.Types.ObjectId(id)),
      });
    }

    return apiResponse(
      res,
      200,
      true,
      "Wishlist updated successfully",
      wishlist
    );
  } catch (error) {
    console.error("Error while updating wishlist", error);
    return apiResponse(res, 500, false, "Internal server error");
  }
};

// delete product from wishlist
const deleteProductFromWishlist = async (req: Request, res: Response) => {
  try {
    const { userId, productId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return apiResponse(res, 400, false, "Invalid user or product ID");
    }

    const userExist = await userModel.findById(userId);
    if (!userExist) {
      return apiResponse(res, 404, false, "User not found");
    }

    const wishList = await wishlistModel.findOne({
      user_id: userExist._id,
    });

    if (!wishList) {
      return apiResponse(res, 404, false, "Wishlist not found");
    }

    const updatedProductIds = wishList.product_id.filter(
      (id: mongoose.Types.ObjectId) => id.toString() !== productId
    );

    if (updatedProductIds.length === wishList.product_id.length) {
      return apiResponse(res, 404, false, "Product not found in wishlist");
    }

    wishList.product_id = updatedProductIds;
    await wishList.save();

    return apiResponse(
      res,
      200,
      true,
      "Product removed from wishlist!",
      wishList
    );
  } catch (error) {
    console.error("Error while removing product from wishlist", error);
    return apiResponse(res, 500, false, "Internal server error");
  }
};

// get user's current order
const getUserOrders = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return apiResponse(res, 400, false, "Invalid user ID");
    }

    const userExist = await userModel.findById(userId);
    if (!userExist) {
      return apiResponse(res, 404, false, "User not found");
    }

    const UserOrders = await orderModel
      .find({
        user_id: userExist._id,
      })
      .sort({ createdAt: -1 });

    if (UserOrders.length === 0) {
      return apiResponse(res, 404, false, "No orders found");
    }

    return apiResponse(res, 200, true, "Orders Fetch Succesfully", {
      orders: UserOrders,
    });
  } catch (error) {
    console.error("Error while fetching user orders", error);
    return apiResponse(res, 500, false, "Internal server error");
  }
};

// Get the user orderHistory
const getUserOrderHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return apiResponse(res, 400, false, "Invalid user ID");
    }

    const orderHistory = await historyModel
      .findOne({
        user_id: userId,
      })
      .sort({
        createdAt: -1,
      });

    if (!orderHistory) {
      return apiResponse(res, 404, false, "No order history found");
    }

    return apiResponse(
      res,
      200,
      true,
      "Order Histort Fetched Succesfully!",
      orderHistory
    );
  } catch (error) {
    console.error("Error while Fetching OrderHistory", error);
    return apiResponse(res, 500, false, "Internal server error");
  }
};

// get userLoyaltiPoints
const getUserLoyaltiPoints = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return apiResponse(res, 400, false, "Invalid user ID");
    }

    const loyaltiData = await LoyaltyPointModel.findOne({
      user_id: userId,
    });

    if (!loyaltiData) {
      return apiResponse(
        res,
        404,
        false,
        "No loyalty points found for this user"
      );
    }

    return apiResponse(
      res,
      200,
      true,
      "Loyalti Points Fetched Succesfully",
      loyaltiData
    );
  } catch (error) {
    console.error("Error while fetching user loyalty points", error);
    return apiResponse(res, 500, false, "Internal Server Error");
  }
};

// Redeem loyalti Points
const RedeeemLoyaltiPoints = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { PointsToRedeem, description } = req.body;

    // Data Validation

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return apiResponse(res, 400, false, "Invalid user ID");
    }

    if (typeof PointsToRedeem !== "number" || PointsToRedeem <= 0) {
      return apiResponse(res, 400, false, "Invalid points to redeem");
    }

    if (!description || typeof description !== "string") {
      return apiResponse(res, 400, false, "Invalid description");
    }

    const loyaltiData = await LoyaltyPointModel.findOne({
      user_id: userId,
    });

    if (loyaltiData.totalPoints < PointsToRedeem) {
      return apiResponse(res, 400, false, "Insufficient loyalti points");
    }

    // update the loyalti points
    loyaltiData.totalPoints -= PointsToRedeem;
    loyaltiData.pointsHistory.push({
      transactionType: "Redeemed",
      points: PointsToRedeem,
      description,
      date: new Date(),
    });

    await loyaltiData.save();

    return apiResponse(
      res,
      200,
      true,
      "Loyalti Points Updated Succesfully!",
      loyaltiData
    );
  } catch (error) {
    console.error("Error while Redeeming loyalti points", error);
    return apiResponse(res, 500, false, "Internal Server Error");
  }
};

// Fetch the notifiction for User
const FetchUserNotification = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return apiResponse(res, 400, false, "Invalid user ID");
    }

    const notificaiton = await NotificationModel.findOne({
      user_id: userId,
    }).sort({
      createdAt: -1,
    });

    if (!notificaiton || notificaiton.length === 0) {
      return apiResponse(
        res,
        404,
        false,
        "No notifications found for this user"
      );
    }

    return apiResponse(
      res,
      200,
      true,
      "Notification Fetched Succesfully",
      notificaiton
    );
  } catch (error) {
    console.error("Error fetching notificaiton for user", error);
    return apiResponse(res, 500, false, "Internal Server Error");
  }
};

export {
  getUserProfile,
  updateUserProfile,
  FetchUserWishlist,
  updateUserWishlist,
  deleteProductFromWishlist,
  getUserOrders,
  getUserLoyaltiPoints,
  RedeeemLoyaltiPoints,
  FetchUserNotification,
  getUserOrderHistory,
};
