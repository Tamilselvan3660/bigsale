import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const createProductSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  sku: z.string().min(2, 'SKU is required'),
  description: z.string().min(5, 'Description is required'),
  shortDescription: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
  compareAtPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  stock: z.number().int().nonnegative().default(0),
  lowStockThreshold: z.number().int().nonnegative().default(5),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  categoryId: z.string().uuid('Invalid category ID'),
  brandId: z.string().uuid('Invalid brand ID').optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        altText: z.string().optional(),
        isPrimary: z.boolean().default(false),
        sortOrder: z.number().int().default(0),
      })
    )
    .optional(),
  variants: z
    .array(
      z.object({
        name: z.string(),
        sku: z.string(),
        price: z.number().positive().optional(),
        stock: z.number().int().default(0),
        attributes: z.record(z.string(), z.any()),
      })
    )
    .optional(),
});

const updateProductSchema = createProductSchema.partial();

export const listProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 12));
    const skip = (page - 1) * limit;

    const {
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      inStock,
      isFeatured,
      rating,
      search,
      sortBy,
      order,
    } = req.query;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (categoryId) {
      where.categoryId = categoryId as string;
    }

    if (brandId) {
      where.brandId = brandId as string;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured === 'true';
    }

    if (inStock === 'true') {
      where.stock = { gt: 0 };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = new Prisma.Decimal(minPrice as string);
      if (maxPrice) where.price.lte = new Prisma.Decimal(maxPrice as string);
    }

    if (rating) {
      where.rating = { gte: new Prisma.Decimal(rating as string) };
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { sku: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy === 'price') {
      orderBy = { price: order === 'asc' ? 'asc' : 'desc' };
    } else if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'name') {
      orderBy = { name: order === 'desc' ? 'desc' : 'asc' };
    } else if (sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
          brand: {
            select: { id: true, name: true, slug: true, logo: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = Math.min(24, parseInt(req.query.limit as string) || 8);
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      take: limit,
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { rating: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductByIdOrSlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const identifier = String(req.params.identifier);

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        category: true,
        brand: true,
        variants: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = createProductSchema.parse(req.body);

    const existingSlug = await prisma.product.findFirst({
      where: { OR: [{ slug: data.slug }, { sku: data.sku }] },
    });

    if (existingSlug) {
      throw new AppError('Product with this slug or SKU already exists', 409);
    }

    const { images, variants, price, compareAtPrice, costPrice, ...rest } = data;

    const product = await prisma.product.create({
      data: {
        ...rest,
        price: new Prisma.Decimal(price),
        compareAtPrice: compareAtPrice ? new Prisma.Decimal(compareAtPrice) : null,
        costPrice: costPrice ? new Prisma.Decimal(costPrice) : null,
        images: images && images.length > 0 ? { create: images } : undefined,
        variants:
          variants && variants.length > 0
            ? {
                create: variants.map((v) => ({
                  name: v.name,
                  sku: v.sku,
                  price: v.price ? new Prisma.Decimal(v.price) : null,
                  stock: v.stock,
                  attributes: v.attributes as Prisma.InputJsonValue,
                })),
              }
            : undefined,
        priceHistories: {
          create: {
            oldPrice: new Prisma.Decimal(price),
            newPrice: new Prisma.Decimal(price),
            reason: 'Initial creation',
            changedBy: req.user?.email || 'SYSTEM',
          },
        },
      },
      include: {
        images: true,
        variants: true,
        category: true,
        brand: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'PRODUCT_CREATED',
        entity: 'Product',
        entityId: product.id,
        details: { sku: product.sku, name: product.name },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const data = updateProductSchema.parse(req.body);

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Product not found', 404);
    }

    const { images, variants, price, compareAtPrice, costPrice, ...rest } = data;

    // Check price change
    let priceHistoryCreate = undefined;
    if (price !== undefined && Number(existing.price) !== price) {
      priceHistoryCreate = {
        create: {
          oldPrice: existing.price,
          newPrice: new Prisma.Decimal(price),
          reason: 'Price updated by admin',
          changedBy: req.user?.email || 'ADMIN',
        },
      };
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(price !== undefined && { price: new Prisma.Decimal(price) }),
        ...(compareAtPrice !== undefined && {
          compareAtPrice: compareAtPrice ? new Prisma.Decimal(compareAtPrice) : null,
        }),
        ...(costPrice !== undefined && {
          costPrice: costPrice ? new Prisma.Decimal(costPrice) : null,
        }),
        ...(priceHistoryCreate && { priceHistories: priceHistoryCreate }),
      },
      include: {
        images: true,
        variants: true,
        category: true,
        brand: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'PRODUCT_UPDATED',
        entity: 'Product',
        entityId: id,
        details: { fields: Object.keys(data) },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Product not found', 404);
    }

    // Soft delete / deactivate to maintain order history
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'PRODUCT_DELETED',
        entity: 'Product',
        entityId: id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
