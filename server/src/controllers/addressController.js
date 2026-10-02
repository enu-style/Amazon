import prisma from "../lib/prisma.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const getAddresses = async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    });

    return sendSuccess(
      res,
      200,
      { addresses },
      "Addresses retrieved successfully.",
    );
  } catch (error) {
    return sendError(res, 500, "Unable to load addresses.", error.message);
  }
};

export const createAddress = async (req, res) => {
  try {
    const { isDefault = false, ...addressData } = req.body;
    const address = await prisma.$transaction(async (tx) => {
      const addressCount = await tx.address.count({
        where: { userId: req.user.id },
      });
      const shouldBeDefault = isDefault || addressCount === 0;

      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { userId: req.user.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          ...addressData,
          userId: req.user.id,
          isDefault: shouldBeDefault,
        },
      });
    });

    return sendSuccess(res, 201, { address }, "Address created successfully.");
  } catch (error) {
    return sendError(res, 500, "Unable to create address.", error.message);
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { isDefault, ...addressData } = req.body;
    const address = await prisma.$transaction(async (tx) => {
      const existing = await tx.address.findFirst({
        where: { id, userId: req.user.id },
      });

      if (!existing) {
        return null;
      }

      if (isDefault === true) {
        await tx.address.updateMany({
          where: { userId: req.user.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id },
        data: {
          ...addressData,
          ...(isDefault === undefined ? {} : { isDefault }),
        },
      });
    });

    if (!address) {
      return sendError(res, 404, "Address not found.");
    }

    return sendSuccess(res, 200, { address }, "Address updated successfully.");
  } catch (error) {
    return sendError(res, 500, "Unable to update address.", error.message);
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await prisma.address.findFirst({
      where: { id, userId: req.user.id },
      select: { id: true, isDefault: true },
    });

    if (!address) {
      return sendError(res, 404, "Address not found.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.delete({ where: { id } });

      if (address.isDefault) {
        const nextDefault = await tx.address.findFirst({
          where: { userId: req.user.id },
          orderBy: { updatedAt: "desc" },
        });

        if (nextDefault) {
          await tx.address.update({
            where: { id: nextDefault.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return sendSuccess(res, 200, {}, "Address deleted successfully.");
  } catch (error) {
    return sendError(res, 500, "Unable to delete address.", error.message);
  }
};
