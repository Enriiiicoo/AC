import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

function AccountManager({ accounts, onUpdate, onStatus }) {
  const [platform, setPlatform] = useState('tiktok');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAddAccount = async () => {
    if (!username || !password) {
      onStatus('Please enter username and password', true);
      return;
    }

    setAdding(true);
    try {
      const response = await axios.post(`${API_BASE}/accounts`, {
        platform,
        username,
        password
      });

      if (response.data.success) {
        onStatus('Account added successfully! A browser window will open for login.');
        setUsername('');
        setPassword('');
        onUpdate();
        
        // Wait a bit for the backend to process
        setTimeout(onUpdate, 3000);
      }
    } catch (error) {
      onStatus(error.response?.data?.error || 'Failed to add account', true);
    }
    setAdding(false);
  };

  const handleDeleteAccount = async (accountId) => {
    try {
      await axios.delete(`${API_BASE}/accounts/${accountId}`);
      onStatus('Account deleted successfully');
      onUpdate();
    } catch (error) {
      onStatus('Failed to delete account', true);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Manage Accounts</h2>
      
      {/* Add Account Form */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-md font-medium text-gray-700 mb-3">Add New Account</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
          </select>
          
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
          />
          
          <button
            onClick={handleAddAccount}
            disabled={adding}
            className="bg-purple-600 text-white rounded-md px-4 py-2 hover:bg-purple-700 disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add Account'}
          </button>
        </div>
      </div>

      {/* Accounts List */}
      <div>
        <h3 className="text-md font-medium text-gray-700 mb-3">Connected Accounts</h3>
        {accounts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No accounts connected yet</p>
        ) : (
          <div className="space-y-2">
            {accounts.map((account) => (
              <div key={account._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <span className="font-medium">{account.username}</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {account.platform}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteAccount(account._id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountManager;