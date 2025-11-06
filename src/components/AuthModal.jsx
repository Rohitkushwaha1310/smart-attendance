import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Login from "../pages/Login";
import Register from "../pages/Register";

const AuthModal = ({ isOpen, onClose, mode, setMode }) => {
  const [role, setRole] = useState("employee"); // ✅ Default role

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 flex items-center justify-center"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          {/* Background Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-40"
            aria-hidden="true"
            onClick={onClose}
          ></motion.div>

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative z-50 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:max-w-lg w-full mx-4"
          >
            <div className="bg-white/90 px-6 py-6 sm:p-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {mode === "login" ? "Sign In" : "Create Account"}
                </h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* ✅ Role Switch Buttons */}
              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={() => handleRoleChange("employee")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    role === "employee"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Employee
                </button>
                <button
                  onClick={() => handleRoleChange("hr")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    role === "hr"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Company HR
                </button>
              </div>

              {/* --- Auth Forms --- */}
              {mode === "login" ? (
                <Login closeModal={onClose} role={role} />
              ) : (
                <Register closeModal={onClose} role={role} />
              )}

              {/* Toggle Between Login / Register */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {mode === "login"
                    ? "Don't have an account?"
                    : "Already have an account?"}
                  <button
                    type="button"
                    className="ml-1 font-medium text-blue-600 hover:text-blue-500 transition-colors"
                    onClick={toggleMode}
                  >
                    {mode === "login" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;

