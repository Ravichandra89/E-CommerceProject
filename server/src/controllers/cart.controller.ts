import CartModel from "../models/Cart.model";
import { Request, Response } from "express";
import apiResponse from "../utils/ApiResponse";
import mongoose from "mongoose";
import productModel from "../models/Product.model";
import { getProductById } from "./product.controller";
import cartRoute from "../routes/cart.route";
import { createCipheriv } from "crypto";

const getUserCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return apiResponse(res, 400, false, "Invalid user ID.");
    }

    const cart = await CartModel.findOne({ userId }).populate(
      "products.productId",
      "name price images stock"
    );

    if (!cart || cart.products.length === 0) {
      return apiResponse(res, 404, false, "Cart is empty.");
    }

    return apiResponse(res, 200, true, "Cart fetched successfully.", cart);
  } catch (error) {
    console.error("Error while fetching cart", error);
    return apiResponse(res, 500, false, "Error while fetching cart");
  }
};

const addProductToCart = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { userId, quantity } = req.body;

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return apiResponse(res, 400, false, "Invalid product ID.");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return apiResponse(res, 400, false, "Invalid user ID.");
    }

    if (!quantity || quantity <= 0) {
      return apiResponse(res, 400, false, "Quantity must be greater than 0.");
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return apiResponse(res, 404, false, "Product not found.");
    }

    if (product.stock < quantity) {
      return apiResponse(res, 400, false, "Not enough stock for this product.");
    }

    let cart = await CartModel.findOne({
      userId,
    });

    if (!cart) {
      // Create new cart for the user
      cart = await CartModel.create({
        userId: new mongoose.Types.ObjectId(userId),
        products: [],
      });
    }

    // If product already exist in the cart
    const productInCart = cart.products.find(
      (item: any) => item.productId.toString() === productId
    );
    if (productInCart) {
      // Update the quantity of the product
      productInCart.quantity += quantity;
    } else {
      // Add the product to the cart
      cart.products.push({
        productId: new mongoose.Types.ObjectId(productId),
        quantity,
      });
    }

    await cart.save();

    return apiResponse(
      res,
      200,
      true,
      "Product added to cart Successfully",
      cart
    );
  } catch (error) {
    console.error("Error while adding product to cart", error);
    return apiResponse(res, 500, false, "Internal Server Error");
  }
};

const updateCart = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { userId, quantity } = req.body;

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return apiResponse(res, 400, false, "Invalid product ID.");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return apiResponse(res, 400, false, "Invalid user ID.");
    }

    if (!quantity || quantity < 0) {
      return apiResponse(res, 400, false, "Quantity must be zero or greater.");
    }

    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return apiResponse(res, 404, false, "Cart not found.");
    }

    const productInCart = cart.products.find(
      (item: any) => item.productId.toString() === productId
    );

    if (!productInCart) {
      return apiResponse(res, 404, false, "Product not found in cart.");
    }

    if (quantity === 0) {
      cart.products = cart.products.filter(
        (item: any) => item.productId.toString() !== productId
      );
    } else {
      const productDetails = await productModel.findById(productId);
      if (!productDetails) {
        return apiResponse(res, 404, false, "Product not found.");
      }

      if (productDetails.stock < quantity) {
        return apiResponse(
          res,
          400,
          false,
          `Insufficient stock. Available stock: ${productDetails.stock}`
        );
      }

      // Update the quantity in the cart
      productInCart.quantity = quantity;
    }

    await cart.save();

    return apiResponse(res, 200, true, "Cart updated successfully.", cart);
  } catch (error) {
    console.error("Error while updating cart", error);
    return apiResponse(res, 500, false, "Internal Server Error");
  }
};

const deleteProductFromCart = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return apiResponse(res, 400, false, "Invalid product ID.");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return apiResponse(res, 400, false, "Invalid user ID.");
    }

    const cartExist = await CartModel.findOne({
      userId,
    });

    const productInCart = cartExist.products.find(
      (item: any) => item.productId.toString() === productId
    );

    if (productInCart == -1) {
      return apiResponse(res, 404, false, "Product not found in cart.");
    }

    cartExist.products.splice(productInCart, 1);

    await cartExist.save();

    return apiResponse(
      res,
      200,
      true,
      "Product Removed from Cart Successfully",
      cartExist
    );
  } catch (error) {
    console.error("Error Removing product from cart", error);
    return apiResponse(res, 500, false, "Internal Server Error");
  }
};

export { getUserCart, addProductToCart, updateCart, deleteProductFromCart };
