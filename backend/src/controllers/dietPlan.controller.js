import fs from "fs";
import path from "path";
import prisma from "../db/db.js";
import { upload, deleteByKey, getSignedFileUrl } from "../utils/s3Service.js";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/home/shiv/uploads";

// CREATE DIET PLAN
// CREATE DIET PLAN
export const createDietPlan = async (req, res) => {
  try {
    const { name, description, price, type } = req.body;

    const pdf = req.files?.pdf?.[0];
    const thumbnail = req.files?.thumbnail?.[0];

    console.log("Files received:", {
      pdf: pdf ? { filename: pdf.filename, path: pdf.path, destination: pdf.destination } : null,
      thumbnail: thumbnail ? { filename: thumbnail.filename, path: thumbnail.path, destination: thumbnail.destination } : null,
    });

    if (!name || !type || !pdf || !thumbnail) {
      return res.status(400).json({
        success: false,
        message: "Name, type, PDF and thumbnail are required",
      });
    }

    if (!["FREE", "PAID"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be FREE or PAID",
      });
    }

    let finalPrice = 0;

    if (type === "PAID") {
      if (!price || isNaN(price) || Number(price) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid price is required for paid plans",
        });
      }
      finalPrice = Number(price);
    }

    if (type === "FREE") {
      finalPrice = 0;
    }

    // Upload PDF and thumbnail to S3
    let pdfData = null;
    let thumbnailData = null;

    try {
      // Upload PDF - use the full path where multer saved the file
      const pdfLocalPath = pdf.path; // Use pdf.path directly from multer
      console.log("Uploading PDF from:", pdfLocalPath);
      console.log("File exists:", fs.existsSync(pdfLocalPath));
      
      const pdfS3Result = await upload(pdfLocalPath);
      console.log("PDF uploaded to S3:", pdfS3Result);
      
      pdfData = {
        key: pdfS3Result.key,
        url: pdfS3Result.url,
      };

      // Upload Thumbnail - use the full path where multer saved the file
      const thumbnailLocalPath = thumbnail.path; // Use thumbnail.path directly from multer
      console.log("Uploading thumbnail from:", thumbnailLocalPath);
      console.log("File exists:", fs.existsSync(thumbnailLocalPath));
      
      const thumbnailS3Result = await upload(thumbnailLocalPath);
      console.log("Thumbnail uploaded to S3:", thumbnailS3Result);
      
      thumbnailData = {
        key: thumbnailS3Result.key,
        url: thumbnailS3Result.url,
      };
    } catch (error) {
      console.error("S3 Upload Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload files. Error: " + error.message,
      });
    }

    console.log("Creating diet plan with:", {
      pdfUrl: pdfData.url,
      pdfKey: pdfData.key,
      thumbnail: thumbnailData.url,
      thumbnailKey: thumbnailData.key,
    });

    const dietPlan = await prisma.dietPlan.create({
      data: {
        name,
        description,
        price: finalPrice,
        type,
        pdfUrl: pdfData.url,
        pdfKey: pdfData.key,
        thumbnail: thumbnailData.url,
        thumbnailKey: thumbnailData.key,
      },
    });

    res.status(201).json({
      success: true,
      message: "Diet plan created successfully",
      data: dietPlan,
    });
  } catch (error) {
    console.error("CREATE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Diet Plan
export const updateDietPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, type } = req.body;

    const pdf = req.files?.pdf?.[0];
    const thumbnail = req.files?.thumbnail?.[0];

    const existingPlan = await prisma.dietPlan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      return res.status(404).json({
        success: false,
        message: "Diet plan not found",
      });
    }

    if (type && !["FREE", "PAID"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be FREE or PAID",
      });
    }

    const finalType = type || existingPlan.type;
    let finalPrice = existingPlan.price;

    if (finalType === "PAID") {
      if (price !== undefined) {
        if (isNaN(price) || Number(price) <= 0) {
          return res.status(400).json({
            success: false,
            message: "Valid price is required for paid plans",
          });
        }
        finalPrice = Number(price);
      }
    } else if (finalType === "FREE") {
      finalPrice = 0;
    }

    // Handle new PDF and thumbnail uploads to S3
    let pdfData = {
      pdfUrl: existingPlan.pdfUrl,
      pdfKey: existingPlan.pdfKey,
    };
    let thumbnailData = {
      thumbnail: existingPlan.thumbnail,
      thumbnailKey: existingPlan.thumbnailKey,
    };

    try {
      // Handle PDF update
      if (pdf) {
        // Delete old PDF from S3
        if (existingPlan.pdfKey) {
          try {
            await deleteByKey(existingPlan.pdfKey);
          } catch (error) {
            console.error("Failed to delete old PDF from S3:", error);
          }
        }

        // Upload new PDF to S3
        const pdfLocalPath = path.join(UPLOAD_DIR, "pdfs", pdf.filename);
        const pdfS3Result = await upload(pdfLocalPath);
        pdfData = {
          pdfUrl: pdfS3Result.url,
          pdfKey: pdfS3Result.key,
        };
      }

      // Handle thumbnail update
      if (thumbnail) {
        // Delete old thumbnail from S3
        if (existingPlan.thumbnailKey) {
          try {
            await deleteByKey(existingPlan.thumbnailKey);
          } catch (error) {
            console.error("Failed to delete old thumbnail from S3:", error);
          }
        }

        // Upload new thumbnail to S3
        const thumbnailLocalPath = path.join(UPLOAD_DIR, "thumbnails", thumbnail.filename);
        const thumbnailS3Result = await upload(thumbnailLocalPath);
        thumbnailData = {
          thumbnail: thumbnailS3Result.url,
          thumbnailKey: thumbnailS3Result.key,
        };
      }
    } catch (error) {
      console.error("S3 Upload Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload files. Please try again.",
      });
    }

    const updatedPlan = await prisma.dietPlan.update({
      where: { id },
      data: {
        name: name || existingPlan.name,
        description: description !== undefined ? description : existingPlan.description,
        price: finalPrice,
        type: finalType,
        ...pdfData,
        ...thumbnailData,
      },
    });

    res.status(200).json({
      success: true,
      message: "Diet plan updated successfully",
      data: updatedPlan,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL DIET PLANS
export const getDietPlans = async (req, res) => {
  try {
    const plans = await prisma.dietPlan.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Generate signed URLs for thumbnails
    const plansWithSignedUrls = await Promise.all(
      plans.map(async (plan) => {
        const updatedPlan = { ...plan };

        // Generate signed URL for thumbnail
        if (plan.thumbnailKey) {
          try {
            updatedPlan.thumbnailSignedUrl = await getSignedFileUrl(plan.thumbnailKey);
          } catch (error) {
            console.error("Error generating signed URL for thumbnail:", error);
          }
        }

        return updatedPlan;
      })
    );

    res.status(200).json({
      success: true,
      data: plansWithSignedUrls,
    });
  } catch (error) {
    console.error("GET ALL ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE DIET PLAN
export const getDietPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await prisma.dietPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Diet plan not found",
      });
    }

    // Generate signed URLs
    if (plan.thumbnailKey) {
      try {
        plan.thumbnailSignedUrl = await getSignedFileUrl(plan.thumbnailKey);
      } catch (error) {
        console.error("Error generating signed URL for thumbnail:", error);
      }
    }

    if (plan.pdfKey) {
      try {
        plan.pdfSignedUrl = await getSignedFileUrl(plan.pdfKey);
      } catch (error) {
        console.error("Error generating signed URL for PDF:", error);
      }
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error("GET ONE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE DIET PLAN (with S3 file cleanup)
export const deleteDietPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await prisma.dietPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Diet plan not found",
      });
    }

    // Delete files from S3
    if (plan.pdfKey) {
      try {
        await deleteByKey(plan.pdfKey);
      } catch (error) {
        console.error("Failed to delete PDF from S3:", error);
      }
    }

    if (plan.thumbnailKey) {
      try {
        await deleteByKey(plan.thumbnailKey);
      } catch (error) {
        console.error("Failed to delete thumbnail from S3:", error);
      }
    }

    await prisma.dietPlan.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Diet plan deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DOWNLOAD DIET PLAN
export const downloadDietPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // from auth middleware (optional)

    const plan = await prisma.dietPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Diet plan not found",
      });
    }

    // Check if PDF key exists in S3
    if (!plan.pdfKey) {
      return res.status(404).json({
        success: false,
        message: "PDF not found for this diet plan",
      });
    }

    // For FREE plans, allow download via signed URL
    if (plan.type === "FREE") {
      try {
        const signedUrl = await getSignedFileUrl(plan.pdfKey);
        return res.redirect(signedUrl);
      } catch (error) {
        console.error("Error generating signed URL:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to generate download link",
        });
      }
    }

    // For PAID plans, check if user has purchased
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login to download this plan",
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        userId,
        status: "PAID",
        items: {
          some: {
            productId: id,
          },
        },
      },
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message: "Please purchase this plan first",
      });
    }

    // Generate signed URL for download
    try {
      const signedUrl = await getSignedFileUrl(plan.pdfKey);
      return res.redirect(signedUrl);
    } catch (error) {
      console.error("Error generating signed URL:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to generate download link",
      });
    }
  } catch (error) {
    console.error("DOWNLOAD ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};