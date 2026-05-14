/**
 * Migration: Backfill Bid ConferenceId
 * 
 * Populates the new `conferenceId` field on existing Bid documents
 * by resolving: Bid → trackId → Track.conferenceId
 * 
 * Safe to run multiple times (idempotent).
 * 
 * Usage: node utils/migrations/backfillBidConferenceId.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Bid = require('../../models/Bid');
const Track = require('../../models/Track');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Find bids without conferenceId
  const bidsToUpdate = await Bid.find({
    conferenceId: { $exists: false }
  }).select('_id trackId').lean();

  console.log(`Found ${bidsToUpdate.length} bids without conferenceId`);

  if (bidsToUpdate.length === 0) {
    console.log('Nothing to migrate.');
    await mongoose.disconnect();
    return;
  }

  // Build track → conference lookup
  const trackIds = [...new Set(bidsToUpdate.map(b => b.trackId?.toString()).filter(Boolean))];
  const tracks = await Track.find({ _id: { $in: trackIds } }).select('_id conferenceId').lean();
  const trackToConf = new Map(tracks.map(t => [t._id.toString(), t.conferenceId]));

  let updated = 0;
  let skipped = 0;

  for (const bid of bidsToUpdate) {
    const confId = trackToConf.get(bid.trackId?.toString());
    if (confId) {
      await Bid.findByIdAndUpdate(bid._id, { conferenceId: confId });
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`✅ Migration complete: ${updated} updated, ${skipped} skipped (no track/conference found)`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
