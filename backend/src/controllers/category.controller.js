import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../db/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { upload, deleteByKey, getSignedFileUrl } from "../utils/s3Service.js";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/home/shiv/uploads";

// Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new category
const createCategory = asyncHandler(async (req, res) => {
  const { name, sku, description } = req.body;
  const { id, role } = req.user;

  if (role !== "Admin") {
    return ApiError.send(res, 403, "Only admins can create a category.");
  }

  if (!name?.trim() || !sku?.trim() || !description?.trim()) {
    return ApiError.send(
      res,
      400,
      "All fields (name, SKU, description) are required."
    );
  }

  const existingCategory = await prisma.category.findUnique({
    where: { sku },
  });

  if (existingCategory) {
    // Delete uploaded file if SKU already exists
    if (req.file) {
      const localFilePath = path.join(UPLOAD_DIR, "thumbnails", req.file.filename);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    }
    return ApiError.send(res, 409, "SKU already exists.");
  }

  let imageData = null;

  if (req.file) {
    try {
      const localFilePath = path.join(UPLOAD_DIR, "thumbnails", req.file.filename);
      
      // Upload to S3 (local file will be deleted automatically in upload function)
      const s3Result = await upload(localFilePath);
      
      // Store as plain object, Prisma will handle JSON serialization
      imageData = {
        key: s3Result.key,
        url: s3Result.url,
      };
    } catch (error) {
      // Cleanup local file on S3 upload error
      const localFilePath = path.join(UPLOAD_DIR, "thumbnails", req.file.filename);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
      console.error("S3 Upload Error:", error);
      return ApiError.send(res, 500, "Failed to upload image. Please try again.");
    }
  }

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      sku: sku.trim(),
      description: description.trim(),
      image: imageData,
      createdby: id,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Category created successfully", { category }));
});

// Get all categories - WITH SIGNED URLs ✅
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    include: { creator: true, products: true, subCategories: true },
  });

  // Generate signed URLs for each category image
  const categoriesWithSignedUrls = await Promise.all(
    categories.map(async (category) => {
      if (category.image?.key) {
        try {
          const signedUrl = await getSignedFileUrl(category.image.key);
          return {
            ...category,
            image: {
              ...category.image,
              signedUrl, // Temporary accessible URL
            },
          };
        } catch (error) {
          console.error("Error generating signed URL:", error);
        }
      }
      return category;
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Categories fetched", { categories: categoriesWithSignedUrls }));
});

// Get category by ID - WITH SIGNED URL ✅
const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "Admin") {
    return ApiError.send(res, 403, "Only admins can fetch a category.");
  }

  const category = await prisma.category.findUnique({
    where: { id },
    include: { creator: true, products: true },
  });

  if (!category) {
    return ApiError.send(res, 404, "Category not found.");
  }

  // Generate signed URL for the image
  if (category.image?.key) {
    try {
      const signedUrl = await getSignedFileUrl(category.image.key);
      category.image = {
        ...category.image,
        signedUrl,
      };
    } catch (error) {
      console.error("Error generating signed URL:", error);
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Category fetched successfully", { category }));
});

// Update category
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, sku, description } = req.body;

  if (req.user.role !== "Admin") {
    return ApiError.send(res, 403, "Only admins can update a category.");
  }

  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    if (req.file) {
      const localFilePath = path.join(UPLOAD_DIR, "thumbnails", req.file.filename);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    }
    return ApiError.send(res, 404, "Category not found.");
  }

  let imageData = existingCategory.image;

  if (req.file) {
    try {
      if (existingCategory.image?.key) {
        try {
          await deleteByKey(existingCategory.image.key);
        } catch (error) {
          console.error("Failed to delete old S3 image:", error);
        }
      }

      const localFilePath = path.join(UPLOAD_DIR, "thumbnails", req.file.filename);
      const s3Result = await upload(localFilePath);
      
      imageData = {
        key: s3Result.key,
        url: s3Result.url,
      };
    } catch (error) {
      const localFilePath = path.join(UPLOAD_DIR, "thumbnails", req.file.filename);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
      console.error("S3 Upload Error:", error);
      return ApiError.send(res, 500, "Failed to upload image. Please try again.");
    }
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      name: name?.trim() ?? existingCategory.name,
      sku: sku?.trim() ?? existingCategory.sku,
      description: description?.trim() ?? existingCategory.description,
      image: imageData,
    },
  });

  return res.status(200).json(
    new ApiResponse(200, "Category updated successfully", {
      category: updatedCategory,
    })
  );
});

// Delete category
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user?.role !== "Admin") {
    return ApiError.send(res, 403, "Only admins can delete a category.");
  }

  const existingCategory = await prisma.category.findUnique({
    where: { id },
    include: { products: true },
  });

  if (!existingCategory) {
    return ApiError.send(res, 404, "Category not found.");
  }

  if (existingCategory.products.length > 0) {
    return ApiError.send(
      res,
      400,
      "Cannot delete category. Please delete its products and subcategories first."
    );
  }

  if (existingCategory.image?.key) {
    try {
      await deleteByKey(existingCategory.image.key);
    } catch (error) {
      console.error("Failed to delete S3 image:", error);
    }
  }

  await prisma.category.delete({ where: { id } });

  return res.status(200).json(
    new ApiResponse(200, "Category deleted successfully")
  );
});

export {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};