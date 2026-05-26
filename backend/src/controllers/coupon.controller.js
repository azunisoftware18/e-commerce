import prisma from "../db/db.js";

// CREATE COUPON
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      expiryDate,
    } = req.body;

    // check existing coupon
    const existingCoupon = await prisma.coupon.findUnique({
      where: {
        code: code.toUpperCase(),
      },
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon already exists",
      });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount || 0),
        maxDiscountAmount: maxDiscountAmount
          ? Number(maxDiscountAmount)
          : null,
        usageLimit: Number(usageLimit || 1),
        expiryDate: new Date(expiryDate),
      },
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL COUPONS
export const getCoupons = async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE COUPON
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.findUnique({
      where: {
        id,
      },
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// APPLY COUPON
// APPLY COUPON
export const applyCoupon = async (req, res) => {
  try {
    const { couponCode, cartTotal } = req.body;

    // USER REQUIRED
    const userId = req.user.id;

    // FIND COUPON
    const coupon = await prisma.coupon.findUnique({
      where: {
        code: couponCode.toUpperCase(),
      },
    });

    // INVALID COUPON
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    // CHECK IF USER ALREADY USED COUPON
    const alreadyUsed = await prisma.couponUsage.findFirst({
      where: {
        userId,
        couponId: coupon.id,
      },
    });

    if (alreadyUsed) {
      return res.status(400).json({
        success: false,
        message: "You already used this coupon",
      });
    }

    // INACTIVE COUPON
    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: "Coupon is inactive",
      });
    }

    // EXPIRED COUPON
    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon expired",
      });
    }

    // USAGE LIMIT EXCEEDED
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit exceeded",
      });
    }

    // MINIMUM ORDER CHECK
    if (Number(cartTotal) < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order should be ₹${coupon.minOrderAmount}`,
      });
    }

    let discount = 0;

    // PERCENTAGE DISCOUNT
    if (coupon.discountType === "percentage") {
      discount =
        (Number(cartTotal) * coupon.discountValue) / 100;

      // MAX DISCOUNT CHECK
      if (
        coupon.maxDiscountAmount &&
        discount > coupon.maxDiscountAmount
      ) {
        discount = coupon.maxDiscountAmount;
      }
    }

    // FLAT DISCOUNT
    if (coupon.discountType === "flat") {
      discount = coupon.discountValue;
    }

    // FINAL TOTAL
    let finalTotal = Number(cartTotal) - Number(discount);

    // EXTRA SAFETY
    if (finalTotal < 0) {
      finalTotal = 0;
    }

    return res.status(200).json({
      success: true,
      couponCode: coupon.code,
      discount,
      finalTotal,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE COUPON
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedCoupon = await prisma.coupon.update({
      where: {
        id,
      },
      data: {
        ...req.body,
      },
    });

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon: updatedCoupon,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE COUPON
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.coupon.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleCouponStatus = async (
  req,
  res,
) => {
  try {
    const { id } = req.params;

    // FIND COUPON
    const coupon =
      await prisma.coupon.findUnique({
        where: { id },
      });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // TOGGLE STATUS
    const updatedCoupon =
      await prisma.coupon.update({
        where: { id },

        data: {
          isActive: !coupon.isActive,
        },
      });

    return res.status(200).json({
      success: true,
      message: `Coupon ${
        updatedCoupon.isActive
          ? "activated"
          : "deactivated"
      } successfully`,
      coupon: updatedCoupon,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};