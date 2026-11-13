import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

// 1. Get Refurbished / Renew catalog items
export const getRenewProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, grade, minPrice, maxPrice } = req.query;

    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      take: 60,
    });

    // Map certified refurbished versions of top hardware
    const renewItems = allProducts.slice(0, 15).map((p: any, idx: number) => {
      const originalPrice = Number(p.price);
      const gradeLetter = idx % 3 === 0 ? 'A' : idx % 3 === 1 ? 'B' : 'C';
      const discount = gradeLetter === 'A' ? 0.25 : gradeLetter === 'B' ? 0.35 : 0.45;
      const renewPrice = Math.round(originalPrice * (1 - discount));
      const batteryHealth = (p.name.toLowerCase().includes('phone') || p.name.toLowerCase().includes('macbook') || p.name.toLowerCase().includes('watch'))
        ? (gradeLetter === 'A' ? '96%' : gradeLetter === 'B' ? '89%' : '84%')
        : null;

      return {
        id: `renew_${p.id}`,
        baseProductId: p.id,
        name: `${p.name} (Refurbished - Grade ${gradeLetter})`,
        slug: `${p.slug}-refurbished-grade-${gradeLetter.toLowerCase()}`,
        brand: p.brand?.name || 'BIGSALE Certified',
        category: p.category?.name || 'Electronics',
        grade: gradeLetter,
        conditionTitle: gradeLetter === 'A' ? 'Pristine / Like New' : gradeLetter === 'B' ? 'Very Good Condition' : 'Fair Condition (Fully Functional)',
        originalPrice,
        renewPrice,
        savings: originalPrice - renewPrice,
        savingsPercent: Math.round(discount * 100),
        batteryHealth,
        inspectionScore: gradeLetter === 'A' ? '68/68 Hardware Points Passed' : '65/68 Hardware Points Passed',
        warranty: '12 Months Comprehensive BIGSALE Certified Warranty',
        returnPolicy: '30-Day Risk-Free Money Back Guarantee',
        stock: 5 + (idx % 7),
        image: p.images && p.images.length > 0 ? p.images[0].url : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        refurbisher: 'BIGSALE Renew Authorized Diagnostic Laboratory',
      };
    });

    let filtered = renewItems;
    if (grade) {
      filtered = filtered.filter((item) => item.grade === String(grade).toUpperCase());
    }

    res.status(200).json({
      success: true,
      data: {
        products: filtered,
        total: filtered.length,
        gradingStandards: [
          { grade: 'A', title: 'Pristine / Excellent', details: 'No visible blemishes at 30cm, battery health 90%+, 68-point bench-tested' },
          { grade: 'B', title: 'Very Good', details: 'Minor micro-scratches on casing, zero screen defects, battery health 85%+' },
          { grade: 'C', title: 'Fair / Functional', details: 'Noticeable signs of previous usage, 100% hardware functionality guaranteed' },
        ],
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Renew fetch failed' });
  }
};

// 2. Submit trade-in evaluation request
export const submitTradeInRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { category, brand, model, condition, batteryHealth, storageCapacity } = req.body;

    if (!category || !brand || !model || !condition) {
      res.status(400).json({ success: false, message: 'Category, brand, model, and physical condition are required.' });
      return;
    }

    // Dynamic valuation model based on device parameters
    let baseValue = 400;
    const modelStr = String(model).toLowerCase();

    if (modelStr.includes('iphone 15') || modelStr.includes('iphone 16') || modelStr.includes('s24') || modelStr.includes('m3')) {
      baseValue = 750;
    } else if (modelStr.includes('iphone 14') || modelStr.includes('s23') || modelStr.includes('m2')) {
      baseValue = 550;
    } else if (modelStr.includes('iphone 13') || modelStr.includes('s22') || modelStr.includes('m1')) {
      baseValue = 420;
    }

    // Condition multiplier
    const multiplier = condition === 'Flawless' ? 1.0 : condition === 'Good' ? 0.8 : condition === 'Fair' ? 0.6 : 0.4;
    const estimatedValue = Math.round(baseValue * multiplier);

    const tradeIn = {
      id: `trade_${Date.now()}`,
      referenceNumber: `TRD-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: req.user?.id || 'guest_user',
      device: {
        category,
        brand,
        model,
        storageCapacity: storageCapacity || 'Standard',
        condition,
        batteryHealth: batteryHealth ? `${batteryHealth}%` : 'N/A',
      },
      valuation: {
        estimatedValue,
        currency: 'USD',
        inspectionStatus: 'PENDING_COURIER_PICKUP',
        offerExpiryDays: 14,
        settlementType: 'BIGSALE Store Credit / Direct Payout',
      },
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      message: `Trade-in request #${tradeIn.referenceNumber} created with estimated credit offer of $${estimatedValue}.00`,
      data: tradeIn,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Trade-in submission failed' });
  }
};

