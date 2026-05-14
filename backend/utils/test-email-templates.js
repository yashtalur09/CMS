/**
 * Quick test script — renders all 13 email templates to HTML files for preview.
 * Run: node backend/utils/test-email-templates.js
 */
const fs = require('fs');
const path = require('path');
const { templates } = require('./emailService');

const outputDir = path.join(__dirname, '..', '..', 'email-previews');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Mock data
const author   = { name: 'Dr. Sarah Chen', email: 'sarah.chen@example.edu' };
const reviewer  = { name: 'Prof. James Miller', email: 'j.miller@uni.edu' };
const organizer = { name: 'Dr. Anita Patel', email: 'anita@conf.org' };
const paper = {
  _id: '682516a3f1',
  title: 'Transformer-Based Methods for Low-Resource NLP: A Comprehensive Survey',
  trackId: { name: 'Natural Language Processing' },
  createdAt: new Date().toISOString(),
  revisionCount: 1,
  duplicationCheck: {
    status: 'verified_duplicate',
    similarityScore: 87,
    matchedPaperId: 'REF-9921',
    message: 'High overlap detected with previously published work in ACL 2025 proceedings.'
  },
  coAuthors: []
};
const conference = {
  name: 'ICML 2026',
  startDate: '2026-07-15',
  reviewDeadline: '2026-06-01',
  organizerId: 'org123'
};
const stats = {
  totalSubmissions: 142,
  pendingReviews: 38,
  completedReviews: 97,
  awaitingDecision: 12,
  acceptedPapers: 45,
  rejectedPapers: 28
};

const cases = [
  ['01-submission-confirmation',    () => templates.submissionConfirmation(author, paper, conference)],
  ['02-new-submission-alert',       () => templates.newSubmissionAlert(organizer, paper, conference, author)],
  ['03-approved-for-review',        () => templates.paperApprovedForReview(author, paper, conference)],
  ['04-reviewer-assigned',          () => templates.reviewerAssigned(reviewer, paper, conference)],
  ['05-revision-requested',         () => templates.revisionRequested(author, paper, conference, 'The experimental section needs more ablation studies. Please also clarify the dataset pre-processing pipeline.')],
  ['06-all-reviews-complete',       () => templates.allReviewsComplete(organizer, paper, conference, 3)],
  ['07-review-reminder',            () => templates.reviewReminder(reviewer, paper, conference, 7)],
  ['08-revised-paper-submitted',    () => templates.revisedPaperSubmitted(reviewer, paper, conference)],
  ['09-paper-accepted',             () => templates.paperAccepted(author, paper, conference)],
  ['10-paper-rejected',             () => templates.paperRejected(author, paper, conference, 'While the topic is interesting, the experimental validation is insufficient.')],
  ['11-final-decision-reviewers',   () => templates.finalDecisionToReviewers(reviewer, paper, conference, 'accepted')],
  ['12-weekly-digest',              () => templates.weeklyDigest(organizer, conference, stats)],
  ['13-rejected-duplicate',         () => templates.paperRejectedDuplicate(author, paper, conference)],
];

for (const [name, fn] of cases) {
  const result = fn();
  const filePath = path.join(outputDir, `${name}.html`);
  fs.writeFileSync(filePath, result.html, 'utf-8');
  console.log(`  Rendered: ${name}.html  |  Subject: ${result.subject}`);
}

console.log(`\nAll 13 templates rendered to: ${outputDir}`);
console.log('Open any .html file in a browser to preview.');
