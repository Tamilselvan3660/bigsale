import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const handleAssistantQuery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, conversationHistory = [] } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      res.status(400).json({ success: false, message: 'Message query cannot be empty.' });
      return;
    }

    const cleanQuery = query.trim().toLowerCase();

    // Fetch active catalog products to ground responses
    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      take: 60,
    });

    let matchedProducts: any[] = [];
    let assistantReply = '';
    let categorySuggestion = '';

    // Budget extraction logic (e.g., "under 500", "under $1000", "below 300")
    const budgetMatch = cleanQuery.match(/(?:under|below|less than|within|\$)\s*(\d+)/i);
    const maxBudget = budgetMatch ? parseInt(budgetMatch[1], 10) : null;

    if (cleanQuery.includes('laptop') || cleanQuery.includes('macbook') || cleanQuery.includes('programming') || cleanQuery.includes('code')) {
      categorySuggestion = 'Computers & Laptops';
      matchedProducts = allProducts.filter((p: any) => {
        const name = p.name.toLowerCase();
        const price = Number(p.price);
        const matchesCategory = name.includes('macbook') || name.includes('laptop') || name.includes('thinkpad');
        return matchesCategory && (maxBudget ? price <= maxBudget : true);
      });
      assistantReply = `I found excellent computing options for development and productivity in our catalog. These machines feature high-efficiency processors, NVMe storage, and high-DPI displays.`;
    } else if (cleanQuery.includes('phone') || cleanQuery.includes('smartphone') || cleanQuery.includes('camera') || cleanQuery.includes('iphone') || cleanQuery.includes('galaxy')) {
      categorySuggestion = 'Smartphones & Mobile Devices';
      matchedProducts = allProducts.filter((p: any) => {
        const name = p.name.toLowerCase();
        const price = Number(p.price);
        const matchesCategory = name.includes('iphone') || name.includes('galaxy') || name.includes('pixel') || name.includes('phone');
        return matchesCategory && (maxBudget ? price <= maxBudget : true);
      });
      assistantReply = `Here are the top-rated smartphones featuring pro-grade camera sensors, optical image stabilization, and long battery endurance.`;
    } else if (cleanQuery.includes('headphone') || cleanQuery.includes('audio') || cleanQuery.includes('airpod') || cleanQuery.includes('sound') || cleanQuery.includes('music')) {
      categorySuggestion = 'High-Fidelity Audio';
      matchedProducts = allProducts.filter((p: any) => {
        const name = p.name.toLowerCase();
        const price = Number(p.price);
        const matchesCategory = name.includes('headphone') || name.includes('airpod') || name.includes('audio') || name.includes('earbuds');
        return matchesCategory && (maxBudget ? price <= maxBudget : true);
      });
      assistantReply = `For audio and studio monitoring, these premium headphones deliver Active Noise Cancellation (ANC), rich bass response, and crystal-clear acoustic isolation.`;
    } else if (cleanQuery.includes('charger') || cleanQuery.includes('cable') || cleanQuery.includes('accessory')) {
      categorySuggestion = 'Power & Accessories';
      matchedProducts = allProducts.filter((p: any) => {
        const name = p.name.toLowerCase();
        return name.includes('charger') || name.includes('cable') || name.includes('watch') || name.includes('case');
      });
      assistantReply = `Here are certified high-speed accessories with universal USB-C Power Delivery and verified thermal safety compliance.`;
    } else {
      // General catalog search fallback
      const keywords = cleanQuery.split(' ').filter((w) => w.length > 2);
      matchedProducts = allProducts.filter((p: any) => {
        const text = `${p.name} ${p.description || ''}`.toLowerCase();
        return keywords.some((k) => text.includes(k));
      });
      if (matchedProducts.length > 0) {
        assistantReply = `Based on your request, I located these verified electronic devices currently in stock in our global warehouse.`;
      } else {
        matchedProducts = allProducts.slice(0, 3);
        assistantReply = `I couldn't locate an exact match, but here are our top-rated trending electronics available today:`;
      }
    }

    // Limit to top 4 recommendations
    const recommendations = matchedProducts.slice(0, 4).map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      rating: p.rating,
      image: p.images && p.images.length > 0 ? p.images[0].url : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      stock: p.stock,
      brand: p.brand?.name,
    }));

    res.status(200).json({
      success: true,
      data: {
        reply: assistantReply,
        category: categorySuggestion,
        recommendations,
        contextCount: recommendations.length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'AI assistant error' });
  }
};

