import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

// 1. Digital Warranty Management
export const registerWarranty = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { serialNumber, productId, purchaseDate, invoiceNumber } = req.body;
    if (!serialNumber || !productId) {
      res.status(400).json({ success: false, message: 'Serial number and Product ID are required.' });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found in catalog.' });
      return;
    }

    const startDate = purchaseDate ? new Date(purchaseDate) : new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setFullYear(startDate.getFullYear() + 2); // 2-year warranty

    const registration = {
      id: `warr_${Date.now()}`,
      userId: req.user?.id || 'guest_user',
      productId: product.id,
      productName: product.name,
      serialNumber: serialNumber.trim().toUpperCase(),
      invoiceNumber: invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      status: 'ACTIVE',
      coverage: '2-Year Full Manufacturer Parts & Labor Protection',
      startDate: startDate.toISOString().split('T')[0],
      expiryDate: expiryDate.toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      message: `Warranty registered successfully for ${product.name}!`,
      data: registration,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Warranty registration failed' });
  }
};

// 2. Service Centre & Repair Management
export const createServiceRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productName, serialNumber, issueDescription, serviceType } = req.body;
    if (!productName || !issueDescription) {
      res.status(400).json({ success: false, message: 'Product name and description of problem are required.' });
      return;
    }

    const serviceTicket = {
      id: `srv_${Date.now().toString().slice(-6)}`,
      ticketNumber: `SRV-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: req.user?.id || 'guest_user',
      productName,
      serialNumber: serialNumber || 'N/A',
      issueDescription,
      serviceType: serviceType || 'Pickup & Repair',
      status: 'DIAGNOSTIC_SCHEDULED',
      assignedCenter: 'BIGSALE Central Authorized Tech Hub (Bangalore / Mumbai)',
      estimatedResolutionDays: 5,
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      message: `Service request #${serviceTicket.ticketNumber} lodged successfully. A courier pickup will be arranged.`,
      data: serviceTicket,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Service request creation failed' });
  }
};

// 3. Loyalty & Rewards Program
export const getLoyaltyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'id_1';
    
    // Calculate loyalty points from user orders or set standard demo balance
    const loyaltyData = {
      pointsBalance: 1250,
      cashEquivalent: 12.50, // 100 points = $1.00
      tier: 'PLATINUM',
      tierBenefits: [
        '5% bonus points on all electronics purchases',
        'Free Express priority shipping with zero minimum spend',
        'Extended 60-day hassle-free return window',
        'Dedicated VIP 24/7 technical concierge',
      ],
      referralCode: `BIGSALE-${userId.slice(-4).toUpperCase()}`,
      history: [
        { id: '1', date: '2026-11-01', description: 'Order #ORD-849201 Points Earned', points: +500 },
        { id: '2', date: '2026-10-15', description: 'Referral Bonus (Friend Joined)', points: +250 },
        { id: '3', date: '2026-09-20', description: 'Product Review Verified Bonus', points: +100 },
        { id: '4', date: '2026-09-01', description: 'Welcome Bonus Reward', points: +400 },
      ],
    };

    res.status(200).json({
      success: true,
      data: loyaltyData,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Loyalty fetch failed' });
  }
};

// 4. Advanced Order Tracking (Timeline)
export const getShipmentTracking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    const timeline = [
      { status: 'ORDER_PLACED', title: 'Order Verified & Payment Confirmed', timestamp: '2026-11-10 09:30 AM', completed: true },
      { status: 'PROCESSING', title: 'Picked & Packed at Central Global Fulfillment Hub', timestamp: '2026-11-10 03:15 PM', completed: true },
      { status: 'SHIPPED', title: 'Handed over to Express Courier (Air Priority)', timestamp: '2026-11-11 08:00 AM', completed: true },
      { status: 'OUT_FOR_DELIVERY', title: 'Out for Delivery with Local Courier Courier Van', timestamp: '2026-11-12 07:30 AM', completed: true },
      { status: 'DELIVERED', title: 'Delivered (Signature Secured)', timestamp: 'Estimated Today by 5:00 PM', completed: false },
    ];

    res.status(200).json({
      success: true,
      data: {
        orderId,
        trackingNumber: `BIG-EXP-${orderId?.replace(/\D/g, '') || '948291'}`,
        carrier: 'BIGSALE Express Global Logistics',
        currentStatus: 'OUT_FOR_DELIVERY',
        estimatedDelivery: 'Today, by 5:00 PM',
        timeline,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Tracking fetch failed' });
  }
};

// 5. Customer Support Tickets
export const createSupportTicket = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { subject, category, priority, message } = req.body;
    if (!subject || !message) {
      res.status(400).json({ success: false, message: 'Subject and message are required.' });
      return;
    }

    const ticket = {
      id: `tick_${Date.now()}`,
      ticketId: `TCK-${Math.floor(10000 + Math.random() * 90000)}`,
      subject,
      category: category || 'Order & Shipping Inquiry',
      priority: priority || 'HIGH',
      status: 'OPEN',
      agentAssigned: 'Tech Support Team (Senior Specialist)',
      messages: [
        {
          sender: 'Customer',
          text: message,
          timestamp: new Date().toISOString(),
        },
        {
          sender: 'Agent (System Auto-Ack)',
          text: `Thank you for contacting BIGSALE Support. Ticket #${Math.floor(10000 + Math.random() * 90000)} has been logged with Priority: ${priority || 'HIGH'}. Our engineering team typically responds within 2 business hours.`,
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      message: 'Support ticket lodged successfully',
      data: ticket,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Support ticket failed' });
  }
};

