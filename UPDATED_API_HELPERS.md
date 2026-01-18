# Updated API Helpers (`frontend/utils/api.js`)

This file contains all the helper functions needed for frontend integration with the backend APIs.

```javascript
import axios from 'axios';

// Detect API base URL dynamically
const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    return process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000`;
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
});

// Helper to add auth headers
export const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

// Helper to set global auth token
export const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

// ============ AUTHENTICATION APIs ============

/**
 * Register a new user
 * @param {Object} data - { name, email, password, role, expertiseDomains }
 * @returns {Promise}
 */
export const registerUser = async (data) => {
  const res = await axiosInstance.post('/api/auth/register', data);
  return res.data;
};

/**
 * Login a user
 * @param {string} email
 * @param {string} password
 * @returns {Promise} { success, token, user }
 */
export const loginUser = async (email, password) => {
  const res = await axiosInstance.post('/api/auth/login', { email, password });
  return res.data;
};

// ============ TRACK APIs ============

/**
 * Get all tracks for a conference
 * @param {string} conferenceId
 * @param {string} token - optional, for explicit auth
 * @returns {Promise} { data: [...] }
 */
export const getTracks = async (conferenceId, token) => {
  try {
    // Try primary endpoint
    const res = await axiosInstance.get(`/api/tracks/conference/${conferenceId}`);
    return res.data;
  } catch (err) {
    // Fallback endpoints
    if (err.response?.status === 404) {
      try {
        const res = await axiosInstance.get(`/api/organizer/conferences/${conferenceId}/tracks`);
        return res.data;
      } catch (err2) {
        // Return empty if both fail
        return { data: [] };
      }
    }
    throw err;
  }
};

/**
 * Create a new track
 * @param {string} conferenceId
 * @param {Object} trackData - { name, description, submissionDeadline }
 * @returns {Promise}
 */
export const createTrack = async (conferenceId, trackData) => {
  const res = await axiosInstance.post('/api/tracks', {
    conferenceId,
    ...trackData,
  });
  return res.data;
};

/**
 * Update a track
 * @param {string} trackId
 * @param {Object} updates - { name, description, submissionDeadline, status }
 * @returns {Promise}
 */
export const updateTrack = async (trackId, updates) => {
  const res = await axiosInstance.put(`/api/tracks/${trackId}`, updates);
  return res.data;
};

/**
 * Delete a track
 * @param {string} trackId
 * @returns {Promise}
 */
export const deleteTrack = async (trackId) => {
  const res = await axiosInstance.delete(`/api/tracks/${trackId}`);
  return res.data;
};

// ============ AUTHOR APIs ============

/**
 * Get author dashboard
 * @returns {Promise} { data: { submissions, activeConferences } }
 */
export const getAuthorDashboard = async () => {
  const res = await axiosInstance.get('/api/author/dashboard');
  return res.data;
};

/**
 * Discover conferences
 * @param {Object} filters - { location, domain, minFee, maxFee, sortBy, page, limit }
 * @returns {Promise} { data: { conferences } }
 */
export const discoverConferences = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const res = await axiosInstance.get(`/api/author/conferences?${params}`);
  return res.data;
};

/**
 * Get conference details (author view)
 * @param {string} conferenceId
 * @returns {Promise} { data: { conference, hasSubmitted, submission } }
 */
export const getConferenceDetailsAuthor = async (conferenceId) => {
  const res = await axiosInstance.get(`/api/author/conferences/${conferenceId}`);
  return res.data;
};

/**
 * Submit a paper to a conference
 * @param {string} conferenceId
 * @param {Object} submissionData - { title, abstract, trackId, fileUrl }
 * @returns {Promise}
 */
export const submitPaper = async (conferenceId, submissionData) => {
  const res = await axiosInstance.post(
    `/api/author/conferences/${conferenceId}/submissions`,
    submissionData
  );
  return res.data;
};

/**
 * Get author submissions with optional track filter
 * @param {Object} filters - { trackId, page, limit }
 * @returns {Promise} { data: [...] }
 */
export const getAuthorSubmissions = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const res = await axiosInstance.get(`/api/author/submissions?${params}`);
  return res.data;
};

/**
 * Get submission details (author view)
 * @param {string} submissionId
 * @returns {Promise} { data: { submission with reviews } }
 */
export const getSubmissionDetailsAuthor = async (submissionId) => {
  const res = await axiosInstance.get(`/api/author/submissions/${submissionId}`);
  return res.data;
};

// ============ REVIEWER APIs ============

/**
 * Get reviewer dashboard (placeholder, use getBids + getReviewerReviews)
 * @returns {Promise}
 */
export const getReviewerDashboard = async () => {
  // Combine bids and reviews data
  const bids = await getReviewerBids();
  const reviews = await getReviewerReviews();
  return { data: { bids, reviews } };
};

/**
 * Place a bid on a submission
 * @param {string} submissionId
 * @param {number} confidence - optional
 * @returns {Promise}
 */
export const placeBid = async (submissionId, confidence) => {
  const res = await axiosInstance.post('/api/reviewer/bids', {
    submissionId,
    ...(confidence && { confidence }),
  });
  return res.data;
};

/**
 * Get reviewer bids with optional filters
 * @param {Object} filters - { trackId, submissionId, page, limit }
 * @returns {Promise} { data: [...] }
 */
export const getReviewerBids = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const res = await axiosInstance.get(`/api/reviewer/bids?${params}`);
  return res.data;
};

/**
 * Create a review for a submission
 * @param {string} submissionId
 * @param {Object} reviewData - { score, comments, recommendation }
 * @returns {Promise}
 */
export const createReview = async (submissionId, reviewData) => {
  const res = await axiosInstance.post(
    `/api/reviewer/submissions/${submissionId}/reviews`,
    reviewData
  );
  return res.data;
};

/**
 * Get submission details for review (reviewer view)
 * @param {string} submissionId
 * @returns {Promise} { data: { submission with author, track populated } }
 */
export const getSubmissionForReview = async (submissionId) => {
  const res = await axiosInstance.get(`/api/reviewer/submissions/${submissionId}`);
  return res.data;
};

/**
 * Get reviewer reviews with optional filters
 * @param {Object} filters - { trackId, submissionId, page, limit }
 * @returns {Promise} { data: [...] }
 */
export const getReviewerReviews = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const res = await axiosInstance.get(`/api/reviewer/reviews?${params}`);
  return res.data;
};

/**
 * Get reviews for a specific submission (reviewer view)
 * @param {string} submissionId
 * @param {Object} filters - { trackId }
 * @returns {Promise} { data: [...] }
 */
export const getSubmissionReviewsReviewer = async (submissionId, filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const res = await axiosInstance.get(
    `/api/reviewer/submissions/${submissionId}/reviews?${params}`
  );
  return res.data;
};

/**
 * Get conferences for reviewer browsing
 * @param {Object} filters - { location, domain, sortBy, page, limit }
 * @returns {Promise} { data: { conferences } }
 */
export const getConferencesForReviewer = async (filters = {}) => {
  // Reuse author API
  return discoverConferences(filters);
};

/**
 * Get submissions for a conference (reviewer view)
 * @param {string} conferenceId
 * @param {Object} filters - { trackId, page, limit }
 * @returns {Promise} { data: [...] }
 */
export const getConferenceSubmissionsReviewer = async (conferenceId, filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const res = await axiosInstance.get(
    `/api/reviewer/conferences/${conferenceId}/submissions?${params}`
  );
  return res.data;
};

// ============ ORGANIZER APIs ============

/**
 * Get organizer dashboard (list of conferences with per-track stats)
 * @returns {Promise} { data: { conferences } }
 */
export const getOrganizerDashboard = async () => {
  const res = await axiosInstance.get('/api/organizer/conferences');
  return res.data;
};

/**
 * Get conference details (organizer view with aggregation)
 * @param {string} conferenceId
 * @returns {Promise} { data: conference with tracks and per-track stats }
 */
export const getConferenceDetailsOrganizer = async (conferenceId) => {
  const res = await axiosInstance.get(`/api/organizer/conferences/${conferenceId}`);
  return res.data;
};

/**
 * Create a conference with optional inline tracks
 * @param {Object} conferenceData - {
 *   name, description, venue, startDate, endDate, submissionDeadline,
 *   domains, fee, tracks: [{ name, description, submissionDeadline }]
 * }
 * @returns {Promise} { data: { conference, tracks } }
 */
export const createConference = async (conferenceData) => {
  const res = await axiosInstance.post('/api/organizer/conferences', conferenceData);
  return res.data;
};

/**
 * Update a conference with optional new tracks
 * @param {string} conferenceId
 * @param {Object} updateData - {
 *   name, description, venue, startDate, endDate, submissionDeadline,
 *   domains, fee, status, tracks: [{ _id, name, description, submissionDeadline }]
 * }
 * @returns {Promise} { data: { conference, newTracks } }
 */
export const updateConference = async (conferenceId, updateData) => {
  const res = await axiosInstance.put(`/api/organizer/conferences/${conferenceId}`, updateData);
  return res.data;
};

/**
 * Get submissions for a conference (organizer view)
 * @param {string} conferenceId
 * @param {Object} filters - { trackId, page, limit }
 * @returns {Promise} { data: [...] }
 */
export const getConferenceSubmissionsOrganizer = async (conferenceId, filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const res = await axiosInstance.get(
    `/api/organizer/conferences/${conferenceId}/submissions?${params}`
  );
  return res.data;
};

/**
 * Make a decision on a submission (accept/reject)
 * @param {string} submissionId
 * @param {string} decision - "accepted" or "rejected"
 * @param {string} feedback - optional
 * @returns {Promise}
 */
export const makeSubmissionDecision = async (submissionId, decision, feedback) => {
  const res = await axiosInstance.patch(
    `/api/organizer/submission/${submissionId}/decision`,
    { decision, feedback }
  );
  return res.data;
};

/**
 * Approve a submission for review
 * @param {string} submissionId
 * @returns {Promise}
 */
export const approveSubmission = async (submissionId) => {
  const res = await axiosInstance.put(`/api/organizer/submissions/${submissionId}/approve`);
  return res.data;
};

/**
 * Update submission status (legacy endpoint)
 * @param {string} submissionId
 * @param {string} status - "accepted" or "rejected"
 * @param {string} feedback - optional
 * @returns {Promise}
 */
export const updateSubmissionStatus = async (submissionId, status, feedback) => {
  const res = await axiosInstance.put(`/api/organizer/submissions/${submissionId}/status`, {
    status,
    feedback,
  });
  return res.data;
};

/**
 * Schedule a presentation slot for a submission
 * @param {string} submissionId
 * @param {Object} scheduleData - { date, startTime, endTime, venue }
 * @returns {Promise}
 */
export const scheduleSubmission = async (submissionId, scheduleData) => {
  const res = await axiosInstance.put(
    `/api/organizer/submissions/${submissionId}/schedule`,
    scheduleData
  );
  return res.data;
};

/**
 * Get submission details (organizer view)
 * @param {string} submissionId
 * @returns {Promise}
 */
export const getSubmissionDetailsOrganizer = async (submissionId) => {
  const res = await axiosInstance.get(`/api/organizer/submissions/${submissionId}`);
  return res.data;
};

/**
 * Get reviews for a submission (organizer view)
 * @param {string} submissionId
 * @param {Object} filters - { trackId }
 * @returns {Promise} { data: [...] }
 */
export const getSubmissionReviewsOrganizer = async (submissionId, filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const res = await axiosInstance.get(
    `/api/organizer/submissions/${submissionId}/reviews?${params}`
  );
  return res.data;
};

/**
 * Get all reviews across organizer's conferences
 * @param {Object} filters - { conferenceId, trackId, submissionId, reviewerId, page, limit }
 * @returns {Promise} { data: [...] }
 */
export const getOrganizerReviews = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const res = await axiosInstance.get(`/api/organizer/reviews?${params}`);
  return res.data;
};

/**
 * Get reviews for a conference
 * @param {string} conferenceId
 * @param {Object} filters - { trackId, submissionId, reviewerId, page, limit }
 * @returns {Promise} { data: [...] }
 */
export const getConferenceReviews = async (conferenceId, filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const res = await axiosInstance.get(
    `/api/organizer/conferences/${conferenceId}/reviews?${params}`
  );
  return res.data;
};

/**
 * Generate certificates for a conference
 * @param {string} conferenceId
 * @returns {Promise} { data: { createdCount, created } }
 */
export const generateCertificates = async (conferenceId) => {
  const res = await axiosInstance.post(`/api/organizer/conferences/${conferenceId}/certificates`);
  return res.data;
};

/**
 * Mark attendance for a participant
 * @param {string} registrationId
 * @param {boolean} attended
 * @returns {Promise}
 */
export const markAttendance = async (registrationId, attended) => {
  const res = await axiosInstance.put(`/api/organizer/registrations/${registrationId}/attendance`, {
    attended,
  });
  return res.data;
};

/**
 * Get participants for a conference
 * @param {string} conferenceId
 * @returns {Promise} { data: [...] }
 */
export const getConferenceParticipants = async (conferenceId) => {
  const res = await axiosInstance.get(`/api/organizer/conferences/${conferenceId}/participants`);
  return res.data;
};

// ============ PARTICIPANT APIs ============

/**
 * Get participant dashboard
 * @returns {Promise}
 */
export const getParticipantDashboard = async () => {
  const res = await axiosInstance.get('/api/participant/dashboard');
  return res.data;
};

/**
 * Discover conferences (participant view)
 * @param {Object} filters - { location, domain, minFee, maxFee, sortBy, page, limit }
 * @returns {Promise} { data: { conferences } }
 */
export const getConferencesParticipant = async (filters = {}) => {
  return discoverConferences(filters);
};

/**
 * Get conference details (participant view)
 * @param {string} conferenceId
 * @returns {Promise} { data: conference }
 */
export const getConferenceDetailsParticipant = async (conferenceId) => {
  const res = await axiosInstance.get(`/api/participant/conferences/${conferenceId}`);
  return res.data;
};

/**
 * Register for a conference
 * @param {string} conferenceId
 * @returns {Promise} { data: registration }
 */
export const registerForConference = async (conferenceId) => {
  const res = await axiosInstance.post('/api/participant/registrations', { conferenceId });
  return res.data;
};

/**
 * Get participant registrations
 * @returns {Promise} { data: [...] }
 */
export const getParticipantRegistrations = async () => {
  const res = await axiosInstance.get('/api/participant/registrations');
  return res.data;
};

/**
 * Get participant certificates
 * @returns {Promise} { data: [...] }
 */
export const getParticipantCertificates = async () => {
  const res = await axiosInstance.get('/api/participant/certificates');
  return res.data;
};

// ============ DEFAULT EXPORT (for legacy support) ============

export default axiosInstance;
```

## Usage Examples

```javascript
// In a component

import {
  loginUser,
  setAuthToken,
  getAuthorDashboard,
  submitPaper,
  getTracks,
  getOrganizerDashboard,
  createConference,
} from '../utils/api';

// 1. Login
const handleLogin = async (email, password) => {
  try {
    const response = await loginUser(email, password);
    if (response.success) {
      const { token, user } = response.data;
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      // Set axios header
      setAuthToken(token);
      // Redirect to dashboard
      navigate(`/${user.role}/dashboard`);
    }
  } catch (error) {
    console.error('Login failed:', error);
    setError(error.response?.data?.message || 'Login failed');
  }
};

// 2. Get author dashboard
const fetchDashboard = async () => {
  try {
    const response = await getAuthorDashboard();
    if (response.success) {
      setSubmissions(response.data.submissions);
      setConferences(response.data.activeConferences);
    }
  } catch (error) {
    if (error.response?.status === 401) {
      // Logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } else {
      setError('Failed to load dashboard');
    }
  }
};

// 3. Submit paper with track
const handleSubmitPaper = async (conferenceId, formData) => {
  try {
    const response = await submitPaper(conferenceId, {
      title: formData.title,
      abstract: formData.abstract,
      trackId: formData.trackId, // REQUIRED
      fileUrl: formData.fileUrl,
    });
    if (response.success) {
      toast.success('Paper submitted successfully!');
      navigate('/author/submissions');
    }
  } catch (error) {
    const errorMsg =
      error.response?.data?.errors?.[0]?.msg ||
      error.response?.data?.message ||
      'Submission failed';
    setError(errorMsg);
  }
};

// 4. Get tracks for conference
const fetchTracks = async (conferenceId) => {
  try {
    const response = await getTracks(conferenceId);
    if (response.success) {
      setTracks(response.data);
    }
  } catch (error) {
    console.error('Failed to load tracks:', error);
    setTracks([]); // Fallback
  }
};

// 5. Create conference with inline tracks
const handleCreateConference = async (formData) => {
  try {
    const response = await createConference({
      name: formData.name,
      description: formData.description,
      venue: formData.venue,
      startDate: formData.startDate,
      endDate: formData.endDate,
      submissionDeadline: formData.submissionDeadline,
      domains: formData.domains,
      fee: formData.fee,
      tracks: formData.tracks, // Array of { name, description, submissionDeadline }
    });
    if (response.success) {
      toast.success('Conference created successfully!');
      navigate(`/organizer/manage/${response.data.conference._id}`);
    }
  } catch (error) {
    const errorMsg =
      error.response?.data?.errors?.[0]?.msg ||
      error.response?.data?.message ||
      'Failed to create conference';
    setError(errorMsg);
  }
};
```

## Error Handling Pattern

```javascript
const handleApiCall = async (apiFunction, fallbackAction) => {
  try {
    const response = await apiFunction();
    if (response.success) {
      // Use response.data
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    if (error.response?.status === 401) {
      // Unauthorized - logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden
      setError('You do not have permission to perform this action');
    } else if (error.response?.status === 404) {
      // Not found
      setError('Resource not found');
    } else if (error.response?.status === 400) {
      // Validation error
      const errors = error.response.data?.errors || [];
      setError(errors[0]?.msg || error.response.data?.message || 'Invalid input');
    } else {
      setError(error.response?.data?.message || 'An error occurred');
    }
  }
};
```
