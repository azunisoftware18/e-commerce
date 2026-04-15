import prisma from "../db/db.js";

// ✅ CREATE CONSULTATION
export const createConsultation = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      age,
      weight,
      phone,
      email,
      healthIssues,
      otherIssue,
      dietPlanId,
    } = req.body;

    // ✅ validation
    if (!firstName || !lastName || !age || !weight || !phone) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    if (!healthIssues || healthIssues.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one health issue",
      });
    }

    if (healthIssues.includes("Other") && !otherIssue) {
      return res.status(400).json({
        success: false,
        message: "Please specify other issue",
      });
    }

    const consultation = await prisma.consultation.create({
      data: {
        firstName,
        lastName,
        age: Number(age),
        weight: Number(weight),
        phone,
        email,
        healthIssues, // JSON field
        otherIssue,
        dietPlanId: dietPlanId || null,
      },
      include: {
        dietPlan: true, // 🔥 relation data bhi milega
      },
    });

    return res.status(201).json({
      success: true,
      message: "Consultation submitted successfully",
      data: consultation,
    });
  } catch (error) {
    console.error("CREATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



// ✅ GET ALL CONSULTATIONS
export const getConsultations = async (req, res) => {
  try {
    const consultations = await prisma.consultation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        dietPlan: true,
      },
    });

    return res.status(200).json({
      success: true,
      count: consultations.length,
      data: consultations,
    });
  } catch (error) {
    console.error("GET ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



// ✅ GET SINGLE CONSULTATION
export const getConsultationById = async (req, res) => {
  try {
    const { id } = req.params;

    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: {
        dietPlan: true,
      },
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: "Consultation not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: consultation,
    });
  } catch (error) {
    console.error("GET ONE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



// ✅ DELETE CONSULTATION
export const deleteConsultation = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.consultation.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Consultation deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};