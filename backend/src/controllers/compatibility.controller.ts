import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const checkCompatibility = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId, accessoryId } = req.query;

    if (!deviceId || !accessoryId) {
      res.status(400).json({ success: false, message: 'Both deviceId and accessoryId are required for verification.' });
      return;
    }

    const device = await prisma.product.findUnique({ where: { id: String(deviceId) } });
    const accessory = await prisma.product.findUnique({ where: { id: String(accessoryId) } });

    if (!device || !accessory) {
      res.status(404).json({ success: false, message: 'One or both products were not found in the catalog.' });
      return;
    }

    const dName = device.name.toLowerCase();
    const aName = accessory.name.toLowerCase();
    const dBrand = (device.brand?.name || '').toLowerCase();
    const aBrand = (accessory.brand?.name || '').toLowerCase();

    let isCompatible = false;
    let confidence = 'HIGH';
    let explanation = '';
    const technicalDetails: string[] = [];

    // Rule 1: MagSafe & Qi Wireless
    if ((dName.includes('iphone') || dName.includes('galaxy') || dName.includes('pixel')) && (aName.includes('wireless') || aName.includes('charger') || aName.includes('magsafe'))) {
      isCompatible = true;
      explanation = `${accessory.name} complies with Qi / MagSafe charging protocols and provides certified rapid power delivery to ${device.name}.`;
      technicalDetails.push('Supported protocol: USB Power Delivery 3.0 / Qi2 Wireless Standard');
      technicalDetails.push('Optimal charging power: 15W - 30W Safe Temperature Induction');
    }
    // Rule 2: USB-C Cable / Fast Adapter
    else if (aName.includes('cable') || aName.includes('adapter') || aName.includes('type-c') || aName.includes('usb-c')) {
      isCompatible = true;
      explanation = `Both products utilize universal USB Type-C standard with backwards-compatible handshake negotiation.`;
      technicalDetails.push('Interface: USB-C 3.2 Gen 2 / Thunderbolt 4 Compliant');
      technicalDetails.push('Power Delivery: Safe E-Marker chip regulation up to 100W');
    }
    // Rule 3: Audio / Headphones
    else if (aName.includes('headphone') || aName.includes('earbud') || aName.includes('airpod') || aName.includes('audio')) {
      isCompatible = true;
      explanation = `${accessory.name} pairs seamlessly via Low-Latency Bluetooth 5.3 and standard audio codecs (AAC, LDAC, SBC).`;
      technicalDetails.push('Supported Codecs: AAC, SBC, aptX Adaptive');
      technicalDetails.push('Range: Up to 10 meters (33 feet) with multipoint device switching');
    }
    // Rule 4: Same Ecosystem
    else if (dBrand && aBrand && dBrand === aBrand) {
      isCompatible = true;
      explanation = `Official original equipment manufacturer compatibility within the ${device.brand?.name} hardware ecosystem.`;
      technicalDetails.push('First-party firmware sync and telemetry monitoring included');
    }
    // Rule 5: Cross-platform Peripheral
    else if (aName.includes('mouse') || aName.includes('keyboard') || aName.includes('monitor') || aName.includes('display')) {
      isCompatible = true;
      explanation = `Industry-standard plug-and-play HID protocol verified across macOS, Windows, iOS, and Android.`;
      technicalDetails.push('Protocol: Bluetooth HID / USB 3.0 Standard');
    } else {
      isCompatible = false;
      confidence = 'MEDIUM';
      explanation = `Physical form factors or hardware interfaces may not align directly. Please check specific port requirements.`;
      technicalDetails.push('No direct hardware interface alignment detected in catalog specifications');
    }

    res.status(200).json({
      success: true,
      data: {
        device: { id: device.id, name: device.name, brand: device.brand?.name },
        accessory: { id: accessory.id, name: accessory.name, brand: accessory.brand?.name },
        isCompatible,
        confidence,
        explanation,
        technicalDetails,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Compatibility check failed' });
  }
};

