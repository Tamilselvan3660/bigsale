import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Category-aware specs generator based on product details
function extractSpecifications(product: any): Record<string, string> {
  const name = product.name.toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const catName = product.category?.name || 'Electronics';

  const specs: Record<string, string> = {
    'Category': catName,
    'Brand': product.brand?.name || 'BIGSALE Certified',
    'Warranty': '2 Years International Manufacturer Warranty',
    'In The Box': 'Device, Power Cable/Adapter, User Documentation, Warranty Card',
  };

  if (name.includes('iphone') || name.includes('galaxy') || name.includes('pixel') || catName.includes('Phone')) {
    specs['Display'] = name.includes('max') || name.includes('ultra') ? '6.8-inch Super AMOLED / OLED 120Hz' : '6.1-inch OLED HDR 120Hz';
    specs['Processor'] = name.includes('iphone') ? 'A18 Pro Bionic Hexa-Core' : 'Snapdragon 8 Gen 3';
    specs['Camera System'] = '48MP / 50MP Main + Ultra-Wide + Telephoto with OIS';
    specs['Battery & Charging'] = '4,500mAh - 5,000mAh with 45W Fast Charging & Wireless';
    specs['OS & Connectivity'] = '5G Dual SIM, Wi-Fi 7, Bluetooth 5.4, NFC';
    specs['Water Resistance'] = 'IP68 Dust & Water Resistant (6m up to 30 mins)';
  } else if (name.includes('macbook') || name.includes('laptop') || name.includes('thinkpad') || catName.includes('Computer')) {
    specs['Display'] = name.includes('16') ? '16.2-inch Liquid Retina XDR 120Hz' : '14-inch IPS QHD Anti-Glare';
    specs['Processor'] = name.includes('macbook') ? 'Apple M3 Pro / M3 Max' : 'Intel Core i9 / AMD Ryzen 9';
    specs['RAM & Storage'] = '16GB / 32GB Unified Memory + 512GB / 1TB NVMe Gen4 SSD';
    specs['Battery Life'] = 'Up to 18-22 hours battery with Fast MagSafe/USB-C charging';
    specs['Ports & Expansion'] = 'Thunderbolt 4, HDMI 2.1, SDXC card slot, 3.5mm Headphone Jack';
    specs['Weight'] = '1.4 kg - 2.1 kg Aluminum Unibody';
  } else if (name.includes('headphone') || name.includes('airpod') || name.includes('audio') || catName.includes('Audio')) {
    specs['Acoustic Architecture'] = 'Custom High-Excursion Driver with Neodymium magnets';
    specs['Noise Cancellation'] = 'Active Noise Cancellation (ANC) with Transparency Mode';
    specs['Battery Life'] = 'Up to 30 hours continuous playback with ANC enabled';
    specs['Connectivity'] = 'Bluetooth 5.3 with multipoint pairing & 3.5mm Aux backup';
    specs['Microphones'] = 'Beamforming Quad-Mic Array with Wind Noise Reduction';
  } else if (name.includes('watch') || catName.includes('Wearable')) {
    specs['Display'] = 'Always-On Retina OLED up to 2000 nits';
    specs['Case Material'] = 'Aerospace-Grade Titanium / Armor Aluminum';
    specs['Health Sensors'] = 'ECG, Blood Oxygen, Heart Rate, Skin Temperature';
    specs['Water Resistance'] = '100m Water Resistant + Dive Computer Certified';
  } else {
    specs['Power Consumption'] = 'Energy Star Certified Eco-Mode';
    specs['Connectivity'] = 'USB 3.2 Gen 2 / Wi-Fi 6';
    specs['Certifications'] = 'CE, FCC, RoHS, BIS Certified';
  }

  return specs;
}

export const compareProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const idsParam = req.query.ids as string;
    if (!idsParam) {
      res.status(400).json({ success: false, message: 'Please provide product ids to compare (comma separated)' });
      return;
    }

    const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
    if (ids.length === 0) {
      res.status(400).json({ success: false, message: 'No valid product IDs provided' });
      return;
    }

    if (ids.length > 4) {
      res.status(400).json({ success: false, message: 'You can compare a maximum of 4 products at once' });
      return;
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: ids },
      },
    });

    if (products.length === 0) {
      res.status(404).json({ success: false, message: 'None of the requested products were found' });
      return;
    }

    // Collect all unique spec keys across all products
    const comparedProducts = products.map((prod: any) => {
      const specs = extractSpecifications(prod);
      return {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        price: prod.price,
        compareAtPrice: prod.compareAtPrice,
        stock: prod.stock,
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        category: prod.category,
        brand: prod.brand,
        images: prod.images,
        specs,
      };
    });

    const allSpecKeys = Array.from(
      new Set(comparedProducts.flatMap((p: any) => Object.keys(p.specs)))
    );

    res.status(200).json({
      success: true,
      data: {
        products: comparedProducts,
        specKeys: allSpecKeys,
        count: comparedProducts.length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to compare products' });
  }
};

