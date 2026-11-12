import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional().nullable(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

const applyCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
});

export const getCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
            variant: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
              variant: true,
            },
          },
        },
      });
    }

    // Calculate subtotal
    let subtotal = new Prisma.Decimal(0);
    for (const item of cart.items) {
      const rawPrice = item.variant?.price != null ? item.variant.price : item.product?.price || 0;
      const decPrice = rawPrice instanceof Prisma.Decimal ? rawPrice : new Prisma.Decimal(Number(rawPrice) || 0);
      subtotal = subtotal.add(decPrice.mul(item.quantity));
    }

    // Check discount if coupon applied
    let discount = new Prisma.Decimal(0);
    let appliedCoupon = null;

    if (cart.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: cart.couponCode.toUpperCase() },
      });

      const now = new Date();
      if (
        coupon &&
        coupon.isActive &&
        now >= coupon.startDate &&
        now <= coupon.endDate &&
        (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) &&
        (!coupon.minOrderAmount || subtotal.gte(coupon.minOrderAmount))
      ) {
        if (coupon.discountType === 'PERCENTAGE') {
          discount = subtotal.mul(coupon.discountValue).div(100);
          if (coupon.maxDiscount && discount.gt(coupon.maxDiscount)) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = Prisma.Decimal.min(subtotal, coupon.discountValue);
        }
        appliedCoupon = coupon;
      }
    }

    const total = Prisma.Decimal.max(new Prisma.Decimal(0), subtotal.sub(discount));

    res.status(200).json({
      success: true,
      data: {
        cart,
        summary: {
          itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: subtotal.toFixed(2),
          discount: discount.toFixed(2),
          total: total.toFixed(2),
          coupon: appliedCoupon,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const data = addToCartSchema.parse(req.body);

    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: { variants: true },
    });

    if (!product || !product.isActive) {
      throw new AppError('Product not found or unavailable', 404);
    }

    let price = product.price;
    let availableStock = product.stock;

    if (data.variantId) {
      const variant = product.variants.find((v) => v.id === data.variantId);
      if (!variant) {
        throw new AppError('Variant not found for this product', 404);
      }
      if (variant.price) {
        price = variant.price;
      }
      availableStock = variant.stock;
    }

    if (availableStock < data.quantity) {
      throw new AppError(
        `Insufficient stock available. Only ${availableStock} in stock.`,
        400
      );
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: data.productId,
        variantId: data.variantId || null,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + data.quantity;
      if (availableStock < newQuantity) {
        throw new AppError(
          `Cannot add quantity. Total in cart would exceed available stock (${availableStock}).`,
          400
        );
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          price,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: data.productId,
          variantId: data.variantId || null,
          quantity: data.quantity,
          price,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const itemId = String(req.params.itemId);
    const { quantity } = updateCartItemSchema.parse(req.body);

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        product: true,
        variant: true,
      },
    });

    if (!cartItem || cartItem.cart.userId !== req.user.id) {
      throw new AppError('Cart item not found', 404);
    }

    const availableStock = cartItem.variant
      ? cartItem.variant.stock
      : cartItem.product.stock;

    if (quantity > availableStock) {
      throw new AppError(`Only ${availableStock} items in stock`, 400);
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: { item: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const itemId = String(req.params.itemId);

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== req.user.id) {
      throw new AppError('Cart item not found', 404);
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
      await prisma.cart.update({
        where: { id: cart.id },
        data: { couponCode: null },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const applyCoupon = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { code } = applyCouponSchema.parse(req.body);

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      throw new AppError('Invalid or inactive coupon code', 400);
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      throw new AppError('Coupon is expired or not yet valid', 400);
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new AppError('Coupon usage limit reached', 400);
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty. Add items before applying coupon.', 400);
    }

    let subtotal = new Prisma.Decimal(0);
    for (const item of cart.items) {
      const price = item.variant?.price || item.product.price;
      subtotal = subtotal.add(price.mul(item.quantity));
    }

    if (coupon.minOrderAmount && subtotal.lt(coupon.minOrderAmount)) {
      throw new AppError(
        `Minimum order amount of $${coupon.minOrderAmount} required for this coupon`,
        400
      );
    }

    await prisma.cart.update({
      where: { id: cart.id },
      data: { couponCode: coupon.code },
    });

    res.status(200).json({
      success: true,
      message: `Coupon ${coupon.code} applied successfully`,
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
};

export const removeCoupon = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (cart) {
      await prisma.cart.update({
        where: { id: cart.id },
        data: { couponCode: null },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon removed from cart',
    });
  } catch (error) {
    next(error);
  }
};
