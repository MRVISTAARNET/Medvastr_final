-- ============================================================
-- MEDVASTR COMPLETE DATABASE SCRIPT
-- Combined Schema, Seed Data, and Admin User
-- ============================================================

CREATE DATABASE IF NOT EXISTS medvastr_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medvastr_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS order_items, orders, cart_items, carts, wishlist_items, 
  product_images, product_variants, reviews, products, categories, 
  addresses, promo_codes, users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  role ENUM('CUSTOMER','ADMIN','MANAGER') DEFAULT 'CUSTOMER',
  email_verified BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  loyalty_points INT DEFAULT 0,
  profile_image VARCHAR(500) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Categories Table
CREATE TABLE categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  image_url VARCHAR(500),
  display_order INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Products Table (Includes Brand, Style ID, Barcode)
CREATE TABLE products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(300) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  brand VARCHAR(100) DEFAULT 'Medvastr',
  style_id VARCHAR(100),
  barcode VARCHAR(100),
  sku VARCHAR(100),
  fabric VARCHAR(80),
  type VARCHAR(60) NOT NULL,
  gender VARCHAR(20) NOT NULL,
  badge VARCHAR(60),
  fabric_detail VARCHAR(120),
  stretch_type VARCHAR(40),
  pocket_count INT,
  care_instructions VARCHAR(255),
  weight VARCHAR(40),
  fit VARCHAR(60),
  rating DECIMAL(3,2) DEFAULT 4.50,
  review_count INT DEFAULT 0,
  category_id BIGINT,
  emoji VARCHAR(10) DEFAULT '🥼',
  bg_color VARCHAR(10) DEFAULT '#f0f0f0',
  active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FULLTEXT idx_search (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Product Variants (Sizes & Colors)
CREATE TABLE product_variants (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  size VARCHAR(10),
  color_name VARCHAR(60),
  color_hex VARCHAR(10),
  stock_quantity INT DEFAULT 0,
  sku VARCHAR(100) UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Product Images
CREATE TABLE product_images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(200),
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Promo Codes
CREATE TABLE promo_codes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  discount_type ENUM('PERCENTAGE','FIXED') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  minimum_order_amount DECIMAL(10,2) DEFAULT 0.00,
  maximum_discount_amount DECIMAL(10,2),
  usage_limit INT,
  used_count INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  expires_at DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Carts & Cart Items
CREATE TABLE carts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE cart_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  cart_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  variant_id BIGINT,
  size VARCHAR(10),
  color_hex VARCHAR(10),
  color_name VARCHAR(60),
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Orders & Order Items
CREATE TABLE orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(30) NOT NULL UNIQUE,
  user_id BIGINT,
  subtotal DECIMAL(10,2),
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  shipping_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  promo_code VARCHAR(50),
  status ENUM('PENDING','CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','RETURNED') DEFAULT 'PENDING',
  payment_method ENUM('RAZORPAY','COD','UPI','NETBANKING','EMI') DEFAULT 'COD',
  payment_status ENUM('PENDING','PAID','FAILED','REFUNDED') DEFAULT 'PENDING',
  payment_id VARCHAR(100),
  razorpay_order_id VARCHAR(100),
  shipping_name VARCHAR(120),
  shipping_phone VARCHAR(15),
  shipping_address VARCHAR(300),
  shipping_city VARCHAR(80),
  shipping_state VARCHAR(80),
  shipping_pincode VARCHAR(10),
  tracking_number VARCHAR(100),
  courier_name VARCHAR(80),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  delivered_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_order_num (order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  product_id BIGINT,
  product_name VARCHAR(255) NOT NULL,
  size VARCHAR(10),
  color_name VARCHAR(60),
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Reviews
CREATE TABLE reviews (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  rating INT NOT NULL,
  title VARCHAR(200),
  body TEXT,
  verified BOOLEAN DEFAULT FALSE,
  approved BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_review (product_id, user_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Password Reset Tokens
CREATE TABLE password_reset_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(64) NOT NULL UNIQUE,
  email VARCHAR(180) NOT NULL,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO categories (name, slug, description, display_order) VALUES
('Scrubs', 'scrubs', 'Professional scrubs for doctors and nurses', 1),
('Lab Coats', 'labcoat', 'Premium lab coats and aprons', 2),
('Stethoscopes', 'stethoscope', 'High-quality stethoscopes', 3),
('DRIFT Jacket', 'jacket', 'Medical outerwear jacket', 4),
('Underscrubs', 'underscrub', 'Comfortable underscrub layers', 5),
('Accessories', 'accessories', 'Scrub caps and accessories', 6);

INSERT INTO promo_codes (code, description, discount_type, discount_value, minimum_order_amount, usage_limit, active, expires_at) VALUES
('MEDVASTR10', '10% off all orders', 'PERCENTAGE', 10.00, 0, 10000, TRUE, '2026-12-31'),
('FIRSTORDER', '15% off first order', 'PERCENTAGE', 15.00, 0, 5000, TRUE, '2026-12-31'),
('DOCTOR20', '20% off for doctors', 'PERCENTAGE', 20.00, 1500, 2000, TRUE, '2026-06-30'),
('BULK50', '50% off bulk orders', 'PERCENTAGE', 50.00, 5000, 500, TRUE, '2026-12-31'),
('FLAT500', 'Flat Rs.500 off', 'FIXED', 500.00, 2000, 1000, TRUE, '2026-12-31');

-- Note: Admin user is now auto-created by the Backend DataInitializer on startup 
-- to ensure the BCrypt password hash is always valid and synchronized.

SELECT 'Fresh Medvastr Database Created Successfully' AS status;
