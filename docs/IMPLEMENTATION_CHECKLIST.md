# Frontend Implementation Quick-Start Checklist

## 📋 Pre-Implementation

- [ ] Read `BACKEND_API_ANALYSIS.md` to understand all endpoints
- [ ] Read `FRONTEND_INTEGRATION_GUIDE.md` to understand page requirements
- [ ] Read `UPDATED_API_HELPERS.md` to understand available API functions
- [ ] Understand the data model: Conference → Track → Submission
- [ ] Verify backend is running on http://localhost:5000
- [ ] Test Postman collection to ensure backend is healthy

---

## 🔐 Step 1: Auth Setup (Required First)

### AuthContext.js
- [ ] Restore token from localStorage on mount (synchronously)
- [ ] Restore user object from localStorage on mount
- [ ] Call `setAuthToken(token)` to set axios Authorization header
- [ ] Implement logout: clear localStorage, clear axios header
- [ ] Store token AND user object after login/register (not just token)

### API File (`utils/api.js`)
- [ ] Copy complete code from `UPDATED_API_HELPERS.md`
- [ ] Verify all 50+ API helpers are present
- [ ] Test that `setAuthToken()` is called from AuthContext
- [ ] Verify axios instance uses dynamic baseURL

### Login/Register Pages
- [ ] Already exist, just verify they:
  - [ ] Store both `token` and `user` in localStorage
  - [ ] Call `setAuthToken(token)` after login
  - [ ] Redirect to correct dashboard based on `user.role`

**Test:** Login as different roles → should see correct dashboard

---

## 👤 Step 2: Author Flow (Core Authors)

### 2.1 Author Dashboard
- [ ] Create: `frontend/pages/Author/Dashboard.js`
- [ ] Call: `GET /api/author/dashboard`
- [ ] Display: submissions list, active conferences
- [ ] Features:
  - [ ] Show status badges (submitted, under_review, accepted, rejected)
  - [ ] Link to submission details
  - [ ] Link to submit new paper
- [ ] Error handling: 401 logout, 500 error message

### 2.2 Author ConferenceDetails
- [ ] Update: `frontend/pages/Author/ConferenceDetails.js`
- [ ] Calls:
  - [ ] `GET /api/author/conferences/:id` (for conference info + hasSubmitted)
  - [ ] `GET /api/tracks/conference/:id` (for tracks list)
- [ ] Display:
  - [ ] Conference metadata (name, dates, venue, fee)
  - [ ] Tracks table (name, deadline, stats)
  - [ ] "Already submitted" message if hasSubmitted=true
  - [ ] "Submit Paper" button if not submitted

### 2.3 Author SubmitPaper
- [ ] Update: `frontend/pages/Author/SubmitPaper.js`
- [ ] Calls:
  - [ ] `GET /api/tracks/conference/:id` on mount
  - [ ] `POST /api/author/conferences/:id/submissions` on submit
- [ ] Form fields:
  - [ ] Track selector (REQUIRED dropdown from tracks list)
  - [ ] Title (text input, required)
  - [ ] Abstract (textarea, required)
  - [ ] File URL (optional text input)
- [ ] Validation: trackId must be selected
- [ ] Error handling:
  - [ ] 400 "trackId invalid" → show "Please select a valid track"
  - [ ] 400 "deadline passed" → show "Submission deadline has passed"
- [ ] Success: redirect to `/author/submissions`

### 2.4 Author MySubmissions
- [ ] Update: `frontend/pages/Author/MySubmissions.js`
- [ ] Calls:
  - [ ] `GET /api/author/submissions?page=1&limit=20` on mount
  - [ ] `GET /api/author/submissions/:id` when viewing details
- [ ] Features:
  - [ ] Submission list/table with title, status, date
  - [ ] Status badges
  - [ ] Link to details page
  - [ ] Pagination

### 2.5 Author SubmissionDetail (NEW)
- [ ] Create: `frontend/pages/Author/SubmissionDetail.js`
- [ ] Calls:
  - [ ] `GET /api/author/submissions/:id` on mount
- [ ] Display:
  - [ ] Submission metadata (title, abstract, status)
  - [ ] Author name, conference, track
  - [ ] Decision (if made): feedback, decided date
  - [ ] Reviews: count, average score, reviewer names

**Test Author Flow:**
1. Register as author
2. View dashboard → see conferences or empty state
3. Discover conferences → find one
4. Click conference → see tracks
5. Click submit → select track → submit paper
6. View submissions → see submitted paper with "submitted" status
7. Click paper → see details

---

## 📝 Step 3: Organizer Flow (Core Organizers)

### 3.1 Organizer Dashboard (NEW)
- [ ] Create: `frontend/pages/Organizer/Dashboard.js`
- [ ] Calls:
  - [ ] `GET /api/organizer/conferences` on mount
- [ ] Display:
  - [ ] Conference cards with per-track stats
  - [ ] For each track: name, total, accepted, rejected, pending
  - [ ] Links: "Manage Conference", "View Submissions"
  - [ ] "Create Conference" button
- [ ] Features:
  - [ ] Pagination if many conferences
  - [ ] Empty state if no conferences

### 3.2 Organizer CreateConference (NEW)
- [ ] Create: `frontend/pages/Organizer/CreateConference.js`
- [ ] Calls:
  - [ ] `POST /api/organizer/conferences` on submit
- [ ] Form fields:
  - [ ] Conference: name, description, venue, startDate, endDate, submissionDeadline, domains, fee
  - [ ] Tracks (dynamic add/remove): name, description, submissionDeadline per track
- [ ] Validation:
  - [ ] All required fields
  - [ ] End date > start date
  - [ ] Deadline <= end date
- [ ] Success: redirect to `ManageConference` with new conference ID
- [ ] Features:
  - [ ] Date pickers for ISO dates
  - [ ] Add/remove tracks dynamically
  - [ ] Show track count

### 3.3 Organizer ManageConference
- [ ] Already updated but verify:
  - [ ] Calls: `GET /api/organizer/conferences/:id` + `GET /api/tracks/conference/:id`
  - [ ] Displays: tracks with stats, conference metadata
  - [ ] Track CRUD: create, edit, delete buttons
  - [ ] Buttons: "View Submissions", "Edit Conference", "Generate Certificates"
  - [ ] Error state visible (not blank)

### 3.4 Organizer ViewSubmissions
- [ ] Already updated but verify:
  - [ ] Calls: `GET /api/organizer/conferences/:id/submissions?trackId=`
  - [ ] Features: track filter dropdown
  - [ ] Columns: title, author, track, status, review count
  - [ ] Actions: "View Details", "Make Decision", "Approve", "Schedule"
  - [ ] Decision/Schedule modals with forms

### 3.5 Organizer SubmissionDetail (NEW)
- [ ] Create: `frontend/pages/Organizer/SubmissionDetail.js`
- [ ] Calls:
  - [ ] `GET /api/organizer/submissions/:id/reviews` on mount
  - [ ] `PATCH /api/organizer/submission/:id/decision` on decision
  - [ ] `PUT /api/organizer/submissions/:id/schedule` on schedule
- [ ] Display:
  - [ ] Submission metadata
  - [ ] All reviews: reviewer name, score, recommendation, comments
  - [ ] Current decision (if made)
- [ ] Actions:
  - [ ] Decision modal: accept/reject + feedback
  - [ ] Schedule modal: date, startTime, endTime, venue
  - [ ] Approve for review button

**Test Organizer Flow:**
1. Register as organizer
2. View dashboard → see conferences (if exist)
3. Create new conference → select tracks
4. Manage conference → verify tracks created
5. Submit author paper to track
6. View submissions → see paper in track
7. Click submission → see reviews (or empty if none yet)
8. Make decision → paper status updates
9. Schedule presentation

---

## 🔍 Step 4: Reviewer Flow

### 4.1 Reviewer Dashboard (NEW)
- [ ] Create: `frontend/pages/Reviewer/Dashboard.js`
- [ ] Calls:
  - [ ] `GET /api/reviewer/bids` on mount
  - [ ] `GET /api/reviewer/reviews` on mount
- [ ] Display:
  - [ ] "Assigned Submissions" section
  - [ ] "Completed Reviews" section
  - [ ] Stats: total assigned, total reviewed, pending
- [ ] Links: BrowseConferences, BidSubmissions, MyReviews

### 4.2 Reviewer BrowseConferences (NEW)
- [ ] Create: `frontend/pages/Reviewer/BrowseConferences.js`
- [ ] Calls:
  - [ ] `GET /api/author/conferences` (reuse author API)
- [ ] Display: conference cards
- [ ] CTA: "View Submissions" button → redirect to ConferenceSubmissions

### 4.3 Reviewer ConferenceSubmissions (NEW)
- [ ] Create: `frontend/pages/Reviewer/ConferenceSubmissions.js`
- [ ] Calls:
  - [ ] `GET /api/tracks/conference/:id` on mount
  - [ ] `GET /api/reviewer/submissions/:id` for each submission
- [ ] Display:
  - [ ] Submissions list
  - [ ] Track filter dropdown
  - [ ] Bid status indicator (placed/not placed)
  - [ ] "Place Bid" button per submission
- [ ] Features: track filtering

### 4.4 Reviewer BidSubmissions (NEW)
- [ ] Create: `frontend/pages/Reviewer/BidSubmissions.js`
- [ ] Calls:
  - [ ] `GET /api/reviewer/bids?page=1` on mount
  - [ ] `POST /api/reviewer/bids` on place bid
- [ ] Display:
  - [ ] Bids table: submission, confidence, date
  - [ ] "Place New Bid" button → modal with:
     - [ ] Submission selector (search/dropdown)
     - [ ] Confidence slider (optional)
- [ ] Success: refresh bids list

### 4.5 Reviewer ReviewPaper
- [ ] Already created, but verify:
  - [ ] Calls: `GET /api/reviewer/submissions/:id` + `POST /api/reviewer/submissions/:id/reviews`
  - [ ] Form fields: score, comments, recommendation dropdown
  - [ ] Recommendation options: accept, weak_accept, borderline, weak_reject, reject
  - [ ] File preview/download from submission
  - [ ] Error handling: 403 if not assigned

### 4.6 Reviewer MyReviews (NEW)
- [ ] Create: `frontend/pages/Reviewer/MyReviews.js`
- [ ] Calls:
  - [ ] `GET /api/reviewer/reviews?page=1` on mount
- [ ] Display:
  - [ ] Reviews list: submission, score, recommendation, date
  - [ ] Track filter (optional)
  - [ ] Pagination

**Test Reviewer Flow:**
1. Register as reviewer
2. View dashboard → empty (no bids/reviews yet)
3. Browse conferences → see author-created conference
4. View submissions → see author-submitted paper
5. Place bid → GET /api/reviewer/bids shows bid
6. Review paper → submit review
7. My reviews → see submitted review

---

## 👥 Step 5: Participant Flow

### 5.1 Participant Dashboard (NEW)
- [ ] Create: `frontend/pages/Participant/Dashboard.js`
- [ ] Calls: `GET /api/participant/dashboard`
- [ ] Display: registrations, certificates, stats

### 5.2 Participant BrowseEvents (NEW)
- [ ] Create: `frontend/pages/Participant/BrowseEvents.js`
- [ ] Calls: `GET /api/participant/conferences`
- [ ] Display: conference cards, filters
- [ ] CTA: "View Details" or "Register"

### 5.3 Participant EventDetails (NEW)
- [ ] Create: `frontend/pages/Participant/EventDetails.js`
- [ ] Calls: `GET /api/participant/conferences/:id`
- [ ] Display: conference info
- [ ] Actions: "Register" button → POST /api/participant/registrations

### 5.4 Participant MyRegistrations (NEW)
- [ ] Create: `frontend/pages/Participant/MyRegistrations.js`
- [ ] Calls: `GET /api/participant/registrations`
- [ ] Display: list of registered conferences

### 5.5 Participant MyCertificates
- [ ] Already created, verify:
  - [ ] Calls: `GET /api/participant/certificates`
  - [ ] Display: certificates with download button

---

## 🧪 Step 6: Testing (End-to-End)

### 6.1 Single-User Workflows
- [ ] **Author:** Discover → Submit → View Status
- [ ] **Organizer:** Create Conference → Manage Tracks → View Submissions → Make Decisions
- [ ] **Reviewer:** Browse → Bid → Review
- [ ] **Participant:** Browse → Register → View Certificates

### 6.2 Multi-User Workflow
1. Organizer creates conference with 2 tracks
2. Author A submits to track 1
3. Author B submits to track 1
4. Author C submits to track 2
5. Reviewer X places bids on all track 1 submissions
6. Reviewer Y places bid on track 2 submission
7. Reviewers create reviews
8. Organizer views submissions, makes decisions
9. Organizer generates certificates
10. Participants register (optional)

### 6.3 Postman Validation
- [ ] Run full 27-request Postman collection
- [ ] All tests should pass
- [ ] No 401/403/404 errors for valid requests

### 6.4 Permission Testing
- [ ] Author cannot view other author's submission (403)
- [ ] Reviewer cannot make decisions (403)
- [ ] Organizer cannot submit papers (403)
- [ ] Participant cannot create conferences (403)

---

## 📊 Implementation Progress Tracking

### Phase 1: Auth & Foundation
| Task | Status | Notes |
|------|--------|-------|
| AuthContext setup | ⏳ | Verify token/user persistence |
| API helpers | ⏳ | Copy from UPDATED_API_HELPERS.md |
| Login/Register pages | ✅ | Already exist |

### Phase 2: Author Pages
| Task | Status | Notes |
|------|--------|-------|
| Author Dashboard | ⏳ | NEW |
| Author ConferenceDetails | ⏳ | Update existing |
| Author SubmitPaper | ⏳ | Update existing |
| Author MySubmissions | ⏳ | Update existing |
| Author SubmissionDetail | ⏳ | NEW |

### Phase 3: Organizer Pages
| Task | Status | Notes |
|------|--------|-------|
| Organizer Dashboard | ⏳ | NEW |
| Organizer CreateConference | ⏳ | NEW |
| Organizer ManageConference | ⏳ | Update existing |
| Organizer ViewSubmissions | ⏳ | Update existing |
| Organizer SubmissionDetail | ⏳ | NEW |

### Phase 4: Reviewer Pages
| Task | Status | Notes |
|------|--------|-------|
| Reviewer Dashboard | ⏳ | NEW |
| Reviewer BrowseConferences | ⏳ | NEW |
| Reviewer ConferenceSubmissions | ⏳ | NEW |
| Reviewer BidSubmissions | ⏳ | NEW |
| Reviewer ReviewPaper | ✅ | Already exist |
| Reviewer MyReviews | ⏳ | NEW |

### Phase 5: Participant Pages
| Task | Status | Notes |
|------|--------|-------|
| Participant Dashboard | ⏳ | NEW |
| Participant BrowseEvents | ⏳ | NEW |
| Participant EventDetails | ⏳ | NEW |
| Participant MyRegistrations | ⏳ | NEW |
| Participant MyCertificates | ✅ | Already exist |

---

## 🚀 Development Workflow

### For Each Page:
1. Create skeleton with imports
2. Add useEffect to call API helper on mount
3. Add loading state (spinner)
4. Add error state (error message + retry)
5. Add empty state (no data message)
6. Add success state (data rendering)
7. Add action handlers (buttons, forms)
8. Add forms with validation
9. Test with mock/real data
10. Test error cases (401, 404, 400, 500)

### Code Template:
```javascript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { [API_HELPER] } from '../../utils/api';

export default function PageName() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await [API_HELPER]();
        if (response.success) {
          setData(response.data);
        } else {
          throw new Error(response.message);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError(err.response?.data?.message || 'Failed to load');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!data) return <div>No data found</div>;

  return (
    <div>
      {/* Render data */}
    </div>
  );
}
```

---

## ⚠️ Common Mistakes to Avoid

- [ ] ❌ Forgetting to call `setAuthToken(token)` after login
- [ ] ❌ Not storing user object in localStorage (causes logout on reload)
- [ ] ❌ Async token restoration (race condition)
- [ ] ❌ Forgetting trackId in submission form
- [ ] ❌ Using axios directly instead of API helpers
- [ ] ❌ Not checking `response.success` before accessing `response.data`
- [ ] ❌ Not showing loading/error states
- [ ] ❌ Hardcoding API URLs instead of using helpers
- [ ] ❌ Not handling 401 by redirecting to login
- [ ] ❌ Showing technical error messages to users

---

## 📞 Quick Debugging Tips

| Problem | Diagnosis | Solution |
|---------|-----------|----------|
| Always 401 | Token not in header | Check axios global header in DevTools |
| 404 on API call | Endpoint path wrong | Verify against BACKEND_API_ANALYSIS.md |
| Blank page after login | Data not loading | Check API response in DevTools Network tab |
| Form validation fails | Required field missing | Check form state before submit |
| Error message doesn't show | Wrong error path | Use `error.response?.data?.message` or `errors[0].msg` |
| Track not in dropdown | getTracks returned empty | Check backend has tracks, verify conferenceId |
| Decision not updating | trackId validation failed | Verify submission.trackId exists |

---

## 🎯 Success Criteria

**Phase 1 Complete When:**
- [ ] User can login as any role
- [ ] Auth token persists on reload
- [ ] All API helpers working

**Phase 2 Complete When:**
- [ ] Author can discover conferences
- [ ] Author can submit paper with track selection
- [ ] Author can view submissions and decisions

**Phase 3 Complete When:**
- [ ] Organizer can create conference with tracks
- [ ] Organizer can manage tracks (create/edit/delete)
- [ ] Organizer can view submissions and make decisions
- [ ] Certificates can be generated

**Phase 4 Complete When:**
- [ ] Reviewer can bid on submissions
- [ ] Reviewer can create reviews
- [ ] Reviewer can track bids/reviews

**Phase 5 Complete When:**
- [ ] Participant can register for conferences
- [ ] Participant can view certificates
- [ ] Full end-to-end workflow works

---

**Last Updated:** [Auto-generated]
**Status:** Ready for implementation
**Next Step:** Start with Step 1 (Auth setup), then Phase 2 (Author pages)

Good luck! 🚀
