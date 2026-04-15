import prisma from "../db/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteOldImage } from "../utils/utils.js";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/home/shiv/uploads";
// CREATE
export const createSubCategory = asyncHandler(async (req, res) => {
  const { name, sku, description, categoryId } = req.body;

  if (req.user.role !== "Admin") {
    return ApiError.send(res, 403, "Only admin can create subcategory");
  }

  if (!name?.trim() || !categoryId) {
    return ApiError.send(res, 400, "Name and categoryId required");
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    return ApiError.send(res, 404, "Parent category not found");
  }

  const image = req.file
  ? `/uploads/thumbnails/${req.file.filename}`
  : null;

  const subCategory = await prisma.subCategory.create({
    data: {
      name: name.trim(),
      sku: sku?.trim(),
      description: description?.trim(),
      categoryId,
      image, // 👈 IMPORTANT
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "SubCategory created", subCategory));
});

// udate 
export const updateSubCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, sku, description, categoryId } = req.body;

  if (req.user.role !== "Admin") {
    return ApiError.send(res, 403, "Only admin can update subcategory");
  }

  const existingSubCategory = await prisma.subCategory.findUnique({
    where: { id },
  });

  if (!existingSubCategory) {
    return ApiError.send(res, 404, "SubCategory not found");
  }

  let newImageFilename = existingSubCategory.image;

  // ✅ SAME IMAGE REPLACE LOGIC
  if (req.file) {
    if (existingSubCategory.image) {
      const fileName = existingSubCategory.image.replace(
  "/uploads/thumbnails/",
  ""
);

const fullPath = path.join(UPLOAD_DIR, "thumbnails", fileName);
      deleteOldImage(fullPath);
    }

    newImageFilename = `/uploads/thumbnails/${req.file.filename}`;
  }

  const updatedSubCategory = await prisma.subCategory.update({
    where: { id },
    data: {
      name: name?.trim() ?? existingSubCategory.name,
      sku: sku?.trim() ?? existingSubCategory.sku,
      description: description?.trim() ?? existingSubCategory.description,
      categoryId: categoryId ?? existingSubCategory.categoryId,
      image: newImageFilename,
    },
  });

  return res.status(200).json(
    new ApiResponse(200, "SubCategory updated successfully", {
      subCategory: updatedSubCategory,
    })
  );
});

// GET ALL
export const getSubCategories = asyncHandler(async (req, res) => {
  const subCategories = await prisma.subCategory.findMany({
    include: { category: true },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "All subcategories", subCategories));
});

// GET BY ID WITH CATEGORY
export const getCategoryWithSubCategories = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      subCategories: true, // 👈 important
    },
  });

  if (!category) {
    return ApiError.send(res, 404, "Category not found");
  }

  return res.status(200).json(
    new ApiResponse(200, "Category with subcategories", category)
  );
});

// DELETE BY ID
export const deleteSubCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user?.role !== "Admin") {
    return ApiError.send(res, 403, "Only admins can delete subcategory");
  }

  const subCategory = await prisma.subCategory.findUnique({
    where: { id },
    include: {
      products: true, // 👈 IMPORTANT
    },
  });

  if (!subCategory) {
    return ApiError.send(res, 404, "SubCategory not found");
  }

  // 🚫 BLOCK DELETE IF PRODUCTS EXIST
  if (subCategory.products.length > 0) {
    return ApiError.send(
      res,
      400,
      "Cannot delete subcategory. Please delete its products first."
    );
  }

  // ✅ IMAGE DELETE
  if (subCategory.image) {
    try {
      const fileName = subCategory.image.replace(
  "/uploads/thumbnails/",
  ""
);

const fullPath = path.join(UPLOAD_DIR, "thumbnails", fileName);
      deleteOldImage(fullPath);
    } catch (err) {
      console.log("Image delete error:", err.message);
    }
  }

  // ✅ DELETE SUBCATEGORY
  await prisma.subCategory.delete({
    where: { id },
  });

  return res.status(200).json({
    success: true,
    message: "SubCategory deleted successfully",
  });
});