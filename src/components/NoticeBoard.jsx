import React, { useEffect, useState } from 'react';

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    // Fetch notices from backend
    const fetchNotices = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/notices'); // your backend endpoint
        const data = await res.json();
        setNotices(data);
      } catch (err) {
        console.error('Failed to fetch notices', err);
      }
    };

    fetchNotices();
  }, []);

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Notice Board</h2>
      {notices.length === 0 ? (
        <p className="text-gray-500">No notices available</p>
      ) : (
        <div className="space-y-3">
          {notices.map((notice) => (
            <div key={notice.id} className="p-3 bg-gray-50 rounded-lg border">
              <p className="font-medium text-gray-800">{notice.topic}</p>
              <p className="text-sm text-gray-600">{notice.description}</p>
              <p className="text-xs text-gray-400">{new Date(notice.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
