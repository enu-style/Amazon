import prisma from "../lib/prisma.js";

// Get all coupons (Admin only)
export const getAllCoupons = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              usages: true,
              orders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit),
      }),
      prisma.coupon.count({ where }),
    ]);

    res.json({
      success: true,
      data: coupons,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get coupons error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
      error: error.message,
    });
  }
};

// Get single coupon
export const getCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            usages: true,
            orders: true,
          },
        },
      },
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error("Get coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupon",
      error: error.message,
    });
  }
};

// Validate and get coupon by code (Customer)
export const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    // Find coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    // Check if coupon is active
    if (coupon.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: "This coupon is no longer active",
      });
    }

    // Check expiration
    const now = new Date();
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return res.status(400).json({
        success: false,
        message: "This coupon has expired",
      });
    }

    if (new Date(coupon.validFrom) > now) {
      return res.status(400).json({
        success: false,
        message: "This coupon is not yet valid",
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "This coupon has reached its usage limit",
      });
    }

    // Check per-user usage limit
    const userUsageCount = await prisma.couponUsage.count({
      where: {
        couponId: coupon.id,
        userId,
      },
    });

    if (userUsageCount >= coupon.usagePerUser) {
      return res.status(400).json({
        success: false,
        message: "You have already used this coupon the maximum number of times",
      });
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && parseFloat(subtotal) < parseFloat(coupon.minOrderAmount)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of $${parseFloat(coupon.minOrderAmount).toFixed(2)} required`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = (parseFloat(subtotal) * parseFloat(coupon.discountValue)) / 100;
      // Apply max discount if specified
      if (coupon.maxDiscount && discountAmount > parseFloat(coupon.maxDiscount)) {
        discountAmount = parseFloat(coupon.maxDiscount);
      }
    } else if (coupon.type === 'FIXED_AMOUNT') {
      discountAmount = parseFloat(coupon.discountValue);
      // Don't let discount exceed subtotal
      if (discountAmount > parseFloat(subtotal)) {
        discountAmount = parseFloat(subtotal);
      }
    } else if (coupon.type === 'FREE_SHIPPING') {
      // Discount will be applied to shipping, not subtotal
      discountAmount = 0; // Handled separately in checkout
    }

    res.json({
      success: true,
      data: {
        coupon: {
          id: coupon.id,
          code: coupon.code,
          type: coupon.type,
          discountValue: coupon.discountValue,
          description: coupon.description,
        },
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        message: coupon.type === 'FREE_SHIPPING' 
          ? 'Free shipping will be applied at checkout'
          : `Discount of $${discountAmount.toFixed(2)} applied`,
      },
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate coupon",
      error: error.message,
    });
  }
};

// Create coupon (Admin only)
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      type,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      usagePerUser,
      validFrom,
      validUntil,
    } = req.body;

    // Validate required fields
    if (!code || !type || !discountValue) {
      return res.status(400).json({
        success: false,
        message: "Code, type, and discount value are required",
      });
    }

    // Check if code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCoupon) {
      return res.status(409).json({
        success: false,
        message: "A coupon with this code already exists",
      });
    }

    // Validate discount value
    if (type === 'PERCENTAGE' && (discountValue < 0 || discountValue > 100)) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount must be between 0 and 100",
      });
    }

    if ((type === 'FIXED_AMOUNT' || type === 'FREE_SHIPPING') && discountValue < 0) {
      return res.status(400).json({
        success: false,
        message: "Discount value must be positive",
      });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description,
        type,
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        usagePerUser: usagePerUser ? parseInt(usagePerUser) : 1,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
        createdById: req.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create coupon",
      error: error.message,
    });
  }
};

// Update coupon (Admin only)
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      description,
      type,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      usagePerUser,
      status,
      validFrom,
      validUntil,
    } = req.body;

    const coupon = await prisma.coupon.findUnique({ where: { id } });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // Validate discount value if provided
    if (type && discountValue !== undefined) {
      if (type === 'PERCENTAGE' && (discountValue < 0 || discountValue > 100)) {
        return res.status(400).json({
          success: false,
          message: "Percentage discount must be between 0 and 100",
        });
      }
      if ((type === 'FIXED_AMOUNT' || type === 'FREE_SHIPPING') && discountValue < 0) {
        return res.status(400).json({
          success: false,
          message: "Discount value must be positive",
        });
      }
    }

    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (discountValue !== undefined) updateData.discountValue = parseFloat(discountValue);
    if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount ? parseFloat(minOrderAmount) : null;
    if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount ? parseFloat(maxDiscount) : null;
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit ? parseInt(usageLimit) : null;
    if (usagePerUser !== undefined) updateData.usagePerUser = usagePerUser ? parseInt(usagePerUser) : 1;
    if (status !== undefined) updateData.status = status;
    if (validFrom !== undefined) updateData.validFrom = new Date(validFrom);
    if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : null;

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            usages: true,
            orders: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Coupon updated successfully",
      data: updatedCoupon,
    });
  } catch (error) {
    console.error("Update coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update coupon",
      error: error.message,
    });
  }
};

// Delete coupon (Admin only)
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // Check if coupon has been used in orders
    if (coupon._count.orders > 0) {
      // Instead of deleting, mark as inactive
      await prisma.coupon.update({
        where: { id },
        data: { status: 'INACTIVE' },
      });

      return res.json({
        success: true,
        message: "Coupon has been deactivated (it was used in orders)",
      });
    }

    // Safe to delete
    await prisma.coupon.delete({ where: { id } });

    res.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
      error: error.message,
    });
  }
};

// Get coupon usage statistics (Admin only)
export const getCouponStatistics = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        usages: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { usedAt: 'desc' },
          take: 50,
        },
        orders: {
          select: {
            id: true,
            total: true,
            discount: true,
            createdAt: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // Calculate statistics
    const totalDiscount = coupon.orders.reduce(
      (sum, order) => sum + parseFloat(order.discount),
      0
    );

    const totalRevenue = coupon.orders.reduce(
      (sum, order) => sum + parseFloat(order.total),
      0
    );

    res.json({
      success: true,
      data: {
        coupon: {
          id: coupon.id,
          code: coupon.code,
          type: coupon.type,
          discountValue: coupon.discountValue,
          usedCount: coupon.usedCount,
          usageLimit: coupon.usageLimit,
        },
        statistics: {
          totalUsages: coupon.usages.length,
          totalOrders: coupon.orders.length,
          totalDiscount: parseFloat(totalDiscount.toFixed(2)),
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          averageOrderValue: coupon.orders.length > 0 
            ? parseFloat((totalRevenue / coupon.orders.length).toFixed(2))
            : 0,
        },
        recentUsages: coupon.usages,
        recentOrders: coupon.orders,
      },
    });
  } catch (error) {
    console.error("Get coupon statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupon statistics",
      error: error.message,
    });
  }
};
