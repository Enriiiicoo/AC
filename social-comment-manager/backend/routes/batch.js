const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Account = require('../models/Account');
const automation = require('../utils/automation');

const engine = new automation();

// Batch post comments
router.post('/', async (req, res) => {
  try {
    const { batch } = req.body;
    
    if (!batch || !Array.isArray(batch)) {
      return res.status(400).json({ error: 'Batch array required' });
    }

    if (batch.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 comments per batch' });
    }

    const results = await engine.batchPostComments(batch);

    // Save successful comments to history
    const successfulComments = results.filter(r => r.success);
    for (const result of successfulComments) {
      const account = await Account.findById(result.accountId);
      if (account) {
        const commentRecord = new Comment({
          accountId: result.accountId,
          platform: account.platform,
          username: account.username,
          videoUrl: result.videoUrl,
          comment: result.comment,
          status: 'posted'
        });
        await commentRecord.save();
      }
    }

    res.json({
      success: true,
      results,
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;