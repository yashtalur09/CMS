/**
 * Migration: Backfill Assignment Source Values
 * 
 * Backfills existing assignments with the new source enum values:
 *   - 'AUTO' assignments with a bidId → 'BID'
 *   - Assignments without a source field → 'MANUAL'
 *   - Also sets assignedCount on submissions based on current assignedReviewers
 * 
 * Usage: node utils/migrations/backfillAssignmentSource.js
 * 
 * Safe to run multiple times (idempotent).
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Assignment = require('../../models/Assignment');
    const Submission = require('../../models/Submission');

    // 1. Backfill 'AUTO' with bidId → 'BID'
    const bidResult = await Assignment.updateMany(
      { source: 'AUTO', bidId: { $exists: true, $ne: null } },
      { $set: { source: 'BID' } }
    );
    console.log(`[1/3] Updated ${bidResult.modifiedCount} AUTO+bid assignments → BID`);

    // 2. Backfill missing source → 'MANUAL'
    const manualResult = await Assignment.updateMany(
      { source: { $exists: false } },
      { $set: { source: 'MANUAL' } }
    );
    console.log(`[2/3] Updated ${manualResult.modifiedCount} sourceless assignments → MANUAL`);

    // 3. Sync assignedCount on all submissions
    const submissions = await Submission.find({}).select('_id assignedReviewers').lean();
    let syncCount = 0;
    for (const sub of submissions) {
      const count = (sub.assignedReviewers || []).length;
      await Submission.updateOne(
        { _id: sub._id },
        { $set: { assignedCount: count } }
      );
      syncCount++;
    }
    console.log(`[3/3] Synced assignedCount on ${syncCount} submissions`);

    console.log('Migration complete.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

run();
