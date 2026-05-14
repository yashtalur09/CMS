/**
 * Assignment Engine — Scoring, Conflict Detection, and Index Utilities
 * 
 * Centralized business logic for reviewer-paper matching used by both
 * manual assignment (POST /api/organizer/assignments) and
 * auto-assignment (POST /api/organizer/conferences/:id/auto-assign).
 * 
 * Score Formula (Section 14 of PRD):
 *   score = bid_confidence × 30 + expertise_match × 60 + capacity_bonus × 10
 * 
 * Early rejection: if currentLoad >= maxLoad → score = 0
 */

// ─── Scoring Constants ───────────────────────────────────────────────────
const SCORE_WEIGHTS = {
  BID_CONFIDENCE: 30,
  EXPERTISE_MATCH: 60,
  CAPACITY_BONUS: 10,
};

// ─── Public Email Domains (excluded from conflict detection) ─────────────
const PUBLIC_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'aol.com', 'icloud.com', 'mail.com', 'protonmail.com',
  'live.com', 'msn.com', 'ymail.com', 'zoho.com',
];

// ─── Scoring ─────────────────────────────────────────────────────────────

/**
 * Compute the match score between a reviewer and a submission.
 * 
 * @param {Object} params
 * @param {Object|null} params.bid - Placed bid (any status: PENDING, APPROVED, etc.) or null
 * @param {Object} params.reviewer - Reviewer user document
 * @param {Object} params.submission - Submission document (with keywords)
 * @param {Object} params.conference - Conference document (with domains)
 * @param {string} params.trackName - Name of the submission's track (for expertise matching)
 * @param {number} params.currentLoad - Current number of active assignments for reviewer
 * @param {number} params.maxLoad - Maximum assignments for reviewer
 * @returns {{ score: number, reason: string }}
 */
function computeMatchScore({ bid, reviewer, submission, conference, trackName, currentLoad, maxLoad }) {
  console.log(`\n[DEBUG-SCORE] ═══════════════════════════════════════════════`);
  console.log(`[DEBUG-SCORE] Computing match score:`);
  console.log(`[DEBUG-SCORE]   Reviewer: ${reviewer?.name || 'N/A'} (${reviewer?._id})`);
  console.log(`[DEBUG-SCORE]   Submission: "${submission?.title || 'N/A'}" (${submission?._id})`);
  console.log(`[DEBUG-SCORE]   Track: "${trackName || 'N/A'}"`);
  console.log(`[DEBUG-SCORE]   Bid: ${bid ? `status=${bid.status}, confidence=${bid.confidence}, bidStrength=${bid.bidStrength}` : 'NO BID'}`);
  console.log(`[DEBUG-SCORE]   Load: ${currentLoad}/${maxLoad}`);

  // Early rejection: overloaded reviewer
  if (currentLoad >= maxLoad) {
    console.log(`[DEBUG-SCORE]   ❌ REJECTED: Reviewer at max capacity (${currentLoad} >= ${maxLoad})`);
    return { score: 0, reason: 'Reviewer at maximum capacity' };
  }

  let score = 0;
  const reasons = [];

  // 1. Bid confidence (max 30) — counts for ANY placed bid (PENDING or APPROVED)
  if (bid && bid.confidence != null) {
    const bidScore = (bid.confidence / 10) * SCORE_WEIGHTS.BID_CONFIDENCE;
    score += bidScore;
    reasons.push(`Bid confidence (${bid.status}): ${bid.confidence}/10 → ${Math.round(bidScore)}pts`);
    console.log(`[DEBUG-SCORE]   📊 Bid confidence (${bid.status}): ${bid.confidence}/10 × ${SCORE_WEIGHTS.BID_CONFIDENCE} = ${Math.round(bidScore)}pts`);
  } else if (bid) {
    // Bid placed but no confidence value → give baseline
    score += SCORE_WEIGHTS.BID_CONFIDENCE * 0.5;
    reasons.push(`Bid placed (${bid.status}, no confidence) → 15pts`);
    console.log(`[DEBUG-SCORE]   📊 Bid placed (${bid.status}) but no confidence → baseline 15pts`);
  } else {
    console.log(`[DEBUG-SCORE]   📊 No bid placed → 0pts for bid component`);
  }

  // 2. Expertise match (max 60) — reviewer expertise vs track name
  const expertiseResult = computeExpertiseMatch(reviewer, submission, conference, trackName);
  score += expertiseResult.score;
  if (expertiseResult.reason) {
    reasons.push(expertiseResult.reason);
  }
  console.log(`[DEBUG-SCORE]   🎯 Expertise match: ${Math.round(expertiseResult.score)}pts — ${expertiseResult.reason}`);

  // 3. Capacity bonus (max 10) — more available = higher bonus
  if (maxLoad > 0) {
    const capacityBonus = ((maxLoad - currentLoad) / maxLoad) * SCORE_WEIGHTS.CAPACITY_BONUS;
    score += capacityBonus;
    reasons.push(`Capacity: ${currentLoad}/${maxLoad} → ${Math.round(capacityBonus)}pts`);
    console.log(`[DEBUG-SCORE]   📦 Capacity bonus: (${maxLoad}-${currentLoad})/${maxLoad} × ${SCORE_WEIGHTS.CAPACITY_BONUS} = ${Math.round(capacityBonus)}pts`);
  } else {
    console.log(`[DEBUG-SCORE]   📦 Capacity bonus: maxLoad=0 → skipped`);
  }

  const finalScore = Math.round(Math.min(score, 100));
  console.log(`[DEBUG-SCORE]   ✅ TOTAL BASE SCORE: ${score.toFixed(2)} → capped/rounded = ${finalScore}`);
  console.log(`[DEBUG-SCORE] ═══════════════════════════════════════════════\n`);

  return {
    score: finalScore,
    reason: reasons.join('; '),
  };
}

/**
 * Compute expertise match between reviewer expertise domains and the submission's track name.
 * 
 * @param {Object} reviewer
 * @param {Object} submission
 * @param {Object} conference
 * @param {string} trackName - The track name for this submission
 * @returns {{ score: number, reason: string }}
 */
function computeExpertiseMatch(reviewer, submission, conference, trackName) {
  const reviewerDomains = (reviewer.expertiseDomains || []).map(d => d.toLowerCase().trim());

  // Build target domains from track name (split by common separators to get individual terms)
  const trackTerms = (trackName || '')
    .toLowerCase()
    .split(/[,;/&|]+/)
    .map(t => t.trim())
    .filter(Boolean);

  // Also include the full track name as one target for broader matching
  const targetDomains = [...new Set([...trackTerms, ...(trackName ? [trackName.toLowerCase().trim()] : [])])];

  console.log(`[DEBUG-EXPERTISE]   Reviewer domains: [${reviewerDomains.join(', ') || 'EMPTY'}]`);
  console.log(`[DEBUG-EXPERTISE]   Track name: "${trackName || 'N/A'}"`);
  console.log(`[DEBUG-EXPERTISE]   Track terms: [${targetDomains.join(', ') || 'EMPTY'}]`);

  if (reviewerDomains.length === 0 || targetDomains.length === 0) {
    console.log(`[DEBUG-EXPERTISE]   ⚠️ No overlap data — reviewerDomains=${reviewerDomains.length}, targetDomains=${targetDomains.length}`);
    return { score: 0, reason: 'No domain overlap data' };
  }

  // Fuzzy domain overlap (substring matching)
  const matchedDomains = reviewerDomains.filter(rd =>
    targetDomains.some(td => td.includes(rd) || rd.includes(td))
  );

  const matchCount = matchedDomains.length;

  // Binary match: if ANY reviewer domain matches the track, award full expertise score.
  // Having more expertise domains should not penalize the reviewer.
  const expertiseScore = matchCount > 0 ? SCORE_WEIGHTS.EXPERTISE_MATCH : 0;

  console.log(`[DEBUG-EXPERTISE]   Matched: [${matchedDomains.join(', ') || 'NONE'}] (${matchCount} of ${reviewerDomains.length} domains match)`);
  console.log(`[DEBUG-EXPERTISE]   Result: ${matchCount > 0 ? `✅ MATCH → full ${SCORE_WEIGHTS.EXPERTISE_MATCH}pts` : '❌ No match → 0pts'}`);

  return {
    score: expertiseScore,
    reason: matchCount > 0
      ? `Track match: [${matchedDomains.slice(0, 3).join(', ')}] → ${expertiseScore}pts`
      : 'No track match',
  };
}

// ─── Conflict Detection ──────────────────────────────────────────────────

/**
 * Check for conflicts between a reviewer and a submission.
 * Returns true if a conflict exists.
 * 
 * Checks:
 *   1. Self-review (reviewer is the author)
 *   2. Co-author conflict (reviewer is listed as co-author)
 *   3. Affiliation overlap (same institution)
 *   4. Email domain overlap (institutional only, public domains excluded)
 * 
 * @param {Object} reviewer - Reviewer user document
 * @param {Object} submission - Submission document (with coAuthors)
 * @param {Object} author - Author user document
 * @returns {boolean} true if conflict detected
 */
function hasConflict(reviewer, submission, author) {
  if (!reviewer || !author) {
    console.log(`[DEBUG-CONFLICT] ⚠️ Missing data — reviewer=${!!reviewer}, author=${!!author} → CONFLICT (safety)`);
    return true; // Safety: missing data = conflict
  }

  const reviewerId = reviewer._id.toString();
  const authorId = author._id.toString();

  // 1. Self-review
  if (reviewerId === authorId) {
    console.log(`[DEBUG-CONFLICT] ❌ Self-review: reviewer=${reviewerId} === author=${authorId}`);
    return true;
  }

  // 2. Co-author conflict
  if (submission.coAuthors && submission.coAuthors.length > 0) {
    const reviewerEmail = (reviewer.email || '').toLowerCase();

    // Check by userId
    const coAuthorUserIds = submission.coAuthors
      .filter(ca => ca.userId)
      .map(ca => ca.userId.toString());
    if (coAuthorUserIds.includes(reviewerId)) {
      console.log(`[DEBUG-CONFLICT] ❌ Co-author conflict (userId): reviewer=${reviewerId} in coAuthorUserIds=[${coAuthorUserIds.join(', ')}]`);
      return true;
    }

    // Check by email
    const coAuthorEmails = submission.coAuthors
      .map(ca => (ca.email || '').toLowerCase())
      .filter(Boolean);
    if (reviewerEmail && coAuthorEmails.includes(reviewerEmail)) {
      console.log(`[DEBUG-CONFLICT] ❌ Co-author conflict (email): ${reviewerEmail} in [${coAuthorEmails.join(', ')}]`);
      return true;
    }
  }

  // 3. Affiliation overlap
  if (reviewer.affiliation && author.affiliation) {
    const revAff = reviewer.affiliation.toLowerCase().trim();
    const authAff = author.affiliation.toLowerCase().trim();
    if (revAff && authAff && (revAff === authAff || revAff.includes(authAff) || authAff.includes(revAff))) {
      console.log(`[DEBUG-CONFLICT] ❌ Affiliation conflict: reviewer="${revAff}" vs author="${authAff}"`);
      return true;
    }
  }

  // 4. Email domain overlap (institutional only)
  if (reviewer.email && author.email) {
    const revDomain = reviewer.email.split('@')[1]?.toLowerCase();
    const authDomain = author.email.split('@')[1]?.toLowerCase();
    if (revDomain && authDomain &&
        !PUBLIC_EMAIL_DOMAINS.includes(revDomain) &&
        revDomain === authDomain) {
      console.log(`[DEBUG-CONFLICT] ❌ Email domain conflict: ${revDomain} === ${authDomain} (institutional)`);
      return true;
    }
  }

  return false;
}

// ─── Index Building Utilities ────────────────────────────────────────────

/**
 * Build a bid map: submissionId → [{ reviewerId, bid }]
 * @param {Array} approvedBids
 * @returns {Map<string, Array>}
 */
function buildBidMap(approvedBids) {
  const bidMap = new Map();
  for (const bid of approvedBids) {
    const subId = bid.submissionId.toString();
    if (!bidMap.has(subId)) {
      bidMap.set(subId, []);
    }
    bidMap.get(subId).push({
      reviewerId: bid.reviewerId.toString(),
      bid,
    });
  }
  return bidMap;
}

/**
 * Build a reviewer-keyed bid lookup: "reviewerId_submissionId" → bid
 * @param {Array} approvedBids
 * @returns {Map<string, Object>}
 */
function buildReviewerBidLookup(approvedBids) {
  const lookup = new Map();
  for (const bid of approvedBids) {
    const key = `${bid.reviewerId.toString()}_${bid.submissionId.toString()}`;
    lookup.set(key, bid);
  }
  return lookup;
}

/**
 * Build a capacity cache: reviewerId → { used, max }
 * @param {Array} reviewers - All reviewer user documents
 * @param {Array} existingAssignments - All ACTIVE assignments for the conference
 * @returns {Map<string, { used: number, max: number }>}
 */
function buildCapacityCache(reviewers, existingAssignments) {
  const cache = new Map();

  // Initialize all reviewers with their max load
  for (const reviewer of reviewers) {
    cache.set(reviewer._id.toString(), {
      used: 0,
      max: reviewer.maxLoad || 10,
    });
  }

  // Count existing active assignments
  for (const assignment of existingAssignments) {
    const revId = assignment.reviewerId.toString();
    if (cache.has(revId)) {
      cache.get(revId).used += 1;
    } else {
      // Reviewer may not be in the current set (e.g., deleted user)
      cache.set(revId, { used: 1, max: 10 });
    }
  }

  return cache;
}

/**
 * Build a conflict cache: Set of "reviewerId|submissionId" pairs with known conflicts.
 * Pre-computed for O(1) conflict lookups during assignment.
 * 
 * @param {Array} reviewers
 * @param {Array} submissions - Submissions with populated authorId and coAuthors
 * @returns {Set<string>}
 */
function buildConflictCache(reviewers, submissions) {
  const cache = new Set();

  for (const submission of submissions) {
    const author = submission.authorId;
    if (!author) continue;

    for (const reviewer of reviewers) {
      if (hasConflict(reviewer, submission, author)) {
        cache.add(`${reviewer._id.toString()}|${submission._id.toString()}`);
      }
    }
  }

  return cache;
}

/**
 * Build a domain index: domain (lowercase) → Set of reviewerIds
 * @param {Array} reviewers
 * @returns {Map<string, Set<string>>}
 */
function buildDomainIndex(reviewers) {
  const index = new Map();

  for (const reviewer of reviewers) {
    const domains = (reviewer.expertiseDomains || []).map(d => d.toLowerCase().trim()).filter(Boolean);
    const revId = reviewer._id.toString();

    for (const domain of domains) {
      if (!index.has(domain)) {
        index.set(domain, new Set());
      }
      index.get(domain).add(revId);
    }
  }

  return index;
}

/**
 * Build a paper assignments tracker: submissionId → count of active assignments
 * @param {Array} existingAssignments
 * @returns {Map<string, number>}
 */
function buildPaperAssignmentCounts(existingAssignments) {
  const counts = new Map();
  for (const assignment of existingAssignments) {
    const subId = assignment.submissionId.toString();
    counts.set(subId, (counts.get(subId) || 0) + 1);
  }
  return counts;
}

/**
 * Build an existing assignment lookup for duplicate checking.
 * @param {Array} existingAssignments
 * @returns {Set<string>} Set of "reviewerId_submissionId" keys
 */
function buildExistingAssignmentSet(existingAssignments) {
  const set = new Set();
  for (const assignment of existingAssignments) {
    set.add(`${assignment.reviewerId.toString()}_${assignment.submissionId.toString()}`);
  }
  return set;
}

// ─── Tie-Breaking ────────────────────────────────────────────────────────

/**
 * Sort candidates for bid-covered papers.
 * Priority: score DESC → bid timestamp ASC → reviewer ID hash
 * 
 * @param {Array} candidates - Array of { score, bidTimestamp, reviewerId, ... }
 */
function sortBidCoveredCandidates(candidates) {
  candidates.sort((a, b) => {
    // 1. Higher score first
    if (b.score !== a.score) return b.score - a.score;
    // 2. Earlier bid timestamp first
    const aTime = a.bidTimestamp ? new Date(a.bidTimestamp).getTime() : Infinity;
    const bTime = b.bidTimestamp ? new Date(b.bidTimestamp).getTime() : Infinity;
    if (aTime !== bTime) return aTime - bTime;
    // 3. Reviewer ID hash (deterministic)
    return a.reviewerId.toString().localeCompare(b.reviewerId.toString());
  });
}

/**
 * Sort candidates for no-bid papers.
 * Priority: score DESC → least recently assigned first → reviewer ID hash
 * 
 * @param {Array} candidates - Array of { score, lastAssignedAt, reviewerId, ... }
 */
function sortNoBidCandidates(candidates) {
  candidates.sort((a, b) => {
    // 1. Higher score first
    if (b.score !== a.score) return b.score - a.score;
    // 2. Least recently assigned first
    const aLast = a.lastAssignedAt ? new Date(a.lastAssignedAt).getTime() : 0;
    const bLast = b.lastAssignedAt ? new Date(b.lastAssignedAt).getTime() : 0;
    if (aLast !== bLast) return aLast - bLast;
    // 3. Reviewer ID hash (deterministic)
    return a.reviewerId.toString().localeCompare(b.reviewerId.toString());
  });
}

// ─── Domain Matching ─────────────────────────────────────────────────────

/**
 * Find domain-matched reviewers for a submission using the domain index.
 * 
 * @param {Object} submission - Submission with keywords
 * @param {Object} conference - Conference with domains
 * @param {Map} domainIndex - domain → Set<reviewerId>
 * @returns {Set<string>} Set of reviewer IDs that match
 */
function findDomainMatchedReviewers(submission, conference, domainIndex) {
  const targetDomains = [
    ...(submission.keywords || []),
    ...(conference.domains || []),
  ].map(d => d.toLowerCase().trim()).filter(Boolean);

  const matchedReviewerIds = new Set();

  for (const domain of targetDomains) {
    // Exact match
    if (domainIndex.has(domain)) {
      for (const revId of domainIndex.get(domain)) {
        matchedReviewerIds.add(revId);
      }
    }

    // Partial/substring match
    for (const [indexDomain, reviewerIds] of domainIndex) {
      if (indexDomain.includes(domain) || domain.includes(indexDomain)) {
        for (const revId of reviewerIds) {
          matchedReviewerIds.add(revId);
        }
      }
    }
  }

  return matchedReviewerIds;
}

// ─── Bid Bonus (Additive Scoring Layer) ──────────────────────────────────

/**
 * Configurable bid bonus values per bid strength tier.
 * These are additive-only — applied on top of the existing score.
 * 
 * PRD Section 9.5:
 *   Strong Accept → +100
 *   Interested    → +75
 *   Neutral       → +40
 *   Weak Interest → +10
 *   No Bid        → +0
 * 
 * The bonus values can be overridden via environment variables.
 */
const BID_BONUS_VALUES = {
  STRONG_ACCEPT: parseInt(process.env.BID_BONUS_STRONG_ACCEPT || '100', 10),
  INTERESTED: parseInt(process.env.BID_BONUS_INTERESTED || '75', 10),
  NEUTRAL: parseInt(process.env.BID_BONUS_NEUTRAL || '40', 10),
  WEAK_INTEREST: parseInt(process.env.BID_BONUS_WEAK_INTEREST || '10', 10),
  DEFAULT: parseInt(process.env.BID_BONUS_DEFAULT || '50', 10), // For approved bids without explicit strength
};

/**
 * Calculate the additive bid bonus for a bidder.
 * 
 * Any placed bid (PENDING or APPROVED) receives a bonus. The bonus value is determined by
 * the bid's strength tier, with a fallback based on confidence score.
 * 
 * @param {Object|null} bid - Bid document (any status) or null
 * @returns {{ bonus: number, reason: string }}
 */
function calculateBidBonus(bid) {
  console.log(`[DEBUG-BID-BONUS] Calculating bid bonus:`);
  console.log(`[DEBUG-BID-BONUS]   Bid: ${bid ? `id=${bid._id}, status=${bid.status}, confidence=${bid.confidence}, bidStrength=${bid.bidStrength}` : 'NULL'}`);

  if (!bid) {
    console.log(`[DEBUG-BID-BONUS]   → No bonus (no bid placed)`);
    return { bonus: 0, reason: '' };
  }

  // Use explicit bidStrength if available
  if (bid.bidStrength && BID_BONUS_VALUES[bid.bidStrength] !== undefined) {
    const bonus = BID_BONUS_VALUES[bid.bidStrength];
    console.log(`[DEBUG-BID-BONUS]   → Explicit bidStrength "${bid.bidStrength}" → +${bonus}pts`);
    return {
      bonus,
      reason: `Bid bonus (${bid.bidStrength}): +${bonus}pts`,
    };
  }

  // Fallback: derive strength from confidence score (0-10)
  if (bid.confidence != null && bid.confidence > 0) {
    let derivedStrength;
    if (bid.confidence >= 9) derivedStrength = 'STRONG_ACCEPT';
    else if (bid.confidence >= 7) derivedStrength = 'INTERESTED';
    else if (bid.confidence >= 4) derivedStrength = 'NEUTRAL';
    else derivedStrength = 'WEAK_INTEREST';

    const bonus = BID_BONUS_VALUES[derivedStrength];
    console.log(`[DEBUG-BID-BONUS]   → Derived from confidence ${bid.confidence}/10 → "${derivedStrength}" → +${bonus}pts`);
    return {
      bonus,
      reason: `Bid bonus (confidence ${bid.confidence}/10 → ${derivedStrength}): +${bonus}pts`,
    };
  }

  // Default bonus for approved bids without strength or confidence data
  console.log(`[DEBUG-BID-BONUS]   → Default bonus (no strength/confidence data) → +${BID_BONUS_VALUES.DEFAULT}pts`);
  return {
    bonus: BID_BONUS_VALUES.DEFAULT,
    reason: `Bid bonus (approved, default): +${BID_BONUS_VALUES.DEFAULT}pts`,
  };
}

/**
 * Compute the final assignment ranking score.
 * 
 * finalScore = existingReviewerScore + bidBonus
 * 
 * This is the ONLY place where bid bonus and base score are combined.
 * The existing scoring formula is never modified.
 * 
 * @param {number} baseScore - Score from computeMatchScore (unchanged)
 * @param {number} bidBonus - Additive bid bonus
 * @returns {number}
 */
function computeFinalScore(baseScore, bidBonus) {
  const final = baseScore + bidBonus;
  console.log(`[DEBUG-FINAL-SCORE] baseScore=${baseScore} + bidBonus=${bidBonus} = finalScore=${final}`);
  return final;
}

// ─── Exports ─────────────────────────────────────────────────────────────

module.exports = {
  // Constants
  SCORE_WEIGHTS,
  PUBLIC_EMAIL_DOMAINS,
  BID_BONUS_VALUES,

  // Scoring
  computeMatchScore,
  computeExpertiseMatch,

  // Bid Bonus (additive layer)
  calculateBidBonus,
  computeFinalScore,

  // Conflict detection
  hasConflict,

  // Index building
  buildBidMap,
  buildReviewerBidLookup,
  buildCapacityCache,
  buildConflictCache,
  buildDomainIndex,
  buildPaperAssignmentCounts,
  buildExistingAssignmentSet,

  // Tie-breaking
  sortBidCoveredCandidates,
  sortNoBidCandidates,

  // Domain matching
  findDomainMatchedReviewers,
};
