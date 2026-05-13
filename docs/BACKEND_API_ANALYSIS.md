# Backend API Analysis - Multi-Track Conference System

## Overview
This document comprehensively documents all backend APIs for the multi-track conference management system. Each API is mapped to its frontend usage.

---

## Authentication APIs (`/api/auth`)

### 1. Register User
- **Endpoint:** `POST /api/auth/register`
- **Auth:** Public
- **Body:**
  ```json
  {
    "name": "string",
    "email": "string (unique per role)",
    "password": "string (min 6 chars)",
    "role": "organizer|author|reviewer|participant",
    "expertiseDomains": ["optional", "array"]
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "_id": "string",
        "name": "string",
        "email": "string",
        "role": "string",
        "expertiseDomains": []
      },
      "token": "JWT_token"
    }
  }
  ```
- **Errors:**
  - 400: Email already registered
  - 400: Validation errors

### 2. Login User
- **Endpoint:** `POST /api/auth/login`
- **Auth:** Public
- **Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "token": "JWT_token",
    "user": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```
- **Errors:** 400/401 Invalid credentials

---

## Track APIs (`/api/tracks`)
**Auth:** Organizer only

### 1. Create Track
- **Endpoint:** `POST /api/tracks`
- **Body:**
  ```json
  {
    "conferenceId": "string (ObjectId)",
    "name": "string",
    "description": "optional string",
    "submissionDeadline": "optional ISO8601"
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "message": "Track created",
    "data": {
      "_id": "string",
      "conferenceId": "string",
      "name": "string",
      "description": "string",
      "submissionDeadline": "ISO8601",
      "status": "active"
    }
  }
  ```

### 2. Update Track
- **Endpoint:** `PUT /api/tracks/:id`
- **Body (all optional):**
  ```json
  {
    "name": "string",
    "description": "string",
    "submissionDeadline": "ISO8601",
    "status": "active|closed"
  }
  ```
- **Response (200):** Updated track object

### 3. Delete Track
- **Endpoint:** `DELETE /api/tracks/:id`
- **Response (200):** `{ "success": true, "message": "Track deleted" }`

### 4. List Tracks for Conference
- **Endpoint:** `GET /api/tracks/conference/:conferenceId`
- **Query Params:** None
- **Response (200):**
  ```json
  {
    "success": true,
    "data": [
      { "_id": "...", "name": "...", ... }
    ]
  }
  ```

---

## Author APIs (`/api/author`)
**Auth:** Author only

### 1. Dashboard
- **Endpoint:** `GET /api/author/dashboard`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "submissions": [{ submission objects with conference populated }],
      "activeConferences": [{ conference objects }]
    }
  }
  ```

### 2. Discover Conferences
- **Endpoint:** `GET /api/author/conferences`
- **Query Params:**
  - `location`: string (filter by venue)
  - `domain`: string (filter by domain)
  - `minFee`: number
  - `maxFee`: number
  - `sortBy`: "newest|deadline|startDate"
- **Response:**
  ```json
  {
    "success": true,
    "data": { "conferences": [...] }
  }
  ```

### 3. Get Conference Details
- **Endpoint:** `GET /api/author/conferences/:id`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "conference": { conference object },
      "hasSubmitted": boolean,
      "submission": { submission object or null }
    }
  }
  ```
- **Note:** Does NOT return tracks. Use `/api/tracks/conference/:id` for tracks.

### 4. Submit Paper
- **Endpoint:** `POST /api/author/conferences/:conferenceId/submissions`
- **Body:**
  ```json
  {
    "title": "string",
    "abstract": "string",
    "trackId": "string (ObjectId, REQUIRED)",
    "fileUrl": "string"
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "message": "Submission created",
    "data": {
      "_id": "string",
      "title": "string",
      "abstract": "string",
      "conferenceId": "string",
      "trackId": "string",
      "authorId": "string",
      "status": "submitted",
      "fileUrl": "string"
    }
  }
  ```
- **Errors:**
  - 400: Missing trackId
  - 400: Invalid trackId for conference
  - 400: Submission deadline passed

### 5. List Author Submissions
- **Endpoint:** `GET /api/author/submissions`
- **Query Params:**
  - `trackId`: filter by track (optional)
  - `page`: number
  - `limit`: number
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "...",
        "title": "...",
        "conferenceId": "...",
        "trackId": "...",
        "status": "submitted|under_review|accepted|rejected"
      }
    ]
  }
  ```

### 6. Get Submission Details
- **Endpoint:** `GET /api/author/submissions/:id`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "_id": "string",
      "title": "string",
      "abstract": "string",
      "conferenceId": { populated conference },
      "trackId": { populated track },
      "status": "string",
      "decision": { decidedBy, decidedAt, feedback }
    }
  }
  ```

---

## Reviewer APIs (`/api/reviewer`)
**Auth:** Reviewer only

### 1. Place Bid
- **Endpoint:** `POST /api/reviewer/bids`
- **Body:**
  ```json
  {
    "submissionId": "string (ObjectId)",
    "confidence": "optional number"
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "message": "Bid placed",
    "data": {
      "_id": "string",
      "submissionId": "string",
      "reviewerId": "string",
      "trackId": "string",
      "confidence": "number"
    }
  }
  ```

### 2. List Reviewer Bids
- **Endpoint:** `GET /api/reviewer/bids`
- **Query Params:**
  - `trackId`: filter by track (optional)
  - `submissionId`: filter by submission (optional)
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "...",
        "submissionId": { populated with title, conferenceId, trackId },
        "trackId": { populated with name },
        "confidence": "..."
      }
    ]
  }
  ```

### 3. Create Review
- **Endpoint:** `POST /api/reviewer/submissions/:submissionId/reviews`
- **Body:**
  ```json
  {
    "score": "number (required)",
    "comments": "optional string",
    "recommendation": "optional string (accept|reject|weak_accept|weak_reject|borderline)"
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "message": "Review submitted",
    "data": {
      "_id": "string",
      "submissionId": "string",
      "reviewerId": "string",
      "trackId": "string",
      "score": "number",
      "comments": "string",
      "recommendation": "string"
    }
  }
  ```
- **Errors:**
  - 403: Reviewer not assigned to submission (if assignedReviewers is non-empty)
  - 400: Invalid recommendation value

### 4. Get Submission for Review
- **Endpoint:** `GET /api/reviewer/submissions/:submissionId`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "_id": "string",
      "title": "string",
      "abstract": "string",
      "conferenceId": { populated },
      "trackId": { populated with name, description },
      "authorId": { populated with name, email },
      "fileUrl": "string",
      "status": "string"
    }
  }
  ```

### 5. List Reviewer Reviews
- **Endpoint:** `GET /api/reviewer/reviews`
- **Query Params:**
  - `trackId`: filter by track (optional)
  - `submissionId`: filter by submission (optional)
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "...",
        "submissionId": { populated },
        "trackId": { populated },
        "score": "...",
        "recommendation": "..."
      }
    ]
  }
  ```

### 6. List Submission Reviews
- **Endpoint:** `GET /api/reviewer/submissions/:submissionId/reviews`
- **Query Params:**
  - `trackId`: validate against submission track (optional)
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "...",
        "reviewerId": { populated with name, email },
        "trackId": { populated },
        "score": "...",
        "recommendation": "..."
      }
    ]
  }
  ```

---

## Organizer APIs (`/api/organizer`)
**Auth:** Organizer only

### 1. List Organizer Conferences
- **Endpoint:** `GET /api/organizer/conferences`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "conferences": [
        {
          "_id": "string",
          "name": "string",
          "description": "string",
          "startDate": "ISO8601",
          "endDate": "ISO8601",
          "tracks": [
            {
              "_id": "string",
              "name": "string",
              "stats": {
                "total": number,
                "accepted": number,
                "rejected": number,
                "pending": number
              }
            }
          ],
          "stats": {
            "total": number,
            "accepted": number,
            "rejected": number,
            "pending": number
          }
        }
      ]
    }
  }
  ```
- **Note:** Uses aggregation pipeline; tracks and per-track stats included.

### 2. Get Conference Details
- **Endpoint:** `GET /api/organizer/conferences/:id`
- **Response:** Single conference with tracks and per-track submissions (aggregation)
  ```json
  {
    "success": true,
    "data": {
      "_id": "string",
      "name": "string",
      "tracks": [
        {
          "_id": "string",
          "name": "string",
          "submissions": [{ submission objects }],
          "stats": { "total": number, "accepted": number, "rejected": number }
        }
      ],
      "stats": { aggregated stats }
    }
  }
  ```

### 3. Create Conference
- **Endpoint:** `POST /api/organizer/conferences`
- **Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "venue": "string",
    "startDate": "ISO8601",
    "endDate": "ISO8601",
    "submissionDeadline": "ISO8601",
    "domains": ["optional", "array"],
    "fee": "optional number",
    "tracks": [
      {
        "name": "string",
        "description": "optional",
        "submissionDeadline": "optional ISO8601"
      }
    ]
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "message": "Conference created successfully",
    "data": {
      "conference": { conference object },
      "tracks": [{ created track objects }]
    }
  }
  ```

### 4. Update Conference
- **Endpoint:** `PUT /api/organizer/conferences/:id`
- **Body (all optional):**
  ```json
  {
    "name": "string",
    "description": "string",
    "venue": "string",
    "startDate": "ISO8601",
    "endDate": "ISO8601",
    "submissionDeadline": "ISO8601",
    "domains": "array",
    "fee": "number",
    "status": "active|expired",
    "tracks": [
      {
        "_id": "optional (if present, track is updated)",
        "name": "string",
        "description": "string",
        "submissionDeadline": "ISO8601"
      }
    ]
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Conference updated",
    "data": {
      "conference": { updated conference },
      "newTracks": [{ newly created tracks }]
    }
  }
  ```

### 5. List Conference Submissions
- **Endpoint:** `GET /api/organizer/conferences/:id/submissions`
- **Query Params:**
  - `trackId`: filter by track (optional)
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "string",
        "title": "string",
        "status": "string",
        "trackId": { populated },
        "authorId": { populated name, email },
        "reviewStats": { "count": number, "avgScore": number }
      }
    ]
  }
  ```

### 6. Approve Submission
- **Endpoint:** `PUT /api/organizer/submissions/:id/approve`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Submission approved",
    "data": { updated submission with organizerApproved: true }
  }
  ```

### 7. Make Submission Decision
- **Endpoint:** `PATCH /api/organizer/submissions/:submissionId/decision`
- **Body:**
  ```json
  {
    "decision": "accepted|rejected",
    "feedback": "optional string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Decision recorded",
    "data": {
      "status": "accepted|rejected",
      "decision": {
        "decidedBy": "user id",
        "decidedAt": "ISO8601",
        "feedback": "string"
      }
    }
  }
  ```

### 8. Update Submission Status
- **Endpoint:** `PUT /api/organizer/submissions/:id/status`
- **Body:**
  ```json
  {
    "status": "accepted|rejected",
    "feedback": "optional string"
  }
  ```
- **Response:** Updated submission

### 9. Schedule Submission
- **Endpoint:** `PUT /api/organizer/submissions/:id/schedule`
- **Body:**
  ```json
  {
    "date": "ISO8601",
    "startTime": "HH:MM",
    "endTime": "HH:MM",
    "venue": "string"
  }
  ```
- **Response:** Updated submission with scheduled slot

### 10. Generate Certificates
- **Endpoint:** `POST /api/organizer/conferences/:id/certificates`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Certificates generated",
    "data": {
      "createdCount": number,
      "created": [
        {
          "_id": "string",
          "userId": "string",
          "conferenceId": "string",
          "type": "presentation|participation",
          "meta": { submissionId: string, trackId: string }
        }
      ]
    }
  }
  ```

### 11. Mark Attendance
- **Endpoint:** `PUT /api/organizer/registrations/:id/attendance`
- **Body:**
  ```json
  {
    "attended": boolean
  }
  ```
- **Response:** Updated registration

### 12. List Conference Participants
- **Endpoint:** `GET /api/organizer/conferences/:id/participants`
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "string",
        "userId": { populated name, email },
        "conferenceId": "string",
        "attended": boolean,
        "createdAt": "ISO8601"
      }
    ]
  }
  ```

### 13. List Reviews
- **Endpoint:** `GET /api/organizer/reviews`
- **Query Params:**
  - `conferenceId`: filter by conference (optional)
  - `trackId`: filter by track (optional)
  - `submissionId`: filter by submission (optional)
  - `reviewerId`: filter by reviewer (optional)
  - `page`: number
  - `limit`: number
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "...",
        "submissionId": { populated },
        "reviewerId": { populated },
        "trackId": { populated },
        "score": "...",
        "recommendation": "..."
      }
    ]
  }
  ```

### 14. List Conference Reviews
- **Endpoint:** `GET /api/organizer/conferences/:id/reviews`
- **Query Params:**
  - `trackId`: filter by track (optional)
  - `submissionId`: filter by submission (optional)
  - `reviewerId`: filter by reviewer (optional)
  - `page`: number
  - `limit`: number
- **Response:** Filtered reviews for conference

### 15. List Submission Reviews
- **Endpoint:** `GET /api/organizer/submissions/:submissionId/reviews`
- **Query Params:**
  - `trackId`: validate (optional)
- **Response:** Reviews for single submission

---

## Participant APIs (`/api/participant`)
**Auth:** Participant only

### 1. Dashboard
- **Endpoint:** `GET /api/participant/dashboard`
- **Response:** Participant dashboard data

### 2. Browse Conferences
- **Endpoint:** `GET /api/participant/conferences`
- **Query Params:** Filters (location, domain, etc.)
- **Response:** Available conferences

### 3. Get Conference Details
- **Endpoint:** `GET /api/participant/conferences/:id`
- **Response:** Conference details

### 4. Register for Conference
- **Endpoint:** `POST /api/participant/registrations`
- **Body:**
  ```json
  {
    "conferenceId": "string"
  }
  ```
- **Response (201):** Registration object

### 5. List My Registrations
- **Endpoint:** `GET /api/participant/registrations`
- **Response:** Array of registration objects

### 6. Get My Certificates
- **Endpoint:** `GET /api/participant/certificates`
- **Response:** Array of certificate objects

---

## Key Integration Notes

### Frontend Must Track:
1. **Authorization Header:** Always include `Authorization: Bearer <token>` for authenticated routes
2. **Track-Scoped Operations:** When submitting papers, creating reviews, listing submissions - include `trackId`
3. **Conference Context:** Many operations start from conference selection
4. **Ownership/Auth:** Backend validates all operations; frontend should respect returned 403/401

### Common Error Responses:
- **400:** Validation error or invalid input
- **401:** Missing or invalid token
- **403:** Unauthorized for this operation
- **404:** Resource not found
- **500:** Server error

### Response Structure:
All successful responses follow:
```json
{
  "success": true,
  "message": "optional message",
  "data": { "actual data object or array" }
}
```

Error responses:
```json
{
  "success": false,
  "message": "error message",
  "errors": "array of validation errors (if applicable)"
}
```
