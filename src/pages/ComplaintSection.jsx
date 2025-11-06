import React, { useState, useEffect } from 'react';
import supabase  from '../supabaseClient'; // make sure your Supabase client is imported
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

const ComplaintSection = () => {
  const [complaints, setComplaints] = useState([]);
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
    category: 'General'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('votes'); // 'votes' or 'recent'
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = ['All', 'General', 'HR Issues', 'Facilities', 'Management', 'Safety', 'IT Support', 'Other'];

  // Fetch complaints from Supabase on mount
  useEffect(() => {
    const fetchComplaints = async () => {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error(error);
      else setComplaints(data);
    };
    fetchComplaints();

    // Optional: Real-time updates using Supabase channel
    const channel = supabase
      .channel('realtime:complaints')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaints' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setComplaints((prev) => [payload.new, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComplaint.title.trim() || !newComplaint.description.trim()) return;

    setIsSubmitting(true);

    const { data, error } = await supabase
      .from('complaints')
      .insert([
        {
          id: uuidv4(),
          title: newComplaint.title,
          description: newComplaint.description,
          category: newComplaint.category,
          votes: 0,
          upvoted: false,
          downvoted: false,
          timestamp: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('Error submitting complaint:', error);
    } else {
      setComplaints([data[0], ...complaints]);
      setNewComplaint({ title: '', description: '', category: 'General' });
    }

    setIsSubmitting(false);
  };

  // Upvote handler
  const handleUpvote = async (id) => {
    const complaint = complaints.find((c) => c.id === id);
    if (!complaint) return;

    let updatedVotes = complaint.votes;
    if (complaint.upvoted) updatedVotes -= 1;
    else if (complaint.downvoted) updatedVotes += 2;
    else updatedVotes += 1;

    const updated = {
      ...complaint,
      votes: updatedVotes,
      upvoted: !complaint.upvoted,
      downvoted: false,
    };

    setComplaints(complaints.map((c) => (c.id === id ? updated : c)));

    await supabase
      .from('complaints')
      .update({ votes: updatedVotes })
      .eq('id', id);
  };

  // Downvote handler
  const handleDownvote = async (id) => {
    const complaint = complaints.find((c) => c.id === id);
    if (!complaint) return;

    let updatedVotes = complaint.votes;
    if (complaint.downvoted) updatedVotes += 1;
    else if (complaint.upvoted) updatedVotes -= 2;
    else updatedVotes -= 1;

    const updated = {
      ...complaint,
      votes: updatedVotes,
      downvoted: !complaint.downvoted,
      upvoted: false,
    };

    setComplaints(complaints.map((c) => (c.id === id ? updated : c)));

    await supabase
      .from('complaints')
      .update({ votes: updatedVotes })
      .eq('id', id);
  };

  // Sorting and filtering
  const getSortedAndFilteredComplaints = () => {
    let filtered = complaints;
    if (filterCategory !== 'All') {
      filtered = filtered.filter((c) => c.category === filterCategory);
    }

    if (sortBy === 'votes') {
      return [...filtered].sort((a, b) => b.votes - a.votes);
    } else {
      return [...filtered].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Anonymous Complaint Box
          </h1>
          <p className="text-gray-600">
            Voice your concerns anonymously and help improve our workplace
          </p>
        </motion.div>

        {/* Complaint Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8 border border-white/20"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Submit a Complaint
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={newComplaint.title}
                onChange={(e) =>
                  setNewComplaint({ ...newComplaint, title: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-blue-600 placeholder:text-blue-400"
                placeholder="Brief title of your complaint"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category
              </label>
              <select
                id="category"
                value={newComplaint.category}
                onChange={(e) =>
                  setNewComplaint({ ...newComplaint, category: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-blue-600"
              >
                {categories
                  .filter((cat) => cat !== 'All')
                  .map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>
            </div>
            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                value={newComplaint.description}
                onChange={(e) =>
                  setNewComplaint({
                    ...newComplaint,
                    description: e.target.value,
                  })
                }
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-blue-600 placeholder:text-blue-400"
                placeholder="Provide details about your complaint"
                required
              ></textarea>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Your submission is completely anonymous
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Filters and Sorting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-4 mb-6 border border-white/20"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilterCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                      filterCategory === category
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSortBy('votes')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    sortBy === 'votes'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Votes
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSortBy('recent')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    sortBy === 'recent'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Recent
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Complaints List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {getSortedAndFilteredComplaints().length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center border border-white/20"
            >
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                ></path>
              </svg>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No complaints yet
              </h3>
              <p className="text-gray-600">Be the first to submit a complaint</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {getSortedAndFilteredComplaints().map((complaint) => (
                <motion.div
                  key={complaint.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {complaint.title}
                    </h3>
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs rounded-full">
                      {complaint.category}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{complaint.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <span>
                        {new Date(complaint.timestamp).toLocaleDateString()} at{' '}
                        {new Date(complaint.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleUpvote(complaint.id)}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-all duration-200 ${
                          complaint.upvoted
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 15l7-7 7 7"
                          ></path>
                        </svg>
                        <span>{complaint.votes}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDownvote(complaint.id)}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-all duration-200 ${
                          complaint.downvoted
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ComplaintSection;
