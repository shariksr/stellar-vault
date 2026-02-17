# Frontend Technical Specification — FTP-Server (Vault)

> **Version:** 1.0  
> **Date:** 2026-02-17  
> **Stack:** React 18 · TypeScript · Vite · Tailwind CSS · Zustand · Axios · Framer Motion  

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)  
2. [Authentication Flow](#2-authentication-flow)  
3. [API Endpoints Reference](#3-api-endpoints-reference)  
4. [State Management](#4-state-management)  
5. [Token Refresh & Interceptors](#5-token-refresh--interceptors)  
6. [File Operations](#6-file-operations)  
7. [Subscription & Payments](#7-subscription--payments)  
8. [Route Structure](#8-route-structure)  
9. [Environment Variables](#9-environment-variables)  
10. [Backend Contract Checklist](#10-backend-contract-checklist)  

---

## 1. Architecture Overview

```
Frontend (React SPA)
  ├── Auth pages (public)       → /login, /signup, /forgot-password, /reset-password, /verify-email
  ├── Dashboard (protected)     → /dashboard/*
  │     ├── Files (index)       → File listing, download
  │     ├── Upload              → Drag & drop file upload
  │     ├── Subscription        → Stripe checkout trigger
  │     ├── API Key             → View/copy subscription API key
  │     └── Settings            → Profile info, change password
  └── Landing page              → /
```

- **HTTP Client:** Axios instance with base URL from env, auto-attaches Bearer token, auto-refreshes on 401.
- **State:** Zustand store (`auth-store`) with `persist` middleware (localStorage key: `vault-auth`).
- **Notifications:** `sonner` toast library.

---

## 2. Authentication Flow

### 2.1 Signup

**Request:**
```
POST /v1/auth/signup
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Expected Response (200):**
```json
{
  "message": "Signup successful. Please verify your email."
}
```

**Frontend behavior:** Shows success toast, redirects to `/login`.

---

### 2.2 Login

**Request:**
```
POST /v1/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

**Expected Response (200):**
```json
{
  "token": "string (JWT access token)",
  "refreshToken": "string",
  "userID": "string"
}
```

**Frontend behavior:**  
1. Stores `token` and `refreshToken` in Zustand (persisted to localStorage).  
2. Calls `GET /v1/auth/me` to fetch user profile and subscription.  
3. Redirects to `/dashboard`.

---

### 2.3 Get Profile

**Request:**
```
GET /v1/auth/me
Authorization: Bearer <accessToken>
```

**Expected Response (200):**
```json
{
  "user": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "isVerified": true,
    "createdAt": "ISO 8601 string",
    "updatedAt": "ISO 8601 string"
  },
  "subscription": {
    "key": "string (API key for file operations)",
    "plan": "free" | "premium",
    "status": "active" | "inactive" | "canceled"
  }
}
```

> **CRITICAL:** The `subscription.key` field is used as the `x-api-key` header for all file upload/download operations.

---

### 2.4 Token Refresh

**Request:**
```
POST /v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "string"
}
```

**Expected Response (200):**
```json
{
  "accessToken": "string (new JWT)",
  "refreshToken": "string (new refresh token)"
}
```

**Frontend behavior:**  
- Triggered automatically by Axios interceptor when any request gets a `401` response.  
- On success: retries the original failed request with the new token.  
- On failure: calls `logout()` and clears all auth state.

---

### 2.5 Logout

**Request:**
```
POST /v1/auth/logout
Content-Type: application/json
Authorization: Bearer <accessToken>

{
  "refreshToken": "string"
}
```

**Expected Response:** Any (frontend proceeds regardless).

**Frontend behavior:** Clears Zustand state (`token`, `refreshToken`, `user`, `subscription`), redirects to `/`.

---

### 2.6 Email Verification

**Request:**
```
GET /v1/auth/verify-email?token=<emailVerificationToken>
```

**Expected Response (200):**
```json
{
  "message": "Email verified successfully"
}
```

**Backend requirement:** Email verification links must point to:  
```
https://<FRONTEND_URL>/verify-email?token=<token>
```
The frontend reads the `token` query param and calls the API endpoint.

---

### 2.7 Forgot Password

**Request:**
```
POST /v1/auth/forgot-password
Content-Type: application/json

{
  "email": "string"
}
```

**Expected Response (200):**
```json
{
  "message": "Reset email sent"
}
```

**Backend requirement:** Password reset links must point to:  
```
https://<FRONTEND_URL>/reset-password?token=<resetToken>
```

---

### 2.8 Reset Password

**Request:**
```
POST /v1/auth/reset-password
Content-Type: application/json

{
  "token": "string (from URL query param)",
  "newPassword": "string"
}
```

**Expected Response (200):**
```json
{
  "message": "Password reset successful"
}
```

---

### 2.9 Change Password (Dashboard)

**Request:**
```
POST /v1/auth/change-password
Content-Type: application/json
Authorization: Bearer <accessToken>

{
  "oldPassword": "string",
  "newPassword": "string"
}
```

**Expected Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Response (400/401):**
```json
{
  "message": "Old password is incorrect"
}
```

**Frontend behavior:** Validates `newPassword.length >= 6` and confirms match before sending.

---

## 3. API Endpoints Reference

| Method | Endpoint                          | Auth Header         | Body / Notes                                     |
|--------|-----------------------------------|---------------------|--------------------------------------------------|
| POST   | `/v1/auth/signup`                 | None                | `{ name, email, password }`                      |
| POST   | `/v1/auth/login`                  | None                | `{ email, password }` → returns tokens           |
| GET    | `/v1/auth/me`                     | `Bearer <token>`    | Returns `{ user, subscription }`                 |
| POST   | `/v1/auth/refresh`                | None                | `{ refreshToken }` → returns new token pair      |
| POST   | `/v1/auth/logout`                 | `Bearer <token>`    | `{ refreshToken }`                               |
| GET    | `/v1/auth/verify-email?token=`    | None                | Token from query string                          |
| POST   | `/v1/auth/forgot-password`        | None                | `{ email }`                                      |
| POST   | `/v1/auth/reset-password`         | None                | `{ token, newPassword }`                         |
| POST   | `/v1/auth/change-password`        | `Bearer <token>`    | `{ oldPassword, newPassword }`                   |
| GET    | `/v1/files/list`                  | `Bearer <token>`    | Returns array of `FileItem`                      |
| POST   | `/v1/files/uploads`               | `x-api-key: <key>`  | `FormData` with field `file`                     |
| GET    | `/v1/files/downloads/:fileId`     | `x-api-key: <key>`  | Returns binary blob                              |
| POST   | `/v1/payments/create-session`     | `Bearer <token>`    | Returns `{ url }` (Stripe checkout URL)          |

---

## 4. State Management

**Zustand Store: `useAuthStore`**

```typescript
interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  subscription: Subscription | null;
  isAuthenticated: boolean;

  setTokens: (token: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setSubscription: (subscription: Subscription) => void;
  fetchProfile: () => Promise<void>;    // GET /v1/auth/me
  logout: () => void;                   // POST /v1/auth/logout + clear state
}
```

**Persistence:** localStorage key `vault-auth`, stores entire state.

---

## 5. Token Refresh & Interceptors

The Axios instance (`src/lib/axios.ts`) has two interceptors:

### Request Interceptor
- Reads `token` from Zustand store.
- Attaches `Authorization: Bearer <token>` to every request.

### Response Interceptor (401 handling)
1. On `401` response, checks if request hasn't already been retried (`_retry` flag).
2. Reads `refreshToken` from store.
3. Calls `POST /v1/auth/refresh` with the refresh token.
4. On success: updates tokens in store, retries original request.
5. On failure: calls `logout()`.

---

## 6. File Operations

### 6.1 List Files

```
GET /v1/files/list
Authorization: Bearer <accessToken>
```

**Expected Response:**
```json
[
  {
    "_id": "string",
    "userID": "string",
    "fileId": "string",
    "filename": "string",
    "folder": "string",
    "type": "string (MIME type, e.g. image/png)",
    "createdAt": "ISO 8601",
    "updatedAt": "ISO 8601"
  }
]
```

Frontend supports filtering by type: `all`, `images`, `videos`, `documents`, `others`.

### 6.2 Upload File

```
POST /v1/files/uploads
x-api-key: <subscription.key>
Content-Type: multipart/form-data

FormData:
  file: <binary>
```

> **NOTE:** Upload does NOT use Bearer token. It uses the `x-api-key` header with the subscription key from `/v1/auth/me`.

### 6.3 Download File

```
GET /v1/files/downloads/:fileId
x-api-key: <subscription.key>
```

**Response:** Binary blob. Frontend creates an object URL and triggers a browser download.

> **NOTE:** Same as upload — uses `x-api-key`, not Bearer token.

---

## 7. Subscription & Payments

### Premium Gating Logic

```typescript
const isPremium = subscription?.plan === 'premium' && subscription?.status === 'active';
```

**Gated features:**
- File upload
- File download
- API key display

### Stripe Checkout Flow

1. Frontend calls `POST /v1/payments/create-session` with Bearer token.
2. Backend returns `{ url: "https://checkout.stripe.com/..." }`.
3. Frontend redirects to Stripe.
4. After payment, Stripe redirects back to:
   - **Success:** `/dashboard?success=true` → frontend re-fetches profile, shows success dialog.
   - **Canceled:** `/dashboard?canceled=true` → frontend shows info dialog.

---

## 8. Route Structure

| Route                    | Component          | Auth Required | Notes                        |
|--------------------------|--------------------|---------------|------------------------------|
| `/`                      | Index (Landing)    | No            |                              |
| `/login`                 | Login              | No            |                              |
| `/signup`                | Signup             | No            |                              |
| `/forgot-password`       | ForgotPassword     | No            |                              |
| `/reset-password`        | ResetPassword      | No            | Reads `?token=` from URL     |
| `/verify-email`          | VerifyEmail        | No            | Reads `?token=` from URL     |
| `/dashboard`             | DashboardLayout    | **Yes**       | Protected by `ProtectedRoute`|
| `/dashboard` (index)     | FilesPage          | **Yes**       | File listing                 |
| `/dashboard/upload`      | UploadPage         | **Yes**       | Premium only                 |
| `/dashboard/subscription`| SubscriptionPage   | **Yes**       |                              |
| `/dashboard/api-key`     | ApiKeyPage         | **Yes**       | Premium only                 |
| `/dashboard/settings`    | SettingsPage       | **Yes**       | Profile + change password    |
| `*`                      | NotFound (404)     | No            |                              |

---

## 9. Environment Variables

| Variable        | Purpose                    | Default                  |
|-----------------|----------------------------|--------------------------|
| `VITE_API_URL`  | Backend API base URL       | `http://localhost:8080`  |

Set via `.env` file at project root:
```
VITE_API_URL=https://your-backend.com
```

---

## 10. Backend Contract Checklist

Before going live, ensure your backend satisfies:

- [ ] **CORS:** Allow the frontend origin (`Access-Control-Allow-Origin`).
- [ ] **Login response** returns `{ token, refreshToken, userID }`.
- [ ] **Refresh response** returns `{ accessToken, refreshToken }`.
- [ ] **GET /v1/auth/me** returns `{ user: {...}, subscription: { key, plan, status } }`.
- [ ] **Subscription key** is included in the `subscription` object — it's used as `x-api-key` for file ops.
- [ ] **Email links** point to frontend routes (`/verify-email?token=...`, `/reset-password?token=...`).
- [ ] **File upload** accepts `multipart/form-data` with field name `file` and validates `x-api-key`.
- [ ] **File download** returns binary data and validates `x-api-key`.
- [ ] **Change password** reads `{ oldPassword, newPassword }` from JSON body with Bearer auth.
- [ ] **Stripe redirect URLs** point to `/dashboard?success=true` and `/dashboard?canceled=true`.
- [ ] **Error responses** follow `{ message: "string" }` format for toast display.

---

## TypeScript Interfaces

```typescript
interface User {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Subscription {
  key: string;
  plan: 'free' | 'premium';
  status: 'active' | 'inactive' | 'canceled';
}

interface FileItem {
  _id: string;
  userID: string;
  fileId: string;
  filename: string;
  folder: string;
  type: string;
  createdAt: string;
  updatedAt?: string;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  userID: string;
}
```

---

*End of specification.*
