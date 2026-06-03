# Medvastr deployment

## Frontend (AWS Amplify)

1. Connect repo: https://github.com/MRVISTAARNET/Medvastr_final
2. Build uses root `amplify.yml` (auto on push to main).
3. **Environment variables** in Amplify console:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://api.medvastr.com/api` |
| `NEXT_PUBLIC_RAZORPAY_KEY` | `rzp_test_SvSswUyEl4VChG` |

## Backend (Elastic Beanstalk)

1. Build JAR locally (or use `backend/deploy/medvastr-backend.jar` after `mvn package`).
2. Upload **only** to EB:
   - `backend-0.0.1-SNAPSHOT.jar` (rename optional)
   - `Procfile`
   - `.ebextensions/` folder
   - `.platform/` folder (if present)
3. Or zip these files and upload as **JAR deployment** on Java Corretto 17 platform.
4. Set environment property: `SPRING_PROFILES_ACTIVE=prod` (included in `.ebextensions`).

### Build JAR

```bash
cd backend
./mvnw.cmd clean package -DskipTests
```

Output: `backend/target/backend-0.0.1-SNAPSHOT.jar`

Copy for upload: `backend/deploy/medvastr-backend.jar`

## Razorpay & Shiprocket

Configured in `application-prod.properties`:

- Razorpay test key: `rzp_test_SvSswUyEl4VChG`
- Shiprocket login: `info@medvastr.com`

Override via EB env vars: `RAZORPAY_KEY`, `RAZORPAY_SECRET`, `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`.
