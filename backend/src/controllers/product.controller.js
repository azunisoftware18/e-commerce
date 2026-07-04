import fs from "fs";
import path from "path";
import prisma from "../db/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { upload, deleteByKey, getSignedFileUrl } from "../utils/s3Service.js";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/home/shiv/uploads";

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, categoryid, subCategoryId, price, stock, status } =
    req.body;
  const { id: createdby, role } = req.user;

  if (role !== "Admin") {
    // Clean up uploaded files if user is not admin
    if (req.files?.length > 0) {
      files.forEach((file) => {
  const localFilePath = path.join(
    UPLOAD_DIR,
    "images",
    file.filename
  );

  if (fs.existsSync(localFilePath)) {
    fs.unlinkSync(localFilePath);
  }
});
    }
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
    // Clean up uploaded files on validation error
    if (req.files?.length > 0) {
      files.forEach((file) => {
  const localFilePath = path.join(
    UPLOAD_DIR,
    "images",
    file.filename
  );

  if (fs.existsSync(localFilePath)) {
    fs.unlinkSync(localFilePath);
  }
});
    }
    return ApiError.send(res, 400, "All required fields must be provided.");
  }

  const files = [
  req.files?.frontImage?.[0],
  req.files?.backImage?.[0],
  req.files?.leftImage?.[0],
  req.files?.rightImage?.[0],
].filter(Boolean);

if (files.length !== 4) {
  return ApiError.send(
    res,
    400,
    "Please upload Front, Back, Left and Right images."
  );
}

  const numericPrice = parseFloat(
    typeof price === "string" ? price.replace(/[^0-9.]/g, "") : price,
  );
  if (isNaN(numericPrice)) {
    // Clean up uploaded files
    files.forEach((file) => {
  const localFilePath = path.join(
    UPLOAD_DIR,
    "images",
    file.filename
  );

  if (fs.existsSync(localFilePath)) {
    fs.unlinkSync(localFilePath);
  }
});
    return ApiError.send(res, 400, "Invalid price format.");
  }

  const numericStock = parseInt(stock);
  if (isNaN(numericStock)) {
    // Clean up uploaded files
    files.forEach((file) => {
  const localFilePath = path.join(
    UPLOAD_DIR,
    "images",
    file.filename
  );

  if (fs.existsSync(localFilePath)) {
    fs.unlinkSync(localFilePath);
  }
});
    return ApiError.send(res, 400, "Invalid stock value.");
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryid },
  });

  if (!category) {
    // Clean up uploaded files
    files.forEach((file) => {
  const localFilePath = path.join(
    UPLOAD_DIR,
    "images",
    file.filename
  );

  if (fs.existsSync(localFilePath)) {
    fs.unlinkSync(localFilePath);
  }
});
    return ApiError.send(res, 404, "Category not found.");
  }

  // Upload images to S3
  let uploadedImages = [];
  try {
    const imageTypes = [
  "1_front",
  "2_back",
  "3_left",
  "4_right",
];



uploadedImages = await Promise.all(
  files.map(async (file, index) => {
    const localFilePath = path.join(
      UPLOAD_DIR,
      "images",
      file.filename
    );

    const fileName =
      `${imageTypes[index]}_${Date.now()}_${file.originalname}`;

    const s3Result = await upload(localFilePath, fileName);

    return {
      key: s3Result.key,
      url: s3Result.url,
    };
  })
);
  } catch (error) {
    // Clean up any remaining files on S3 upload error
    files.forEach((file) => {
  const localFilePath = path.join(
    UPLOAD_DIR,
    "images",
    file.filename
  );

  if (fs.existsSync(localFilePath)) {
    fs.unlinkSync(localFilePath);
  }
});
    console.error("S3 Upload Error:", error);
    return ApiError.send(res, 500, "Failed to upload images. Please try again.");
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
        create: uploadedImages.map((img) => ({
          url: img.url,
          key: img.key,
        })),
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

  // Generate signed URLs for all product images
  const productsWithSignedUrls = await Promise.all(
    products.map(async (product) => {
      const imagesWithSignedUrls = await Promise.all(
        product.images.map(async (image) => {
          if (image.key) {
            try {
              const signedUrl = await getSignedFileUrl(image.key);
              return {
                ...image,
                signedUrl,
              };
            } catch (error) {
              console.error("Error generating signed URL for image:", error);
            }
          }
          return image;
        })
      );
const imageOrder = [
  "front",
  "back",
  "left",
  "right",
];

imagesWithSignedUrls.sort((a, b) => {
  const aIndex = imageOrder.findIndex((x) => a.key.includes(x));
  const bIndex = imageOrder.findIndex((x) => b.key.includes(x));

  return aIndex - bIndex;
});
      return {
        ...product,
        images: imagesWithSignedUrls,
      };
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Products fetched successfully.", { 
      products: productsWithSignedUrls 
    }));
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

  // Generate signed URLs for product images
  if (product.images?.length > 0) {
    const imagesWithSignedUrls = await Promise.all(
      product.images.map(async (image) => {
        if (image.key) {
          try {
            const signedUrl = await getSignedFileUrl(image.key);
            return {
              ...image,
              signedUrl,
            };
          } catch (error) {
            console.error("Error generating signed URL for image:", error);
          }
        }
        return image;
      })
    );

    product.images = imagesWithSignedUrls;
  }
const imageOrder = [
  "front",
  "back",
  "left",
  "right",
];

product.images.sort((a, b) => {
  const aIndex = imageOrder.findIndex((x) => a.key.includes(x));
  const bIndex = imageOrder.findIndex((x) => b.key.includes(x));

  return aIndex - bIndex;
});
  return res
    .status(200)
    .json(new ApiResponse(200, "Product fetched successfully.", { product }));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, categoryid, subCategoryId, price, stock, status } =
    req.body;

  if (req.user?.role !== "Admin") {
    // Clean up uploaded files if user is not admin
    if (req.files?.length > 0) {
     files.forEach((file) => {
  const localFilePath = path.join(
    UPLOAD_DIR,
    "images",
    file.filename
  );

  if (fs.existsSync(localFilePath)) {
    fs.unlinkSync(localFilePath);
  }
});
    }
    return ApiError.send(res, 403, "Only admins can update products.");
  }

  const existingProduct = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!existingProduct) {
    // Clean up uploaded files if product not found
    if (req.files?.length > 0) {
     files.forEach((file) => {
  const localFilePath = path.join(
    UPLOAD_DIR,
    "images",
    file.filename
  );

  if (fs.existsSync(localFilePath)) {
    fs.unlinkSync(localFilePath);
  }
});
    }
    return ApiError.send(res, 404, "Product not found.");
  }

  if (categoryid) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryid },
    });
    if (!categoryExists) {
      // Clean up uploaded files if category doesn't exist
      if (req.files?.length > 0) {
        files.forEach((file) => {
  const localFilePath = path.join(
    UPLOAD_DIR,
    "images",
    file.filename
  );

  if (fs.existsSync(localFilePath)) {
    fs.unlinkSync(localFilePath);
  }
});
      }
      return ApiError.send(res, 404, "Category not found.");
    }
  }

  /* ---------- IMAGE REPLACEMENT WITH S3 ---------- */
  let imageUpdateData = undefined;

  const files = [
  req.files?.frontImage?.[0],
  req.files?.backImage?.[0],
  req.files?.leftImage?.[0],
  req.files?.rightImage?.[0],
].filter(Boolean);

if (files.length > 0) {
    try {
      // Delete old images from S3
      for (const img of existingProduct.images) {
        if (img.key) {
          try {
            await deleteByKey(img.key);
          } catch (error) {
            console.error("Failed to delete old S3 image:", error);
          }
        }
      }

      

const files = [
  req.files.frontImage?.[0],
  req.files.backImage?.[0],
  req.files.leftImage?.[0],
  req.files.rightImage?.[0],
].filter(Boolean);

const imageTypes = [
  "1_front",
  "2_back",
  "3_left",
  "4_right",
];

const uploadedImages = await Promise.all(
  files.map(async (file, index) => {
    const localFilePath = path.join(
      UPLOAD_DIR,
      "images",
      file.filename
    );

    const fileName =
      `${imageTypes[index]}_${Date.now()}_${file.originalname}`;

    const s3Result = await upload(localFilePath, fileName);

    return {
      key: s3Result.key,
      url: s3Result.url,
    };
  })
);

      // Delete old image records from database
      await prisma.productImage.deleteMany({
        where: { productId: id },
      });

      // Create new image records
      imageUpdateData = {
        images: {
          create: uploadedImages,
        },
      };
    } catch (error) {
      // Clean up new files on error
      files.forEach((file) => {
  const localFilePath = path.join(
    UPLOAD_DIR,
    "images",
    file.filename
  );

  if (fs.existsSync(localFilePath)) {
    fs.unlinkSync(localFilePath);
  }
});
      console.error("S3 Upload Error:", error);
      return ApiError.send(res, 500, "Failed to upload images. Please try again.");
    }
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

  // Update product with optional image data
  const updateData = {
    name: name?.trim() ?? existingProduct.name,
    description: description ?? existingProduct.description,
    categoryid: categoryid ?? existingProduct.categoryid,
    subCategoryId:
      subCategoryId !== undefined
        ? subCategoryId
        : existingProduct.subCategoryId,
    price: price !== undefined ? parseFloat(price) : existingProduct.price,
    stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
    status: status ?? existingProduct.status,
  };

  // Add image update data if new images were uploaded
  if (imageUpdateData) {
    Object.assign(updateData, imageUpdateData);
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: updateData,
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

  // Delete images from S3
  for (const img of product.images) {
    if (img.key) {
      try {
        await deleteByKey(img.key);
      } catch (error) {
        console.error("Failed to delete S3 image:", error);
      }
    }
  }

  await prisma.product.delete({ where: { id } });

  return res
    .status(200)
    .json(new ApiResponse(200, "Product deleted successfully."));
});

const getRecommendedProducts = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get User Cart
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  // Empty cart
  if (!cart || cart.items.length === 0) {
    const products = await prisma.product.findMany({
      where: {
        status: "Active",
        stock: {
          gt: 0,
        },
      },
      include: {
        images: true,
        category: true,
        subCategory: true,
      },
      take: 8,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        "Recommended products fetched successfully.",
        {
          products,
        }
      )
    );
  }

  // Cart Product IDs
  const cartProductIds = cart.items.map(
    (item) => item.productId
  );

  // Categories
  const categoryIds = [
    ...new Set(
      cart.items.map(
        (item) => item.product.categoryid
      )
    ),
  ];

  // Sub Categories
  const subCategoryIds = [
    ...new Set(
      cart.items
        .map(
          (item) => item.product.subCategoryId
        )
        .filter(Boolean)
    ),
  ];

  const products = await prisma.product.findMany({
    where: {
      id: {
        notIn: cartProductIds,
      },

      status: "Active",

      stock: {
        gt: 0,
      },

      OR: [
        {
          categoryid: {
            in: categoryIds,
          },
        },

        {
          subCategoryId: {
            in: subCategoryIds,
          },
        },
      ],
    },

    include: {
      images: true,
      category: true,
      subCategory: true,
    },

    take: 8,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      "Recommended products fetched successfully.",
      {
        products,
      }
    )
  );
});

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getRecommendedProducts,
};