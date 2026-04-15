import path from "path";
import prisma from "../db/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteOldImage } from "../utils/utils.js";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/home/shiv/uploads";

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, categoryid, subCategoryId, price, stock, status } =
    req.body;
  const { id: createdby, role } = req.user;

  const imagePaths =
    req.files?.map((file) => `/uploads/${file.filename}`) || [];

  if (role !== "Admin") {
    return ApiError.send(res, 403, "Only admins can create a product.");
  }

  if (
    !name ||
    !description ||
    !categoryid ||
    !subCategoryId ||
    !price ||
    !stock ||
    !status
  ) {
    return ApiError.send(res, 400, "All required fields must be provided.");
  }

  if (imagePaths.length === 0) {
    return ApiError.send(res, 400, "Please upload at least one product image.");
  }

  const numericPrice = parseFloat(
    typeof price === "string" ? price.replace(/[^0-9.]/g, "") : price,
  );
  if (isNaN(numericPrice)) {
    return ApiError.send(res, 400, "Invalid price format.");
  }

  const numericStock = parseInt(stock);
  if (isNaN(numericStock)) {
    return ApiError.send(res, 400, "Invalid stock value.");
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryid },
  });

  if (!category) {
    return ApiError.send(res, 404, "Category not found.");
  }

  const product = await prisma.product.create({
    data: {
      name: name.trim(),
      description,
      categoryid,
      subCategoryId: subCategoryId,
      price: numericPrice,
      stock: numericStock,
      status,
      createdby,
      images: {
        create: imagePaths.map((url) => ({ url })),
      },
    },
    include: { images: true },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Product created successfully", { product }));
});

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    include: { category: true, images: true, subCategory: true },
    orderBy: { name: "asc" },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Products fetched successfully.", { products }));
});

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, images: true, orderItems: true, creator: true },
  });

  if (!product) {
    return ApiError.send(res, 404, "Product not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Product fetched successfully.", { product }));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, categoryid, subCategoryId, price, stock, status } =
    req.body;

  if (req.user?.role !== "Admin") {
    return ApiError.send(res, 403, "Only admins can update products.");
  }

  const existingProduct = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!existingProduct) {
    return ApiError.send(res, 404, "Product not found.");
  }

  if (categoryid) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryid },
    });
    if (!categoryExists) {
      return ApiError.send(res, 404, "Category not found.");
    }
  }

  /* ---------- IMAGE REPLACEMENT ---------- */
  if (req.files?.length > 0) {
    // Delete old images
    for (const img of existingProduct.images) {
      const fileName = img.url.replace("/uploads/", "");
      const fullPath = path.join(UPLOAD_DIR, fileName);
      deleteOldImage(fullPath);
    }

    await prisma.productImage.deleteMany({
      where: { productId: id },
    });

    await prisma.product.update({
      where: { id },
      data: {
        images: {
          create: req.files.map((file) => ({
            url: `/uploads/${file.filename}`,
          })),
        },
      },
    });
  }

  const numericPrice =
    price !== undefined ? parseFloat(price) : existingProduct.price;

  if (price !== undefined && (isNaN(numericPrice) || numericPrice < 0)) {
    return ApiError.send(res, 400, "Invalid price format.");
  }

  const numericStock =
    stock !== undefined ? parseInt(stock, 10) : existingProduct.stock;

  if (stock !== undefined && (isNaN(numericStock) || numericStock < 0)) {
    return ApiError.send(res, 400, "Invalid stock value.");
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      name: name?.trim() ?? existingProduct.name,
      description: description ?? existingProduct.description,
      categoryid: categoryid ?? existingProduct.categoryid,
      subCategoryId:
        subCategoryId !== undefined
          ? subCategoryId
          : existingProduct.subCategoryId, // ✅ IMPORTANT
      price: price ? parseFloat(price) : existingProduct.price,
      stock: stock ? parseInt(stock) : existingProduct.stock,
      status: status ?? existingProduct.status,
    },

    include: { images: true },
  });

  return res.status(200).json(
    new ApiResponse(200, "Product updated successfully.", {
      product: updatedProduct,
    }),
  );
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user?.role !== "Admin") {
    return ApiError.send(res, 403, "Only admins can delete products.");
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!product) {
    return ApiError.send(res, 404, "Product not found.");
  }

  for (const img of product.images) {
    const fileName = img.url.replace("/uploads/", "");
    const fullPath = path.join(UPLOAD_DIR, fileName);
    deleteOldImage(fullPath);
  }

  await prisma.product.delete({ where: { id } });

  return res
    .status(200)
    .json(new ApiResponse(200, "Product deleted successfully."));
});

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
