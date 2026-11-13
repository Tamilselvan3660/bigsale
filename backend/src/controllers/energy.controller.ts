import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const calculateEnergyCost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { powerWatts, dailyHours, operatingDays = 30, tariffRate = 0.15 } = req.body;

    const watts = Number(powerWatts) || 100;
    const hours = Number(dailyHours) || 8;
    const days = Number(operatingDays) || 30;
    const rate = Number(tariffRate) || 0.15; // $/kWh standard commercial/residential average

    // Formula: Energy consumed (kWh) = Power (watts) × Operating hours × Days ÷ 1000
    const totalKwh = (watts * hours * days) / 1000;
    const totalCost = totalKwh * rate;

    // Monthly & Annualized projections
    const monthlyKwh = (watts * hours * 30) / 1000;
    const monthlyCost = monthlyKwh * rate;

    const annualKwh = (watts * hours * 365) / 1000;
    const annualCost = annualKwh * rate;

    // Carbon footprint estimate: ~0.85 lbs CO2 per kWh
    const annualCarbonLbs = Math.round(annualKwh * 0.85);

    res.status(200).json({
      success: true,
      data: {
        inputs: {
          powerWatts: watts,
          dailyHours: hours,
          operatingDays: days,
          tariffRate: rate,
        },
        calculatedPeriod: {
          energyConsumedKwh: +totalKwh.toFixed(2),
          estimatedCost: +totalCost.toFixed(2),
          currency: 'USD',
        },
        projections: {
          monthlyKwh: +monthlyKwh.toFixed(2),
          monthlyCost: +monthlyCost.toFixed(2),
          annualKwh: +annualKwh.toFixed(2),
          annualCost: +annualCost.toFixed(2),
          annualCarbonLbs,
        },
        energyEfficiencyTips: [
          'Enable Energy Star Eco-sleep mode when hardware is idle',
          'Use 80+ Gold or Platinum power supplies to reduce thermal line loss by 12%',
          'Switch to Smart Plugs to auto-isolate vampire standby loads',
        ],
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Energy calculation failed' });
  }
};

export const getProductEnergyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const name = product.name.toLowerCase();
    let ratedWatts = 65;
    let starRating = 5;
    let categoryClass = 'Energy Star Certified Tier 1';

    if (name.includes('macbook') || name.includes('laptop')) {
      ratedWatts = 70;
      starRating = 5;
    } else if (name.includes('phone') || name.includes('watch')) {
      ratedWatts = 20;
      starRating = 5;
    } else if (name.includes('display') || name.includes('tv') || name.includes('monitor')) {
      ratedWatts = 120;
      starRating = 4;
    } else if (name.includes('pc') || name.includes('desktop')) {
      ratedWatts = 450;
      starRating = 4;
    }

    const monthlyKwh = (ratedWatts * 6 * 30) / 1000;
    const monthlyCost = +(monthlyKwh * 0.15).toFixed(2);
    const annualCost = +(monthlyCost * 12).toFixed(2);

    res.status(200).json({
      success: true,
      data: {
        productId: product.id,
        productName: product.name,
        ratedWatts,
        energyStarRating: starRating,
        categoryClass,
        monthlyEstimatedCost: monthlyCost,
        annualEstimatedCost: annualCost,
        standardAssumptions: 'Based on 6 daily operating hours @ $0.15/kWh national average',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Energy profile failed' });
  }
};

