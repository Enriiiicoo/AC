import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AccountManager from './components/AccountManager';
import CommentPoster from './components/CommentPoster';
import BatchComment from './components/BatchComment';
import History from './components/History';
import './styles/App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

function App() {
  const [accounts, setAccounts] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadAccounts();
    loadComments();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/accounts`);
      setAccounts(response.data);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadComments = async () => {
    try {
      const response = await axios.get(`${API_BASE}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const updateStatus = (message, isError = false) => {
    setStatus(message);
    setTimeout(() => setStatus(''), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="font-bold text-xl text-gray-800">SocialComment Pro</span>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                {['dashboard', 'accounts', 'batch', 'history'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      activeTab === tab ? 'border-purple-500 text-gray-900' : ''
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Status Message */}
        {status && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {status}
          </div>
        )}

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{accounts.length}</div>
                  <div className="text-sm text-blue-600">Connected Accounts</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{comments.length}</div>
                  <div className="text-sm text-green-600">Total Comments</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
              {comments.slice(0, 5).map((comment) => (
                <div key={comment._id} className="border-b border-gray-100 py-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{comment.username}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{comment.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accounts Manager */}
        {activeTab === 'accounts' && (
          <AccountManager
            accounts={accounts}
            onUpdate={loadAccounts}
            onStatus={updateStatus}
          />
        )}

        {/* Single Comment */}
        {activeTab === 'dashboard' && (
          <CommentPoster
            accounts={accounts}
            onCommentPosted={loadComments}
            onStatus={updateStatus}
          />
        )}

        {/* Batch Comments */}
        {activeTab === 'batch' && (
          <BatchComment
            accounts={accounts}
            onBatchComplete={loadComments}
            onStatus={updateStatus}
          />
        )}

        {/* History */}
        {activeTab === 'history' && (
          <History comments={comments} />
        )}
      </div>
    </div>
  );
}

export default App;