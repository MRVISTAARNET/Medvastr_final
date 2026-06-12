# Medvastr E-Commerce API Documentation

## Base URL
- Production: `https://api.medvastr.com`
- Development: `http://localhost:8080`

## Authentication
Most admin endpoints require JWT token in header:
```
Authorization: Bearer {jwt_token}
```

---

## 🏠 BANNERS API

### Get All Active Banners
**PUBLIC - No auth required**
```
GET /api/banners
```
Returns list of all active banners ordered by display order.

### Get Banners by Position
**PUBLIC**
```
GET /api/banners/position/{position}
```
Positions: `HOME_TOP`, `HOME_MIDDLE`, `HOME_BOTTOM`, `CATEGORY`, `PROMO`

### Create Banner (ADMIN)
**POST /api/admin/banners**
```json
{
  "title": "Summer Collection",
  "imageUrl": "https://...",
  "linkUrl": "/collections/summer",
  "position": "HOME_TOP",
  "displayOrder": 0,
  "isActive": true
}
```

### Update Banner (ADMIN)
**PUT /api/admin/banners/{id}**
Same payload as create.

### Delete Banner (ADMIN)
**DELETE /api/admin/banners/{id}**

### Reorder Banners (ADMIN)
**POST /api/admin/banners/reorder**
```json
[1, 3, 2]  // List of banner IDs in desired order
```

---

## 📦 COLLECTIONS API

### Get All Active Collections
**PUBLIC**
```
GET /api/collections
```

### Get Collection by Slug
**PUBLIC**
```
GET /api/collections/slug/{slug}
Response: Collection details with product count
```

### Get Collections by Type
**PUBLIC**
```
GET /api/collections/type/{type}
```
Types: `CURATED`, `NEW_ARRIVALS`, `TRENDING`, `SALE`, `BULK_ORDER`, `SEASONAL`

### Get New Arrivals
**PUBLIC**
```
GET /api/collections/new-arrivals
```

### Get Trending Collections
**PUBLIC**
```
GET /api/collections/trending
```

### Get Bulk Order Collections
**PUBLIC**
```
GET /api/collections/bulk-orders
```

### Create Collection (ADMIN)
**POST /api/admin/collections**
```json
{
  "name": "Summer Sale",
  "slug": "summer-sale",
  "description": "Best deals for summer",
  "imageUrl": "https://...",
  "collectionType": "SALE",
  "displayOrder": 1,
  "isActive": true
}
```

### Update Collection (ADMIN)
**PUT /api/admin/collections/{id}**

### Delete Collection (ADMIN)
**DELETE /api/admin/collections/{id}**

### Add Product to Collection (ADMIN)
**POST /api/admin/collections/{collectionId}/products/{productId}**

### Remove Product from Collection (ADMIN)
**DELETE /api/admin/collections/{collectionId}/products/{productId}**

### Reorder Products in Collection (ADMIN)
**POST /api/admin/collections/{collectionId}/reorder-products**
```json
[5, 3, 1, 2]  // Product IDs in desired order
```

---

## 🛒 BULK ORDERS API

### Get All Active Discount Tiers
**PUBLIC**
```
GET /api/bulk-orders/tiers
```

### Calculate Discount for Quantity
**PUBLIC**
```
GET /api/bulk-orders/calculate-discount?quantity=50
Response: {
  "quantity": 50,
  "minQuantity": 51,
  "maxQuantity": 100,
  "discountPercentage": 15,
  "description": "Bulk order 51-100 pieces: 15% discount"
}
```

### Create Discount Tier (ADMIN)
**POST /api/admin/bulk-orders/tiers**
```json
{
  "minQuantity": 10,
  "maxQuantity": 50,
  "discountPercentage": 10.00,
  "description": "Bulk order 10-50 pieces: 10% discount",
  "isActive": true
}
```

### Update Discount Tier (ADMIN)
**PUT /api/admin/bulk-orders/tiers/{id}**

### Delete Discount Tier (ADMIN)
**DELETE /api/admin/bulk-orders/tiers/{id}**

### Calculate Discount (ADMIN)
**POST /api/admin/bulk-orders/calculate-discount**
```json
{"quantity": 25}
```

---

## 📊 PRODUCT VARIANTS API

### Product Structure with Variants
```json
{
  "id": 1,
  "name": "Premium T-Shirt",
  "slug": "premium-tshirt",
  "price": 599.00,
  "originalPrice": 799.00,
  "barcode": "1234567890123",
  "sku": "TSH-001",
  "variants": [
    {
      "id": 1,
      "colorName": "Black",
      "colorHex": "#000000",
      "size": "M",
      "stockQuantity": 50,
      "sku": "TSH-001-BLK-M",
      "barcode": "1234567890123",
      "variantPrice": 599.00,
      "isDefault": true,
      "imageUrl": "https://..."
    }
  ]
}
```

---

## 🎨 COLOR & SIZE MASTERS API

### Get All Active Product Sizes
**PUBLIC**
```
GET /api/product-sizes
Response: [
  { "id": 1, "name": "Small", "sizeValue": "S", "category": "Clothing" },
  { "id": 2, "name": "Medium", "sizeValue": "M", "category": "Clothing" }
]
```

### Get All Active Product Colors
**PUBLIC**
```
GET /api/product-colors
Response: [
  { "id": 1, "name": "Black", "hexCode": "#000000" },
  { "id": 2, "name": "White", "hexCode": "#FFFFFF" }
]
```

---

## ✅ RESPONSE FORMATS

### Successful Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...]
}
```

### HTTP Status Codes
- `200 OK` - Successful GET/PUT/POST
- `201 Created` - Resource created
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Server Error` - Internal server error

---

## 🔐 ROLE-BASED ACCESS

### Admin Endpoints
Require roles: `ADMIN`, `MANAGER`
- `/api/admin/**` - All admin endpoints

### Public Endpoints
- `/api/banners/**` - Accessible to all
- `/api/collections/**` - Accessible to all
- `/api/bulk-orders/**` - Accessible to all
- `/api/product-sizes/**` - Accessible to all
- `/api/product-colors/**` - Accessible to all

---

## 📱 FRONTEND INTEGRATION EXAMPLES

### Fetch All Collections
```typescript
const collections = await fetch('/api/collections').then(r => r.json());
```

### Add Banner to Homepage
```typescript
const banners = await fetch('/api/banners/position/HOME_TOP').then(r => r.json());
banners.forEach(banner => {
  // Display banner
});
```

### Check Bulk Discount
```typescript
const discount = await fetch('/api/bulk-orders/calculate-discount?quantity=25')
  .then(r => r.json());
console.log(`You get ${discount.discountPercentage}% off`);
```

### Create New Collection (Admin)
```typescript
await fetch('/api/admin/collections', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    name: 'New Collection',
    slug: 'new-collection',
    collectionType: 'CURATED',
    isActive: true
  })
});
```

---

## 🚀 DEPLOYMENT NOTES

### Environment Variables Needed
```env
# Database
DB_URL=jdbc:mysql://rds-endpoint:3306/medvastr_db
DB_USER=admin
DB_PASSWORD=strong_password

# JWT
JWT_SECRET=64_character_random_string

# S3
AWS_S3_BUCKET=medvastr-assets
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# Email
SMTP_HOST=smtp.titan.email
SMTP_PORT=587
SMTP_USER=noreply@medvastr.com
SMTP_PASSWORD=your_password

# Payment
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret

# API Endpoints
FRONTEND_URL=https://medvastr.com
API_URL=https://api.medvastr.com
```

### Database Migration
```bash
mysql -h RDS_ENDPOINT -u admin -p medvastr_db < migration_v3_ecommerce_features.sql
```

### Build & Deploy
```bash
# Backend
mvn clean package -DskipTests
# Deploy to Elastic Beanstalk

# Frontend
npm run build
amplify deploy
```

---

## 📞 Support
For API issues or questions, contact: dev@medvastr.com
