import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

function BatchComment({ accounts, onBatchComplete, onStatus }) {
  const [batch, setBatch] = useState([{ accountId: '', videoUrl: '', comment: '' }]);
  const [posting, setPosting] = useState(false);

  const addRow = () => {
    if (batch.length < 10) {
      setBatch([...batch, { accountId: '', videoUrl: '', comment: '' }]);
    }
  };

  const removeRow = (index) => {
    if (batch.length > 1) {
      setBatch(batch.filter((_, i) => i !== index));
    }
  };

  const updateRow = (index, field, value) => {
    const newBatch = [...batch];
    newBatch[index][field] = value;
    setBatch(newBatch);
  };

  const handleBatchPost = async () => {
    // Validate batch
    const invalidRows = batch.filter(row => 
      !row.accountId || !row.videoUrl || !row.comment || row.comment.length > 150
    );

    if (invalidRows.length > 0) {
      onStatus('Please fill all fields and ensure comments are 150 characters or less', true);
      return;
    }

    setPosting(true);
    try {
      const response = await axios.post(`${API_BASE}/batch`, { batch });

      if (response.data.success) {
        onStatus(`Batch completed: ${response.data.successful} successful, ${response.data.failed} failed`);
        setBatch([{ accountId: '', videoUrl: '', comment: '' }]);
        onBatchComplete();
      }
    } catch (error) {
      onStatus(error.response?.data?.error || 'Failed to post batch', true);
    }
    setPosting(false);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Batch Commenting</h2>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Add up to 10 comments at once</span>
          <button
            onClick={addRow}
            disabled={batch.length >= 10}
            className="text-purple-600 hover:text-purple-800 text-sm disabled:opacity-50"
          >
            + Add Row
          </button>
        </div>

        {/* Batch Table */}
        <div className="space-y-3">
          {batch.map((row, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-md">
              {/* Account Select */}
              <div className="col-span-4">
                <select
                  value={row.accountId}
                  onChange={(e) => updateRow(index, 'accountId', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select account...</option>
                  {accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.username}
                    </option>
                  ))}
                </select>
              </div>

              {/* Video URL */}
              <div className="col-span-4">
                <input
                  type="url"
                  placeholder="Video URL"
                  value={row.videoUrl}
                  onChange={(e) => updateRow(index, 'videoUrl', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Comment */}
              <div className="col-span-3">
                <input
                  type="text"
                  placeholder="Comment"
                  value={row.comment}
                  onChange={(e) => updateRow(index, 'comment', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Remove Button */}
              <div className="col-span-1">
                <button
                  onClick={() => removeRow(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleBatchPost}
        disabled={posting}
        className="w-full bg-purple-600 text-white rounded-md px-4 py-2 hover:bg-purple-700 disabled:opacity-50"
      >
        {posting ? 'Posting Batch...' : 'Post Batch Comments'}
      </button>
    </div>
  );
}

export default BatchComment;