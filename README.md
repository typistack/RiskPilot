# Dhan Broker Backend (Node.js)

Backend server for DhanHQ API authentication, TOTP generation, and order placement.

---

## 1. Run Command (Backend Chalane Ke Liye)

Terminal me `dhan-broker` folder me ye command run karein:

```bash
npm start
```

Ya development mode (auto reload) ke liye:
```bash
npm run dev
```

---

## 2. API Endpoints

### Health Check
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/health`

---

### Authentication / Generate Access Token
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/login` (ya `http://localhost:5000/api/login`)
- **Headers:** `Content-Type: application/json`

#### Request Body (Flutter ya Postman se Sirf Ye 2 Bhejne Hain):
```json
{
  "dhanClientId": "YOUR_DHAN_CLIENT_ID",
  "pin": "YOUR_6_DIGIT_PIN"
}
```

> **Note:**
> - Flutter app ko koi bhi TOTP ya secret bhejne ki zaroorat nahi hai.
> - Backend ki `.env` file me `DHAN_TOTP_SECRET` ek baar configure kar dijiye.
> - Backend khud us secret key se dynamic TOTP banayega aur Dhan API ko bhej kar Access Token le aayega.

#### Response (Success):
```json
{
  "success": true,
  "message": "Authentication successful",
  "generatedTotp": "548921",
  "data": {
    "dhanClientId": "1000000001",
    "dhanClientName": "Your Name",
    "dhanClientUcc": "UCC123",
    "givenPowerOfAttorney": true,
    "accessToken": "eyJhbGciOi...",
    "expiryTime": "2026-10-23T09:30:00Z"
  }
}
```

---

## 3. Postman / cURL Testing Example

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "dhanClientId": "1000000001",
    "pin": "123456",
    "totpSecret": "YOUR_TOTP_SECRET_BASE32"
  }'
```
