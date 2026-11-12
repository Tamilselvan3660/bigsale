import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const checkShippingAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pincode, productId } = req.query;

    if (!pincode || typeof pincode !== 'string') {
      res.status(400).json({ success: false, message: 'PIN / Postal Code is required' });
      return;
    }

    const cleanPin = pincode.trim().toUpperCase();
    
    // Check if product exists if productId passed
    let product: any = null;
    if (productId && typeof productId === 'string') {
      product = await prisma.product.findUnique({ where: { id: productId } });
    }

    // Deterministic delivery computation based on pincode patterns
    // Real-world fallback: Check validity (e.g. 5 or 6 digit codes)
    const isStandardPin = /^[0-9]{5,6}$/.test(cleanPin) || /^[A-Z0-9\s]{3,8}$/.test(cleanPin);

    if (!isStandardPin) {
      res.status(200).json({
        success: true,
        data: {
          isServiceable: false,
          pincode: cleanPin,
          message: 'Delivery service is not currently available for this postal code.',
          estimatedDays: null,
          methods: [],
        },
      });
      return;
    }

    // Determine region and delivery speed
    const isMetro = cleanPin.startsWith('1') || cleanPin.startsWith('4') || cleanPin.startsWith('5') || cleanPin.startsWith('6');
    const standardDays = isMetro ? 2 : 4;
    const expressDays = isMetro ? 1 : 2;

    const today = new Date();
    const standardDeliveryDate = new Date(today);
    standardDeliveryDate.setDate(today.getDate() + standardDays);

    const expressDeliveryDate = new Date(today);
    expressDeliveryDate.setDate(today.getDate() + expressDays);

    const methods = [
      {
        id: 'standard',
        name: 'Standard Secure Ground',
        cost: 0, // Free delivery
        estimatedDays: standardDays,
        formattedDeliveryDate: standardDeliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        description: 'Standard insured transit with real-time GPS tracking',
      },
      {
        id: 'express',
        name: 'BIGSALE Express Priority',
        cost: 15.00,
        estimatedDays: expressDays,
        formattedDeliveryDate: expressDeliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        description: 'Next-day or priority flight dispatch with signature requirement',
      },
    ];

    res.status(200).json({
      success: true,
      data: {
        isServiceable: true,
        pincode: cleanPin,
        city: isMetro ? 'Metro Metropolitan Region' : 'Regional Hub District',
        warehouse: 'Global Fulfillment Center Alpha (Direct Dispatch)',
        availableStock: product ? product.stock : 50,
        methods,
        cashOnDeliveryAvailable: true,
        returnPolicyDays: 30,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error checking shipping' });
  }
};

