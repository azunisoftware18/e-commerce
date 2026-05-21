import prisma from "../db/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { upload, deleteByKey, getSignedFileUrl } from "../utils/s3Service.js";
import fs from "fs";
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
    // Delete uploaded file if category not found
    if (req.file) {
      const localFilePath = path.join(UPLOAD_DIR, "thumbnails", req.file.filename);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    }
    return ApiError.send(res, 404, "Parent category not found");
  }

  let imageData = null;

  if (req.file) {
    try {
      const localFilePath = path.join(UPLOAD_DIR, "thumbnails", req.file.filename);
      
      // Upload to S3
      const s3Result = await upload(localFilePath);
      
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

  const subCategory = await prisma.subCategory.create({
    data: {
      name: name.trim(),
      sku: sku?.trim(),
      description: description?.trim(),
      categoryId,
      image: imageData,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "SubCategory created", subCategory));
});

// UPDATE
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
    // Delete uploaded file if subcategory not found
    if (req.file) {
      const localFilePath = path.join(UPLOAD_DIR, "thumbnails", req.file.filename);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    }
    return ApiError.send(res, 404, "SubCategory not found");
  }

  let imageData = existingSubCategory.image;

  if (req.file) {
    try {
      // Delete old image from S3 if exists
      if (existingSubCategory.image?.key) {
        try {
          await deleteByKey(existingSubCategory.image.key);
        } catch (error) {
          console.error("Failed to delete old S3 image:", error);
        }
      }

      const localFilePath = path.join(UPLOAD_DIR, "thumbnails", req.file.filename);
      
      // Upload new image to S3
      const s3Result = await upload(localFilePath);
      
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

  const updatedSubCategory = await prisma.subCategory.update({
    where: { id },
    data: {
      name: name?.trim() ?? existingSubCategory.name,
      sku: sku?.trim() ?? existingSubCategory.sku,
      description: description?.trim() ?? existingSubCategory.description,
      categoryId: categoryId ?? existingSubCategory.categoryId,
      image: imageData,
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

  // Generate signed URLs for images
  const subCategoriesWithUrls = await Promise.all(
    subCategories.map(async (subCategory) => {
      if (subCategory.image?.key) {
        try {
          const signedUrl = await getSignedFileUrl(subCategory.image.key);
          return {
            ...subCategory,
            image: {
              ...subCategory.image,
              signedUrl,
            },
          };
        } catch (error) {
          console.error("Error generating signed URL:", error);
        }
      }
      return subCategory;
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "All subcategories", subCategoriesWithUrls));
});

// GET BY ID WITH CATEGORY
export const getCategoryWithSubCategories = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      subCategories: true,
    },
  });

  if (!category) {
    return ApiError.send(res, 404, "Category not found");
  }

  // Generate signed URLs for category image
  if (category.image?.key) {
    try {
      const signedUrl = await getSignedFileUrl(category.image.key);
      category.image = {
        ...category.image,
        signedUrl,
      };
    } catch (error) {
      console.error("Error generating signed URL for category:", error);
    }
  }

  // Generate signed URLs for subcategory images
  if (category.subCategories) {
    await Promise.all(
      category.subCategories.map(async (subCategory) => {
        if (subCategory.image?.key) {
          try {
            const signedUrl = await getSignedFileUrl(subCategory.image.key);
            subCategory.image = {
              ...subCategory.image,
              signedUrl,
            };
          } catch (error) {
            console.error("Error generating signed URL for subcategory:", error);
          }
        }
        return subCategory;
      })
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Category with subcategories", category)
  );
});

// DELETE
export const deleteSubCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user?.role !== "Admin") {
    return ApiError.send(res, 403, "Only admins can delete subcategory");
  }

  const subCategory = await prisma.subCategory.findUnique({
    where: { id },
    include: {
      products: true,
    },
  });

  if (!subCategory) {
    return ApiError.send(res, 404, "SubCategory not found");
  }

  // Block delete if products exist
  if (subCategory.products.length > 0) {
    return ApiError.send(
      res,
      400,
      "Cannot delete subcategory. Please delete its products first."
    );
  }

  // Delete image from S3 if exists
  if (subCategory.image?.key) {
    try {
      await deleteByKey(subCategory.image.key);
    } catch (error) {
      console.error("Failed to delete S3 image:", error);
    }
  }

  // Delete subcategory from database
  await prisma.subCategory.delete({
    where: { id },
  });

  return res.status(200).json(
    new ApiResponse(200, "SubCategory deleted successfully")
  );
});