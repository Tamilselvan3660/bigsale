import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const createReviewSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  title: z.string().optional(),
  comment: z.string().min(3, 'Comment must be at least 3 characters'),
});

const recalculateProductRating = async (productId: string) => {
  const reviews = await prisma.review.findMany({
    where: { productId },
    select: { rating: true },
  });

  const count = reviews.length;
  const avg = count > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / count : 0;

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: new Prisma.Decimal(avg.toFixed(2)),
      reviewCount: count,
    },
  });
};

export const listProductReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productId = String(req.params.productId);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const [reviews, total, allReviews] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        skip,
        take: limit,
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
      }),
      prisma.review.count({ where: { productId } }),
      prisma.review.findMany({
        where: { productId },
        select: { rating: true },
      }),
    ]);

    // Rating breakdown distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviews.forEach((r) => {
      if (r.rating in distribution) {
        distribution[r.rating as keyof typeof distribution]++;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        distribution,
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

export const createReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { productId, rating, title, comment } = createReviewSchema.parse(req.body);

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: req.user.id,
        },
      },
    });

    if (existingReview) {
      throw new AppError('You have already submitted a review for this product', 400);
    }

    // Check if verified purchase
    const orderWithProduct = await prisma.order.findFirst({
      where: {
        userId: req.user.id,
        status: { in: ['DELIVERED', 'SHIPPED', 'CONFIRMED'] },
        items: {
          some: { productId },
        },
      },
    });

    const isVerifiedPurchase = !!orderWithProduct;

    const review = await prisma.review.create({
      data: {
        productId,
        userId: req.user.id,
        rating,
        title,
        comment,
        isVerifiedPurchase,
      },
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
    });

    // Update product rating
    await recalculateProductRating(productId);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const id = String(req.params.id);

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (req.user.role === 'CUSTOMER' && review.userId !== req.user.id) {
      throw new AppError('Forbidden: You can only delete your own reviews', 403);
    }

    await prisma.review.delete({
      where: { id },
    });

    await recalculateProductRating(review.productId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
