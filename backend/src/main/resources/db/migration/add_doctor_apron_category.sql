-- ==================================================================================
-- MIGRATION SCRIPT: Add "Doctor Apron / Lab Coat" Category (Idempotent & Safe)
-- Can be run multiple times safely without throwing duplicate key errors or corrupting data.
-- ==================================================================================

-- 1. Insert Men's Doctor Apron / Lab Coat category under 'men' parent (if not already exists)
INSERT INTO categories (name, slug, description, parent_id, active, show_in_nav, display_order, created_at, updated_at)
SELECT 
    'Doctor Apron / Lab Coat', 
    'men-doctor-apron-lab-coat', 
    'Premium protective doctor aprons and lab coats tailored for men, featuring fluid-resistant, breathable fabric and reinforced utility pockets.',
    (SELECT id FROM (SELECT id FROM categories WHERE slug = 'men' LIMIT 1) AS m),
    1, 
    1, 
    5, 
    NOW(), 
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE slug = 'men-doctor-apron-lab-coat'
);

-- 2. Insert Women's Doctor Apron / Lab Coat category under 'women' parent (if not already exists)
INSERT INTO categories (name, slug, description, parent_id, active, show_in_nav, display_order, created_at, updated_at)
SELECT 
    'Doctor Apron / Lab Coat', 
    'women-doctor-apron-lab-coat', 
    'Tailored doctor aprons and lab coats for women healthcare professionals with all-day comfort, stain resistance, and sleek fit.',
    (SELECT id FROM (SELECT id FROM categories WHERE slug = 'women' LIMIT 1) AS w),
    1, 
    1, 
    5, 
    NOW(), 
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE slug = 'women-doctor-apron-lab-coat'
);

-- 3. (Optional Standalone) Top-level Doctor Apron / Lab Coat category for unisex / general catalog
INSERT INTO categories (name, slug, description, parent_id, active, show_in_nav, display_order, created_at, updated_at)
SELECT 
    'Doctor Apron / Lab Coat', 
    'doctor-apron-lab-coat', 
    'Hospital-grade lab coats and aprons engineered with barrier protection and durable stitching for doctors and clinicians.',
    NULL,
    1, 
    1, 
    5, 
    NOW(), 
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE slug = 'doctor-apron-lab-coat'
);

-- 4. Correct any Milky White / White variants or tagged images that were saved with placeholder #6b7280
UPDATE product_variants 
SET color_hex = '#ffffff' 
WHERE LOWER(TRIM(color_name)) IN ('milky white', 'milky-white', 'milk white', 'white', 'pure white', 'doctor white') 
  AND (color_hex IS NULL OR LOWER(color_hex) IN ('#6b7280', '#808080', '#cccccc'));

UPDATE product_images 
SET color_hex = '#ffffff', color_code = '#ffffff' 
WHERE (LOWER(color_hex) = '#6b7280' OR LOWER(color_code) = '#6b7280') 
  AND product_id IN (
      SELECT DISTINCT product_id 
      FROM product_variants 
      WHERE LOWER(TRIM(color_name)) IN ('milky white', 'milky-white', 'milk white', 'white', 'pure white', 'doctor white')
  );

-- Verification Query:
-- SELECT id, name, slug, parent_id, active, show_in_nav FROM categories WHERE slug LIKE '%doctor-apron%';

-- Rollback Script (if ever needed):
-- DELETE FROM categories WHERE slug IN ('men-doctor-apron-lab-coat', 'women-doctor-apron-lab-coat', 'doctor-apron-lab-coat');
