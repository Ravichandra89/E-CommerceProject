import express, { Router } from "express";
import {
  getAllProducts,
  getProductById,
  searchProduct,
  filterProduct,
} from "../controllers/product.controller";

const productRoute = Router();

// Define productRoute
productRoute.get("/", getAllProducts);
productRoute.get("/:productId", getProductById);
productRoute.get("/search/:searchTerm", searchProduct);
productRoute.get("/filter/:category", filterProduct);

export default productRoute;
