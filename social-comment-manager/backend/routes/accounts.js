const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const { encrypt } = require('../utils/encryption');
const automation = require('../utils/automation');

const engine = new automation();

// Initialize automation engine
engine.initialize().catch(console.error);

// Get all accounts
router.get('/', async (req, res) => {
  try {
    const accounts = await Account.find().select('-encryptedCookies');
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new account
router.post('/', async (req, res) => {
  try {
    const { platform, username, password } = req.body;
    
    if (!platform || !username || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Use automation to login and get cookies
    const cookies = await engine.addAccount(platform, username, password);
    const encryptedCookies = encrypt(JSON.stringify(cookies));

    const account = new Account({
      platform,
      username,
      encryptedCookies
    });

    await account.save();

    res.json({
      success: true,
      account: {
        id: account._id,
        platform: account.platform,
        username: account.username,
        status: account.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete account
router.delete('/:id', async (req, res) => {
  try {
    await Account.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;