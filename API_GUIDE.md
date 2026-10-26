# Dhan Broker Backend - Complete API Documentation

Yeh backend DhanHQ API ke liye ek secure static IP bridge ke roop me kaam karta hai. Isme modular architecture implement kiya gaya hai:
- Dynamic TOTP Token Generation
- User Profile API
- Super Orders API (Place, Get, Cancel Leg)

---

## 1. Project Run Command

Terminal me ye command chalayein:
```bash
npm run dev
```
*(Production ke liye: `npm start`)*

Server **port 5000** par start hoga:
```text
Base URL: http://localhost:5000
```

---

## 2. API Endpoints Overview

| # | Endpoint | Method | Description | Headers Required |
|---|---|---|---|---|
| 1 | `/app/generateAccessToken` | `POST` | Generate 24-hr Access Token via TOTP | `Content-Type: application/json` |
| 2 | `/v2/profile` | `GET` | Get User Profile & Account Segments | `access-token` |
| 3 | `/v2/super/orders` | `POST` | Place Multi-leg Super Order (Entry + Target + SL) | `access-token`, `Content-Type: application/json` |
| 4 | `/v2/super/orders` | `GET` | Get All Super Orders for today | `access-token` |
| 5 | `/v2/super/orders/:orderId/:orderLeg` | `DELETE` | Cancel Super Order Leg (`ENTRY_LEG`, `TARGET_LEG`, `STOP_LOSS_LEG`) | `access-token` |
| 6 | `/api/health` | `GET` | Server Health Status Check | None |

---

## 3. Endpoints Detail & Request/Response

### API 1: Generate Access Token
- **URL:** `http://localhost:5000/app/generateAccessToken`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`

#### Request Body (JSON):
```json
{
  "dhanClientId": "YOUR_DHAN_CLIENT_ID",
  "pin": "YOUR_6_DIGIT_PIN",
  "totpSecret": "YOUR_TOTP_SECRET_KEY"
}
```

#### Response (200 OK):
```json
{
  "dhanClientId": "111**999",
  "dhanClientName": "AC***YA VIR****KUMAR *****",
  "dhanClientUcc": "DMXS*****",
  "givenPowerOfAttorney": false,
  "accessToken": "eyJ0eXAiOiJKV1QiLCJhb**********9...",
  "expiryTime": "2026-10-23T16******"
}
```

---

### API 2: Get Profile
- **URL:** `http://localhost:5000/v2/profile`
- **Method:** `GET`
- **Headers:**
  - `access-token: YOUR_ACCESS_TOKEN`

#### Response (200 OK):
```json
{
  "dhanClientId": "1112****999",
  "tokenValidity": "23/10/2026 16:17",
  "activeSegment": "Equity, Derivative, Currency, Commodity"
}
```

---

### API 3: Place Super Order
- **URL:** `http://localhost:5000/v2/super/orders`
- **Method:** `POST`
- **Headers:**
  - `access-token: YOUR_ACCESS_TOKEN`
  - `Content-Type: application/json`

#### Request Body (JSON):
```json
{
  "dhanClientId": "111****999",
  "correlationId": "order_trade_001",
  "transactionType": "BUY",
  "exchangeSegment": "NSE_EQ",
  "productType": "CNC",
  "orderType": "LIMIT",
  "securityId": "11536",
  "quantity": 1,
  "price": 1500.0,
  "targetPrice": 1600.0,
  "stopLossPrice": 1400.0,
  "trailingJump": 0.0
}
```

#### Response (200 OK):
```json
{
  "orderId": "112****12345",
  "orderStatus": "TRANSIT"
}
```

---

### API 4: Get All Super Orders
- **URL:** `http://localhost:5000/v2/super/orders`
- **Method:** `GET`
- **Headers:**
  - `access-token: YOUR_ACCESS_TOKEN`

#### Response (200 OK):
Array of today's super orders with statuses of entry, target, and stop-loss legs.

---

### API 5: Cancel Super Order Leg
- **URL:** `http://localhost:5000/v2/super/orders/:orderId/:orderLeg`
  - Example: `http://localhost:5000/v2/super/orders/1123****2345/ENTRY_LEG`
  - Example: `http://localhost:5000/v2/super/orders/1123****2345/TARGET_LEG`
  - Example: `http://localhost:5000/v2/super/orders/1123****2345/STOP_LOSS_LEG`
- **Method:** `DELETE`
- **Headers:**
  - `access-token: YOUR_ACCESS_TOKEN`

#### Allowed Leg Values:
- `ENTRY_LEG`
- `TARGET_LEG`
- `STOP_LOSS_LEG`

#### Response (200 OK):
```json
{
  "orderId": "11231*****5",
  "orderStatus": "CANCELLED"
}
```

---

## 4. Postman Collection Example

### Step 1: Login karein
- POST `http://localhost:5000/app/generateAccessToken`
- Response me mila hua `accessToken` copy karein.

### Step 2: Profile Check Karein
- GET `http://localhost:5000/v2/profile`
- Headers me `access-token` paste karein aur Send karein.

### Step 3: Super Order Lagayein ya Cancel Karein
- Headers me `access-token` add karein aur order manage karein.
