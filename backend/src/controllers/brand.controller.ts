import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const createBrandSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().optional(),
  logo: z.string().url().optional(),
  website: z.string().url().optional(),
  isActive: z.boolean().default(true),
});

const updateBrandSchema = createBrandSchema.partial();

export const listBrands = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: { brands },
    });
  } catch (error) {
    next(error);
  }
};

export const getBrandByIdOrSlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const identifier = String(req.params.identifier);

    const brand = await prisma.brand.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        products: {
          where: { isActive: true },
          take: 20,
          include: {
            images: { take: 1 },
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      throw new AppError('Brand not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { brand },
    });
  } catch (error) {
    next(error);
  }
};

export const createBrand = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = createBrandSchema.parse(req.body);

    const existing = await prisma.brand.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new AppError('Brand with this slug already exists', 409);
    }

    const brand = await prisma.brand.create({
      data,
    });

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: { brand },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBrand = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const data = updateBrandSchema.parse(req.body);

    const existing = await prisma.brand.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Brand not found', 404);
    }

    const brand = await prisma.brand.update({
      where: { id },
      data,
    });

    res.status(200).json({
      success: true,
      message: 'Brand updated successfully',
      data: { brand },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBrand = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!existing) {
      throw new AppError('Brand not found', 404);
    }

    if (existing._count.products > 0) {
      throw new AppError('Cannot delete brand with associated products. Deactivate it instead.', 400);
    }

    await prisma.brand.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Brand deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
