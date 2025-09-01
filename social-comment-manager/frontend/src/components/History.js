import React from 'react';

function History({ comments }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Comment History</h2>
      
      {comments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No comment history yet</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment._id} className="border-b border-gray-100 py-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium">{comment.username}</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {comment.platform}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(comment.timestamp).toLocaleString()}
                </span>
              </div>
              
              <p className="text-gray-700 mb-2">{comment.comment}</p>
              
              <a
                href={comment.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-purple-600 hover:text-purple-800 truncate block"
              >
                {comment.videoUrl}
              </a>
              
              <div className={`text-xs mt-1 ${
                comment.status === 'posted' ? 'text-green-600' : 'text-red-600'
              }`}>
                Status: {comment.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;