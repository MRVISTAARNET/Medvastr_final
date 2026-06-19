-- ============================================================
-- MEDVASTR COMPLETE DATABASE SETUP
-- One file to rule them all - Run this single file to setup everything
-- ============================================================

USE medvastr_db;
SET FOREIGN_KEY_CHECKS=0;

-- ============================================================
-- SECTION 1: CORE TABLES (BASE SCHEMA)
-- ============================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'USER',
  email_verified BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  loyalty_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. CATEGORIES TABLE (with hierarchy)
CREATE TABLE IF NOT EXISTS categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(170) NOT NULL UNIQUE,
  description TEXT,
  display_order INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  parent_id BIGINT NULL,
  show_in_nav BOOLEAN DEFAULT TRUE,
  nav_label VARCHAR(120) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_parent_active (parent_id, active, display_order),
  INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE categories
  ADD CONSTRAINT fk_category_parent
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL;

-- 3. PRODUCT COLORS MASTER
CREATE TABLE IF NOT EXISTS product_colors (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  hex_code VARCHAR(10) NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. PRODUCT SIZES MASTER
CREATE TABLE IF NOT EXISTS product_sizes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  size_value VARCHAR(20) NOT NULL UNIQUE,
  category VARCHAR(50),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description LONGTEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  fabric VARCHAR(120),
  material VARCHAR(120),
  tags VARCHAR(500),
  seo_title VARCHAR(300),
  seo_description VARCHAR(500),
  product_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  short_description TEXT,
  type VARCHAR(60) NOT NULL,
  gender VARCHAR(20) NOT NULL,
  badge VARCHAR(50),
  brand VARCHAR(100),
  style_id VARCHAR(100),
  barcode VARCHAR(100),
  sku VARCHAR(100) UNIQUE,
  emoji VARCHAR(10),
  bg_color VARCHAR(20),
  fabric_detail TEXT,
  stretch_type VARCHAR(50),
  pocket_count INT,
  care_instructions TEXT,
  weight VARCHAR(50),
  fit VARCHAR(50),
  video_url VARCHAR(500),
  rating DECIMAL(3,2) DEFAULT 4.50,
  review_count INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  category_id BIGINT,
  subcategory_id BIGINT,
  child_category_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_category (category_id),
  INDEX idx_subcategory (subcategory_id),
  INDEX idx_child_category (child_category_id),
  INDEX idx_active (active),
  INDEX idx_featured (featured),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (subcategory_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (child_category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS product_variants (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  sku VARCHAR(100),
  size VARCHAR(50),
  color VARCHAR(100),
  stock_quantity INT DEFAULT 0,
  barcode VARCHAR(100) UNIQUE,
  variant_price DECIMAL(10,2),
  variant_original_price DECIMAL(10,2),
  is_default BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  color_id BIGINT,
  size_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product (product_id),
  INDEX idx_sku (sku),
  INDEX idx_stock (stock_quantity),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (color_id) REFERENCES product_colors(id) ON DELETE SET NULL,
  FOREIGN KEY (size_id) REFERENCES product_sizes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS product_images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  color_code VARCHAR(10),
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. PRODUCT ATTRIBUTES (for filtering)
CREATE TABLE IF NOT EXISTS product_attributes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  attribute_type VARCHAR(30) NOT NULL DEFAULT 'SELECT',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_filterable BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. PRODUCT ATTRIBUTE VALUES
CREATE TABLE IF NOT EXISTS product_attribute_values (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  attribute_id BIGINT NOT NULL,
  value VARCHAR(200) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (attribute_id) REFERENCES product_attributes(id) ON DELETE CASCADE,
  UNIQUE KEY uk_attr_value (attribute_id, value),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  user_id BIGINT,
  rating INT NOT NULL,
  title VARCHAR(255),
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_product (product_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. BANNERS
CREATE TABLE IF NOT EXISTS banners (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  link_url VARCHAR(500),
  position ENUM('HOME_TOP','HOME_MIDDLE','HOME_BOTTOM','CATEGORY','PROMO') DEFAULT 'HOME_TOP',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_position_order (position, display_order),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. COLLECTIONS
CREATE TABLE IF NOT EXISTS collections (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  slug VARCHAR(170) NOT NULL UNIQUE,
  description TEXT,
  image_url VARCHAR(500),
  collection_type ENUM('CURATED','NEW_ARRIVALS','TRENDING','SALE','BULK_ORDER','SEASONAL') DEFAULT 'CURATED',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type_order (collection_type, display_order),
  INDEX idx_slug (slug),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. COLLECTION PRODUCTS
CREATE TABLE IF NOT EXISTS collection_products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  collection_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  display_order INT DEFAULT 0,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_collection_product (collection_id, product_id),
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. BULK ORDER CONFIG
CREATE TABLE IF NOT EXISTS bulk_order_config (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  min_quantity INT NOT NULL DEFAULT 10,
  max_quantity INT DEFAULT 500,
  discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. BLOG CATEGORIES
CREATE TABLE IF NOT EXISTS blog_categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL UNIQUE,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. BLOG POSTS
CREATE TABLE IF NOT EXISTS blog_posts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(320) NOT NULL UNIQUE,
  excerpt TEXT,
  content LONGTEXT NOT NULL,
  featured_image VARCHAR(500),
  category_id BIGINT,
  author_name VARCHAR(120),
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  seo_title VARCHAR(300),
  seo_description VARCHAR(500),
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_published (published_at),
  INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 17. NAVBAR ITEMS
CREATE TABLE IF NOT EXISTS navbar_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(120) NOT NULL,
  href VARCHAR(500),
  parent_id BIGINT,
  item_type VARCHAR(30) NOT NULL DEFAULT 'LINK',
  category_id BIGINT,
  gender VARCHAR(20),
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  open_new_tab BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_parent_order (parent_id, is_active, display_order),
  INDEX idx_active (is_active),
  CONSTRAINT fk_nav_parent FOREIGN KEY (parent_id) REFERENCES navbar_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_nav_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 18. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  discount_price DECIMAL(12,2) DEFAULT 0,
  final_price DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'PENDING',
  order_status VARCHAR(20) DEFAULT 'PENDING',
  shipping_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_status (order_status),
  INDEX idx_order_number (order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 19. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  variant_id BIGINT,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
  INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 20. PROMO CODES
CREATE TABLE IF NOT EXISTS promo_codes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type VARCHAR(20) NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  max_uses INT,
  usage_count INT DEFAULT 0,
  min_purchase_amount DECIMAL(10,2),
  expiry_date TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 21. OTP TABLE
CREATE TABLE IF NOT EXISTS otp_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_otp (email, otp_code),
  INDEX idx_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 22. INQUIRIES/CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS inquiries (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255),
  message LONGTEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'NEW',
  replied_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 23. STORE SETTINGS
CREATE TABLE IF NOT EXISTS store_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value LONGTEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SECTION 2: SEED DATA
-- ============================================================

-- Seed colors
INSERT IGNORE INTO product_colors (name, hex_code, display_order, is_active) VALUES
('Black', '#000000', 1, TRUE),
('White', '#FFFFFF', 2, TRUE),
('Navy', '#001F3F', 3, TRUE),
('Red', '#FF4136', 4, TRUE),
('Blue', '#0074D9', 5, TRUE),
('Green', '#2ECC40', 6, TRUE),
('Gray', '#AAAAAA', 7, TRUE),
('Beige', '#F5DEB3', 8, TRUE),
('Teal', '#00A7A7', 9, TRUE),
('Gold', '#FFD700', 10, TRUE),
('Dark Blue', '#1a2b4a', 11, TRUE),
('Light Blue', '#add8e6', 12, TRUE),
('Maroon', '#800000', 13, TRUE),
('Wine', '#722f37', 14, TRUE),
('Olive Green', '#556b2f', 15, TRUE),
('Navy Blue', '#000080', 16, TRUE),
('Bottle Green', '#006a4e', 17, TRUE);

-- Seed sizes
INSERT IGNORE INTO product_sizes (name, size_value, category, display_order, is_active) VALUES
('Extra Small', 'XS', 'APPAREL', 1, TRUE),
('Small', 'S', 'APPAREL', 2, TRUE),
('Medium', 'M', 'APPAREL', 3, TRUE),
('Large', 'L', 'APPAREL', 4, TRUE),
('Extra Large', 'XL', 'APPAREL', 5, TRUE),
('2XL', '2XL', 'APPAREL', 6, TRUE),
('XXXL', 'XXXL', 'APPAREL', 7, TRUE),
('4XL', '4XL', 'APPAREL', 8, TRUE),
('5XL', '5XL', 'APPAREL', 9, TRUE),
('One Size', 'One Size', 'ACCESSORIES', 10, TRUE);

-- Seed categories (with hierarchy)
INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav, nav_label) VALUES
('Men', 'men', 'Men''s medical apparel', 1, TRUE, NULL, TRUE, 'Men'),
('Women', 'women', 'Women''s medical apparel', 2, TRUE, NULL, TRUE, 'Women'),
('Surgical Wear', 'surgical-wear', 'Surgical gowns and caps', 3, TRUE, NULL, TRUE, 'Surgical Wear'),
('Bulk Orders', 'bulk-orders', 'Hospital linen and bulk supplies', 4, TRUE, NULL, TRUE, 'Bulk Orders');

-- Subcategories under Men
INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Scrub Suit', 'men-scrub-suit', 'Scrub suits for men', 1, TRUE, c.id, TRUE FROM categories c WHERE c.slug = 'men' LIMIT 1;

INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Cotton Crew T-Shirt', 'men-cotton-crew-tshirt', 'Cotton crew neck t-shirts', 2, TRUE, c.id, TRUE FROM categories c WHERE c.slug = 'men' LIMIT 1;

INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Full Wear', 'men-full-wear', 'Full wear for men', 3, TRUE, c.id, TRUE FROM categories c WHERE c.slug = 'men' LIMIT 1;

INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Surgical Gown', 'men-surgical-gown', 'Surgical gowns for men', 4, TRUE, c.id, TRUE FROM categories c WHERE c.slug = 'men' LIMIT 1;

INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Surgical Cap', 'men-surgical-cap', 'Surgical caps for men', 5, TRUE, c.id, TRUE FROM categories c WHERE c.slug = 'men' LIMIT 1;

-- Level 3 under Men > Scrub Suit
INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Flexi Fit V Scrub', 'men-scrub-suit-flexi-fit-v-scrub', 'Flexi Fit V Scrub for men', 1, TRUE, c.id, TRUE
FROM categories c WHERE c.slug = 'men-scrub-suit' LIMIT 1;

INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Classic V Scrub', 'men-scrub-suit-classic-v-scrub', 'Classic V Scrub for men', 2, TRUE, c.id, TRUE
FROM categories c WHERE c.slug = 'men-scrub-suit' LIMIT 1;

INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Premium Scrub', 'men-scrub-suit-premium-scrub', 'Premium Scrub for men', 3, TRUE, c.id, TRUE
FROM categories c WHERE c.slug = 'men-scrub-suit' LIMIT 1;

-- Subcategories under Women (mirror Men)
INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Scrub Suit', 'women-scrub-suit', 'Scrub suits for women', 1, TRUE, c.id, TRUE FROM categories c WHERE c.slug = 'women' LIMIT 1;

INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Cotton Crew T-Shirt', 'women-cotton-crew-tshirt', 'Cotton crew neck t-shirts', 2, TRUE, c.id, TRUE FROM categories c WHERE c.slug = 'women' LIMIT 1;

INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Full Wear', 'women-full-wear', 'Full wear for women', 3, TRUE, c.id, TRUE FROM categories c WHERE c.slug = 'women' LIMIT 1;

INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Surgical Gown', 'women-surgical-gown', 'Surgical gowns for women', 4, TRUE, c.id, TRUE FROM categories c WHERE c.slug = 'women' LIMIT 1;

INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Surgical Cap', 'women-surgical-cap', 'Surgical caps for women', 5, TRUE, c.id, TRUE FROM categories c WHERE c.slug = 'women' LIMIT 1;

-- Level 3 under Women > Scrub Suit
INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Flexi Fit V Scrub', 'women-scrub-suit-flexi-fit-v-scrub', 'Flexi Fit V Scrub for women', 1, TRUE, c.id, TRUE
FROM categories c WHERE c.slug = 'women-scrub-suit' LIMIT 1;

INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Classic V Scrub', 'women-scrub-suit-classic-v-scrub', 'Classic V Scrub for women', 2, TRUE, c.id, TRUE
FROM categories c WHERE c.slug = 'women-scrub-suit' LIMIT 1;

INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Premium Scrub', 'women-scrub-suit-premium-scrub', 'Premium Scrub for women', 3, TRUE, c.id, TRUE
FROM categories c WHERE c.slug = 'women-scrub-suit' LIMIT 1;

-- Subcategories under Surgical Wear
INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Surgical Cap', 'surgical-surgical-cap', 'Surgical caps', 1, TRUE, c.id, TRUE FROM categories c WHERE c.slug = 'surgical-wear' LIMIT 1;

INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Surgical Gown', 'surgical-surgical-gown', 'Surgical gowns', 2, TRUE, c.id, TRUE FROM categories c WHERE c.slug = 'surgical-wear' LIMIT 1;

-- Subcategories under Bulk Orders
INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Linen & Bedding', 'bulk-linen-bedding', 'Hospital linen and bedding', 1, TRUE, c.id, TRUE FROM categories c WHERE c.slug = 'bulk-orders' LIMIT 1;

INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Brown Blanket', 'bulk-brown-blanket', 'Brown blankets', 2, TRUE, c.id, TRUE FROM categories c WHERE c.slug = 'bulk-orders' LIMIT 1;

INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Maternity Gown', 'bulk-maternity-gown', 'Maternity gowns', 3, TRUE, c.id, TRUE FROM categories c WHERE c.slug = 'bulk-orders' LIMIT 1;

INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Patient Dress', 'bulk-patient-dress', 'Patient dresses', 4, TRUE, c.id, TRUE FROM categories c WHERE c.slug = 'bulk-orders' LIMIT 1;

INSERT IGNORE INTO categories (name, slug, description, display_order, active, parent_id, show_in_nav)
SELECT 'Scrub Suit', 'bulk-scrub-suit', 'Bulk scrub suits', 5, TRUE, c.id, TRUE FROM categories c WHERE c.slug = 'bulk-orders' LIMIT 1;

-- Seed attributes
INSERT IGNORE INTO product_attributes (name, slug, attribute_type, display_order, is_filterable) VALUES
('Color', 'color', 'COLOR', 1, TRUE),
('Size', 'size', 'SIZE', 2, TRUE),
('Fabric', 'fabric', 'SELECT', 3, TRUE),
('Material', 'material', 'SELECT', 4, TRUE),
('Fit', 'fit', 'SELECT', 5, TRUE),
('Gender', 'gender', 'SELECT', 6, TRUE),
('Department', 'department', 'SELECT', 7, FALSE),
('Usage', 'usage', 'SELECT', 8, FALSE);

-- Seed navbar
INSERT IGNORE INTO navbar_items (label, href, item_type, display_order, is_active) VALUES
('Men', '/products?gen=men', 'MEGA_MENU', 1, TRUE),
('Women', '/products?gen=women', 'MEGA_MENU', 2, TRUE),
('Surgical Wear', '/products?cat=surgical-wear', 'DROPDOWN', 3, TRUE),
('Bulk Orders', '/bulk-orders', 'LINK', 4, TRUE),
('About Us', '/about', 'LINK', 5, TRUE),
('Blogs', '/blog', 'LINK', 6, TRUE),
('Contact Us', '/contact', 'LINK', 7, TRUE);

-- Seed bulk order tiers
INSERT IGNORE INTO bulk_order_config (min_quantity, max_quantity, discount_percentage, description, is_active) VALUES
(10, 50, 10.00, 'Bulk order 10-50 pieces: 10% discount', TRUE),
(51, 100, 15.00, 'Bulk order 51-100 pieces: 15% discount', TRUE),
(101, 500, 20.00, 'Bulk order 100+ pieces: 20% discount', TRUE);

-- Seed collections
INSERT IGNORE INTO collections (name, slug, collection_type, display_order, is_active) VALUES
('New Arrivals', 'new-arrivals', 'NEW_ARRIVALS', 1, TRUE),
('Trending Now', 'trending-now', 'TRENDING', 2, TRUE),
('Summer Sale', 'summer-sale', 'SALE', 3, TRUE),
('Bulk Orders', 'bulk-orders', 'BULK_ORDER', 4, TRUE),
('Bestsellers', 'bestsellers', 'CURATED', 5, TRUE);

-- Seed blog categories
INSERT IGNORE INTO blog_categories (name, slug, description, display_order, is_active) VALUES
('Medical Updates', 'medical-updates', 'Latest updates on medical standards', 1, TRUE),
('Tips & Tricks', 'tips-tricks', 'Helpful tips for medical professionals', 2, TRUE),
('Industry News', 'industry-news', 'Healthcare industry news', 3, TRUE);

-- Create admin user (optional)
INSERT IGNORE INTO users (first_name, last_name, email, password, phone, role, email_verified, active, loyalty_points)
VALUES ('Admin', 'Medvastr', 'admin@medvastr.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', '+919876543210', 'ADMIN', TRUE, TRUE, 0);

-- ============================================================
-- SECTION 3: OPTIMIZATION (Indices already created above)
-- ============================================================

-- All performance indices created inline during table definitions
-- No additional indices needed

-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT '✓ Database setup completed!' AS status;
SELECT COUNT(*) as total_categories FROM categories;
SELECT COUNT(*) as total_colors FROM product_colors;
SELECT COUNT(*) as total_sizes FROM product_sizes;
SELECT COUNT(*) as bulk_tiers FROM bulk_order_config;
SELECT COUNT(*) as total_collections FROM collections;
SELECT COUNT(*) as total_users FROM users;

SET FOREIGN_KEY_CHECKS=1;
COMMIT;

-- ============================================================
-- END OF COMPLETE SETUP
-- ============================================================
