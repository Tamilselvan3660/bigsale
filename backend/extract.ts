import fs from 'fs';
import path from 'path';

// Read seed file
let seed = fs.readFileSync(path.join(__dirname, 'prisma/seed.ts'), 'utf8');

// Replace imports
seed = seed.replace(/import\s*\{\s*PrismaClient[^\}]*\}\s*from\s*'@prisma\/client';/, 'const Role = { ADMIN: "ADMIN", CUSTOMER: "CUSTOMER" }; const DiscountType = { PERCENTAGE: "PERCENTAGE", FIXED: "FIXED" };');

// Mock prisma store
const store: any = {
  users: [],
  categories: [],
  brands: [],
  coupons: [],
  products: [],
  productImages: [],
  productVariants: [],
  reviews: [],
  orders: []
};

let idCounter = 1;
const genId = () => `id_${idCounter++}`;

const mockPrisma: any = {
  $disconnect: async () => {},
  auditLog: { deleteMany: async () => {} },
  notification: { deleteMany: async () => {} },
  review: { deleteMany: async () => {} },
  payment: { deleteMany: async () => {} },
  shipment: { deleteMany: async () => {} },
  orderItem: { deleteMany: async () => {} },
  order: { deleteMany: async () => {}, create: async (args: any) => { store.orders.push(args.data); return args.data; } },
  cartItem: { deleteMany: async () => {} },
  cart: { deleteMany: async () => {} },
  wishlistItem: { deleteMany: async () => {} },
  wishlist: { deleteMany: async () => {} },
  priceHistory: { deleteMany: async () => {} },
  productImage: { deleteMany: async () => {} },
  productVariant: { deleteMany: async () => {} },
  product: {
    deleteMany: async () => {},
    create: async (args: any) => {
      const p = { id: genId(), ...args.data };
      store.products.push(p);
      return p;
    }
  },
  coupon: {
    deleteMany: async () => {},
    create: async (args: any) => {
      const c = { id: genId(), ...args.data };
      store.coupons.push(c);
      return c;
    }
  },
  brand: {
    deleteMany: async () => {},
    create: async (args: any) => {
      const b = { id: genId(), ...args.data };
      store.brands.push(b);
      return b;
    }
  },
  category: {
    deleteMany: async () => {},
    create: async (args: any) => {
      const cat = { id: genId(), ...args.data };
      store.categories.push(cat);
      return cat;
    }
  },
  address: { deleteMany: async () => {} },
  user: {
    deleteMany: async () => {},
    create: async (args: any) => {
      const u = { id: genId(), ...args.data };
      store.users.push(u);
      return u;
    }
  }
};

// Replace const prisma = new PrismaClient(); with const prisma = mockPrisma;
seed = seed.replace(/const\s+prisma\s*=\s*new\s+PrismaClient\(\);/, 'const prisma = (global as any).__mockPrisma;');

(global as any).__mockPrisma = mockPrisma;

async function run() {
  const modCode = `
    ${seed}
    export { main };
  `;
  fs.writeFileSync(path.join(__dirname, 'temp_seed_exec.ts'), modCode);
  const { main } = await import('./temp_seed_exec');
  await main();
  fs.writeFileSync(path.join(__dirname, 'src/data.json'), JSON.stringify(store, null, 2));
  console.log('SUCCESS! Extracted store with:');
  console.log('- Products:', store.products.length);
  console.log('- Categories:', store.categories.length);
  console.log('- Brands:', store.brands.length);
  console.log('- Coupons:', store.coupons.length);
  console.log('- Users:', store.users.length);
  // cleanup
  fs.unlinkSync(path.join(__dirname, 'temp_seed_exec.ts'));
}

run().catch(console.error);
