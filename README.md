# RiskPilot — Connect Broker Backend

A robust, modular Node.js API bridge and middleware service for the **DhanHQ API**. It simplifies authentication by generating dynamic Time-based One-Time Passwords (TOTP), provisions 24-hour access tokens, fetches user profiles, and manages multi-leg Super Orders (Bracket Orders).

---

## Table of Contents

- [Features](#features)
- [Architecture & Project Structure](#architecture--project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Running the Server](#running-the-server)
  - [Local Development](#local-development)
  - [Production Mode](#production-mode)
  - [Docker & Docker Compose](#docker--docker-compose)
- [API Reference](#api-reference)
  - [1. Health Check](#1-health-check)
  - [2. Generate Access Token (Authentication)](#2-generate-access-token-authentication)
  - [3. Get User Profile](#3-get-user-profile)
  - [4. Place Super Order](#4-place-super-order)
  - [5. Retrieve Super Orders](#5-retrieve-super-orders)
  - [6. Cancel Super Order Leg](#6-cancel-super-order-leg)
- [Testing via cURL](#testing-via-curl)
- [Security Guidelines](#security-guidelines)
- [License](#license)

---

## Features

- **Automated Dynamic TOTP Generation**: Automatically computes valid 6-digit TOTP codes using Base32 secrets via `otpauth` without requiring manual OTP submission from mobile or frontend clients.
- **Unified Authentication Gateway**: Fetches and returns Dhan 24-hour Access Tokens along with user profile metadata.
- **Super Order Execution (Bracket Orders)**: Place, view, and selectively cancel individual legs (`ENTRY_LEG`, `TARGET_LEG`, `STOP_LOSS_LEG`).
- **Flexible Configuration**: Fallback to environment variables (`.env`) if parameters are omitted in request payloads.
- **Docker Ready**: Includes production `Dockerfile` and `compose.yml` for seamless deployment to AWS EC2 or containerized platforms.
- **CORS & JSON Middleware**: Fully ready to integrate with Flutter apps, web dashboards, or custom trading bots.

---

## Architecture & Project Structure

```text
backend-server/
├── Dockerfile                  # Container build instructions
├── compose.yml                 # Docker Compose service definition
├── package.json                # Project dependencies and npm scripts
├── server.js                   # Application entry point & route registration
├── API_GUIDE.md                # Comprehensive API documentation
├── README.md                   # Project overview and setup guidelines
└── src/
    ├── config/
    │   └── dhan.config.js      # DhanHQ base URLs (Auth & Trading APIs)
    ├── controllers/
    │   ├── auth.controller.js        # Authentication & TOTP handling
    │   ├── profile.controller.js     # User profile retrieval
    │   └── superOrder.controller.js  # Bracket/Super order lifecycle
    ├── routes/
    │   ├── auth.routes.js            # Authentication endpoints
    │   ├── profile.routes.js         # Profile endpoints
    │   └── superOrder.routes.js      # Order endpoints
    └── utils/
        └── totp.util.js              # TOTP generator utility
```

---

## Prerequisites

Before setting up the project, ensure you have the following installed on your system:

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Docker & Docker Compose** *(Optional, for containerized deployments)*
- Active **DhanHQ API** credentials (Client ID, 6-digit MPIN, and TOTP secret key)

---

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/typistack/RiskPilot.git
   cd RiskPilot/backend-server
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root of `backend-server`:
   ```bash
   cp .env.example .env
   ```
   *(Or create a new `.env` file directly).*

---

## Environment Configuration

Configure the following variables in your `.env` file:

| Variable | Type | Required | Description |
|---|---|---|---|
| `PORT` | Number | No | Port on which the server listens (Default: `3000`). |
| `DHAN_CLIENT_ID` | String | Optional | Default Dhan Client ID fallback. |
| `DHAN_PIN` | String | Optional | Default 6-digit Dhan MPIN fallback. |
| `DHAN_TOTP_SECRET` | String | Optional | Base32 TOTP secret key for automatic OTP generation. |

> **Tip**: If `DHAN_CLIENT_ID`, `DHAN_PIN`, and `DHAN_TOTP_SECRET` are defined in `.env`, client requests can hit authentication endpoints without repeatedly transmitting secrets in payloads.

---

## Running the Server

### Local Development
Run with automatic server reload on file changes:
```bash
npm run dev
```

### Production Mode
Run the standard Node.js server:
```bash
npm start
```

### Docker & Docker Compose
To run as an isolated background container:
```bash
# Build and start container in detached mode
docker compose up -d --build

# View container logs
docker compose logs -f

# Stop container
docker compose down
```

---

## API Reference

### Base URL
```text
http://localhost:3000
```

### Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Server health and uptime verification | None |
| `POST` | `/app/generateAccessToken` | Generates 24-hour Access Token via TOTP | None |
| `GET` | `/v2/profile` | Fetches user profile and active segments | `access-token` |
| `POST` | `/v2/super/orders` | Places a new Super / Bracket Order | `access-token` |
| `GET` | `/v2/super/orders` | Retrieves all Super Orders for the day | `access-token` |
| `DELETE` | `/v2/super/orders/:orderId/:orderLeg` | Cancels a specific leg of a Super Order | `access-token` |

---

### 1. Health Check
Checks if the backend server is operational.

- **URL:** `/api/health`
- **Method:** `GET`
- **Headers:** None
- **Response (200 OK):**
  ```json
  {
    "status": "ok",
    "message": "Dhan Broker Backend is running smoothly",
    "timestamp": "2026-10-26T10:45:00.000Z"
  }
  ```

---

### 2. Generate Access Token (Authentication)
Generates dynamic TOTP and exchanges it with DhanHQ API to obtain an access token.

- **URL:** `/app/generateAccessToken`  
  *(Aliases: `/api/auth/login`, `/generateAccessToken`)*
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body (JSON):**
  ```json
  {
    "dhanClientId": "YOUR_DHAN_CLIENT_ID",
    "pin": "YOUR_6_DIGIT_PIN",
    "totpSecret": "YOUR_TOTP_SECRET_BASE32"
  }
  ```
  *(Note: If `totpSecret` or credentials are set in `.env`, they can be omitted from request body).*

- **Response (200 OK):**
  ```json
  {
    "dhanClientId": "1110000001",
    "dhanClientName": "JOHN DOE",
    "dhanClientUcc": "UCC12345",
    "givenPowerOfAttorney": false,
    "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9...",
    "expiryTime": "2026-10-27T06:00:00.000"
  }
  ```

---

### 3. Get User Profile
Retrieves trader profile information, token validity, and enabled market segments.

- **URL:** `/v2/profile`
- **Method:** `GET`
- **Headers:**
  - `access-token: YOUR_ACCESS_TOKEN`
- **Response (200 OK):**
  ```json
  {
    "dhanClientId": "1110000001",
    "tokenValidity": "27/10/2026 06:00",
    "activeSegment": "Equity, Derivative, Currency, Commodity"
  }
  ```

---

### 4. Place Super Order
Places a bracket/super order containing an entry leg, target profit leg, and stop-loss leg.

- **URL:** `/v2/super/orders`
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `access-token: YOUR_ACCESS_TOKEN`
- **Request Body (JSON):**
  ```json
  {
    "dhanClientId": "YOUR_DHAN_CLIENT_ID",
    "correlationId": "order_trade_001",
    "transactionType": "BUY",
    "exchangeSegment": "NSE_EQ",
    "productType": "BO",
    "orderType": "LIMIT",
    "validity": "DAY",
    "securityId": "1333",
    "quantity": 10,
    "price": 1420.50,
    "targetPrice": 1450.00,
    "stopLossPrice": 1400.00,
    "trailingStopLoss": 0.0
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "orderId": "1123102212345",
    "orderStatus": "TRANSIT"
  }
  ```

---

### 5. Retrieve Super Orders
Fetches the status and details of all Super Orders submitted during the active trading day.

- **URL:** `/v2/super/orders`
- **Method:** `GET`
- **Headers:**
  - `access-token: YOUR_ACCESS_TOKEN`
- **Response (200 OK):**
  ```json
  [
    {
      "orderId": "1123102212345",
      "orderStatus": "CONFIRMED",
      "legName": "ENTRY_LEG",
      "transactionType": "BUY",
      "securityId": "1333",
      "quantity": 10,
      "price": 1420.50
    }
  ]
  ```

---

### 6. Cancel Super Order Leg
Cancels a specific leg of an active Super Order.

- **URL:** `/v2/super/orders/:orderId/:orderLeg`
  - **Parameters:**
    - `:orderId` — The unique Dhan order identifier.
    - `:orderLeg` — One of `ENTRY_LEG`, `TARGET_LEG`, or `STOP_LOSS_LEG`.
- **Method:** `DELETE`
- **Headers:**
  - `access-token: YOUR_ACCESS_TOKEN`
- **Response (200 OK):**
  ```json
  {
    "orderId": "1123102212345",
    "orderStatus": "CANCELLED"
  }
  ```

---

## Testing via cURL

### 1. Test Server Health
```bash
curl -X GET http://localhost:3000/api/health
```

### 2. Generate Access Token
```bash
curl -X POST http://localhost:3000/app/generateAccessToken \
  -H "Content-Type: application/json" \
  -d '{
    "dhanClientId": "YOUR_DHAN_CLIENT_ID",
    "pin": "YOUR_6_DIGIT_PIN",
    "totpSecret": "YOUR_TOTP_SECRET_BASE32"
  }'
```

### 3. Fetch Profile
```bash
curl -X GET http://localhost:3000/v2/profile \
  -H "access-token: YOUR_ACCESS_TOKEN"
```

---

## Security Guidelines

1. **Protect Credentials**: Never commit `.env` or files containing client IDs, PINs, or TOTP secrets to public version control repositories.
2. **Access Token Lifespan**: DhanHQ access tokens remain valid for up to 24 hours. Cache tokens locally on client applications and renew periodically.
3. **Network Security**: If hosting on cloud services like AWS EC2, place the backend behind a reverse proxy (e.g., NGINX) with HTTPS/SSL enabled.
4. **IP Whitelisting**: If utilizing static broker IP restrictions, bind the outbound IP in DhanHQ's developer console.

---

## License

This project is licensed under the [ISC License](LICENSE).
