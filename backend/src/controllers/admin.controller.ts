import { Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const getDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalOrders,
      ordersByStatus,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      recentOrders,
      revenueResult,
    ] = await Promise.all([
      // Total orders
      prisma.order.count(),

      // Orders grouped by status
      prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),

      // Total customers
      prisma.user.count({
        where: { role: 'CUSTOMER' },
      }),

      // Total active products
      prisma.product.count({
        where: { isActive: true },
      }),

      // Low stock products
      prisma.product.count({
        where: {
          isActive: true,
          stock: { lte: 5 },
        },
      }),

      // 5 most recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),

      // Total revenue from paid orders
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
        },
        _sum: {
          total: true,
        },
      }),
    ]);

    // Top selling products by order count
    const topOrderItems = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        total: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    const topProductDetails = await Promise.all(
      topOrderItems.map(async (item) => {
        const prod = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, slug: true, price: true },
        });
        return {
          product: prod,
          unitsSold: item._sum.quantity || 0,
          revenue: item._sum.total || 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalRevenue: revenueResult._sum.total || '0.00',
          totalOrders,
          totalCustomers,
          totalProducts,
          lowStockProducts,
        },
        ordersByStatus: ordersByStatus.reduce((acc, curr) => {
          acc[curr.status] = curr._count._all;
          return acc;
        }, {} as Record<string, number>),
        recentOrders,
        topProducts: topProductDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listCustomers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 15));
    const skip = (page - 1) * limit;

    const search = req.query.search ? String(req.query.search) : undefined;

    const where: Prisma.UserWhereInput = {
      role: 'CUSTOMER',
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: { orders: true, reviews: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        customers,
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

export const getCustomerById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);

    const customer = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        addresses: true,
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
          },
        },
        reviews: {
          take: 10,
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { customer },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomerStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { isActive, role } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError('Customer not found', 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(role !== undefined && { role }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        role: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'CUSTOMER_STATUS_UPDATED',
        entity: 'User',
        entityId: id,
        details: { isActive, role },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

export const listAuditLogs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const action = req.query.action ? String(req.query.action) : undefined;
    const entity = req.query.entity ? String(req.query.entity) : undefined;

    const where: Prisma.AuditLogWhereInput = {
      ...(action && { action }),
      ...(entity && { entity }),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        logs,
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
