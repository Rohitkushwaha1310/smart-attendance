import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  UserX, 
  FileText, 
  Download, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Copy, 
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Clock,
  Mail,
  Shield,
  Building,
  UserPlus,
  Bell,
  LogOut,
  Menu,
  X,
  Home,
  Settings,
  BarChart3,
  FileDown,
  User
} from 'lucide-react';
import supabase from '../supabaseClient';

const HRDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState('members');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [faceCode, setFaceCode] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [showFaceCode, setShowFaceCode] = useState(false);
  const [showCompanyCode, setShowCompanyCode] = useState(false);
  const [notices, setNotices] = useState([
    {
      id: 1,
      topic: 'Office Holiday Schedule',
      description: 'The office will be closed on upcoming national holidays. Please plan your work accordingly.',
      date: '2023-11-15',
      author: 'HR Department'
    },
    {
      id: 2,
      topic: 'New Attendance Policy',
      description: 'Effective from next month, all employees must mark attendance before 9:30 AM.',
      date: '2023-11-10',
      author: 'HR Department'
    }
  ]);
  const [newNotice, setNewNotice] = useState({ topic: '', description: '' });
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    lowAttendance: 0
  });
  
  // Dummy data for members
  const [members, setMembers] = useState([
    {
      id: 1,
      name: 'Rohit',
      email: 'john.doe@example.com',
      role: 'Software Engineer',
      avatar: 'https://picsum.photos/seed/john/200/200.jpg',
      attendanceStatus: 'Present',
      attendancePercentage: 92
    },
    {
      id: 2,
      name: 'Harshit Verma',
      email: 'jane.smith@example.com',
      role: 'Product Designer',
      avatar: 'https://picsum.photos/seed/jane/200/200.jpg',
      attendanceStatus: 'Present',
      attendancePercentage: 88
    },
    {
      id: 3,
      name: 'Ansh Verma',
      email: 'robert.j@example.com',
      role: 'Project Manager',
      avatar: 'https://picsum.photos/seed/robert/200/200.jpg',
      attendanceStatus: 'Absent',
      attendancePercentage: 65
    },
    {
      id: 4,
      name: 'Adnan Ansari',
      email: 'emily.davis@example.com',
      role: 'HR Specialist',
      avatar: 'https://picsum.photos/seed/emily/200/200.jpg',
      attendanceStatus: 'Present',
      attendancePercentage: 95
    },
    {
      id: 5,
      name: 'Michael Wilson',
      email: 'michael.w@example.com',
      role: 'QA Engineer',
      avatar: 'https://picsum.photos/seed/michael/200/200.jpg',
      attendanceStatus: 'Present',
      attendancePercentage: 70
    },
    {
      id: 6,
      name: 'Sarah Brown',
      email: 'sarah.brown@example.com',
      role: 'Marketing Manager',
      avatar: 'https://picsum.photos/seed/sarah/200/200.jpg',
      attendanceStatus: 'Present',
      attendancePercentage: 85
    }
  ]);
  
  // Dummy data for leave requests
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      name: 'Rohit',
      reason: 'Medical emergency',
      startDate: '2023-11-20',
      endDate: '2023-11-22',
      status: 'pending'
    },
    {
      id: 2,
      name: 'Harshit Verma',
      reason: 'Family vacation',
      startDate: '2023-11-25',
      endDate: '2023-11-30',
      status: 'pending'
    },
    {
      id: 3,
      name: 'Ansh Verma',
      reason: 'Personal work',
      startDate: '2023-11-18',
      endDate: '2023-11-19',
      status: 'approved'
    }
  ]);

  // Calculate stats on component mount and when members change
  useEffect(() => {
    const presentCount = members.filter(m => m.attendanceStatus === 'Present').length;
    const pendingCount = leaveRequests.filter(r => r.status === 'pending').length;
    const lowCount = members.filter(m => m.attendancePercentage < 75).length;
    
    setStats({
      totalEmployees: members.length,
      presentToday: presentCount,
      pendingLeaves: pendingCount,
      lowAttendance: lowCount
    });
  }, [members, leaveRequests]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: -300 }
  };

  // Number animation
  const useAnimatedNumber = (target) => {
    const [current, setCurrent] = useState(0);
    
    useEffect(() => {
      const increment = target / 30;
      let timer = setInterval(() => {
        setCurrent(prev => {
          const next = prev + increment;
          return next >= target ? target : next;
        });
      }, 30);
      
      return () => clearInterval(timer);
    }, [target]);
    
    return Math.floor(current);
  };

  const animatedTotalEmployees = useAnimatedNumber(stats.totalEmployees);
  const animatedPresentToday = useAnimatedNumber(stats.presentToday);
  const animatedPendingLeaves = useAnimatedNumber(stats.pendingLeaves);
  const animatedLowAttendance = useAnimatedNumber(stats.lowAttendance);

  // Show toast notification
  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Generate random code
  const generateCode = (type) => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    if (type === 'face') {
      setFaceCode(code);
      setShowFaceCode(true);
      showToast('Face registration code generated!', 'success');
    } else {
      setCompanyCode(code);
      setShowCompanyCode(true);
      showToast('Company code generated!', 'success');
    }
  };

  // Copy to clipboard
  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    showToast('Code copied to clipboard!', 'success');
  };

 
const addNotice = async () => {
  if (!newNotice.topic || !newNotice.description) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  const notice = {
    topic: newNotice.topic,
    description: newNotice.description,
    date: new Date().toISOString().split('T')[0],
    author: 'HR Department',
  };

  const { data, error } = await supabase
    .from('notices')
    .insert([notice])
    .select(); // ✅ ensures data is returned after insert

  if (error) {
    console.error('Error adding notice:', error);
    showToast('Failed to post notice', 'error');
    return;
  }

  // ✅ Check that data exists before using it
  if (data && data.length > 0) {
    setNotices([data[0], ...notices]); // add the inserted notice to state
    showToast('Notice posted successfully!', 'success');
  } else {
    console.warn('No data returned from Supabase insert');
  }

  setNewNotice({ topic: '', description: '' });
  setShowNoticeForm(false);
};

  // Handle leave request
  const handleLeaveRequest = (id, action) => {
    setLeaveRequests(leaveRequests.map(request => 
      request.id === id 
        ? { ...request, status: action }
        : request
    ));
    
    showToast(`Leave request ${action}!`, 'success');
  };

  // Download Excel sheet
  const downloadExcel = () => {
    showToast('Preparing Excel sheet...', 'info');
    setTimeout(() => {
      showToast('Excel sheet downloaded successfully!', 'success');
    }, 1500);
  };

  // Filter members based on search
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get low attendance members
  const lowAttendanceMembers = members.filter(member => member.attendancePercentage < 75);

  // Tab content components
  const renderMembersTab = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Members Overview</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full md:w-64 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <motion.div
            key={member.id}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.role}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 truncate max-w-[150px]">{member.email}</span>
              </div>
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                member.attendanceStatus === 'Present' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                {member.attendanceStatus === 'Present' ? (
                  <UserCheck className="w-3 h-3" />
                ) : (
                  <UserX className="w-3 h-3" />
                )}
                <span>{member.attendanceStatus}</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Attendance</span>
                <span className="text-xs font-medium text-gray-700">{member.attendancePercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    member.attendancePercentage >= 75 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${member.attendancePercentage}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderCodesTab = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-800">Code Generation</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Face Registration Code</h3>
              <p className="text-sm text-gray-600">For new user face data registration</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => generateCode('face')}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <Shield className="w-5 h-5" />
            <span>Generate Face Registration Code</span>
          </motion.button>
          
          <AnimatePresence>
            {showFaceCode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Your Code:</p>
                    <p className="text-xl font-bold text-blue-800">{faceCode}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copyToClipboard(faceCode)}
                    className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Copy className="w-5 h-5 text-blue-600" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <motion.div
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Company Code</h3>
              <p className="text-sm text-gray-600">For company/HR registration</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => generateCode('company')}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <Building className="w-5 h-5" />
            <span>Generate Company Code</span>
          </motion.button>
          
          <AnimatePresence>
            {showCompanyCode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-600 font-medium">Your Code:</p>
                    <p className="text-xl font-bold text-indigo-800">{companyCode}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copyToClipboard(companyCode)}
                    className="p-2 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors"
                  >
                    <Copy className="w-5 h-5 text-indigo-600" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Daily Attendance Report</h3>
            <p className="text-blue-100">Download today's attendance data in Excel format</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
         onClick={() => window.open("https://docs.google.com/spreadsheets/d/14B5d6s_jZdr7eUtPTwu-8pTz6sEtD_ETYWQFfZE_rA8/edit?usp=sharing  ", "_blank")}
            className="px-6 py-3 bg-white text-blue-600 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Download Excel Sheet</span>
          </motion.button>
           <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
         onClick={() => window.open("https://docs.google.com/spreadsheets/d/1hVKoGj-WRnmVCXfxgFl1gt3qd5I1WZG2Y9_Ql5NmoF0/edit?usp=sharing ", "_blank")}
            className="px-6 py-3 bg-white text-blue-600 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Download Excel Sheet which are below 60%</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderNoticeboardTab = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Noticeboard</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowNoticeForm(!showNoticeForm)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
        >
          <FileText className="w-5 h-5" />
          <span>Post Notice</span>
        </motion.button>
      </div>
      
      <AnimatePresence>
        {showNoticeForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Post New Notice</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                <input
                  type="text"
                  value={newNotice.topic}
                  onChange={(e) => setNewNotice({ ...newNotice, topic: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter notice topic"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newNotice.description}
                  onChange={(e) => setNewNotice({ ...newNotice, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter notice description"
                ></textarea>
              </div>
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addNotice}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Post Notice
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowNoticeForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="space-y-4">
        {notices.map((notice) => (
          <motion.div
            key={notice.id}
            variants={itemVariants}
            whileHover={{ x: 5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{notice.topic}</h3>
                <p className="text-gray-600 mb-3">{notice.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{notice.date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{notice.author}</span>
                  </div>
                </div>
              </div>
              <div className="ml-4">
                <Bell className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderLeavesTab = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-800">Leave Requests</h2>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Reason</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date Range</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((request) => (
                <motion.tr
                  key={request.id}
                  variants={itemVariants}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {request.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-gray-800">{request.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{request.reason}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {request.startDate} to {request.endDate}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === 'approved' 
                        ? 'bg-green-100 text-green-600' 
                        : request.status === 'rejected'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleLeaveRequest(request.id, 'approved')}
                          className="p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleLeaveRequest(request.id, 'rejected')}
                          className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <XCircle className="w-5 h-5 text-red-600" />
                        </motion.button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  const renderLowAttendanceTab = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex items-center space-x-3">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-800">Low Attendance Alert</h2>
      </div>
      
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-700">
          The following employees have attendance below 75%. Please take necessary action.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lowAttendanceMembers.map((member) => (
          <motion.div
            key={member.id}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Ayush Tiwari</h3>
                <p className="text-sm text-gray-600">{member.role}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Attendance</span>
              <span className="text-lg font-bold text-red-600">{member.attendancePercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-red-500"
                style={{ width: `${member.attendancePercentage}%` }}
              ></div>
            </div>
            <div className="mt-4 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-sm text-red-600 font-medium">Needs Attention</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'members':
        return renderMembersTab();
      case 'codes':
        return renderCodesTab();
      case 'notices':
        return renderNoticeboardTab();
      case 'leaves':
        return renderLeavesTab();
      case 'low-attendance':
        return renderLowAttendanceTab();
      default:
        return renderMembersTab();
    }
  };

  // Sidebar navigation items
  const navItems = [
    { id: 'members', label: 'Members', icon: Users },
    { id: 'codes', label: 'Code Generator', icon: Shield },
    { id: 'notices', label: 'Noticeboard', icon: FileText },
    { id: 'leaves', label: 'Leave Requests', icon: Calendar },
    { id: 'low-attendance', label: 'Low Attendance', icon: AlertCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-500' : 
              toast.type === 'error' ? 'bg-red-500' : 
              'bg-blue-500'
            } text-white max-w-sm`}
          >
            <div className="flex items-center">
              {toast.type === 'success' && (
                <CheckCircle className="w-5 h-5 mr-2" />
              )}
              {toast.type === 'error' && (
                <XCircle className="w-5 h-5 mr-2" />
              )}
              {toast.type === 'info' && (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              <span>{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex h-screen">
        {/* Sidebar */}
        <motion.div
          variants={sidebarVariants}
          animate={sidebarOpen ? "open" : "closed"}
          className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white/80 backdrop-blur-md shadow-xl transition-all duration-300 overflow-hidden`}
        >
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SmartAttendance
              </span>
            </div>
            
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                );
              })}
            </nav>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <motion.button
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
               <form action="/"> <span className="font-medium" >Logout</span></form>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/50 sticky top-0 z-10">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.button>
                <h1 className="text-2xl font-bold text-gray-800">HR Dashboard</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-gray-700" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </motion.button>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  HR
                </div>
              </div>
            </div>
          </header>

          {/* Stats Cards */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-600">Total</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{animatedTotalEmployees}</h3>
                <p className="text-sm text-gray-600">Total Employees</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-green-600">Present</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{animatedPresentToday}</h3>
                <p className="text-sm text-gray-600">Present Today</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="text-sm font-medium text-yellow-600">Pending</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{animatedPendingLeaves}</h3>
                <p className="text-sm text-gray-600">Pending Leaves</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-red-600">Alert</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{animatedLowAttendance}</h3>
                <p className="text-sm text-gray-600">Low Attendance</p>
              </motion.div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;