# ============================================================
# MEDVASTR BACKEND — Environment Configuration Guide
# PRODUCTION DEPLOYMENT CHECKLIST
# ============================================================

## 1. DATABASE CONFIGURATION
# RDS MySQL Instance
DB_URL=jdbc:mysql://medvastr-rds-endpoint:3306/medvastr_db?useSSL=true&serverTimezone=Asia/Kolkata&characterEncoding=UTF-8&maxPoolSize=20&minPoolSize=5
DB_USER=admin_user  # Use a strong, unique username
DB_PASS=<STRONG_PASSWORD_HERE>  # Generate using: openssl rand -base64 32

## 2. JWT SECURITY
# Generate a cryptographically secure JWT secret:
# openssl rand -base64 64
JWT_SECRET=<GENERATE_STRONG_SECRET>  # Min 64 characters, alphanumeric + special chars
JWT_EXPIRATION_MS=86400000  # 24 hours in milliseconds

## 3. CORS CONFIGURATION
# Lock down to your actual domain
ALLOWED_ORIGINS=https://medvastr.com,https://www.medvastr.com,https://admin.medvastr.com

## 4. FRONTEND URL
# Used for password reset links in emails
FRONTEND_URL=https://medvastr.com

## 5. AWS S3 CONFIGURATION
# Create IAM user with S3FullAccess policy for Elastic Beanstalk role
AWS_S3_BUCKET=medvastr-assets  # Use bucket versioning + encryption
AWS_S3_REGION=ap-south-1
AWS_ACCESS_KEY_ID=<IAM_USER_ACCESS_KEY>  # Use IAM role on EB instead
AWS_SECRET_ACCESS_KEY=<IAM_USER_SECRET_KEY>

# For Elastic Beanstalk: Attach IAM role instead of using keys
# Role: medvastr-eb-role with policy: arn:aws:iam::aws:policy/AmazonS3FullAccess

## 6. EMAIL CONFIGURATION (Transactional)
# Using Titan Mail SMTP (configured in backend)
MAIL_USER=noreply@medvastr.com  # Separate from info@medvastr.com
MAIL_PASS=<TITAN_EMAIL_PASSWORD>
# Verify sender email in Titan control panel before going live

## 7. PAYMENT GATEWAY (Razorpay)
RAZORPAY_KEY=rzp_live_<YOUR_LIVE_KEY>  # Switch from test to live
RAZORPAY_SECRET=<YOUR_LIVE_SECRET>

## 8. SHIPROCKET INTEGRATION
SHIPROCKET_ENABLED=true
SHIPROCKET_EMAIL=logistics@medvastr.com  # Separate Shiprocket account
SHIPROCKET_PASSWORD=<SHIPROCKET_PASSWORD>

## 9. LOGGING & MONITORING
# Set appropriate log levels for production
LOGGING_LEVEL=WARN  # Only log WARN and ERROR in production
LOG_FORMAT=JSON  # For easier parsing by log aggregation services

## 10. SPRING PROFILES
SPRING_PROFILES_ACTIVE=prod

## 11. DATABASE BACKUP
# Enable automated RDS backups
# Retention: 30 days minimum
# Multi-AZ deployment: Recommended for high availability

## 12. MONITORING & ALERTS
# CloudWatch Alarms for:
# - High CPU usage on Elastic Beanstalk
# - RDS connection count
# - S3 bucket size
# - Email failure rate

## 13. SECURITY HEADERS
# Add in application-prod.properties:
# security.headers.strict-transport-security=max-age=31536000; includeSubDomains
# security.headers.x-content-type-options=nosniff
# security.headers.x-frame-options=DENY
# security.headers.content-security-policy=default-src 'self'

## 14. PERFORMANCE TUNING
# JPA Batch Size
spring.jpa.properties.hibernate.jdbc.batch_size=20

# Connection Pool
spring.datasource.hikari.maximumPoolSize=20
spring.datasource.hikari.minimumIdle=5
spring.datasource.hikari.connectionTimeout=20000

## 15. DEPLOYMENT CHECKLIST
# ✓ All environment variables set in Elastic Beanstalk
# ✓ RDS backup configured
# ✓ S3 bucket with versioning & encryption enabled
# ✓ CloudFront distribution for S3 (CDN)
# ✓ WAF rules enabled
# ✓ SSL certificate installed
# ✓ Database migrations tested
# ✓ Email verification working
# ✓ Payment gateway test transaction successful
# ✓ Shiprocket test order synced
# ✓ Logs aggregated to CloudWatch
# ✓ Health checks configured
# ✓ Auto-scaling rules set
