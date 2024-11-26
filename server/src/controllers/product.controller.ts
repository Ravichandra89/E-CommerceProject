import productModel from "../models/Product.model";
import { Request, Response } from "express";
import apiResponse from "../utils/ApiResponse";

const getAllProducts = async (req: Request, res: Response) => {
  try {
    // Pagination Optimise approach

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;

    const products = await productModel
      .find()
      .populate("supplier_id")
      .populate("category_id")
      .populate("reviews")
      .skip(skip)
      .limit(limit);

    // Total counts of products
    const totalProducts = await productModel.countDocuments();

    // Total number of pages
    const totalPages = Math.ceil(totalProducts / limit);

    if (products.length === 0) {
      return apiResponse(res, 404, false, "No product found");
    }

    return apiResponse(res, 200, true, "Product fetched succesfully", {
      products,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        productPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error while fetching all Products", error);
    return apiResponse(res, 500, false, "Internal server error");
  }
};

const getProductById = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return apiResponse(res, 400, false, "ProductId is Required");
    }

    const product = await productModel
      .findById(productId)
      .populate("supplier_id")
      .populate("category_id")
      .populate("reviews");

    if (!product) {
      return apiResponse(res, 404, false, "Product not found");
    }

    return apiResponse(
      res,
      200,
      true,
      `Product fetched succesfully : ${productId}`,
      product
    );
  } catch (error) {
    console.error("Error while fetching product by id", error);
    return apiResponse(res, 500, false, "Internal Server Error");
  }
};

const searchProduct = async (req: Request, res: Response) => {
  try {
    const { searchTerm } = req.params;

    if (!searchTerm || searchTerm.trim().length === 0) {
      return apiResponse(res, 400, false, "Search term is required");
    }

    const products = await productModel
      .find({
        $or: [
          { name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive match for name
          { description: { $regex: searchTerm, $options: "i" } }, // Case-insensitive match for description
        ],
      })
      .populate("supplier_id")
      .populate("category_id")
      .populate("reviews");

    if (products.length === 0) {
      return apiResponse(res, 404, false, "No products found");
    }

    return apiResponse(res, 200, true, "Products fetched succesfully!", {
      products,
    });
  } catch (error) {
    console.error("Error while searching products", error);
    return apiResponse(res, 500, false, "Internal server error");
  }
};

const filterProduct = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const { minPrice, maxPrice, inStock, supplierId } = req.body;

    const filter: Record<string, any> = {};

    if (category) {
      filter.category_id = category;
    }

    // Filter by min and maxPrice
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice as string);
    }

    // Filter by stock
    if (inStock) {
      filter.stock = { $gt: 0 };
    }

    // Filter by supplier ID
    if (supplierId) {
      filter.supplier_id = supplierId;
    }

    // Fetch the filtered products
    const products = await productModel
      .find(filter)
      .populate("supplier_id")
      .populate("category_id")
      .populate("reviews");

    if (!products || products.length === 0) {
      return apiResponse(res, 404, false, "No products found");
    }

    return apiResponse(
      res,
      200,
      true,
      "Filtered Products Fetched Succesfully!",
      products
    );
  } catch (error) {
    console.error("Error Filtering Products", error);
    return apiResponse(res, 500, false, "Internal Server Error");
  }
};

// GET /api/v1/product/filter/64b2f3f1e4b0c5b45a6820e2
// GET /api/v1/product/filter/64b2f3f1e4b0c5b45a6820e2?minPrice=200&maxPrice=500
// GET /api/v1/product/filter/64b2f3f1e4b0c5b45a6820e2?inStock=true&supplierId=64b2f1e1e4b0c5b45a6820e0

export { getAllProducts, getProductById, searchProduct, filterProduct };
