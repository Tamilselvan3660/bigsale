import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getSetupBuilderOptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { setupType = 'gaming', budget } = req.query;

    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      take: 60,
    });

    // Curate component catalog categories for PC / Setup Assembly
    const cpus = [
      { id: 'cpu_intel_i9', name: 'Intel Core i9-14900K 24-Core', socket: 'LGA1700', tdp: '125W', price: 549, stock: 18 },
      { id: 'cpu_amd_ryzen9', name: 'AMD Ryzen 9 7950X 16-Core', socket: 'AM5', tdp: '170W', price: 519, stock: 12 },
      { id: 'cpu_amd_ryzen7', name: 'AMD Ryzen 7 7800X3D Gaming', socket: 'AM5', tdp: '120W', price: 399, stock: 24 },
    ];

    const motherboards = [
      { id: 'mb_asus_z790', name: 'ASUS ROG Maximus Z790 Hero', socket: 'LGA1700', ramType: 'DDR5', formFactor: 'ATX', price: 499, stock: 9 },
      { id: 'mb_msi_b650', name: 'MSI MAG B650 Tomahawk WiFi', socket: 'AM5', ramType: 'DDR5', formFactor: 'ATX', price: 219, stock: 15 },
      { id: 'mb_gigabyte_x670', name: 'Gigabyte X670 AORUS Elite AX', socket: 'AM5', ramType: 'DDR5', formFactor: 'ATX', price: 289, stock: 14 },
    ];

    const gpus = [
      { id: 'gpu_rtx_4090', name: 'NVIDIA GeForce RTX 4090 24GB', minPsuWatt: 850, lengthMm: 336, price: 1799, stock: 6 },
      { id: 'gpu_rtx_4080', name: 'NVIDIA GeForce RTX 4080 Super 16GB', minPsuWatt: 750, lengthMm: 310, price: 999, stock: 11 },
      { id: 'gpu_rtx_4070', name: 'NVIDIA GeForce RTX 4070 Ti Super 16GB', minPsuWatt: 700, lengthMm: 285, price: 799, stock: 20 },
    ];

    const rams = [
      { id: 'ram_corsair_32', name: 'Corsair Vengeance RGB 32GB (2x16GB) DDR5-6000', type: 'DDR5', price: 129, stock: 35 },
      { id: 'ram_gskill_64', name: 'G.Skill Trident Z5 64GB (2x32GB) DDR5-6400', type: 'DDR5', price: 249, stock: 16 },
    ];

    const storages = [
      { id: 'ssd_samsung_2tb', name: 'Samsung 990 PRO 2TB PCIe 4.0 NVMe SSD', readSpeed: '7450 MB/s', price: 179, stock: 40 },
      { id: 'ssd_wd_4tb', name: 'WD_BLACK SN850X 4TB NVMe SSD', readSpeed: '7300 MB/s', price: 329, stock: 14 },
    ];

    const psus = [
      { id: 'psu_corsair_850', name: 'Corsair RM850x 850W 80+ Gold Fully Modular', wattage: 850, price: 139, stock: 28 },
      { id: 'psu_seasonic_1000', name: 'Seasonic Vertex GX-1000 1000W 80+ Gold PCIe 5.0', wattage: 1000, price: 219, stock: 17 },
    ];

    const cases = [
      { id: 'case_lianli_o11', name: 'Lian Li O11 Dynamic EVO Mid-Tower', formFactor: 'ATX', maxGpuLength: 422, price: 169, stock: 22 },
      { id: 'case_nzxt_h9', name: 'NZXT H9 Flow Dual-Chamber ATX', formFactor: 'ATX', maxGpuLength: 435, price: 159, stock: 19 },
    ];

    // Pick top catalog monitors & audio peripherals from active products
    const monitors = allProducts.filter((p: any) => p.name.toLowerCase().includes('display') || p.name.toLowerCase().includes('monitor') || p.category?.name?.includes('Display')).slice(0, 3);
    const audioPeripherals = allProducts.filter((p: any) => p.name.toLowerCase().includes('audio') || p.name.toLowerCase().includes('headphone')).slice(0, 3);

    res.status(200).json({
      success: true,
      data: {
        components: {
          processors: cpus,
          motherboards,
          graphicsCards: gpus,
          memory: rams,
          storage: storages,
          powerSupplies: psus,
          cabinets: cases,
          monitors: monitors.length > 0 ? monitors : allProducts.slice(0, 2),
          peripherals: audioPeripherals.length > 0 ? audioPeripherals : allProducts.slice(2, 4),
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Setup builder failed' });
  }
};

export const validateSetupCompatibility = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cpu, motherboard, gpu, ram, psu, caseItem } = req.body;

    const errors: string[] = [];
    const warnings: string[] = [];
    let estimatedWattage = 150; // base mobo + fans

    // 1. Socket check
    if (cpu && motherboard) {
      if (cpu.socket !== motherboard.socket) {
        errors.push(`Incompatible CPU Socket: ${cpu.name} requires ${cpu.socket}, but motherboard ${motherboard.name} has ${motherboard.socket}.`);
      }
    }

    // 2. RAM type check
    if (ram && motherboard) {
      if (ram.type !== motherboard.ramType) {
        errors.push(`Incompatible RAM standard: Motherboard accepts ${motherboard.ramType}, but chosen memory is ${ram.type}.`);
      }
    }

    // 3. Power supply wattage calculation
    if (cpu) estimatedWattage += parseInt(cpu.tdp) || 125;
    if (gpu) estimatedWattage += (gpu.minPsuWatt ? gpu.minPsuWatt - 300 : 300);

    if (psu && gpu) {
      if (psu.wattage < gpu.minPsuWatt) {
        errors.push(`Insufficient Power: GPU ${gpu.name} mandates at least ${gpu.minPsuWatt}W PSU, but ${psu.name} provides only ${psu.wattage}W.`);
      }
    }

    // 4. Physical Case Clearance
    if (caseItem && gpu) {
      if (gpu.lengthMm > caseItem.maxGpuLength) {
        errors.push(`Physical Clearance Error: GPU length (${gpu.lengthMm}mm) exceeds maximum cabinet allowance (${caseItem.maxGpuLength}mm).`);
      }
    }

    const isCompatible = errors.length === 0;

    res.status(200).json({
      success: true,
      data: {
        isCompatible,
        estimatedTotalWattage: estimatedWattage,
        recommendedPsuWattage: Math.ceil((estimatedWattage * 1.3) / 50) * 50,
        errors,
        warnings,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Validation failed' });
  }
};

