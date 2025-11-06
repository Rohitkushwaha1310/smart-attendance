// src/pages/Attendance.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ComplaintSection from './ComplaintSection';
import NoticeBoard from '../components/NoticeBoard';
import supabase from '../supabaseClient'; // <- supabase client

const Attendance = () => {
  // Webcam and face detection states
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const webcamRef = useRef(null);
  const streamRef = useRef(null);

  // Location states
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [locationError, setLocationError] = useState(null);
  const [isWithinCampus, setIsWithinCampus] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Attendance states
  const [attendanceType, setAttendanceType] = useState('check-in'); // 'check-in' or 'check-out'
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [todayRecords, setTodayRecords] = useState([]);

  // dynamic employee & office
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [officeLocation, setOfficeLocation] = useState(null);

  // loading flag for initial fetches
  const [initialLoading, setInitialLoading] = useState(true);

  // ---------- Fetch logged-in user -> employee row & office location ----------
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        // 1) try get logged user from supabase auth
        const {
          data: { user },
          error: userErr
        } = await supabase.auth.getUser();

        if (userErr) {
          console.warn('supabase.auth.getUser error:', userErr);
        }

        const email = user?.email || null;

        // 2) fetch employee row by email if email exists, otherwise don't fail
        if (email) {
          const { data: empData, error: empErr } = await supabase
            .from('employees')
            .select('*')
            .eq('email', email)
            .single();

          if (!empErr && empData && isMounted) {
            setEmployeeInfo(empData);
          } else {
            // no employee found for this email (dev fallback)
            if (empErr) console.warn('fetch employee error:', empErr);
          }
        } else {
          // No auth user — try to fetch a default employee if you want (commented)
          // const { data: empData } = await supabase.from('employees').select('*').limit(1).single();
          // if (empData && isMounted) setEmployeeInfo(empData);
          console.warn('No logged user found via supabase.auth.getUser(). If you are not using Supabase Auth, pass employee identifier.');
        }

        // 3) fetch office location (single row expected)
        const { data: officeData, error: officeErr } = await supabase
          .from('office_location')
          .select('*')
          .limit(1)
          .single();

        if (!officeErr && officeData && isMounted) {
          setOfficeLocation(officeData);
        } else {
          if (officeErr) console.warn('fetch office location error:', officeErr);
        }
      } catch (err) {
        console.error('init fetch error:', err);
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // ---------- Webcam controls ----------
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        streamRef.current = stream;
        await webcamRef.current.play();
        setIsWebcamActive(true);
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      toast.error('Failed to access webcam. Please check permissions.');
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsWebcamActive(false);
    }
  };

  // ---------- Capture & verify face ----------
  const captureImage = () => {
    if (!webcamRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = webcamRef.current.videoWidth;
    canvas.height = webcamRef.current.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(webcamRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageData);
    stopWebcam();
    verifyFace(imageData);
  };

  const verifyFace = async (imageData) => {
    setIsProcessing(true);
    // Simulated verification — replace with your API call
    setTimeout(() => {
      const isSuccess = Math.random() > 0.2;
      if (isSuccess) {
        setFaceVerified(true);
        toast.success('Face verified successfully!');
      } else {
        setFaceVerified(false);
        toast.error('Face verification failed. Please try again.');
        startWebcam();
      }
      setIsProcessing(false);
    }, 2000);
  };

  // ---------- Location handling ----------
  const getUserLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    // guard: if officeLocation not yet loaded
    if (!officeLocation) {
      toast.error('Office location not yet loaded. Try again shortly.');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });

        // Check if within campus (guard if officeLocation missing)
        if (officeLocation && typeof officeLocation.latitude === 'number' && typeof officeLocation.longitude === 'number') {
          const distance = calculateDistance(
            latitude,
            longitude,
            officeLocation.latitude,
            officeLocation.longitude
          );

          setIsWithinCampus(distance <= (officeLocation.radius ?? 800));
          setLocationLoading(false);

          if (distance <= (officeLocation.radius ?? 800)) {
            toast.success('Location verified: Within campus');
          } else {
            toast.error(`Location verified: Outside campus (${Math.round(distance)}m away)`);
          }
        } else {
          setLocationLoading(false);
          toast.error('Office location is not configured by HR');
        }
      },
      (error) => {
        setLocationError(error.message || 'Failed to get location');
        setLocationLoading(false);
        toast.error('Failed to get your location');
      }
    );
  };

  // Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if ([lat1, lon1, lat2, lon2].some((v) => typeof v !== 'number')) return Infinity;
    const R = 6371e3; // m
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // ---------- Attendance helpers ----------
  const determineAttendanceType = useCallback(async () => {
    // guard
    if (!employeeInfo?.employee_id && !employeeInfo?.id) return 'check-in';

    const empId = employeeInfo.employee_id || employeeInfo.id;

    try {
      const todayISO = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', empId)
        .eq('date', todayISO)
        .order('timestamp', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching last attendance:', error);
        return 'check-in';
      }

      if (!data || data.length === 0) return 'check-in';
      const lastRecord = data[0];
      return lastRecord.type === 'check-in' ? 'check-out' : 'check-in';
    } catch (err) {
      console.error(err);
      return 'check-in';
    }
  }, [employeeInfo]);

  const recordAttendance = async () => {
    // guards
    if (!employeeInfo) {
      toast.error('Employee not loaded yet');
      return;
    }
    if (!faceVerified || !isWithinCampus) {
      toast.error('Please complete both face and location verification');
      return;
    }

    const empId = employeeInfo.employee_id || employeeInfo.id;
    const empName = employeeInfo.name || employeeInfo.employee_name || 'Unknown';

    const type = await determineAttendanceType();
    const timestamp = new Date();
    const dateISO = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD

    const recordPayload = {
      employee_id: empId,
      employee_name: empName,
      type,
      timestamp: timestamp.toISOString(),
      date: dateISO,
      time: timestamp.toLocaleTimeString(),
      latitude: location.latitude,
      longitude: location.longitude,
      face_verified: true,
      location_verified: isWithinCampus,
      captured_image: capturedImage,
    };

    try {
      const { error: insertError } = await supabase
        .from('attendance_records')
        .insert([recordPayload]);

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        toast.error('Failed to record attendance. Try again.');
        return;
      }

      // refresh today's records
      await loadTodayRecords();

      // mark working_day true if >= 2 records exist (simple approach)
      const { data: todays, error: fetchErr } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', empId)
        .eq('date', dateISO);

      if (!fetchErr && todays && todays.length >= 2) {
        const { error: updateErr } = await supabase
          .from('attendance_records')
          .update({ working_day: true })
          .eq('employee_id', empId)
          .eq('date', dateISO);

        if (updateErr) console.error('Error updating working_day:', updateErr);
      }

      setAttendanceRecord({
        employeeName: empName,
        type,
        time: timestamp.toLocaleTimeString(),
        date: timestamp.toLocaleDateString(),
        locationVerified: isWithinCampus
      });

      // set next action
      setAttendanceType(type === 'check-in' ? 'check-out' : 'check-in');
      toast.success(`Successfully recorded ${type.replace('-', ' ')}`);
    } catch (err) {
      console.error('Error recording attendance:', err);
      toast.error('An error occurred while recording attendance');
    }
  };

  const resetForm = () => {
    setCapturedImage(null);
    setFaceVerified(false);
    setIsWithinCampus(false);
    setAttendanceRecord(null);
    stopWebcam();
  };

  const loadTodayRecords = async () => {
    if (!employeeInfo) {
      setTodayRecords([]);
      return;
    }
    const empId = employeeInfo.employee_id || employeeInfo.id;
    try {
      const todayISO = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', empId)
        .eq('date', todayISO)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error loading today records:', error);
        setTodayRecords([]);
        return;
      }

      const mapped = (data || []).map((r) => ({
        id: r.id,
        type: r.type,
        time: r.time || new Date(r.timestamp).toLocaleTimeString(),
        timestamp: r.timestamp,
        locationVerified: r.location_verified,
        faceVerified: r.face_verified,
        capturedImage: r.captured_image
      }));

      setTodayRecords(mapped);
    } catch (err) {
      console.error('loadTodayRecords error:', err);
      setTodayRecords([]);
    }
  };

  // Load today's records on component mount or when employeeInfo changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      // Wait until initial fetch completes
      if (initialLoading) return;
      await loadTodayRecords();
      const type = await determineAttendanceType();
      if (mounted) setAttendanceType(type);
    })();
    return () => { mounted = false; };
  }, [initialLoading, employeeInfo, determineAttendanceType]);

  const handleAttendance = async () => {
  if (!employeeInfo) return alert("Employee not found");

  const { data: todayCheckIn, error: checkInError } = await supabase
    .from("attendance")
    .select("*")
    .eq("employee_id", employeeInfo.id)
    .gte("created_at", new Date().toISOString().split("T")[0])
    .eq("type", "check-in");

  if (checkInError) {
    console.error(checkInError);
    return;
  }

  const { data, error } = await supabase.from("attendance").insert([
    {
      employee_id: employeeInfo.id,
      employee_name: employeeInfo.name,
      type: attendanceType,
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    },
  ]);

  if (error) {
    console.error(error);
    return;
  }

  // If both check-in and check-out exist in one day -> increase working day count
  if (attendanceType === "check-out" && todayCheckIn && todayCheckIn.length > 0) {
    const { error: updateError } = await supabase.rpc("increment_working_days", {
      emp_id: employeeInfo.id,
    });
    if (updateError) console.error(updateError);
  }

  alert(`Successfully ${attendanceType}ed!`);
  fetchTodayRecords();
};


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
  

  // Loading guard UI - keeps styling but prevents null reads
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-700">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Mark Your Attendance
          </h1>
          <p className="text-gray-600">
            Use face recognition and location verification to record your attendance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Employee Info & Today's Records */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1 space-y-6"
          >
            {/* Employee Info Card */}
            <motion.div
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Employee Information</h2>
              <div className="flex items-center space-x-4">
                <img
                  src={employeeInfo?.profile_image || employeeInfo?.profileImage || "/default-avatar.png"}
                  alt={employeeInfo?.name || employeeInfo?.employee_name || "Profile"}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-800">
                    {employeeInfo?.name || employeeInfo?.employee_name || 'Employee'}
                  </h3>
                  <p className="text-sm text-gray-600">ID: {employeeInfo?.employee_id || employeeInfo?.id || '—'}</p>
                  <p className="text-sm text-gray-600">{employeeInfo?.department || '—'}</p>
                </div>
              </div>
            </motion.div>

            {/* Today's Records */}
            <motion.div
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Records</h2>
              {todayRecords.length > 0 ? (
                <div className="space-y-3">
                  {todayRecords.map((record) => (
                    <div 
                      key={record.id}
                      className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800 capitalize">
                          {record.type.replace('-', ' ')}
                        </span>
                        <span className="text-sm text-gray-600">{record.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No attendance records for today
                </p>
              )}
            </motion.div>
          </motion.div>

          {/* Middle Column - Face Verification */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1"
          >
            <motion.div
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20 h-full"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Face Verification</h2>
              
              <div className="relative">
                {/* Webcam or Captured Image */}
                <div className="relative overflow-hidden rounded-xl bg-gray-100 aspect-[4/3]">
                  {isWebcamActive ? (
                    <video
                      ref={webcamRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : capturedImage ? (
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        <p className="text-gray-500">Camera not active</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Processing Overlay */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        <p className="text-white mt-2">Verifying face...</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Verification Status */}
                  {faceVerified && !isProcessing && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Camera Controls */}
                <div className="mt-4 flex space-x-3">
                  {!isWebcamActive && !capturedImage && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startWebcam}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                      Start Camera
                    </motion.button>
                  )}
                  
                  {isWebcamActive && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={captureImage}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                      Capture & Verify
                    </motion.button>
                  )}
                  
                  {capturedImage && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetForm}
                      className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                      Retake
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Location Verification & Attendance Record */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1 space-y-6"
          >
            {/* Location Verification */}
            <motion.div
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Location Verification</h2>
              
              <div className="space-y-4">
                <button
                  onClick={getUserLocation}
                  disabled={locationLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {locationLoading ? 'Getting Location...' : 'Verify Location'}
                </button>
                
                {location.latitude && location.longitude && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      {isWithinCampus ? (
                        <div className="flex items-center text-green-600">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span className="font-medium">Within Campus</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span className="font-medium">Outside Campus</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
                
                {locationError && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-red-600 text-sm">{locationError}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Attendance Action */}
            <motion.div
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Mark Attendance</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Next Action:</p>
                  <p className="text-lg font-semibold text-gray-800 capitalize">
                    {attendanceType.replace('-', ' ')}
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={recordAttendance}
                  disabled={!faceVerified || !isWithinCampus}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark {attendanceType.replace('-', ' ')}
                </motion.button>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${faceVerified ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    Face Verification: {faceVerified ? 'Complete' : 'Pending'}
                  </div>
                  <div className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${isWithinCampus ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    Location Verification: {isWithinCampus ? 'Complete' : 'Pending'}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
     
        {/* Success Modal */}
        <AnimatePresence>
          {attendanceRecord && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setAttendanceRecord(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {attendanceRecord.type.replace('-', ' ')} Successful!
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Employee:</span>
                      <span className="font-medium">{attendanceRecord.employeeName}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{attendanceRecord.time}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{attendanceRecord.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium text-green-600">
                        {attendanceRecord.locationVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setAttendanceRecord(null)}
                    className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
              
            </motion.div>
            
          )}
        </AnimatePresence>

        {/* Notice Board */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mt-6">
          <motion.div variants={itemVariants}>
            <NoticeBoard />
          </motion.div>
        </motion.div>

      </div>


  <motion.button
   onClick={() => window.open("https://rohitkushwaha07.app.n8n.cloud/form/d1cfaabe-4bee-4281-8278-c4ea7613cd13", "_blank")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
         
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
          >
           
            <span>Request for Leave</span>
          </motion.button>
          

      <div className="mt-10">
        <ComplaintSection />
      </div>
    </div>
  );
};

export default Attendance;
