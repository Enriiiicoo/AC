const puppeteer = require('puppeteer');
const { decrypt } = require('./encryption');
const Account = require('../models/Account');

class AutomationEngine {
  constructor() {
    this.browser = null;
    this.activeSessions = new Map();
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for production
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    console.log('Puppeteer browser initialized');
  }

  async addAccount(platform, username, password) {
    try {
      const page = await this.browser.newPage();
      
      // Set viewport
      await page.setViewport({ width: 1280, height: 800 });
      
      // Navigate to login page
      let loginUrl;
      if (platform === 'tiktok') {
        loginUrl = 'https://www.tiktok.com/login';
      } else if (platform === 'instagram') {
        loginUrl = 'https://www.instagram.com/accounts/login/';
      } else {
        throw new Error('Unsupported platform');
      }

      await page.goto(loginUrl, { 
        waitUntil: 'networkidle2',
        timeout: 60000 
      });

      console.log(`Please manually login to ${platform} as ${username} in the opened browser window...`);
      console.log('Waiting for 2 minutes for manual login...');

      // Wait for manual login with timeout
      try {
        await page.waitForNavigation({ 
          waitUntil: 'networkidle2',
          timeout: 120000 
        });
      } catch (error) {
        console.log('Navigation timeout exceeded, continuing with current page...');
      }

      // Get cookies after login
      const cookies = await page.cookies();
      
      // Verify we have session cookies
      const hasSessionCookies = cookies.some(cookie => 
        cookie.name.includes('session') || cookie.name.includes('token')
      );

      if (!hasSessionCookies) {
        throw new Error('No session cookies found. Login may have failed.');
      }

      await page.close();

      return cookies;
    } catch (error) {
      console.error('Error adding account:', error);
      throw error;
    }
  }

  async postComment(accountId, videoUrl, comment) {
    const account = await Account.findById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    try {
      const page = await this.browser.newPage();
      
      // Set cookies from encrypted storage
      const cookies = JSON.parse(decrypt(account.encryptedCookies));
      await page.setCookie(...cookies);

      // Navigate to video
      await page.goto(videoUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Platform-specific selectors
      let commentSelector, submitSelector;
      if (account.platform === 'tiktok') {
        commentSelector = 'div[data-e2e="comment-input"] textarea';
        submitSelector = 'button[data-e2e="comment-post"]';
      } else if (account.platform === 'instagram') {
        commentSelector = 'textarea[aria-label="Add a comment…"]';
        submitSelector = 'button[type="submit"]';
      }

      // Wait for comment input
      await page.waitForSelector(commentSelector, { timeout: 10000 });
      
      // Type comment
      await page.focus(commentSelector);
      await page.keyboard.type(comment);

      // For safety: Only simulate, don't actually post
      // Uncomment below to enable real posting (use at your own risk)
      /*
      await page.waitForSelector(submitSelector, { timeout: 5000 });
      await page.click(submitSelector);
      
      // Wait for post confirmation
      await page.waitForTimeout(3000);
      */

      // Simulate typing only (safe mode)
      console.log(`Simulated posting comment: "${comment}" to ${videoUrl}`);
      await page.waitForTimeout(2000);

      await page.close();

      return { success: true, simulated: true };
    } catch (error) {
      console.error('Error posting comment:', error);
      throw error;
    }
  }

  async batchPostComments(batchRequests) {
    const results = [];
    
    for (const request of batchRequests) {
      try {
        const result = await this.postComment(
          request.accountId,
          request.videoUrl,
          request.comment
        );
        results.push({ ...request, success: true, result });
      } catch (error) {
        results.push({ ...request, success: false, error: error.message });
      }
      
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return results;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = AutomationEngine;