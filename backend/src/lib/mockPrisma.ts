import fs from 'fs';
import path from 'path';

// Load stored seed data or fallback
const dataFilePath = path.join(__dirname, '../data.json');

interface StoreData {
  users: any[];
  categories: any[];
  brands: any[];
  coupons: any[];
  products: any[];
  orders: any[];
  carts: any[];
  wishlists: any[];
}

let store: StoreData = {
  users: [],
  categories: [],
  brands: [],
  coupons: [],
  products: [],
  orders: [],
  carts: [],
  wishlists: [],
};

if (fs.existsSync(dataFilePath)) {
  try {
    const raw = fs.readFileSync(dataFilePath, 'utf8');
    store = JSON.parse(raw);
    if (!store.orders) store.orders = [];
    if (!store.carts) store.carts = [];
    if (!store.wishlists) store.wishlists = [];
  } catch (e) {
    console.error('Failed to parse data.json', e);
  }
}

function saveStore() {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write data.json', e);
  }
}

let idCounter = 1000;
const genId = (prefix = 'item') => `${prefix}_${Date.now()}_${idCounter++}`;

function matchesWhere(item: any, where?: any): boolean {
  if (!where) return true;
  for (const key of Object.keys(where)) {
    const filter = where[key];
    const val = item[key];

    if (filter === undefined) continue;

    if (typeof filter === 'object' && filter !== null) {
      if ('equals' in filter && val !== filter.equals) return false;
      if ('in' in filter && Array.isArray(filter.in) && !filter.in.includes(val)) return false;
      if ('not' in filter && val === filter.not) return false;
      if ('contains' in filter) {
        const needle = String(filter.contains).toLowerCase();
        const haystack = String(val || '').toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      if ('gte' in filter && !(Number(val) >= Number(filter.gte))) return false;
      if ('lte' in filter && !(Number(val) <= Number(filter.lte))) return false;
      if ('gt' in filter && !(Number(val) > Number(filter.gt))) return false;
      if ('lt' in filter && !(Number(val) < Number(filter.lt))) return false;
    } else {
      if (val !== filter) return false;
    }
  }
  return true;
}

export const mockPrisma: any = {
  $disconnect: async () => {},

  product: {
    findMany: async (args: any = {}) => {
      let list = store.products.filter(p => matchesWhere(p, args.where));

      if (args.orderBy) {
        const orderKey = Object.keys(args.orderBy)[0];
        const dir = args.orderBy[orderKey] === 'desc' ? -1 : 1;
        list.sort((a, b) => (a[orderKey] > b[orderKey] ? 1 : -1) * dir);
      }

      const skip = args.skip || 0;
      const take = args.take || list.length;
      return list.slice(skip, skip + take);
    },

    findUnique: async (args: any) => {
      const { where } = args;
      return store.products.find(p => matchesWhere(p, where)) || null;
    },

    findFirst: async (args: any) => {
      const { where } = args;
      return store.products.find(p => matchesWhere(p, where)) || null;
    },

    count: async (args: any = {}) => {
      return store.products.filter(p => matchesWhere(p, args.where)).length;
    },

    create: async (args: any) => {
      const product = { id: genId('prod'), ...args.data };
      store.products.push(product);
      saveStore();
      return product;
    },

    update: async (args: any) => {
      const index = store.products.findIndex(p => matchesWhere(p, args.where));
      if (index === -1) throw new Error('Product not found');
      store.products[index] = { ...store.products[index], ...args.data };
      saveStore();
      return store.products[index];
    },

    delete: async (args: any) => {
      const index = store.products.findIndex(p => matchesWhere(p, args.where));
      if (index === -1) throw new Error('Product not found');
      const removed = store.products.splice(index, 1)[0];
      saveStore();
      return removed;
    },
  },

  category: {
    findMany: async (args: any = {}) => {
      return store.categories.filter(c => matchesWhere(c, args.where));
    },
    findUnique: async (args: any) => {
      return store.categories.find(c => matchesWhere(c, args.where)) || null;
    },
    count: async (args: any = {}) => {
      return store.categories.filter(c => matchesWhere(c, args.where)).length;
    },
  },

  brand: {
    findMany: async (args: any = {}) => {
      return store.brands.filter(b => matchesWhere(b, args.where));
    },
    findUnique: async (args: any) => {
      return store.brands.find(b => matchesWhere(b, args.where)) || null;
    },
    count: async (args: any = {}) => {
      return store.brands.filter(b => matchesWhere(b, args.where)).length;
    },
  },

  user: {
    findUnique: async (args: any) => {
      return store.users.find(u => matchesWhere(u, args.where)) || null;
    },
    findFirst: async (args: any) => {
      return store.users.find(u => matchesWhere(u, args.where)) || null;
    },
    create: async (args: any) => {
      const user = { id: genId('usr'), ...args.data };
      store.users.push(user);
      saveStore();
      return user;
    },
    update: async (args: any) => {
      const index = store.users.findIndex(u => matchesWhere(u, args.where));
      if (index === -1) throw new Error('User not found');
      store.users[index] = { ...store.users[index], ...args.data };
      saveStore();
      return store.users[index];
    },
    count: async (args: any = {}) => {
      return store.users.filter(u => matchesWhere(u, args.where)).length;
    },
  },

  coupon: {
    findFirst: async (args: any) => {
      return store.coupons.find(c => matchesWhere(c, args.where)) || null;
    },
    findUnique: async (args: any) => {
      return store.coupons.find(c => matchesWhere(c, args.where)) || null;
    },
  },

  order: {
    findMany: async (args: any = {}) => {
      return store.orders.filter(o => matchesWhere(o, args.where));
    },
    findUnique: async (args: any) => {
      return store.orders.find(o => matchesWhere(o, args.where)) || null;
    },
    create: async (args: any) => {
      const order = {
        id: genId('ord'),
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        status: 'PENDING',
        paymentStatus: 'PAID',
        createdAt: new Date().toISOString(),
        ...args.data,
      };
      store.orders.unshift(order);
      saveStore();
      return order;
    },
    count: async (args: any = {}) => {
      return store.orders.filter(o => matchesWhere(o, args.where)).length;
    },
  },

  cart: {
    findUnique: async (args: any) => {
      return store.carts.find(c => matchesWhere(c, args.where)) || null;
    },
    findFirst: async (args: any) => {
      return store.carts.find(c => matchesWhere(c, args.where)) || null;
    },
    create: async (args: any) => {
      const cart = { id: genId('cart'), items: [], ...args.data };
      store.carts.push(cart);
      saveStore();
      return cart;
    },
    update: async (args: any) => {
      const index = store.carts.findIndex(c => matchesWhere(c, args.where));
      if (index === -1) {
        const newCart = { id: genId('cart'), items: [], ...args.data };
        store.carts.push(newCart);
        saveStore();
        return newCart;
      }
      store.carts[index] = { ...store.carts[index], ...args.data };
      saveStore();
      return store.carts[index];
    },
  },

  cartItem: {
    findUnique: async (args: any) => {
      for (const cart of store.carts) {
        if (!cart.items) continue;
        const item = cart.items.find((i: any) => matchesWhere(i, args.where));
        if (item) {
          return {
            ...item,
            cart: { id: cart.id, userId: cart.userId },
            product: store.products.find(p => p.id === item.productId) || item.product,
            variant: item.variant || null,
          };
        }
      }
      return null;
    },

    findFirst: async (args: any) => {
      for (const cart of store.carts) {
        if (!cart.items) continue;
        const item = cart.items.find((i: any) => matchesWhere(i, args.where));
        if (item) {
          return {
            ...item,
            cart: { id: cart.id, userId: cart.userId },
            product: store.products.find(p => p.id === item.productId) || item.product,
            variant: item.variant || null,
          };
        }
      }
      return null;
    },

    create: async (args: any) => {
      const newItem = {
        id: genId('ci'),
        createdAt: new Date().toISOString(),
        ...args.data,
      };
      const cart = store.carts.find(c => c.id === args.data.cartId);
      if (cart) {
        if (!cart.items) cart.items = [];
        // attach full product for populated queries
        const prod = store.products.find(p => p.id === args.data.productId);
        newItem.product = prod;
        cart.items.push(newItem);
        saveStore();
      }
      return newItem;
    },

    update: async (args: any) => {
      for (const cart of store.carts) {
        if (!cart.items) continue;
        const idx = cart.items.findIndex((i: any) => matchesWhere(i, args.where));
        if (idx !== -1) {
          cart.items[idx] = { ...cart.items[idx], ...args.data };
          saveStore();
          return cart.items[idx];
        }
      }
      throw new Error('Cart item not found');
    },

    delete: async (args: any) => {
      for (const cart of store.carts) {
        if (!cart.items) continue;
        const idx = cart.items.findIndex((i: any) => matchesWhere(i, args.where));
        if (idx !== -1) {
          const removed = cart.items.splice(idx, 1)[0];
          saveStore();
          return removed;
        }
      }
      return null;
    },

    deleteMany: async (args: any) => {
      for (const cart of store.carts) {
        if (args?.where?.cartId && cart.id === args.where.cartId) {
          cart.items = [];
        }
      }
      saveStore();
      return { count: 0 };
    },
  },

  wishlist: {
    findUnique: async (args: any) => {
      return store.wishlists.find(w => matchesWhere(w, args.where)) || null;
    },
    findFirst: async (args: any) => {
      return store.wishlists.find(w => matchesWhere(w, args.where)) || null;
    },
    create: async (args: any) => {
      const wl = { id: genId('wl'), items: [], ...args.data };
      store.wishlists.push(wl);
      saveStore();
      return wl;
    },
  },

  review: {
    findMany: async (args: any = {}) => [],
    create: async (args: any) => args.data,
  },

  auditLog: {
    create: async () => {},
    findMany: async () => [],
    count: async () => 0,
  },

  $transaction: async (fnOrArray: any) => {
    if (typeof fnOrArray === 'function') {
      return fnOrArray(mockPrisma);
    }
    return Promise.all(fnOrArray);
  },
};

export default mockPrisma;

