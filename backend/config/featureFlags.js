/**
 * Feature Flags for Assignment System Enhancements
 * 
 * Controls progressive rollout of new assignment features.
 * All flags default to enabled (true) except ASYNC which is opt-in.
 * Override via environment variables.
 */
module.exports = {
  /** Enable domain-based reviewer matching for no-bid papers */
  ENABLE_DOMAIN_MATCHING: process.env.ENABLE_DOMAIN_MATCHING !== 'false',

  /** Enable dry-run mode for auto-assignment */
  ENABLE_DRY_RUN: process.env.ENABLE_DRY_RUN !== 'false',

  /** Enable assignment analytics endpoint & dashboard */
  ENABLE_ASSIGNMENT_ANALYTICS: process.env.ENABLE_ASSIGNMENT_ANALYTICS !== 'false',

  /** Enable async processing for large assignment runs (future) */
  ENABLE_ASYNC_ASSIGNMENT: process.env.ENABLE_ASYNC_ASSIGNMENT === 'true',

  /** Phase 1: Require conference registration for reviewer assignment eligibility */
  ENABLE_CONFERENCE_ELIGIBILITY: process.env.ENABLE_CONFERENCE_ELIGIBILITY !== 'false',

  /** Phase 2: Apply additive bid bonus to approved bidders during assignment ranking */
  ENABLE_BID_BONUS: process.env.ENABLE_BID_BONUS !== 'false',

  /** Phase 3: Require conference registration before reviewers can place bids */
  ENABLE_REGISTRATION_REQUIRED_BIDDING: process.env.ENABLE_REGISTRATION_REQUIRED_BIDDING !== 'false',
};
