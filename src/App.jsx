// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import ComplaintSection from "./pages/ComplaintSection";
import HRDashboard from "./pages/HRDashboard";
import Attendance from "./pages/AttendancePage"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/complaints" element={<ComplaintSection />} />
        <Route path="/hr" element={<HRDashboard />} />
       <Route path="/employee" element={<Attendance />} />

      </Routes>
    </Router>
  );
}

export default App;


