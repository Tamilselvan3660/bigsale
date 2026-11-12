import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { Prisma, OrderStatus, ShipmentStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
  ]),
  adminNotes: z.string().optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
});

export const getMyOrders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const { status } = req.query;
    const where: Prisma.OrderWhereInput = {
      userId: req.user.id,
      ...(status && { status: status as OrderStatus }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: { take: 1 },
                },
              },
            },
          },
          shippingAddress: true,
          payments: true,
          shipments: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const id = String(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 },
              },
            },
            variant: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
        payments: true,
        shipments: true,
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Only allow customer to view their own order; admin can view all
    if (req.user.role === 'CUSTOMER' && order.userId !== req.user.id) {
      throw new AppError('Forbidden: Access denied to this order', 403);
    }

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 15));
    const skip = (page - 1) * limit;

    const { status, paymentStatus, search } = req.query;

    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status as OrderStatus;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus as any;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search as string, mode: 'insensitive' } },
        { user: { email: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          items: true,
          payments: true,
          shipments: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { status, adminNotes, trackingNumber, carrier } =
      updateOrderStatusSchema.parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id },
      include: { shipments: true },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order
      const updated = await tx.order.update({
        where: { id },
        data: {
          status: status as OrderStatus,
          ...(adminNotes && { adminNotes }),
        },
      });

      // Update shipment if status changed to shipped
      let shipmentStatus: ShipmentStatus | undefined;
      if (status === 'SHIPPED') shipmentStatus = ShipmentStatus.IN_TRANSIT;
      else if (status === 'DELIVERED') shipmentStatus = ShipmentStatus.DELIVERED;
      else if (status === 'CANCELLED') shipmentStatus = ShipmentStatus.RETURNED;

      if (order.shipments && order.shipments.length > 0) {
        await tx.shipment.update({
          where: { id: order.shipments[0].id },
          data: {
            ...(shipmentStatus && { status: shipmentStatus }),
            ...(trackingNumber && { trackingNumber }),
            ...(carrier && { carrier }),
            ...(status === 'SHIPPED' && { shippedAt: new Date() }),
            ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
          },
        });
      }

      // Notify customer
      await tx.notification.create({
        data: {
          userId: order.userId,
          title: `Order Status Update: ${status}`,
          message: `Your order #${order.orderNumber} status has been updated to ${status}.`,
          type: 'ORDER_STATUS',
          link: `/orders/${order.id}`,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId: req.user?.id,
          action: 'ORDER_STATUS_UPDATED',
          entity: 'Order',
          entityId: order.id,
          details: { oldStatus: order.status, newStatus: status },
        },
      });

      return updated;
    });

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: { order: updatedOrder },
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const id = String(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (req.user.role === 'CUSTOMER' && order.userId !== req.user.id) {
      throw new AppError('Forbidden', 403);
    }

    if (
      order.status === OrderStatus.SHIPPED ||
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new AppError(
        `Cannot cancel an order that is already ${order.status}`,
        400
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Restore product stock
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // 2. Update status
      await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
      });

      // 3. Audit Log
      await tx.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'ORDER_CANCELLED',
          entity: 'Order',
          entityId: order.id,
          details: { orderNumber: order.orderNumber },
        },
      });
    });

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and inventory restored',
    });
  } catch (error) {
    next(error);
  }
};
