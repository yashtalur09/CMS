# ORCID Authentication Flow Diagram

## Visual Flow of ORCID Login

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     ORCID AUTHENTICATION FLOW                           │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────┐                ┌──────────┐                ┌──────────┐
│          │                │          │                │          │
│   USER   │                │ FRONTEND │                │ BACKEND  │
│          │                │          │                │          │
└────┬─────┘                └────┬─────┘                └────┬─────┘
     │                           │                           │
     │                           │                           │
     │  1. Navigate to Login     │                           │
     ├──────────────────────────>│                           │
     │                           │                           │
     │  2. See "Login with       │                           │
     │     ORCID" button         │                           │
     │<──────────────────────────┤                           │
     │                           │                           │
     │  3. Click ORCID button    │                           │
     ├──────────────────────────>│                           │
     │                           │                           │
     │                           │  4. Build OAuth URL       │
     │                           │     with Client ID        │
     │                           │                           │
     │  5. Redirect to ORCID     │                           │
     │<──────────────────────────┤                           │
     │                           │                           │

┌────▼─────┐
│          │
│  ORCID   │ ◄─────── User sees ORCID authorization page
│  SERVER  │
│          │
└────┬─────┘
     │
     │  6. User enters ORCID credentials
     │     and clicks "Authorize"
     │
     │  7. ORCID redirects back with code
     ├──────────────────────────────────────────────────────────────┐
     │                                                               │
     │  URL: http://localhost:3000/auth/orcid/callback?code=ABC123  │
     │                                                               │
     └───────────────────────────────────────────────────────────────┘

     │                           │                           │
     │  8. Land on callback page │                           │
     ├──────────────────────────>│                           │
     │                           │                           │
     │  9. Show loading spinner  │                           │
     │<──────────────────────────┤                           │
     │                           │                           │
     │                           │  10. Send code to backend │
     │                           ├──────────────────────────>│
     │                           │                           │
     │                           │      POST /api/auth/      │
     │                           │      orcid/callback       │
     │                           │      { code: "ABC123" }   │
     │                           │                           │
     │                           │                           ├────┐
     │                           │                           │    │ 11. Exchange
     │                           │                           │    │     code for
     │                           │                           │    │     token
     │                           │                           │    │
     │                           │                           │    │ POST to ORCID
     │                           │                           │    │ /oauth/token
     │                           │                           │<───┘
     │                           │                           │
     │                           │                           │
┌────┴─────┐                    │                           │
│          │                    │                           │
│  ORCID   │                    │                           │
│  SERVER  │<───────────────────┼───────────────────────────┤
│          │                    │                           │
└────┬─────┘    12. Token Request│                           │
     │                           │                           │
     │  13. Response:            │                           │
     │      {                    │                           │
     │        orcid: "0000-...", │                           │
     │        access_token: "...",                           │
     │        name: "Alice"      │                           │
     │      }                    │                           │
     │                           │                           │
     └───────────────────────────┼──────────────────────────>│
                                 │                           │
                                 │                           ├────┐
                                 │                           │    │ 14. Fetch
                                 │                           │    │     profile
                                 │                           │    │     data
                                 │                           │    │
                                 │                           │    │ GET /v3.0/
                                 │                           │    │ {orcid}/person
                                 │                           │<───┘
                                 │                           │
┌──────────┐                    │                           │
│          │                    │                           │
│  ORCID   │                    │                           │
│  SERVER  │<───────────────────┼───────────────────────────┤
│          │                    │                           │
└────┬─────┘    15. Profile Request                        │
     │                           │                           │
     │  16. Response:            │                           │
     │      {                    │                           │
     │        name: {...},       │                           │
     │        affiliation: {...} │                           │
     │      }                    │                           │
     │                           │                           │
     └───────────────────────────┼──────────────────────────>│
                                 │                           │
                                 │                           ├────┐
                                 │                           │    │ 17. Create/
                                 │                           │    │     update
                                 │                           │    │     user in
                                 │                           │    │     MongoDB
                                 │                           │<───┘
                                 │                           │
┌──────────┐                    │                           │
│          │                    │                           │
│ MongoDB  │<───────────────────┼───────────────────────────┤
│          │                    │                           │
└────┬─────┘    18. Save User   │                           │
     │                           │                           │
     │  19. User Saved           │                           │
     │                           │                           │
     └───────────────────────────┼──────────────────────────>│
                                 │                           │
                                 │                           ├────┐
                                 │                           │    │ 20. Generate
                                 │                           │    │     JWT token
                                 │                           │<───┘
                                 │                           │
                                 │  21. Return user + token  │
                                 │<──────────────────────────┤
                                 │                           │
                                 │  {                        │
                                 │    success: true,         │
                                 │    data: {                │
                                 │      user: {...},         │
                                 │      token: "jwt..."      │
                                 │    }                      │
                                 │  }                        │
                                 │                           │
     │                           ├────┐                      │
     │                           │    │ 22. Store token      │
     │                           │    │     in localStorage  │
     │                           │<───┘                      │
     │                           │                           │
     │  23. Redirect to          │                           │
     │      dashboard            │                           │
     │<──────────────────────────┤                           │
     │                           │                           │
     │                           │                           │
     │  24. User logged in! 🎉   │                           │
     │                           │                           │
     ▼                           ▼                           ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                           USER DASHBOARD                                │
│                                                                         │
│   Welcome, Dr. Alice Smith! (ORCID: 0000-0002-1825-0097)               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Key Components

### 1. **User (Browser)**
- Initiates login
- Authorizes on ORCID
- Receives final authentication

### 2. **Frontend (React)**
- OrcidButton component
- OrcidCallback page
- Manages redirect flow
- Stores JWT token

### 3. **Backend (Node.js/Express)**
- Auth routes
- Token exchange with ORCID
- User management
- JWT generation

### 4. **ORCID Server**
- OAuth authorization
- Token endpoint
- Profile API

### 5. **MongoDB**
- Stores user data
- Stores ORCID iD
- Links user accounts

---

## Data Flow

### Request: Frontend → Backend
```json
POST /api/auth/orcid/callback
{
  "code": "ABC123",
  "role": "author"
}
```

### Request: Backend → ORCID
```http
POST https://orcid.org/oauth/token
client_id=APP-XXXXX
client_secret=secret
grant_type=authorization_code
code=ABC123
redirect_uri=http://localhost:3000/auth/orcid/callback
```

### Response: ORCID → Backend
```json
{
  "orcid": "0000-0002-1825-0097",
  "access_token": "abc-123-def-456",
  "name": "Alice Smith",
  "expires_in": 631138518
}
```

### Request: Backend → ORCID (Profile)
```http
GET https://pub.orcid.org/v3.0/0000-0002-1825-0097/person
Authorization: Bearer abc-123-def-456
```

### Response: ORCID → Backend
```json
{
  "name": {
    "given-names": { "value": "Alice" },
    "family-name": { "value": "Smith" }
  },
  "employments": {
    "affiliation-group": [{
      "summaries": [{
        "employment-summary": {
          "organization": { "name": "MIT" }
        }
      }]
    }]
  }
}
```

### Database Record
```javascript
{
  _id: ObjectId("..."),
  name: "Alice Smith",
  email: "0000000218250097@orcid.user",
  orcid: "0000-0002-1825-0097",
  orcidAccessToken: "abc-123-def-456", // Hidden from API
  affiliation: "MIT",
  role: "author",
  expertiseDomains: [],
  createdAt: ISODate("2025-12-19..."),
  updatedAt: ISODate("2025-12-19...")
}
```

### Response: Backend → Frontend
```json
{
  "success": true,
  "message": "ORCID authentication successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "Alice Smith",
      "email": "0000000218250097@orcid.user",
      "orcid": "0000-0002-1825-0097",
      "affiliation": "MIT",
      "role": "author",
      "expertiseDomains": []
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "isNewUser": true
  }
}
```

---

## Security Features

### ✅ Secure Elements

1. **Client Secret** - Never leaves backend
2. **Access Token** - Stored but not exposed in API responses
3. **JWT Token** - Standard session management
4. **Password Not Required** - ORCID users skip password validation
5. **Unique ORCID** - Database constraint prevents duplicates

### ⚠️ Important URLs

- **Development:** `http://localhost:3000`
- **Production:** Must use HTTPS
- **Redirect URI:** Must match exactly in all places

---

## Timeline Estimate

| Step | Time | Description |
|------|------|-------------|
| 1-5 | < 1 sec | Button click → ORCID redirect |
| 6 | Variable | User authorizes (depends on user) |
| 7-10 | < 1 sec | Callback → Send code |
| 11-13 | 1-2 sec | Token exchange |
| 14-16 | 1-2 sec | Profile fetch |
| 17-20 | < 1 sec | Database + JWT |
| 21-24 | < 1 sec | Return + Redirect |
| **Total** | **~3-5 sec** | Full flow (excluding user auth time) |

---

## Error Handling Points

| Point | Error Type | Handler |
|-------|-----------|---------|
| Step 3 | User closes window | No action (session expires) |
| Step 6 | User denies | OrcidCallback shows error |
| Step 11 | Invalid credentials | Backend returns 500 error |
| Step 11 | Network error | Backend returns 500 error |
| Step 14 | Profile private | Continue with basic data |
| Step 17 | Duplicate ORCID | Update existing user |

---

**For more details, see:**
- [ORCID_SETUP.md](ORCID_SETUP.md) - Setup instructions
- [ORCID_INTEGRATION.md](ORCID_INTEGRATION.md) - Technical details
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Overview
