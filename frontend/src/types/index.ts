export type Role = 'CUSTOMER' | 'ADMIN' | 'MANAGER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: Role;
  avatar?: string | null;
  isVerified?: boolean;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
  children?: Category[];
  _count?: {
    products: number;
  };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  isActive?: boolean;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price?: number | string | null;
  stock: number;
  attributes: Record<string, any>;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string | null;
  price: number | string;
  compareAtPrice?: number | string | null;
  costPrice?: number | string | null;
  stock: number;
  lowStockThreshold?: number;
  isActive: boolean;
  isFeatured: boolean;
  rating: number | string;
  reviewCount: number;
  categoryId: string;
  brandId?: string | null;
  category?: Category;
  brand?: Brand;
  images?: ProductImage[];
  variants?: ProductVariant[];
  reviews?: Review[];
  createdAt?: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  price: number | string;
  product: Product;
  variant?: ProductVariant | null;
}

export interface CartSummary {
  itemCount: number;
  subtotal: string | number;
  discount: string | number;
  total: string | number;
  coupon?: any;
}

export interface Cart {
  id: string;
  userId: string;
  couponCode?: string | null;
  items: CartItem[];
}

export interface Address {
  id?: string;
  userId?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string | null;
  name: string;
  sku: string;
  price: number | string;
  quantity: number;
  total: number | string;
  image?: string | null;
  product?: Product;
}

export interface Shipment {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: string;
  estimatedDelivery?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  subtotal: number | string;
  discount: number | string;
  shippingFee: number | string;
  tax: number | string;
  total: number | string;
  couponCode?: string | null;
  notes?: string | null;
  shippingAddress: Address;
  billingAddress?: Address;
  items: OrderItem[];
  shipments?: Shipment[];
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// concrete exports for bundler runtime
export const Product = {};
export const Pagination = {};
export const ApiResponse = {};

export const User = {};
export const CartItem = {};
export const ProductVariant = {};
export const Review = {};
export const Category = {};
export const Brand = {};
export const Order = {};
export const OrderItem = {};
export const Address = {};
export const Cart = {};
export const CartSummary = {};
export const Shipment = {};
