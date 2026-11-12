import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { Prisma, PaymentMethod, OrderStatus, PaymentStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const calculateCheckoutSchema = z.object({
  shippingAddressId: z.string().uuid().optional(),
  couponCode: z.string().optional(),
});

const placeOrderSchema = z.object({
  shippingAddressId: z.string().uuid('Shipping address ID is required'),
  billingAddressId: z.string().uuid().optional(),
  paymentMethod: z.enum(['CREDIT_CARD', 'STRIPE', 'PAYPAL', 'CASH_ON_DELIVERY']).default('CREDIT_CARD'),
  customerNotes: z.string().optional(),
});

export const calculateCheckout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { couponCode } = calculateCheckoutSchema.parse(req.body);

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
      throw new AppError('Cart is empty', 400);
    }

    let subtotal = new Prisma.Decimal(0);
    for (const item of cart.items) {
      const price = item.variant?.price || item.product.price;
      subtotal = subtotal.add(price.mul(item.quantity));
    }

    // Tax calculation (standard 8%)
    const taxRate = new Prisma.Decimal(0.08);
    const tax = subtotal.mul(taxRate);

    // Shipping fee ($10, or free if subtotal >= $75)
    const shippingFee = subtotal.gte(new Prisma.Decimal(75))
      ? new Prisma.Decimal(0)
      : new Prisma.Decimal(10);

    // Coupon calculation
    let discount = new Prisma.Decimal(0);
    const codeToApply = couponCode || cart.couponCode;

    if (codeToApply) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: codeToApply.toUpperCase() },
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
      }
    }

    const total = Prisma.Decimal.max(
      new Prisma.Decimal(0),
      subtotal.sub(discount).add(tax).add(shippingFee)
    );

    res.status(200).json({
      success: true,
      data: {
        itemCount: cart.items.reduce((acc, curr) => acc + curr.quantity, 0),
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        tax: tax.toFixed(2),
        shippingFee: shippingFee.toFixed(2),
        total: total.toFixed(2),
        appliedCoupon: codeToApply || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const placeOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const data = placeOrderSchema.parse(req.body);

    const shippingAddress = await prisma.address.findFirst({
      where: {
        id: data.shippingAddressId,
        userId: req.user.id,
      },
    });

    if (!shippingAddress) {
      throw new AppError('Invalid shipping address', 400);
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
      throw new AppError('Cart is empty. Cannot place order.', 400);
    }

    // Validate stock for all items
    for (const item of cart.items) {
      const availableStock = item.variant
        ? item.variant.stock
        : item.product.stock;

      if (availableStock < item.quantity) {
        throw new AppError(
          `Insufficient stock for '${item.product.name}'. Requested ${item.quantity}, available: ${availableStock}`,
          400
        );
      }
    }

    // Calculate totals
    let subtotal = new Prisma.Decimal(0);
    for (const item of cart.items) {
      const price = item.variant?.price || item.product.price;
      subtotal = subtotal.add(price.mul(item.quantity));
    }

    const tax = subtotal.mul(new Prisma.Decimal(0.08));
    const shippingFee = subtotal.gte(new Prisma.Decimal(75))
      ? new Prisma.Decimal(0)
      : new Prisma.Decimal(10);

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

    const total = Prisma.Decimal.max(
      new Prisma.Decimal(0),
      subtotal.sub(discount).add(tax).add(shippingFee)
    );

    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Database transaction to create order, order items, deduct stock, create payment, clear cart
    const order = await prisma.$transaction(async (tx) => {
      // 1. Deduct stock
      for (const item of cart.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 2. Increment coupon usage if used
      if (appliedCoupon) {
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { usageCount: { increment: 1 } },
        });
      }

      // 3. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: req.user!.id,
          status: OrderStatus.CONFIRMED,
          paymentStatus:
            data.paymentMethod === 'CASH_ON_DELIVERY'
              ? PaymentStatus.PENDING
              : PaymentStatus.PAID,
          paymentMethod: data.paymentMethod as PaymentMethod,
          subtotal,
          discount,
          tax,
          shippingFee,
          total,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          shippingAddressId: data.shippingAddressId,
          billingAddressId: data.billingAddressId || data.shippingAddressId,
          customerNotes: data.customerNotes,
          items: {
            create: cart.items.map((item) => {
              const itemPrice = item.variant?.price || item.product.price;
              return {
                productId: item.productId,
                variantId: item.variantId || null,
                name: item.variant
                  ? `${item.product.name} (${item.variant.name})`
                  : item.product.name,
                sku: item.variant ? item.variant.sku : item.product.sku,
                price: itemPrice,
                quantity: item.quantity,
                total: itemPrice.mul(item.quantity),
              };
            }),
          },
          payments: {
            create: {
              amount: total,
              provider: data.paymentMethod,
              status:
                data.paymentMethod === 'CASH_ON_DELIVERY'
                  ? PaymentStatus.PENDING
                  : PaymentStatus.PAID,
              transactionId: `TXN-${Date.now()}`,
              paymentMethod: data.paymentMethod,
            },
          },
          shipments: {
            create: {
              carrier: 'Standard Delivery',
              status: 'PENDING',
              estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            },
          },
        },
        include: {
          items: true,
          shippingAddress: true,
          payments: true,
          shipments: true,
        },
      });

      // 4. Clear Cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: { couponCode: null },
      });

      // 5. Create Notification
      await tx.notification.create({
        data: {
          userId: req.user!.id,
          title: 'Order Placed Successfully!',
          message: `Your order #${newOrder.orderNumber} for $${total.toFixed(2)} has been confirmed.`,
          type: 'ORDER_CONFIRMED',
          link: `/orders/${newOrder.id}`,
        },
      });

      // 6. Audit Log
      await tx.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'ORDER_PLACED',
          entity: 'Order',
          entityId: newOrder.id,
          details: { orderNumber, total: total.toString() },
          ipAddress: req.ip,
        },
      });

      return newOrder;
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};
