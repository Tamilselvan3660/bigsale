-- ==============================================================================
-- BIGSALE E-Commerce Database Schema (PostgreSQL)
-- Matches Prisma Schema Definition
-- ==============================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean existing tables (in reverse dependency order)
DROP TABLE IF EXISTS "audit_logs" CASCADE;
DROP TABLE IF EXISTS "price_histories" CASCADE;
DROP TABLE IF EXISTS "shipments" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "reviews" CASCADE;
DROP TABLE IF EXISTS "coupons" CASCADE;
DROP TABLE IF EXISTS "payments" CASCADE;
DROP TABLE IF EXISTS "order_items" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "wishlist_items" CASCADE;
DROP TABLE IF EXISTS "wishlists" CASCADE;
DROP TABLE IF EXISTS "cart_items" CASCADE;
DROP TABLE IF EXISTS "carts" CASCADE;
DROP TABLE IF EXISTS "product_variants" CASCADE;
DROP TABLE IF EXISTS "product_images" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "brands" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "addresses" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Drop Enums if they exist
DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "OrderStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentMethod" CASCADE;
DROP TYPE IF EXISTS "DiscountType" CASCADE;
DROP TYPE IF EXISTS "ShipmentStatus" CASCADE;

-- Create Enums
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN', 'MANAGER');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'STRIPE', 'PAYPAL', 'CASH_ON_DELIVERY');
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED');

-- -----------------------------------------------------------------------------
-- 1. Users Table
-- -----------------------------------------------------------------------------
CREATE TABLE "users" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(50),
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "isVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_role" ON "users"("role");

-- -----------------------------------------------------------------------------
-- 2. Addresses Table
-- -----------------------------------------------------------------------------
CREATE TABLE "addresses" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" VARCHAR(36) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "fullName" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "postalCode" VARCHAR(20) NOT NULL,
    "country" VARCHAR(50) NOT NULL DEFAULT 'US',
    "isDefault" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_addresses_userId" ON "addresses"("userId");

-- -----------------------------------------------------------------------------
-- 3. Categories Table
-- -----------------------------------------------------------------------------
CREATE TABLE "categories" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL UNIQUE,
    "description" TEXT,
    "image" TEXT,
    "parentId" VARCHAR(36) REFERENCES "categories"("id") ON DELETE SET NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_categories_slug" ON "categories"("slug");
CREATE INDEX "idx_categories_parentId" ON "categories"("parentId");

-- -----------------------------------------------------------------------------
-- 4. Brands Table
-- -----------------------------------------------------------------------------
CREATE TABLE "brands" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL UNIQUE,
    "description" TEXT,
    "logo" TEXT,
    "website" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_brands_slug" ON "brands"("slug");

-- -----------------------------------------------------------------------------
-- 5. Products Table
-- -----------------------------------------------------------------------------
CREATE TABLE "products" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL UNIQUE,
    "sku" VARCHAR(100) NOT NULL UNIQUE,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "price" DECIMAL(10, 2) NOT NULL,
    "compareAtPrice" DECIMAL(10, 2),
    "costPrice" DECIMAL(10, 2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
    "rating" DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "categoryId" VARCHAR(36) NOT NULL REFERENCES "categories"("id") ON DELETE RESTRICT,
    "brandId" VARCHAR(36) REFERENCES "brands"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_products_slug" ON "products"("slug");
CREATE INDEX "idx_products_sku" ON "products"("sku");
CREATE INDEX "idx_products_categoryId" ON "products"("categoryId");
CREATE INDEX "idx_products_brandId" ON "products"("brandId");
CREATE INDEX "idx_products_price" ON "products"("price");
CREATE INDEX "idx_products_isActive" ON "products"("isActive");

-- -----------------------------------------------------------------------------
-- 6. Product Images Table
-- -----------------------------------------------------------------------------
CREATE TABLE "product_images" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "productId" VARCHAR(36) NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "url" TEXT NOT NULL,
    "altText" VARCHAR(255),
    "isPrimary" BOOLEAN NOT NULL DEFAULT FALSE,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_product_images_productId" ON "product_images"("productId");

-- -----------------------------------------------------------------------------
-- 7. Product Variants Table
-- -----------------------------------------------------------------------------
CREATE TABLE "product_variants" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "productId" VARCHAR(36) NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "name" VARCHAR(150) NOT NULL,
    "sku" VARCHAR(100) NOT NULL UNIQUE,
    "price" DECIMAL(10, 2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "attributes" JSONB NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_product_variants_productId" ON "product_variants"("productId");
CREATE INDEX "idx_product_variants_sku" ON "product_variants"("sku");

-- -----------------------------------------------------------------------------
-- 8. Carts Table
-- -----------------------------------------------------------------------------
CREATE TABLE "carts" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" VARCHAR(36) NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
    "couponCode" VARCHAR(50),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_carts_userId" ON "carts"("userId");

-- -----------------------------------------------------------------------------
-- 9. Cart Items Table
-- -----------------------------------------------------------------------------
CREATE TABLE "cart_items" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "cartId" VARCHAR(36) NOT NULL REFERENCES "carts"("id") ON DELETE CASCADE,
    "productId" VARCHAR(36) NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "variantId" VARCHAR(36) REFERENCES "product_variants"("id") ON DELETE SET NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(10, 2) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_cart_product_variant" UNIQUE ("cartId", "productId", "variantId")
);

CREATE INDEX "idx_cart_items_cartId" ON "cart_items"("cartId");

-- -----------------------------------------------------------------------------
-- 10. Wishlists Table
-- -----------------------------------------------------------------------------
CREATE TABLE "wishlists" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" VARCHAR(36) NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_wishlists_userId" ON "wishlists"("userId");

-- -----------------------------------------------------------------------------
-- 11. Wishlist Items Table
-- -----------------------------------------------------------------------------
CREATE TABLE "wishlist_items" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "wishlistId" VARCHAR(36) NOT NULL REFERENCES "wishlists"("id") ON DELETE CASCADE,
    "productId" VARCHAR(36) NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_wishlist_product" UNIQUE ("wishlistId", "productId")
);

CREATE INDEX "idx_wishlist_items_wishlistId" ON "wishlist_items"("wishlistId");

-- -----------------------------------------------------------------------------
-- 12. Orders Table
-- -----------------------------------------------------------------------------
CREATE TABLE "orders" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "orderNumber" VARCHAR(50) NOT NULL UNIQUE,
    "userId" VARCHAR(36) NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CREDIT_CARD',
    "subtotal" DECIMAL(10, 2) NOT NULL,
    "discount" DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    "tax" DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    "shippingFee" DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    "total" DECIMAL(10, 2) NOT NULL,
    "couponCode" VARCHAR(50),
    "shippingAddressId" VARCHAR(36) NOT NULL REFERENCES "addresses"("id") ON DELETE RESTRICT,
    "billingAddressId" VARCHAR(36) REFERENCES "addresses"("id") ON DELETE SET NULL,
    "customerNotes" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_orders_userId" ON "orders"("userId");
CREATE INDEX "idx_orders_orderNumber" ON "orders"("orderNumber");
CREATE INDEX "idx_orders_status" ON "orders"("status");
CREATE INDEX "idx_orders_createdAt" ON "orders"("createdAt");

-- -----------------------------------------------------------------------------
-- 13. Order Items Table
-- -----------------------------------------------------------------------------
CREATE TABLE "order_items" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "orderId" VARCHAR(36) NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
    "productId" VARCHAR(36) NOT NULL REFERENCES "products"("id") ON DELETE RESTRICT,
    "variantId" VARCHAR(36) REFERENCES "product_variants"("id") ON DELETE SET NULL,
    "name" VARCHAR(255) NOT NULL,
    "sku" VARCHAR(100) NOT NULL,
    "price" DECIMAL(10, 2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total" DECIMAL(10, 2) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_order_items_orderId" ON "order_items"("orderId");

-- -----------------------------------------------------------------------------
-- 14. Payments Table
-- -----------------------------------------------------------------------------
CREATE TABLE "payments" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "orderId" VARCHAR(36) NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
    "amount" DECIMAL(10, 2) NOT NULL,
    "provider" VARCHAR(50) NOT NULL DEFAULT 'STRIPE',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" VARCHAR(255),
    "paymentMethod" VARCHAR(50),
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_payments_orderId" ON "payments"("orderId");
CREATE INDEX "idx_payments_transactionId" ON "payments"("transactionId");

-- -----------------------------------------------------------------------------
-- 15. Coupons Table
-- -----------------------------------------------------------------------------
CREATE TABLE "coupons" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "code" VARCHAR(50) NOT NULL UNIQUE,
    "description" TEXT,
    "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "discountValue" DECIMAL(10, 2) NOT NULL,
    "minOrderAmount" DECIMAL(10, 2),
    "maxDiscount" DECIMAL(10, 2),
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "endDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_coupons_code" ON "coupons"("code");

-- -----------------------------------------------------------------------------
-- 16. Reviews Table
-- -----------------------------------------------------------------------------
CREATE TABLE "reviews" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "productId" VARCHAR(36) NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "userId" VARCHAR(36) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "rating" INTEGER NOT NULL,
    "title" VARCHAR(255),
    "comment" TEXT NOT NULL,
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_review_product_user" UNIQUE ("productId", "userId")
);

CREATE INDEX "idx_reviews_productId" ON "reviews"("productId");
CREATE INDEX "idx_reviews_userId" ON "reviews"("userId");

-- -----------------------------------------------------------------------------
-- 17. Notifications Table
-- -----------------------------------------------------------------------------
CREATE TABLE "notifications" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" VARCHAR(36) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
    "link" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_notifications_userId" ON "notifications"("userId");

-- -----------------------------------------------------------------------------
-- 18. Shipments Table
-- -----------------------------------------------------------------------------
CREATE TABLE "shipments" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "orderId" VARCHAR(36) NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
    "carrier" VARCHAR(100) NOT NULL,
    "trackingNumber" VARCHAR(100),
    "trackingUrl" TEXT,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
    "shippedAt" TIMESTAMP WITH TIME ZONE,
    "estimatedDelivery" TIMESTAMP WITH TIME ZONE,
    "deliveredAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_shipments_orderId" ON "shipments"("orderId");

-- -----------------------------------------------------------------------------
-- 19. Price Histories Table
-- -----------------------------------------------------------------------------
CREATE TABLE "price_histories" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "productId" VARCHAR(36) NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "oldPrice" DECIMAL(10, 2) NOT NULL,
    "newPrice" DECIMAL(10, 2) NOT NULL,
    "reason" TEXT,
    "changedBy" VARCHAR(100),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_price_histories_productId" ON "price_histories"("productId");

-- -----------------------------------------------------------------------------
-- 20. Audit Logs Table
-- -----------------------------------------------------------------------------
CREATE TABLE "audit_logs" (
    "id" VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" VARCHAR(36) REFERENCES "users"("id") ON DELETE SET NULL,
    "action" VARCHAR(100) NOT NULL,
    "entity" VARCHAR(100) NOT NULL,
    "entityId" VARCHAR(36),
    "details" JSONB,
    "ipAddress" VARCHAR(45),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_audit_logs_userId" ON "audit_logs"("userId");
CREATE INDEX "idx_audit_logs_action" ON "audit_logs"("action");
CREATE INDEX "idx_audit_logs_createdAt" ON "audit_logs"("createdAt");
