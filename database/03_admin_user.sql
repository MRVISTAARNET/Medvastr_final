-- MEDVASTR ADMIN USER — Run this third
-- Password hash = BCrypt of "Admin@123"
USE medvastr_db;
INSERT INTO users (first_name,last_name,email,password,phone,role,email_verified,active) VALUES
('Admin','Medvastr','admin@medvastr.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpR0.xQQJxQnGO','9920314164','ADMIN',TRUE,TRUE),
('Dr. Test','Customer','doctor@test.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpR0.xQQJxQnGO','9876543210','CUSTOMER',TRUE,TRUE);
SELECT 'Admin: admin@medvastr.com / Admin@123' AS status;
SELECT 'Test:  doctor@test.com   / Admin@123'  AS status;
