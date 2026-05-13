# NEXT STEPS - Frontend Completion Guide

## 🎯 Priority 1: Reviewer Pages (Highest Priority)

### 1. Reviewer/BrowseConferences.js
**Purpose:** List conferences → select conference → show submissions for bidding

**Implementation:**
```javascript
// Use these functions:
- discoverConferences()          // Get all conferences
- getConferenceSubmissionsReviewer() // Get submissions in conference

// Features needed:
- Conference search/filter
- Click conference → show submissions in that conference
- Submission cards with bid button
- Status (bid accepted/pending/rejected)
```

**Template Pattern:** Similar to Author/DiscoverConferences but show submissions

---

### 2. Reviewer/BidSubmissions.js
**Purpose:** Manage bids on submissions

**Implementation:**
```javascript
// Use these functions:
- placeBid(submissionId, confidence)  // Create bid
- getReviewerBids()                    // List all bids
- deleteBid() // NOT YET - may need backend addition

// Features needed:
- List of submitted bids with status
- Bid form (submission selector + confidence level)
- Accept/reject bid buttons
- Bid status updates
```

---

### 3. Reviewer/ReviewPaper.js (Fix existing)
**Purpose:** Submit review for assigned submission

**Implementation:**
```javascript
// Use these functions:
- getSubmissionForReview(submissionId)  // Get paper details
- createReview(submissionId, reviewData) // Submit review

// Features needed:
- Display paper title/abstract/authors
- Review form:
  - Recommendation dropdown (Accept/Reject/Minor Changes/Major Changes)
  - Comments textarea
  - Rating (1-5 stars)
- File download for paper
- Submit button → redirect to MyReviews
```

---

### 4. Reviewer/MyReviews.js
**Purpose:** View all submitted reviews

**Implementation:**
```javascript
// Use this function:
- getReviewerReviews()  // List all reviews

// Features needed:
- List of reviews with:
  - Paper title (link to submission)
  - Recommendation badge
  - Comments snippet
  - Date submitted
- Filter by recommendation
- Filter by conference
```

---

## 🎯 Priority 2: Organizer Pages (Highest Priority)

### 1. Organizer/ManageConference.js (Fix existing)
**Purpose:** Edit conference details and manage tracks

**Implementation:**
```javascript
// Use these functions:
- getConferenceDetailsOrganizer(conferenceId)  // Get conference
- updateConference(conferenceId, data)         // Save changes
- getTracks(conferenceId)                      // Get tracks
- updateTrack(trackId, data)                   // Edit track
- deleteTrack(trackId)                         // Delete track
- createTrack(conferenceId, data)              // Add track

// Features needed:
- Conference edit form (name, description, dates, venue)
- Track management section:
  - List existing tracks
  - Add new track button + form
  - Edit track button + form (modal)
  - Delete track with confirmation
- Save all changes
- Error handling per field
```

---

### 2. Organizer/ViewSubmissions.js (Fix existing)
**Purpose:** List submissions and make decisions

**Implementation:**
```javascript
// Use these functions:
- getConferenceSubmissionsOrganizer(conferenceId, filters)
- makeSubmissionDecision(submissionId, decision, feedback)
- scheduleSubmission(submissionId, scheduleData)
- getSubmissionDetailsOrganizer(submissionId)
- getSubmissionReviewsOrganizer(submissionId)

// Features needed:
- Submission list with columns:
  - Title
  - Author
  - Track
  - Status (pending/accepted/rejected)
  - Review score
- Filter by track/status
- Row click → Detail modal showing:
  - Paper info
  - All reviews
  - Reviews summary
  - Decision form (accept/reject)
  - Feedback textarea
  - Schedule date/time if accepted
- Save decision
```

---

## 🎯 Priority 3: Participant Pages (Medium Priority)

### 1. Participant/Dashboard.js
**Purpose:** Participant overview

```javascript
// Use:
- getParticipantDashboard()

// Show:
- Stats: Registered conferences, upcoming events
- Registered events list (with dates)
- Certificates earned
- Quick action buttons
```

### 2. Participant/BrowseEvents.js
**Purpose:** Browse and find conferences to register

```javascript
// Use:
- discoverConferences()  // Reuse from Author

// Show:
- Conference search/filter
- Registration button
- Filter by date/domain
```

### 3. Participant/EventDetails.js
**Purpose:** View event details and register

```javascript
// Use:
- getConferenceDetailsParticipant(conferenceId)
- registerForConference(conferenceId)

// Show:
- Full event info
- Register button
- Confirmation modal
- Success message
```

### 4. Participant/MyRegistrations.js
**Purpose:** View registered events

```javascript
// Use:
- getParticipantRegistrations()

// Show:
- List of registered conferences
- Attendance status (attended/pending)
- Download certificate button
- Event dates
```

---

## 🔍 VERIFICATION CHECKLIST

Before each page goes to production:

- [ ] API functions imported correctly
- [ ] Error handling with try/catch
- [ ] Loading state shown during fetch
- [ ] Empty state message when no data
- [ ] Navbar component included
- [ ] Back button for navigation
- [ ] Responsive design tested (mobile/tablet/desktop)
- [ ] Form validation before submit
- [ ] Success/error messages displayed
- [ ] All links working
- [ ] No console errors

---

## 🔗 REFERENCE FILES

**For code copy-paste:**
- UPDATED_API_HELPERS.md - All 50+ functions with signatures

**For specifications:**
- FRONTEND_INTEGRATION_GUIDE.md - Page-by-page requirements
- BACKEND_API_ANALYSIS.md - API endpoint reference

**For tracking:**
- IMPLEMENTATION_PROGRESS.md - Current status
- IMPLEMENTATION_CHECKLIST.md - 5-phase plan

---

## 💡 COMMON PATTERNS

### Error + Loading Pattern
```javascript
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await apiFunction();
    setData(data.data || data);
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to load');
  } finally {
    setLoading(false);
  }
};

if (loading) return <Loading />;

return (
  <>
    <Navbar />
    <div className="max-w-7xl mx-auto px-4 py-8">
      {error && <ErrorCard error={error} onRetry={fetchData} />}
      {/* Content */}
    </div>
  </>
);
```

### Form Submission Pattern
```javascript
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  
  // Validation
  if (!formData.field) {
    setError('Field is required');
    return;
  }
  
  setSubmitting(true);
  try {
    await apiFunction(formData);
    navigate('/success-page');
  } catch (err) {
    setError(err.response?.data?.message);
  } finally {
    setSubmitting(false);
  }
};
```

---

## ✅ COMPLETION METRICS

### Target: 22 Pages Total
- ✅ Completed: 8 pages (Author 5, Organizer 2, Reviewer 1)
- ⏳ Ready to build: 14 pages (Organizer 2, Reviewer 4, Participant 5, Auth 1)

### Backend Readiness
- ✅ All 50+ APIs implemented and tested
- ✅ Error responses documented
- ✅ Request/response schemas verified
- ✅ Multi-role access control verified

### Testing Readiness
- ✅ AuthContext working (token + user)
- ✅ API helpers complete
- ✅ Global layout pattern established
- ✅ Error/loading states implemented

---

**Last Updated:** After Session 1
**Status:** Ready for Session 2 - Reviewer pages are next priority
