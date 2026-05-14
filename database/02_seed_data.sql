-- MEDVASTR SEED DATA — Run this second
USE medvastr_db;
INSERT INTO categories (name,slug,description,display_order) VALUES
('Scrubs','scrubs','Professional scrubs for doctors and nurses',1),
('Lab Coats','labcoat','Premium lab coats and aprons',2),
('Stethoscopes','stethoscope','High-quality stethoscopes',3),
('DRIFT Jacket','jacket','Medical outerwear jacket',4),
('Underscrubs','underscrub','Comfortable underscrub layers',5),
('Accessories','accessories','Scrub caps and accessories',6);

INSERT INTO promo_codes (code,description,discount_type,discount_value,minimum_order_amount,usage_limit,active,expires_at) VALUES
('MEDVASTR10','10% off all orders','PERCENTAGE',10.00,0,10000,TRUE,'2026-12-31'),
('FIRSTORDER','15% off first order','PERCENTAGE',15.00,0,5000,TRUE,'2026-12-31'),
('DOCTOR20','20% off for doctors','PERCENTAGE',20.00,1500,2000,TRUE,'2026-06-30'),
('BULK50','50% off bulk orders','PERCENTAGE',50.00,5000,500,TRUE,'2026-12-31'),
('FLAT500','Flat Rs.500 off','FIXED',500.00,2000,1000,TRUE,'2026-12-31');

SELECT 'Seed data (Categories & Promos) inserted' AS status;
