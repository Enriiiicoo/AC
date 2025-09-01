import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

function CommentPoster({ accounts, onCommentPosted, onStatus }) {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);

  const handlePostComment = async () => {
    if (!selectedAccount || !videoUrl || !comment) {
      onStatus('Please fill all fields', true);
      return;
    }

    if (comment.length > 150) {
      onStatus('Comment must be 150 characters or less', true);
      return;
    }

    setPosting(true);
    try {
      const response = await axios.post(`${API_BASE}/comments`, {
        accountId: selectedAccount,
        videoUrl,
        comment
      });

      if (response.data.success) {
        onStatus(`Comment ${response.data.simulated ? 'simulated' : 'posted'} successfully!`);
        setVideoUrl('');
        setComment('');
        onCommentPosted();
      }
    } catch (error) {
      onStatus(error.response?.data?.error || 'Failed to post comment', true);
    }
    setPosting(false);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Post Comment</h2>
      
      <div className="space-y-4">
        {/* Account Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Account
          </label>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Choose an account...</option>
            {accounts.map((account) => (
              <option key={account._id} value={account._id}>
                {account.username} ({account.platform})
              </option>
            ))}
          </select>
        </div>

        {/* Video URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Video URL
          </label>
          <input
            type="url"
            placeholder="https://tiktok.com/@user/video/1234567890"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comment ({comment.length}/150)
          </label>
          <textarea
            rows="3"
            placeholder="Type your comment here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <div className="text-right text-sm text-gray-500">
            {comment.length}/150 characters
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handlePostComment}
          disabled={posting}
          className="w-full bg-purple-600 text-white rounded-md px-4 py-2 hover:bg-purple-700 disabled:opacity-50"
        >
          {posting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </div>
  );
}

export default CommentPoster;