import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export const fullTextSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = ((req.query.q as string) || '').trim();
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const skip = (page - 1) * limit;

    const { categoryId, brandId, minPrice, maxPrice } = req.query;

    if (!query) {
      res.status(200).json({
        success: true,
        data: {
          products: [],
          categories: [],
          brands: [],
          facets: {},
          pagination: { total: 0, page: 1, limit, totalPages: 0 },
        },
      });
      return;
    }

    const productWhere: Prisma.ProductWhereInput = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (categoryId) {
      productWhere.categoryId = categoryId as string;
    }

    if (brandId) {
      productWhere.brandId = brandId as string;
    }

    if (minPrice || maxPrice) {
      productWhere.price = {};
      if (minPrice) productWhere.price.gte = new Prisma.Decimal(minPrice as string);
      if (maxPrice) productWhere.price.lte = new Prisma.Decimal(maxPrice as string);
    }

    const [products, totalProducts, matchedCategories, matchedBrands] =
      await Promise.all([
        prisma.product.findMany({
          where: productWhere,
          skip,
          take: limit,
          orderBy: { rating: 'desc' },
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            category: { select: { id: true, name: true, slug: true } },
            brand: { select: { id: true, name: true, slug: true } },
          },
        }),
        prisma.product.count({ where: productWhere }),
        prisma.category.findMany({
          where: {
            isActive: true,
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 5,
        }),
        prisma.brand.findMany({
          where: {
            isActive: true,
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 5,
        }),
      ]);

    res.status(200).json({
      success: true,
      data: {
        query,
        products,
        categories: matchedCategories,
        brands: matchedBrands,
        pagination: {
          total: totalProducts,
          page,
          limit,
          totalPages: Math.ceil(totalProducts / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const searchSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = ((req.query.q as string) || '').trim();

    if (!query || query.length < 2) {
      res.status(200).json({
        success: true,
        data: { suggestions: [] },
      });
      return;
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        name: { contains: query, mode: 'insensitive' },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
      take: 6,
    });

    const suggestions = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      image: p.images[0]?.url || null,
    }));

    res.status(200).json({
      success: true,
      data: { suggestions },
    });
  } catch (error) {
    next(error);
  }
};
