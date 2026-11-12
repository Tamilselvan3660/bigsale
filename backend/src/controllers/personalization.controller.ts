import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, categoryId, type = 'similar', limit = 6 } = req.query;
    const maxItems = Math.min(Number(limit) || 6, 12);

    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      take: 60,
    });

    let results: any[] = [];

    if (type === 'frequently-bought' && productId) {
      // Return complementary accessories or peripherals
      const baseProduct = allProducts.find((p: any) => p.id === String(productId));
      const baseName = (baseProduct?.name || '').toLowerCase();

      results = allProducts.filter((p: any) => {
        if (p.id === productId) return false;
        const name = p.name.toLowerCase();
        // Complementary logic: phone -> charger/earbuds, laptop -> mouse/audio
        if (baseName.includes('iphone') || baseName.includes('galaxy') || baseName.includes('phone')) {
          return name.includes('charger') || name.includes('airpod') || name.includes('headphone') || name.includes('watch');
        }
        if (baseName.includes('macbook') || baseName.includes('laptop')) {
          return name.includes('headphone') || name.includes('mouse') || name.includes('audio') || name.includes('display');
        }
        return p.categoryId !== baseProduct?.categoryId;
      });
    } else if (type === 'trending') {
      // Sort by rating & review count
      results = [...allProducts].sort((a: any, b: any) => (Number(b.rating) * (b.reviewCount || 1)) - (Number(a.rating) * (a.reviewCount || 1)));
    } else {
      // Similar products (same category or brand)
      if (categoryId) {
        results = allProducts.filter((p: any) => p.categoryId === String(categoryId) && p.id !== productId);
      }
      if (results.length < maxItems) {
        // Fallback to top-rated
        const remaining = allProducts.filter((p: any) => p.id !== productId && !results.some((r) => r.id === p.id));
        results = [...results, ...remaining];
      }
    }

    res.status(200).json({
      success: true,
      data: {
        recommendations: results.slice(0, maxItems),
        type,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching recommendations' });
  }
};

export const getBundles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.query;
    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      take: 60,
    });

    // Generate curated hardware bundles
    const pPhone = allProducts.find((p: any) => p.name.toLowerCase().includes('iphone')) || allProducts[0];
    const pLaptop = allProducts.find((p: any) => p.name.toLowerCase().includes('macbook')) || allProducts[1];
    const pHeadphones = allProducts.find((p: any) => p.name.toLowerCase().includes('airpod') || p.name.toLowerCase().includes('headphone')) || allProducts[2];
    const pWatch = allProducts.find((p: any) => p.name.toLowerCase().includes('watch')) || allProducts[3];

    const bundles = [
      {
        id: 'bundle_creator_suite',
        title: 'Pro Creative Studio Bundle',
        description: 'Complete high-performance workstation bundle with unmatched processing & immersive spatial audio.',
        products: [pLaptop, pHeadphones].filter(Boolean),
        bundlePrice: Math.round((Number(pLaptop?.price || 1999) + Number(pHeadphones?.price || 499)) * 0.88),
        originalPrice: Math.round(Number(pLaptop?.price || 1999) + Number(pHeadphones?.price || 499)),
        discountPercent: 12,
        savings: Math.round((Number(pLaptop?.price || 1999) + Number(pHeadphones?.price || 499)) * 0.12),
      },
      {
        id: 'bundle_mobile_ecosystem',
        title: 'Flagship Mobile Ecosystem',
        description: 'Titanium smartphone coupled with aerospace-grade smartwatch for ultimate seamless telemetry.',
        products: [pPhone, pWatch].filter(Boolean),
        bundlePrice: Math.round((Number(pPhone?.price || 1199) + Number(pWatch?.price || 799)) * 0.85),
        originalPrice: Math.round(Number(pPhone?.price || 1199) + Number(pWatch?.price || 799)),
        discountPercent: 15,
        savings: Math.round((Number(pPhone?.price || 1199) + Number(pWatch?.price || 799)) * 0.15),
      },
    ];

    res.status(200).json({
      success: true,
      data: {
        bundles: productId ? bundles.filter((b) => b.products.some((p: any) => p.id === productId)) : bundles,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching bundles' });
  }
};

