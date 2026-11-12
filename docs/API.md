# BIGSALE API Documentation

The BIGSALE API is an enterprise-grade RESTful API powering the BIGSALE E-Commerce platform.

- **Base URL**: `http://localhost:4000/api`
- **Content Type**: `application/json`
- **Authentication**: Bearer Token in `Authorization` header (`Authorization: Bearer <jwt_token>`) or `token` cookie.

---

## Table of Contents
1. [General & System](#1-general--system)
2. [Authentication & Account](#2-authentication--account)
3. [Products Catalog](#3-products-catalog)
4. [Categories](#4-categories)
5. [Brands](#5-brands)
6. [Shopping Cart](#6-shopping-cart)
7. [Wishlist](#7-wishlist)
8. [Checkout & Pricing](#8-checkout--pricing)
9. [Orders & Tracking](#9-orders--tracking)
10. [Product Reviews](#10-product-reviews)
11. [Search & Suggestions](#11-search--suggestions)
12. [Administration & Analytics](#12-administration--analytics)

---

## 1. General & System

### 1.1 Health Check
Check API health, uptime, and service status.

- **Method + URL**: `GET /api/health`
- **Auth Required**: No
- **Request Body**: None
- **Response Schema**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-11-11T16:50:00.000Z",
    "uptime": 124.52,
    "service": "BIGSALE API"
  }
  ```
- **Example cURL**:
  ```bash
  curl -X GET http://localhost:4000/api/health
  ```

---

## 2. Authentication & Account

### 2.1 Register New Account
Register a new customer account.

- **Method + URL**: `POST /api/auth/register`
- **Auth Required**: No
- **Request Body Schema**:
  ```json
  {
    "email": "customer@bigsale.com",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1-555-0199"
  }
  ```
- **Response Schema** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "uuid-v4-string",
        "email": "customer@bigsale.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "CUSTOMER"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Example cURL**:
  ```bash
  curl -X POST http://localhost:4000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "email": "customer@bigsale.com",
      "password": "Password123!",
      "firstName": "John",
      "lastName": "Doe"
    }'
  ```

### 2.2 User Login
Authenticate with email and password.

- **Method + URL**: `POST /api/auth/login`
- **Auth Required**: No
- **Request Body Schema**:
  ```json
  {
    "email": "customer@bigsale.com",
    "password": "Customer123!"
  }
  ```
- **Response Schema** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "data": {
      "user": {
        "id": "uuid-v4-string",
        "email": "customer@bigsale.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "CUSTOMER"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Example cURL**:
  ```bash
  curl -X POST http://localhost:4000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@bigsale.com",
      "password": "Admin123!"
    }'
  ```

### 2.3 Get Current User Profile (`/me`)
Get the authenticated user's profile and default address.

- **Method + URL**: `GET /api/auth/me`
- **Auth Required**: Yes (Bearer Token)
- **Request Body**: None
- **Response Schema** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-v4-string",
      "email": "customer@bigsale.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1-555-0199",
      "role": "CUSTOMER",
      "avatar": null,
      "addresses": []
    }
  }
  ```
- **Example cURL**:
  ```bash
  curl -X GET http://localhost:4000/api/auth/me \
    -H "Authorization: Bearer <TOKEN>"
  ```

### 2.4 Update Profile
Update profile information for the authenticated user.

- **Method + URL**: `PUT /api/auth/profile`
- **Auth Required**: Yes (Bearer Token)
- **Request Body Schema**:
  ```json
  {
    "firstName": "Johnny",
    "lastName": "Doe",
    "phone": "+1-555-9988",
    "avatar": "https://example.com/avatar.jpg"
  }
  ```
- **Response Schema** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": {
      "id": "uuid-v4-string",
      "firstName": "Johnny",
      "lastName": "Doe"
    }
  }
  ```

### 2.5 Change Password
Update account password.

- **Method + URL**: `PUT /api/auth/change-password`
- **Auth Required**: Yes (Bearer Token)
- **Request Body Schema**:
  ```json
  {
    "currentPassword": "Customer123!",
    "newPassword": "NewSecurePassword123!"
  }
  ```
- **Response Schema** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Password changed successfully"
  }
  ```

### 2.6 Logout
Invalidate cookie and session.

- **Method + URL**: `POST /api/auth/logout`
- **Auth Required**: No
- **Response Schema** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

## 3. Products Catalog

### 3.1 List Products
Retrieve paginated, filterable, sortable list of products.

- **Method + URL**: `GET /api/products`
- **Auth Required**: No
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 12)
  - `search` (string)
  - `category` (category ID or slug)
  - `brand` (brand ID or slug)
  - `minPrice` (numeric)
  - `maxPrice` (numeric)
  - `sortBy` (`price_asc`, `price_desc`, `rating`, `newest`, `popular`)
  - `featured` (`true` / `false`)
- **Response Schema** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "products": [
        {
          "id": "prod-uuid",
          "name": "Wireless Noise-Canceling Headphones",
          "slug": "wireless-noise-canceling-headphones",
          "sku": "HEADPH-001",
          "description": "High fidelity audio...",
          "price": 299.99,
          "compareAtPrice": 349.99,
          "stock": 45,
          "rating": 4.8,
          "reviewCount": 128,
          "category": { "id": "cat-uuid", "name": "Electronics", "slug": "electronics" },
          "brand": { "id": "brand-uuid", "name": "SoundWave", "slug": "soundwave" },
          "images": [{ "url": "https://images.unsplash.com/...", "isPrimary": true }]
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 12,
        "total": 52,
        "totalPages": 5
      }
    }
  }
  ```
- **Example cURL**:
  ```bash
  curl -X GET "http://localhost:4000/api/products?category=electronics&minPrice=50&sortBy=price_asc"
  ```

### 3.2 Get Featured Products
Retrieve top highlighted products for banners and homepage showcases.

- **Method + URL**: `GET /api/products/featured`
- **Auth Required**: No
- **Response Schema** (`200 OK`):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "prod-uuid",
        "name": "Flagship Smartphone Pro",
        "price": 999.99,
        "isFeatured": true
      }
    ]
  }
  ```

### 3.3 Get Product by ID or Slug
Fetch complete product details with variants, images, category, brand, and reviews.

- **Method + URL**: `GET /api/products/:identifier`
- **Auth Required**: No
- **Response Schema** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "id": "prod-uuid",
      "name": "Wireless Noise-Canceling Headphones",
      "slug": "wireless-noise-canceling-headphones",
      "sku": "HEADPH-001",
      "description": "Full product description here...",
      "price": 299.99,
      "stock": 45,
      "images": [],
      "variants": [],
      "reviews": []
    }
  }
  ```
- **Example cURL**:
  ```bash
  curl -X GET http://localhost:4000/api/products/wireless-noise-canceling-headphones
  ```

### 3.4 Create Product
Add a new product to the catalog.

- **Method + URL**: `POST /api/products`
- **Auth Required**: Yes (`ADMIN` or `MANAGER`)
- **Request Body Schema**:
  ```json
  {
    "name": "Smart Watch Ultra",
    "sku": "WATCH-ULTRA-01",
    "description": "Advanced health tracking smartwatch.",
    "shortDescription": "Next-gen smartwatch.",
    "price": 399.99,
    "compareAtPrice": 449.99,
    "costPrice": 220.00,
    "stock": 100,
    "lowStockThreshold": 10,
    "categoryId": "cat-uuid",
    "brandId": "brand-uuid",
    "isFeatured": true,
    "images": [
      { "url": "https://example.com/watch.jpg", "altText": "Smart Watch", "isPrimary": true }
    ],
    "variants": [
      {
        "name": "Black / 44mm",
        "sku": "WATCH-ULTRA-BLK-44",
        "price": 399.99,
        "stock": 50,
        "attributes": { "color": "Black", "size": "44mm" }
      }
    ]
  }
  ```
- **Response Schema** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "Product created successfully",
    "data": { "id": "prod-uuid", "name": "Smart Watch Ultra" }
  }
  ```

### 3.5 Update Product
Update product details and stock.

- **Method + URL**: `PUT /api/products/:id`
- **Auth Required**: Yes (`ADMIN` or `MANAGER`)
- **Request Body Schema**: Partial fields of product.
- **Response Schema** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Product updated successfully",
    "data": { "id": "prod-uuid", "price": 379.99 }
  }
  ```

### 3.6 Delete Product
Delete a product from the database.

- **Method + URL**: `DELETE /api/products/:id`
- **Auth Required**: Yes (`ADMIN`)
- **Response Schema** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Product deleted successfully"
  }
  ```

---

## 4. Categories

### 4.1 List Categories
- **Method + URL**: `GET /api/categories`
- **Auth Required**: No
- **Response Schema**: List of categories with child subcategories and product count.

### 4.2 Get Category Details
- **Method + URL**: `GET /api/categories/:identifier`
- **Auth Required**: No

### 4.3 Create Category
- **Method + URL**: `POST /api/categories`
- **Auth Required**: Yes (`ADMIN`)
- **Request Body**:
  ```json
  {
    "name": "Smart Home",
    "description": "Connected devices and home automation",
    "image": "https://example.com/cat.jpg",
    "parentId": null,
    "isFeatured": true
  }
  ```

### 4.4 Update Category
- **Method + URL**: `PUT /api/categories/:id`
- **Auth Required**: Yes (`ADMIN`)

### 4.5 Delete Category
- **Method + URL**: `DELETE /api/categories/:id`
- **Auth Required**: Yes (`ADMIN`)

---

## 5. Brands

### 5.1 List Brands
- **Method + URL**: `GET /api/brands`
- **Auth Required**: No

### 5.2 Get Brand Details
- **Method + URL**: `GET /api/brands/:identifier`
- **Auth Required**: No

### 5.3 Create Brand
- **Method + URL**: `POST /api/brands`
- **Auth Required**: Yes (`ADMIN`)
- **Request Body**:
  ```json
  {
    "name": "Apple",
    "description": "Innovations in consumer tech",
    "logo": "https://example.com/apple.png",
    "website": "https://apple.com"
  }
  ```

### 5.4 Update Brand
- **Method + URL**: `PUT /api/brands/:id`
- **Auth Required**: Yes (`ADMIN`)

### 5.5 Delete Brand
- **Method + URL**: `DELETE /api/brands/:id`
- **Auth Required**: Yes (`ADMIN`)

---

## 6. Shopping Cart

### 6.1 Get Cart
Retrieve user's shopping cart, items, variants, applied coupon, and totals.

- **Method + URL**: `GET /api/cart`
- **Auth Required**: Yes
- **Response Schema** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "id": "cart-uuid",
      "items": [
        {
          "id": "cart-item-uuid",
          "productId": "prod-uuid",
          "variantId": "var-uuid",
          "quantity": 2,
          "price": 299.99,
          "product": { "name": "Wireless Headphones", "images": [] }
        }
      ],
      "couponCode": "SAVE20",
      "subtotal": 599.98,
      "discount": 119.99,
      "total": 479.99
    }
  }
  ```
- **Example cURL**:
  ```bash
  curl -X GET http://localhost:4000/api/cart \
    -H "Authorization: Bearer <TOKEN>"
  ```

### 6.2 Add Item to Cart
- **Method + URL**: `POST /api/cart/add`
- **Auth Required**: Yes
- **Request Body Schema**:
  ```json
  {
    "productId": "prod-uuid",
    "variantId": null,
    "quantity": 1
  }
  ```
- **Response Schema** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Item added to cart",
    "data": { ...cart }
  }
  ```

### 6.3 Update Cart Item Quantity
- **Method + URL**: `PUT /api/cart/items/:itemId`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "quantity": 3
  }
  ```

### 6.4 Remove Item from Cart
- **Method + URL**: `DELETE /api/cart/items/:itemId`
- **Auth Required**: Yes

### 6.5 Clear Cart
- **Method + URL**: `DELETE /api/cart/clear`
- **Auth Required**: Yes

### 6.6 Apply Promo Coupon
- **Method + URL**: `POST /api/cart/coupon`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "code": "BIGSALE2026"
  }
  ```

### 6.7 Remove Promo Coupon
- **Method + URL**: `DELETE /api/cart/coupon`
- **Auth Required**: Yes

---

## 7. Wishlist

### 7.1 Get Wishlist
- **Method + URL**: `GET /api/wishlist`
- **Auth Required**: Yes

### 7.2 Add Item to Wishlist
- **Method + URL**: `POST /api/wishlist/add`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "productId": "prod-uuid"
  }
  ```

### 7.3 Remove Item from Wishlist
- **Method + URL**: `DELETE /api/wishlist/remove/:productId`
- **Auth Required**: Yes

---

## 8. Checkout & Pricing

### 8.1 Calculate Checkout Totals
Preview shipping, tax, discounts, and grand total prior to placing order.

- **Method + URL**: `POST /api/checkout/calculate`
- **Auth Required**: Yes
- **Request Body Schema**:
  ```json
  {
    "shippingAddressId": "address-uuid",
    "couponCode": "SAVE20"
  }
  ```
- **Response Schema** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "subtotal": 599.98,
      "discount": 119.99,
      "tax": 38.40,
      "shippingFee": 15.00,
      "total": 533.39,
      "items": []
    }
  }
  ```

### 8.2 Place Order
Finalize cart, process payment method, deduct inventory, and persist new order.

- **Method + URL**: `POST /api/checkout/place-order`
- **Auth Required**: Yes
- **Request Body Schema**:
  ```json
  {
    "shippingAddress": {
      "fullName": "John Doe",
      "phone": "+1-555-0199",
      "addressLine1": "123 Market Street",
      "addressLine2": "Apt 4B",
      "city": "San Francisco",
      "state": "CA",
      "postalCode": "94103",
      "country": "US"
    },
    "paymentMethod": "STRIPE",
    "customerNotes": "Please leave at front door.",
    "couponCode": "SAVE20"
  }
  ```
- **Response Schema** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "Order placed successfully",
    "data": {
      "order": {
        "id": "order-uuid",
        "orderNumber": "ORD-20261111-9872",
        "status": "PENDING",
        "paymentStatus": "PAID",
        "total": 533.39
      }
    }
  }
  ```
- **Example cURL**:
  ```bash
  curl -X POST http://localhost:4000/api/checkout/place-order \
    -H "Authorization: Bearer <TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{
      "shippingAddress": {
        "fullName": "Jane Doe",
        "phone": "+1-555-4321",
        "addressLine1": "456 Tech Parkway",
        "city": "Austin",
        "state": "TX",
        "postalCode": "78701",
        "country": "US"
      },
      "paymentMethod": "CREDIT_CARD"
    }'
  ```

---

## 9. Orders & Tracking

### 9.1 Get User's Orders
- **Method + URL**: `GET /api/orders/my-orders`
- **Auth Required**: Yes

### 9.2 Get Single Order Details
- **Method + URL**: `GET /api/orders/:id`
- **Auth Required**: Yes

### 9.3 Cancel Order
- **Method + URL**: `POST /api/orders/:id/cancel`
- **Auth Required**: Yes

### 9.4 List All Orders (Admin)
- **Method + URL**: `GET /api/orders/admin/all`
- **Auth Required**: Yes (`ADMIN` or `MANAGER`)
- **Query Parameters**: `status`, `page`, `limit`

### 9.5 Update Order Status (Admin)
- **Method + URL**: `PUT /api/orders/admin/:id/status`
- **Auth Required**: Yes (`ADMIN` or `MANAGER`)
- **Request Body**:
  ```json
  {
    "status": "PROCESSING",
    "adminNotes": "Package prepared in warehouse"
  }
  ```

---

## 10. Product Reviews

### 10.1 List Product Reviews
- **Method + URL**: `GET /api/reviews/product/:productId`
- **Auth Required**: No

### 10.2 Create Review
- **Method + URL**: `POST /api/reviews`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "productId": "prod-uuid",
    "rating": 5,
    "title": "Incredible sound quality",
    "comment": "Battery lasts all week. Highly recommended!"
  }
  ```

### 10.3 Delete Review
- **Method + URL**: `DELETE /api/reviews/:id`
- **Auth Required**: Yes (Review Owner or `ADMIN`)

---

## 11. Search & Suggestions

### 11.1 Full-Text Search
- **Method + URL**: `GET /api/search`
- **Auth Required**: No
- **Query Parameters**:
  - `q`: search query string
  - `category`: optional category filter
  - `minPrice`, `maxPrice`
  - `page`, `limit`
- **Example cURL**:
  ```bash
  curl -X GET "http://localhost:4000/api/search?q=wireless&minPrice=100"
  ```

### 11.2 Search Autocomplete Suggestions
- **Method + URL**: `GET /api/search/suggestions`
- **Auth Required**: No
- **Query Parameters**: `q` (minimum 2 chars)

---

## 12. Administration & Analytics

### 12.1 Dashboard Stats
Key executive business KPIs, revenue, order totals, and recent sales trends.

- **Method + URL**: `GET /api/admin/stats`
- **Auth Required**: Yes (`ADMIN` or `MANAGER`)
- **Response Schema** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "totalRevenue": 48590.25,
      "totalOrders": 342,
      "totalCustomers": 128,
      "totalProducts": 64,
      "recentOrders": [],
      "topSellingProducts": []
    }
  }
  ```
- **Example cURL**:
  ```bash
  curl -X GET http://localhost:4000/api/admin/stats \
    -H "Authorization: Bearer <ADMIN_TOKEN>"
  ```

### 12.2 List Customers
- **Method + URL**: `GET /api/admin/customers`
- **Auth Required**: Yes (`ADMIN`)

### 12.3 Get Customer Detail
- **Method + URL**: `GET /api/admin/customers/:id`
- **Auth Required**: Yes (`ADMIN`)

### 12.4 Update Customer Status (Block/Activate)
- **Method + URL**: `PUT /api/admin/customers/:id/status`
- **Auth Required**: Yes (`ADMIN`)
- **Request Body**:
  ```json
  {
    "isActive": false
  }
  ```

### 12.5 View System Audit Logs
- **Method + URL**: `GET /api/admin/audit-logs`
- **Auth Required**: Yes (`ADMIN`)
- **Query Parameters**: `page`, `limit`, `action`
