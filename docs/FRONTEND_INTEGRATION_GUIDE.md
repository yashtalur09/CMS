# Frontend-to-Backend Integration Guide

This document maps each frontend page to the backend APIs it must call, in the correct order with proper error handling.

---

## 1. Authentication Flow

### Login Page (`frontend/pages/Login.js`)

**Sequence:**
1. User enters email + password
2. POST `/api/auth/login` with `{ email, password }`
3. Backend returns `{ success: true, token, user }`
4. **Frontend must:**
   - Store `token` in localStorage
   - Store `user` object in localStorage
   - Call `setAuthToken(token)` to set axios Authorization header
   - Redirect to role-based dashboard (organizer → org dashboard, author → author dashboard, etc.)

**Error Handling:**
- 400/401: Invalid credentials → Show "Invalid email or password"
- 500: Server error → Show "Login failed, please try again"

---

### Register Page (`frontend/pages/Register.js`)

**Sequence:**
1. User fills: name, email, password, role, expertiseDomains (if reviewer)
2. POST `/api/auth/register` with `{ name, email, password, role, expertiseDomains }`
3. Backend returns `{ success: true, message, data: { user, token } }`
4. **Frontend must:** Same as login (store token/user, set axios header, redirect)

**Error Handling:**
- 400 with `errors: []`: Validation failed → Show first error message
- 400 "Email already registered": Show "Email already in use for this role"
- 500: Server error → Show "Registration failed"

---

## 2. Author User Flow

### Author Dashboard (`frontend/pages/Author/Dashboard.js`)

**Sequence:**
1. On mount, call `GET /api/author/dashboard`
2. Backend returns `{ success: true, data: { submissions: [...], activeConferences: [...] } }`
3. Display:
   - "Recent Submissions" section with status badges (submitted, under_review, accepted, rejected)
   - "Active Conferences" section with link to submit
   - Stats: Total submissions, Pending reviews, Accepted

**Error Handling:**
- 401: Unauthorized → Logout, redirect to login
- 500: Server error → Show "Failed to load dashboard"

**UI Notes:**
- Show empty state if no submissions/conferences
- Link each submission to review details page
- Link each conference to "Submit Paper" page

---

### Discover Conferences (`frontend/pages/Author/DiscoverConferences.js`)

**Sequence:**
1. On mount, call `GET /api/author/conferences?sortBy=deadline&page=1&limit=20`
2. Optional filters:
   - `location`: "venue filter"
   - `domain`: "domain filter"
   - `minFee`: number
   - `maxFee`: number
3. Implement pagination based on returned data
4. When user clicks a conference, navigate to ConferenceDetails

**Error Handling:**
- 401: Logout
- 500: Show "Failed to load conferences"

**UI Notes:**
- Show conference cards with: name, venue, deadline, fee
- Show "Submit Paper" button for each conference
- Implement filters with form/dropdown

---

### Conference Details (`frontend/pages/Author/ConferenceDetails.js`)

**Sequence:**
1. Get `conferenceId` from URL params
2. Call `GET /api/author/conferences/:conferenceId` to get conference + hasSubmitted flag
3. Call `GET /api/tracks/conference/:conferenceId` to list available tracks
4. Display:
   - Conference title, description, dates, venue, fee
   - Tracks table (name, description, submission deadline)
   - If user has submitted: Show "Already submitted" + button to view submission
   - Otherwise: Show "Submit Paper" button

**Error Handling:**
- 401: Logout
- 404: Conference not found → Show "Conference not found"
- 500: Server error → Show "Failed to load conference"

**UI Notes:**
- Track list should be sortable/filterable
- "Submit Paper" button → redirect to SubmitPaper with `conferenceId` prepopulated
- Link existing submissions to details page

---

### Submit Paper (`frontend/pages/Author/SubmitPaper.js`)

**Sequence:**
1. Get `conferenceId` from URL params or context
2. Call `GET /api/tracks/conference/:conferenceId` to populate track dropdown
3. Display form fields:
   - Conference name (read-only)
   - Track selector (required, dropdown populated from step 2)
   - Title (text input, required)
   - Abstract (textarea, required)
   - File upload (optional, stores fileUrl)
4. On submit, call `POST /api/author/conferences/:conferenceId/submissions` with:
   ```json
   {
     "title": "string",
     "abstract": "string",
     "trackId": "selected track ObjectId",
     "fileUrl": "optional string"
   }
   ```
5. Backend returns `{ success: true, message, data: { _id, title, status, ... } }`
6. **Frontend must:**
   - Show success toast/notification
   - Redirect to MySubmissions or submission detail page

**Error Handling:**
- 400 "Missing trackId": Show "Please select a track"
- 400 "Invalid trackId for conference": Show "Invalid track selection"
- 400 "Submission deadline passed": Show "Submission deadline has passed for this track"
- 400 validation errors: Show error messages for each field
- 401: Logout
- 500: Show "Failed to submit paper"

**UI Notes:**
- Track selector required; disable submit if not selected
- Show submission deadline for selected track
- Implement file drag-and-drop if possible

---

### My Submissions (`frontend/pages/Author/MySubmissions.js`)

**Sequence:**
1. On mount, call `GET /api/author/submissions?page=1&limit=20`
2. Optional: Add track filter: `GET /api/author/submissions?trackId=<id>&page=1`
3. Display submissions in list/table with:
   - Title, conference, track, submission date
   - Status badge (submitted, under_review, accepted, rejected)
   - Action buttons (View Details, Edit if status=submitted)
4. When user clicks a submission, call `GET /api/author/submissions/:submissionId` and navigate to details view

**Error Handling:**
- 401: Logout
- 500: Show "Failed to load submissions"

**UI Notes:**
- Implement pagination controls
- Add track filter dropdown (optional)
- Sort by newest submissions first
- Show empty state if no submissions

---

### Submission Details (`frontend/pages/Author/SubmissionDetail.js`) - NEW PAGE

**Sequence:**
1. Get `submissionId` from URL params
2. Call `GET /api/author/submissions/:submissionId`
3. Display:
   - Submission metadata: title, abstract, status, submitted date
   - Conference name, track name
   - Decision (if status = accepted/rejected): feedback, decided date
   - Reviews summary: count, average score
4. Show "Reviews" section with list of reviewer comments/scores (if available)

**Error Handling:**
- 401: Logout
- 404: Submission not found
- 500: Server error

**UI Notes:**
- Read-only display
- Show decision feedback prominently if rejected
- Show reviews in collapsible sections

---

## 3. Reviewer User Flow

### Reviewer Dashboard (`frontend/pages/Reviewer/Dashboard.js`) - NEW PAGE

**Sequence:**
1. On mount, call `GET /api/reviewer/bids` and `GET /api/reviewer/reviews`
2. Display:
   - "Assigned Submissions" section: submissions where reviewer can place bids or has already placed bids
   - "Completed Reviews" section: submissions already reviewed
   - Stats: Total assigned, Total reviewed, Pending bids
3. Links to:
   - BrowseConferences (to find more to bid on)
   - BidSubmissions (dashboard for bidding)
   - MyReviews (all reviews submitted)

**Error Handling:**
- 401: Logout
- 500: Show "Failed to load dashboard"

---

### Browse Conferences (`frontend/pages/Reviewer/BrowseConferences.js`)

**Sequence:**
1. Call `GET /api/author/conferences?sortBy=deadline` (reuse author API or new endpoint)
2. For each conference, allow reviewer to:
   - View conference details
   - Click "View Submissions" → redirect to ConferenceSubmissions with `conferenceId` param

**Error Handling:**
- 401: Logout
- 500: Show "Failed to load conferences"

**UI Notes:**
- Similar to author discover, but with "View Submissions" CTA instead of "Submit Paper"

---

### Conference Submissions (`frontend/pages/Reviewer/ConferenceSubmissions.js`)

**Sequence:**
1. Get `conferenceId` from URL params
2. Call `GET /api/tracks/conference/:conferenceId` to populate track filter
3. Call `GET /api/reviewer/submissions/:submissionId` for each submission (or batch via author API if available)
4. OR if backend provides `/api/reviewer/conferences/:id/submissions`: use that directly
5. Display submissions list with:
   - Title, abstract, track, author name, status
   - "Place Bid" button (if bid not yet placed)
   - "View Details" button
6. Allow filtering by track via dropdown

**Error Handling:**
- 401: Logout
- 404: Conference not found
- 500: Show "Failed to load submissions"

**UI Notes:**
- Filter by track (dropdown)
- Show "No submissions available" if none found
- Bid status indicator (placed/not placed)

---

### Bid Submissions (`frontend/pages/Reviewer/BidSubmissions.js`)

**Sequence:**
1. Call `GET /api/reviewer/bids` to list current bids
2. Call `GET /api/reviewer/bids?submissionId=<id>` to check if bid exists for a submission
3. Display:
   - Table of all bids placed
   - Confidence level, submission details, track
4. "Place New Bid" button → opens modal or redirects to submission selection
5. If placing bid on new submission:
   - Show submission details (title, abstract, author)
   - Confidence slider (optional)
   - POST `/api/reviewer/bids` with `{ submissionId, confidence }`
6. After bid placed, show success message and refresh list

**Error Handling:**
- 400: Validation errors → Show specific error
- 401: Logout
- 500: Show "Failed to place bid"

**UI Notes:**
- Show bid status per submission
- Implement confidence rating widget
- Refresh after bid placement

---

### Review Paper (`frontend/pages/Reviewer/ReviewPaper.js`)

**Sequence:**
1. Get `submissionId` from URL params
2. Call `GET /api/reviewer/submissions/:submissionId` to get submission details + file URL
3. Display submission for review:
   - Title, abstract, file download/preview
   - Author name, conference, track
   - Review form with fields:
     - Score (number input or slider, 1-10)
     - Comments (textarea)
     - Recommendation (dropdown: accept, weak_accept, borderline, weak_reject, reject)
4. On submit, call `POST /api/reviewer/submissions/:submissionId/reviews` with:
   ```json
   {
     "score": number,
     "comments": "string",
     "recommendation": "string"
   }
   ```
5. Backend auto-normalizes recommendation value (handles synonym mapping)
6. Show success message and redirect to Reviewer Dashboard or MyReviews

**Error Handling:**
- 400 "Reviewer not assigned": Show "You are not assigned to review this submission"
- 400 "Invalid recommendation": Show "Please select a valid recommendation"
- 401: Logout
- 404: Submission not found
- 500: Show "Failed to submit review"

**UI Notes:**
- File preview/download for submission
- Score slider or numeric input
- Recommendation dropdown with clear labels
- Comments should support multi-line text

---

### My Reviews (`frontend/pages/Reviewer/MyReviews.js`)

**Sequence:**
1. Call `GET /api/reviewer/reviews?page=1&limit=20`
2. Optional filter by track: `GET /api/reviewer/reviews?trackId=<id>`
3. Display reviews in table:
   - Submission title, track, score, recommendation, review date
   - "View Details" button
4. When clicked, show full review with comments

**Error Handling:**
- 401: Logout
- 500: Show "Failed to load reviews"

**UI Notes:**
- Sort by newest first
- Pagination controls
- Track filter dropdown
- Show empty state if no reviews

---

## 4. Organizer User Flow

### Organizer Dashboard (`frontend/pages/Organizer/Dashboard.js`) - NEW PAGE

**Sequence:**
1. On mount, call `GET /api/organizer/conferences`
2. Backend returns aggregated conference list with per-track stats
3. Display:
   - Conference cards showing:
     - Conference name, dates, venue
     - Per-track breakdown: Track name, total submissions, accepted, rejected, pending
     - Overall stats for conference
   - Links:
     - "Manage Conference" → redirect to ManageConference with `conferenceId`
     - "View Submissions" → redirect to ViewSubmissions with `conferenceId`
     - "Create Conference" button → redirect to CreateConference
4. Implement pagination if many conferences

**Error Handling:**
- 401: Logout
- 500: Show "Failed to load conferences"

**UI Notes:**
- Show empty state if no conferences
- Per-track stats should be clear (use progress bars)
- Conference cards should be clickable

---

### Create Conference (`frontend/pages/Organizer/CreateConference.js`)

**Sequence:**
1. Display form with fields:
   - Conference name (required)
   - Description (required)
   - Venue (required)
   - Start date (required, ISO8601)
   - End date (required, ISO8601)
   - Submission deadline (required, ISO8601)
   - Domains (optional, multi-select or tags)
   - Fee (optional, number)
   - Tracks section:
     - Add track button → dynamic form for each track
     - Each track has: name (required), description (optional), submission deadline (optional)
2. On submit, POST `/api/organizer/conferences` with:
   ```json
   {
     "name": "string",
     "description": "string",
     "venue": "string",
     "startDate": "ISO8601",
     "endDate": "ISO8601",
     "submissionDeadline": "ISO8601",
     "domains": ["optional", "array"],
     "fee": optional number,
     "tracks": [
       {
         "name": "Track 1",
         "description": "optional",
         "submissionDeadline": "optional ISO8601"
       }
     ]
   }
   ```
3. Backend returns `{ success: true, data: { conference, tracks } }`
4. Show success message and redirect to ManageConference with new `conferenceId`

**Error Handling:**
- 400 validation errors: Show field-level error messages
- 400: Date validation: Show "End date must be after start date"
- 401: Logout
- 500: Show "Failed to create conference"

**UI Notes:**
- Date pickers for ISO8601 dates
- Dynamic track addition/removal
- Form validation on client-side before submit
- Show track count alongside conference form

---

### Manage Conference (`frontend/pages/Organizer/ManageConference.js`)

**Sequence:**
1. Get `conferenceId` from URL params
2. Call `GET /api/organizer/conferences/:conferenceId` for aggregated view
3. Call `GET /api/tracks/conference/:conferenceId` for track list
4. Display:
   - Conference header: name, dates, venue
   - Track list in grid/table:
     - Track name, description, submission deadline
     - Per-track stats: total submissions, accepted, rejected, pending
     - Action buttons: "View Submissions", "Manage Track" (if can edit)
   - Conference-level actions:
     - "Edit Conference" button
     - "View All Submissions" button
     - "Generate Certificates" button
5. Allow track management (organizer can create/update/delete tracks):
   - "Add Track" button → modal with form (POST `/api/tracks`)
   - "Edit Track" → modal with form (PUT `/api/tracks/:id`)
   - "Delete Track" → confirmation dialog (DELETE `/api/tracks/:id`)

**Error Handling:**
- 401: Logout
- 404: Conference not found
- 500: Show "Failed to load conference"

**Track CRUD:**
- POST `/api/tracks` on create
  - 400: Validation errors
  - 403: Not authorized
- PUT `/api/tracks/:id` on update
  - 403: Not authorized
- DELETE `/api/tracks/:id` on delete
  - 403: Not authorized

**UI Notes:**
- Show Navbar for breadcrumbs/navigation
- Per-track submission stats should be clickable (navigate to ViewSubmissions with trackId filter)
- Track cards should show deadline prominently
- Empty state if no tracks

---

### View Submissions (`frontend/pages/Organizer/ViewSubmissions.js`)

**Sequence:**
1. Get `conferenceId` from URL params
2. Call `GET /api/organizer/conferences/:conferenceId/submissions` (no filter)
3. Call `GET /api/tracks/conference/:conferenceId` to populate track filter dropdown
4. Display submissions list with:
   - Title, author name, status, track name
   - Review count, average score
   - Decision status
   - Action buttons:
     - "View Details" → navigate to submission details
     - "Make Decision" → modal with accept/reject + feedback
     - "Approve for Review" → PUT `/api/organizer/submissions/:id/approve`
     - "Schedule" → modal with date/time/venue
     - "Assign Reviewers" (if available in backend)
5. Implement track filter: re-query with `?trackId=<id>`
6. Implement status filter: display, submitted, under_review, accepted, rejected
7. Implement pagination

**Error Handling:**
- 401: Logout
- 404: Conference not found
- 400 (if trackId invalid): Show "Invalid track"
- 500: Show "Failed to load submissions"

**Decision/Approve/Schedule Errors:**
- 403: Not authorized → Show "You are not authorized"
- 404: Submission not found
- 400: Validation errors

**UI Notes:**
- Track filter dropdown (optional, pre-populate if from ManageConference)
- Status badges with color coding
- Review stats prominently displayed
- Bulk actions (if applicable)
- Pagination controls

---

### Organizer Submission Details (NEW PAGE)

**Sequence:**
1. Get `submissionId` from URL params
2. Call `GET /api/organizer/submissions/:submissionId/reviews` to get all reviews for submission
3. Display:
   - Submission: title, abstract, author, track, status
   - Reviews section:
     - Table of all reviews: reviewer name, score, recommendation, comments
   - Decision section:
     - Current decision (if made): accepted/rejected, feedback, decided date
     - If no decision: buttons for "Accept" and "Reject" with optional feedback modal
   - Actions:
     - "Approve for Review" button (if not approved)
     - "Schedule Presentation" button (if accepted)
4. On decision:
   - PATCH `/api/organizer/submission/:submissionId/decision` with `{ decision, feedback }`
5. On schedule:
   - PUT `/api/organizer/submissions/:submissionId/schedule` with date/time/venue

**Error Handling:**
- Same as ViewSubmissions

**UI Notes:**
- Review list with expandable comments
- Decision modal with textarea for feedback
- Schedule modal with date/time pickers
- Show decision prominently

---

### Organizer Reviews (`frontend/pages/Organizer/ReviewsList.js`) - OPTIONAL PAGE

**Sequence:**
1. Call `GET /api/organizer/reviews?page=1&limit=50` for all reviews
2. OR with filters: `GET /api/organizer/reviews?conferenceId=<id>&trackId=<id>&submissionId=<id>`
3. Display reviews table:
   - Reviewer name, submission title, track, score, recommendation
   - "View Details" button
4. Filters:
   - By conference (dropdown)
   - By track (dropdown, populated based on conference selection)
   - By submission (search/dropdown)

**Error Handling:**
- 401: Logout
- 500: Show "Failed to load reviews"

---

### Generate Certificates

**Sequence:**
1. In ManageConference or separate view, show "Generate Certificates" button
2. On click, POST `/api/organizer/conferences/:conferenceId/certificates`
3. Backend generates:
   - Presentation certificates for authors of accepted submissions
   - Participation certificates for registered participants with attended=true
4. Backend returns `{ success: true, data: { createdCount, created } }`
5. Show success message: "Generated X certificates"

**Error Handling:**
- 401: Logout
- 404: Conference not found
- 403: Not authorized
- 500: Show "Failed to generate certificates"

---

## 5. Participant User Flow

### Participant Dashboard (`frontend/pages/Participant/Dashboard.js`) - NEW PAGE

**Sequence:**
1. On mount, call `GET /api/participant/dashboard`
2. Display:
   - "Upcoming Events" section: registered conferences
   - "Available Certificates" section: completed/attended conferences with certificates
   - Stats: Total registered, attended, certificates

**Error Handling:**
- 401: Logout
- 500: Show "Failed to load dashboard"

---

### Browse Events (`frontend/pages/Participant/BrowseEvents.js`)

**Sequence:**
1. Call `GET /api/participant/conferences?sortBy=startDate`
2. Optional filters similar to author discover
3. Display conference cards with:
   - Name, venue, dates, fee
   - "View Details" button
   - If registered: "Cancel Registration" button

**Error Handling:**
- 401: Logout
- 500: Show "Failed to load events"

---

### Event Details (`frontend/pages/Participant/EventDetails.js`)

**Sequence:**
1. Get `conferenceId` from URL params
2. Call `GET /api/participant/conferences/:conferenceId`
3. Display:
   - Conference details: name, description, dates, venue, fee
   - "Register for Conference" button (if not registered)
   - Or "You are registered" message with option to withdraw

**Error Handling:**
- 401: Logout
- 404: Conference not found
- 500: Show "Failed to load event"

---

### Register for Conference

**Sequence:**
1. From EventDetails, POST `/api/participant/registrations` with `{ conferenceId }`
2. Backend returns `{ success: true, data: { registration object } }`
3. Show success message and redirect to MyRegistrations

**Error Handling:**
- 400: Already registered
- 401: Logout
- 500: Show "Failed to register"

---

### My Registrations (`frontend/pages/Participant/MyRegistrations.js`)

**Sequence:**
1. Call `GET /api/participant/registrations`
2. Display registrations with:
   - Conference name, dates, venue
   - Attendance status (attended/not attended)
   - Link to event details
   - Option to cancel/withdraw (if applicable)

**Error Handling:**
- 401: Logout
- 500: Show "Failed to load registrations"

---

### My Certificates (`frontend/pages/Participant/MyCertificates.js`)

**Sequence:**
1. Call `GET /api/participant/certificates`
2. Display certificates:
   - Conference name, certificate type (presentation/participation)
   - Issued date
   - Download/print button

**Error Handling:**
- 401: Logout
- 500: Show "Failed to load certificates"

---

## 6. General Frontend Best Practices

### Authorization Header
- Always include `Authorization: Bearer <token>` in all API requests
- Set globally in axios: `axios.defaults.headers.common['Authorization'] = \`Bearer \${token}\``
- Update on login: call `setAuthToken(token)` immediately
- Clear on logout: delete from localStorage, clear axios header

### Error Handling
- **401 Unauthorized:**
  - Clear token/user from localStorage
  - Clear axios Authorization header
  - Redirect to Login page
  - Show "Session expired, please login again"

- **403 Forbidden:**
  - Show "You do not have permission to perform this action"
  - Do NOT redirect; allow user to navigate back

- **404 Not Found:**
  - Resource-specific: "Conference not found" vs generic "Resource not found"
  - Allow user to navigate back or to homepage

- **400 Bad Request:**
  - Show field-level validation errors
  - Highlight form fields with errors

- **500 Server Error:**
  - Generic message: "An error occurred, please try again"
  - Log error details to console for debugging

### Response Normalization
All backend responses follow:
```json
{
  "success": true/false,
  "message": "optional message",
  "data": {...} or [...]
}
```

Always check `response.data.success` before accessing `response.data.data`

### Token Persistence
- On mount of main App/AuthContext: restore token from localStorage
- If token exists, call `setAuthToken(token)` immediately
- This prevents 401 on initial API requests after page reload
- Also restore user object to prevent logout-on-reload

### Pagination
- Backend endpoints support `?page=1&limit=25` (default)
- Frontend should:
  - Maintain current page in state
  - Implement "prev/next" or numbered page buttons
  - Re-query backend when page changes
  - Show total count if available

### Loading States
- Show skeleton loaders or spinners while fetching
- Disable buttons during API calls
- Show empty states clearly ("No data found")

### Track Context
- Many operations require `trackId` in request body
- Always fetch tracks for a conference before allowing submission/bid/review creation
- Use track dropdown/selector in forms

### Notification/Toast Messages
- Success messages: "Action completed successfully"
- Error messages: Specific, actionable, non-technical
- Use toast/notification library (e.g., react-toastify) for non-modal feedback

---

## Summary of Pages to Create

**New Pages Needed:**
1. ✅ Author/Dashboard (list submissions + active conferences)
2. ✅ Author/SubmissionDetail (view full submission + reviews)
3. ✅ Reviewer/Dashboard (assigned submissions, completed reviews)
4. ✅ Reviewer/ConferenceSubmissions (submissions for specific conference)
5. ✅ Reviewer/BidSubmissions (dashboard for managing bids)
6. ✅ Organizer/Dashboard (list conferences with per-track stats)
7. ✅ Organizer/CreateConference (form to create conference + inline tracks)
8. ✅ Organizer/SubmissionDetail (view submission + all reviews + make decision/schedule)
9. ✅ Organizer/ReviewsList (optional: list all reviews with filters)
10. ✅ Participant/Dashboard (registrations + certificates)
11. ✅ Participant/EventDetails (single conference for participants)
12. ✅ Participant/MyRegistrations (list registered conferences)

**Pages to Update:**
- ✅ Author/ConferenceDetails (show tracks, call /api/tracks endpoint)
- ✅ Author/SubmitPaper (require track selection, POST with trackId)
- ✅ Author/MySubmissions (optional track filter)
- ✅ Reviewer/ReviewPaper (normalized recommendations)
- ✅ Organizer/ManageConference (track CRUD, getTracks resilience)
- ✅ Organizer/ViewSubmissions (track filter, decision/schedule actions)

---

**Implementation Priority:**
1. HIGH: Author/Dashboard, Author/SubmitPaper (core author flow)
2. HIGH: Organizer/Dashboard, Organizer/CreateConference, Organizer/ManageConference (core organizer flow)
3. HIGH: Reviewer/Dashboard, Reviewer/ReviewPaper (core reviewer flow)
4. MEDIUM: Participant/Dashboard, Participant/BrowseEvents
5. MEDIUM: Details pages (SubmissionDetail, EventDetails)
6. LOW: Optional pages (ReviewsList)
