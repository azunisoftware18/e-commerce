import fs from "fs";
import path from "path";
import prisma from "../db/db.js";

// CREATE DIET PLAN
export const createDietPlan = async (req, res) => {
  try {
    const { name, description, price, type } = req.body;

    const pdf = req.files?.pdf?.[0];
    const thumbnail = req.files?.thumbnail?.[0];

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

    const dietPlan = await prisma.dietPlan.create({
      data: {
        name,
        description,
        price: finalPrice,
        type,
        pdfUrl: `/uploads/pdfs/${pdf.filename}`,
        thumbnail: `/uploads/thumbnails/${thumbnail.filename}`,
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

//  GET ALL DIET PLANS
export const getDietPlans = async (req, res) => {
  try {
    const plans = await prisma.dietPlan.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: plans,
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

// DELETE DIET PLAN (with file cleanup)
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

    const pdfPath = path.join("public", plan.pdfUrl);
    const thumbPath = path.join("public", plan.thumbnail);

    if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);

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

    const filePath = path.join("public", plan.pdfUrl);

    if (plan.type === "FREE") {
      return res.download(filePath);
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

    return res.download(filePath);
  } catch (error) {
    console.error("DOWNLOAD ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};