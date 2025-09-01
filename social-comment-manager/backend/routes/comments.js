const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Account = require('../models/Account');
const automation = require('../utils/automation');

const engine = new automation();

// Get comment history
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('accountId', 'username platform')
      .sort({ timestamp: -1 })
      .limit(50);
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post single comment
router.post('/', async (req, res) => {
  try {
    const { accountId, videoUrl, comment } = req.body;
    
    if (!accountId || !videoUrl || !comment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (comment.length > 150) {
      return res.status(400).json({ error: 'Comment too long (max 150 chars)' });
    }

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Post comment using automation
    const result = await engine.postComment(accountId, videoUrl, comment);

    // Save to history
    const commentRecord = new Comment({
      accountId,
      platform: account.platform,
      username: account.username,
      videoUrl,
      comment,
      status: result.success ? 'posted' : 'failed'
    });

    await commentRecord.save();

    res.json({
      success: true,
      comment: commentRecord,
      simulated: result.simulated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;