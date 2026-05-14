const { BrevoClient } = require('@getbrevo/brevo');
const {
  buildEmailLayout,
  metadataBox,
  bodyText,
  feedbackBlock,
  orderedList,
  PORTAL_URL,
} = require('./emailTemplateLayout');

// Create Brevo client
const createBrevoClient = () => {
  if (process.env.BREVO_API_KEY) {
    return new BrevoClient({
      apiKey: process.env.BREVO_API_KEY
    });
  }
  return null;
};

// Development fallback - logs to console
const devSendMail = async (mailOptions) => {
  console.log('EMAIL (Development Mode):', {
    to: mailOptions.to,
    cc: mailOptions.cc || 'None',
    subject: mailOptions.subject,
    text: mailOptions.text?.substring(0, 200) + '...'
  });
  return { messageId: 'dev-' + Date.now() };
};

// ─────────────────────────────────────────────────
// Email templates
// ─────────────────────────────────────────────────

const templates = {
  // 1. Paper Submission Confirmation to Author
  submissionConfirmation: (author, paper, conference) => ({
    subject: `[eConfMate] Successful Submission: ${paper.title}`,
    html: buildEmailLayout({
      title: 'Submission Received',
      icon: 'check',
      buttonText: 'View Your Submission',
      body:
        bodyText(`Dear ${author.name},`) +
        bodyText(`Thank you for choosing <strong>eConfMate</strong> to manage your submission. This email confirms that your manuscript, <strong>&ldquo;${paper.title}&rdquo;</strong>, has been successfully received for <strong>${conference.name}</strong>.`) +
        metadataBox([
          ['Paper ID', `#${paper._id}`],
          ['Title', paper.title],
          ['Track', paper.trackId?.name || 'N/A'],
          ['Submitted', new Date(paper.createdAt).toLocaleString()],
        ]) +
        bodyText('<strong>What happens next?</strong>') +
        orderedList([
          'Your paper will undergo an initial screening by the conference organizers.',
          'If it meets the requirements, it will be assigned to the Technical Program Committee for peer review.',
          'You can track the real-time status of your paper and manage co-author details through our portal.',
        ]),
    }),
    text: `Dear ${author.name},\n\nThank you for choosing eConfMate. Your manuscript "${paper.title}" has been successfully received for ${conference.name}.\n\nPaper ID: #${paper._id}\nTrack: ${paper.trackId?.name || 'N/A'}\nSubmitted: ${new Date(paper.createdAt).toLocaleString()}\n\nYou can track the status of your paper at ${PORTAL_URL}.`
  }),

  // 2. New Submission Alert to Organizer
  newSubmissionAlert: (organizer, paper, conference, author) => ({
    subject: `[Action Required] New Manuscript Submitted: ${paper._id}`,
    html: buildEmailLayout({
      title: 'New Manuscript Submitted',
      icon: 'inbox',
      buttonText: 'Access Organizer Dashboard',
      body:
        bodyText(`Hello Organizer,`) +
        bodyText(`A new manuscript has been submitted to your conference, <strong>${conference.name}</strong>, and requires your attention.`) +
        metadataBox([
          ['Paper ID', `#${paper._id}`],
          ['Title', paper.title],
          ['Primary Author', `${author.name} (${author.email})`],
          ['Track', paper.trackId?.name || 'N/A'],
          ['Submitted', new Date(paper.createdAt).toLocaleString()],
        ]) +
        bodyText('Please log in to the eConfMate dashboard to perform the initial screening and begin the reviewer assignment process.'),
    }),
    text: `Hello Organizer,\n\nA new manuscript has been submitted to ${conference.name}.\n\nPaper ID: #${paper._id}\nTitle: ${paper.title}\nAuthor: ${author.name} (${author.email})\nTrack: ${paper.trackId?.name || 'N/A'}\n\nPlease log in to perform the initial screening.`
  }),

  // 3. Paper Approved for Review
  paperApprovedForReview: (author, paper, conference) => ({
    subject: `Status Update: Your paper has moved to Technical Review`,
    html: buildEmailLayout({
      title: 'Moved to Technical Review',
      icon: 'search',
      buttonText: 'View Status',
      body:
        bodyText(`Dear ${author.name},`) +
        bodyText(`We are pleased to inform you that your paper, <strong>&ldquo;${paper.title}&rdquo;</strong>, has successfully passed the initial screening phase for <strong>${conference.name}</strong>.`) +
        metadataBox([
          ['Paper ID', `#${paper._id}`],
          ['Title', paper.title],
          ['Conference', conference.name],
        ]) +
        bodyText('The manuscript has now been forwarded to the Technical Review Committee. During this stage, independent experts in your field will evaluate your work based on originality, technical quality, and relevance.') +
        bodyText('We will notify you immediately once the review results are available. Thank you for your patience.'),
    }),
    text: `Dear ${author.name},\n\nYour paper "${paper.title}" has passed the initial screening for ${conference.name} and has been forwarded to the Technical Review Committee.\n\nWe will notify you once results are available.`
  }),

  // 4. Reviewer Assignment Notification
  reviewerAssigned: (reviewer, paper, conference) => ({
    subject: `Invitation to Review for ${conference.name}: ${paper._id}`,
    html: buildEmailLayout({
      title: 'Review Invitation',
      icon: 'clipboard',
      buttonText: 'Accept or Decline',
      body:
        bodyText(`Dear ${reviewer.name},`) +
        bodyText(`Because of your recognized expertise in this field, we would like to invite you to review a manuscript for <strong>${conference.name}</strong>.`) +
        metadataBox([
          ['Paper ID', `#${paper._id}`],
          ['Title', paper.title],
          ['Track', paper.trackId?.name || 'N/A'],
          ['Review Deadline', conference.reviewDeadline ? new Date(conference.reviewDeadline).toLocaleDateString() : 'TBD'],
        ]) +
        bodyText('Your contribution is essential to maintaining the high academic standards of this conference. If you are unable to review this paper, please let us know as soon as possible so we may reassign it.'),
    }),
    text: `Dear ${reviewer.name},\n\nYou have been invited to review a manuscript for ${conference.name}.\n\nPaper ID: #${paper._id}\nTitle: ${paper.title}\nDeadline: ${conference.reviewDeadline ? new Date(conference.reviewDeadline).toLocaleDateString() : 'TBD'}\n\nPlease log in to accept or decline.`
  }),

  // 5. Revision Requested
  revisionRequested: (author, paper, conference, feedback) => ({
    subject: `Action Required: Revised Manuscript Requested for #${paper._id}`,
    html: buildEmailLayout({
      title: 'Revision Requested',
      icon: 'edit',
      buttonText: 'Upload Revision',
      body:
        bodyText(`Dear ${author.name},`) +
        bodyText(`The peer review process for your submission, <strong>&ldquo;${paper.title}&rdquo;</strong>, has reached a preliminary stage. The reviewers have expressed interest in your work but have requested specific revisions before a final decision can be made.`) +
        metadataBox([
          ['Paper ID', `#${paper._id}`],
          ['Title', paper.title],
          ['Conference', conference.name],
        ]) +
        bodyText('<strong>Reviewer Feedback Summary:</strong>') +
        feedbackBlock(feedback || 'Please see the detailed feedback in the portal.') +
        bodyText('<strong>Submission Instructions:</strong>') +
        orderedList([
          'Log in to eConfMate to read the full detailed reports.',
          'Address each point raised by the reviewers in your revised manuscript.',
          'Upload the new version and a &ldquo;Response to Reviewers&rdquo; document.',
        ]),
    }),
    text: `Dear ${author.name},\n\nRevisions have been requested for your paper "${paper.title}" at ${conference.name}.\n\nFeedback: ${feedback || 'Please see the detailed feedback in the portal.'}\n\nPlease submit your revised paper through the portal.`
  }),

  // 6. All Reviews Complete (to Organizer)
  allReviewsComplete: (organizer, paper, conference, reviewCount) => ({
    subject: `Decision Ready: All Reviews Submitted for #${paper._id}`,
    html: buildEmailLayout({
      title: 'All Reviews Complete',
      icon: 'clipboard',
      buttonText: 'Finalize Decision',
      body:
        bodyText(`Hello Organizer,`) +
        bodyText(`The review cycle for the paper <strong>&ldquo;${paper.title}&rdquo;</strong> (ID: #${paper._id}) is now complete. All assigned reviewers have submitted their scores and final recommendations.`) +
        metadataBox([
          ['Paper ID', `#${paper._id}`],
          ['Title', paper.title],
          ['Total Reviews', reviewCount],
        ]) +
        bodyText('The paper is now awaiting your final decision (Accept, Reject, or Further Revision).'),
    }),
    text: `Hello Organizer,\n\nAll reviewers have submitted their reviews for paper "${paper.title}" (ID: #${paper._id}).\n\nTotal Reviews: ${reviewCount}\n\nThe paper is ready for your final decision.`
  }),

  // 7. Review Reminder
  reviewReminder: (reviewer, paper, conference, daysLeft) => ({
    subject: `Reminder: Your Review for ${conference.name} is Due Soon`,
    html: buildEmailLayout({
      title: 'Review Reminder',
      icon: 'clock',
      buttonText: 'Complete Your Review',
      body:
        bodyText(`Dear ${reviewer.name},`) +
        bodyText(`We hope this email finds you well. This is a friendly reminder that the deadline for your review of paper <strong>&ldquo;${paper.title}&rdquo;</strong> is approaching.`) +
        metadataBox([
          ['Paper ID', `#${paper._id}`],
          ['Title', paper.title],
          ['Days Remaining', `${daysLeft} days`],
        ]) +
        bodyText('Timely reviews are crucial for us to provide authors with prompt decisions. If you require a short extension or are facing any technical difficulties, please contact the conference organizers through the portal.'),
    }),
    text: `Dear ${reviewer.name},\n\nThis is a reminder that your review for paper "${paper.title}" is approaching its deadline.\n\n${daysLeft} days remaining. Please submit your review soon.`
  }),

  // 8. Revised Paper Submitted (to Reviewers)
  revisedPaperSubmitted: (reviewer, paper, conference) => ({
    subject: `Update: Revised Manuscript Uploaded for #${paper._id}`,
    html: buildEmailLayout({
      title: 'Revised Manuscript Submitted',
      icon: 'upload',
      buttonText: 'Evaluate Revision',
      body:
        bodyText(`Dear ${reviewer.name},`) +
        bodyText(`The authors of <strong>&ldquo;${paper.title}&rdquo;</strong> have submitted their revised manuscript and addressed the feedback provided during the first round of reviews.`) +
        metadataBox([
          ['Paper ID', `#${paper._id}`],
          ['Title', paper.title],
          ['Revision', `#${paper.revisionCount || 1}`],
        ]) +
        bodyText('As an original reviewer of this work, we invite you to evaluate whether the changes made are satisfactory. Your previous comments and the author&rsquo;s responses are available for your reference in the portal.'),
    }),
    text: `Dear ${reviewer.name},\n\nThe authors of "${paper.title}" have submitted a revised manuscript (Revision #${paper.revisionCount || 1}).\n\nPlease review the changes and provide your feedback.`
  }),

  // 9. Paper Accepted
  paperAccepted: (author, paper, conference) => ({
    subject: `CONGRATULATIONS: Your Paper has been Accepted for ${conference.name}`,
    html: buildEmailLayout({
      title: 'Paper Accepted',
      icon: 'award',
      buttonText: 'View Next Steps',
      body:
        bodyText(`Dear ${author.name},`) +
        bodyText(`On behalf of the Program Committee, we are delighted to inform you that your paper, <strong>&ldquo;${paper.title}&rdquo;</strong>, has been <strong>ACCEPTED</strong> for presentation at <strong>${conference.name}</strong>.`) +
        metadataBox([
          ['Paper ID', `#${paper._id}`],
          ['Title', paper.title],
          ['Conference', conference.name],
          ['Conference Date', conference.startDate ? new Date(conference.startDate).toLocaleDateString() : 'TBD'],
        ]) +
        bodyText('The reviewers found your work to be a significant contribution to the field. Please log in to the portal to download your formal Acceptance Letter and view the final instructions regarding:') +
        orderedList([
          'Final Camera-Ready manuscript submission.',
          'Copyright transfer requirements.',
          'Registration and presentation scheduling.',
        ]) +
        bodyText('Congratulations on this achievement! We look forward to seeing your work presented.'),
    }),
    text: `Dear ${author.name},\n\nCongratulations! Your paper "${paper.title}" has been ACCEPTED for presentation at ${conference.name}.\n\nPlease prepare your camera-ready version and register for the conference.\n\nVisit ${PORTAL_URL} for next steps.`
  }),

  // 10. Paper Rejected
  paperRejected: (author, paper, conference, feedback) => ({
    subject: `Decision Notification for ${conference.name}: ${paper._id}`,
    html: buildEmailLayout({
      title: 'Decision Notification',
      icon: 'info',
      body:
        bodyText(`Dear ${author.name},`) +
        bodyText(`Thank you for your interest in <strong>${conference.name}</strong> and for submitting your work, <strong>&ldquo;${paper.title}&rdquo;</strong>.`) +
        metadataBox([
          ['Paper ID', `#${paper._id}`],
          ['Title', paper.title],
        ]) +
        bodyText('The Program Committee has completed a thorough evaluation of all submissions. Due to the high volume of high-quality papers and limited presentation slots, we regret to inform you that your paper was not selected for inclusion in this year&rsquo;s program.') +
        (feedback ? feedbackBlock(feedback) : '') +
        bodyText('We encourage you to review the feedback provided by the experts in the eConfMate portal, which we hope will be beneficial for your future research and submissions.'),
    }),
    text: `Dear ${author.name},\n\nThank you for your interest in ${conference.name}.\n\nYour paper "${paper.title}" was not selected for inclusion in this year's program.\n\n${feedback ? 'Feedback: ' + feedback + '\n\n' : ''}We encourage you to review the feedback in the portal.`
  }),

  // 11. Final Decision to Reviewers
  finalDecisionToReviewers: (reviewer, paper, conference, decision) => ({
    subject: `Final Decision Update for Paper #${paper._id}`,
    html: buildEmailLayout({
      title: 'Final Decision Update',
      icon: 'info',
      body:
        bodyText(`Dear ${reviewer.name},`) +
        bodyText(`We are writing to inform you that a final decision has been made for the manuscript you reviewed: <strong>&ldquo;${paper.title}&rdquo;</strong>.`) +
        metadataBox([
          ['Paper ID', `#${paper._id}`],
          ['Title', paper.title],
          ['Final Decision', decision.toUpperCase()],
        ]) +
        bodyText(`Thank you once again for your time and the detailed insights you provided. Your contribution has been vital in ensuring the academic integrity of <strong>${conference.name}</strong>.`),
    }),
    text: `Dear ${reviewer.name},\n\nA final decision has been made for "${paper.title}".\n\nFinal Decision: ${decision.toUpperCase()}\n\nThank you for your contribution to ${conference.name}.`
  }),

  // 12. Weekly Digest to Organizer
  weeklyDigest: (organizer, conference, stats) => ({
    subject: `eConfMate: Weekly Status Report for ${conference.name}`,
    html: buildEmailLayout({
      title: 'Weekly Status Report',
      icon: 'barchart',
      buttonText: 'Manage Conference',
      body:
        bodyText(`Hello Organizer,`) +
        bodyText(`Here is your weekly activity summary for <strong>${conference.name}</strong> (Week ending ${new Date().toLocaleDateString()}).`) +
        metadataBox([
          ['Total Submissions', stats.totalSubmissions || 0],
          ['Pending Reviews', stats.pendingReviews || 0],
          ['Completed Reviews', stats.completedReviews || 0],
          ['Pending Decisions', stats.awaitingDecision || 0],
          ['Accepted Papers', stats.acceptedPapers || 0],
          ['Rejected Papers', stats.rejectedPapers || 0],
        ]) +
        (stats.pendingReviews > 0
          ? feedbackBlock(`<strong>${stats.pendingReviews} reviews</strong> are still pending. Consider sending reminders to reviewers.`)
          : '') +
        (stats.awaitingDecision > 0
          ? feedbackBlock(`<strong>${stats.awaitingDecision} papers</strong> have completed reviews and are ready for your decision.`)
          : '') +
        bodyText('Log in to the dashboard to view detailed reports and manage pending tasks.'),
    }),
    text: `Weekly Status Report - ${conference.name}\n\nTotal Submissions: ${stats.totalSubmissions || 0}\nPending Reviews: ${stats.pendingReviews || 0}\nCompleted Reviews: ${stats.completedReviews || 0}\nPending Decisions: ${stats.awaitingDecision || 0}\nAccepted: ${stats.acceptedPapers || 0}\nRejected: ${stats.rejectedPapers || 0}\n\nVisit ${PORTAL_URL} for details.`
  }),

  // 13. Paper Rejected Due to Duplication (PDE Integration)
  paperRejectedDuplicate: (author, paper, conference) => ({
    subject: `Paper Submission Rejected — Duplicate Detected — ${conference.name}`,
    html: buildEmailLayout({
      title: 'Submission Rejected — Duplicate Detected',
      icon: 'alertTriangle',
      body:
        bodyText(`Dear ${author.name},`) +
        bodyText(`Your paper submission was rejected because it was identified as <strong>${paper.duplicationCheck?.status === 'verified_duplicate' ? 'a verified duplicate' : 'suspicious (potential duplicate)'}</strong> by the PaperDuplicationEngine during organizer review.`) +
        metadataBox([
          ['Paper', paper.title],
          ['Conference', conference.name],
          ['Duplication Status', (paper.duplicationCheck?.status || 'unknown').replace(/_/g, ' ').toUpperCase()],
          ['Similarity Score', `${paper.duplicationCheck?.similarityScore ?? 'N/A'}%`],
          ...(paper.duplicationCheck?.matchedPaperId ? [['Matched Reference', paper.duplicationCheck.matchedPaperId]] : []),
          ['Decision Date', new Date().toLocaleString()],
        ]) +
        (paper.duplicationCheck?.message
          ? feedbackBlock(`<strong>Analysis Details:</strong> ${paper.duplicationCheck.message}`)
          : '') +
        bodyText('If you believe this is in error, please contact the conference organizer directly to discuss an appeal.'),
    }),
    text: `Dear ${author.name},\n\nYour paper "${paper.title}" was rejected due to duplication detection at ${conference.name}.\n\nSimilarity Score: ${paper.duplicationCheck?.similarityScore ?? 'N/A'}%\nStatus: ${(paper.duplicationCheck?.status || 'unknown').replace(/_/g, ' ')}\n\nIf you believe this is an error, please contact the conference organizer.`
  })
};

// Send email function using Brevo Transactional Email API
const sendEmail = async (to, template, cc = null) => {
  try {
    const brevoClient = createBrevoClient();

    // If no Brevo API key, use development fallback
    if (!brevoClient) {
      return await devSendMail({
        to: Array.isArray(to) ? to.join(', ') : to,
        cc: cc,
        subject: template.subject,
        text: template.text
      });
    }

    // Build the recipient list
    const toRecipients = Array.isArray(to)
      ? to.map(email => ({ email }))
      : [{ email: to }];

    // Build Brevo email payload
    const emailPayload = {
      sender: {
        name: process.env.BREVO_SENDER_NAME || 'CMS System',
        email: process.env.BREVO_SENDER_EMAIL || 'econfmate@gmail.com'
      },
      to: toRecipients,
      subject: template.subject,
      htmlContent: template.html,
      textContent: template.text
    };

    // Add CC if provided (for co-authors)
    if (cc) {
      emailPayload.cc = Array.isArray(cc)
        ? cc.map(email => ({ email }))
        : [{ email: cc }];
    }

    // Send via Brevo API
    const result = await brevoClient.transactionalEmails.sendTransacEmail(emailPayload);

    console.log('Email sent via Brevo:', {
      to: Array.isArray(to) ? to.join(', ') : to,
      cc: cc || 'None',
      subject: template.subject,
      messageId: result.messageId
    });

    return { messageId: result.messageId, ...result };
  } catch (error) {
    console.error('Brevo email error:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  templates
};
