import React, { useState } from "react";
import { motion } from "framer-motion";
import supabase from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const Register = ({ closeModal }) => {
  const [role, setRole] = useState("employee");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    companyCode: "",
    companyLocation: "",
    position: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const generateCompanyCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      let company_code = formData.companyCode;
      let hrId = null;

      // HR registration -> generate company code
      if (role === "hr") {
        company_code = generateCompanyCode();
      } else {
        // Employee registration -> validate company code
        const { data: hrData, error: hrError } = await supabase
          .from("users")
          .select("id")
          .eq("company_code", formData.companyCode)
          .eq("role", "hr")
          .single();

        if (hrError || !hrData) {
          setError("Invalid company code. Please contact your HR.");
          setLoading(false);
          return;
        }
        hrId = hrData.id;
      }

      // Insert user into table
      const { data, error: dbError } = await supabase.from("users").insert([
        {
          name: formData.name,
          email: formData.email,
          company_name: role === "hr" ? formData.companyName : "N/A",
          company_location: formData.companyLocation,
          company_code,
          role,
          position: role === "employee" ? formData.position : null,
          hr_id: hrId,
        },
      ]);

      if (dbError) throw dbError;

      // Save user info locally
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: formData.name,
          email: formData.email,
          role,
          company_code,
        })
      );

      alert(
        role === "hr"
          ? `✅ HR registered successfully!\nYour Company Code: ${company_code}`
          : "✅ Employee registered successfully!"
      );

      navigate(role === "hr" ? "/hr" : "/employee");
    } catch (err) {
      console.error("Registration Error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full flex justify-center p-4"
    >
      <div className="relative bg-white border border-gray-300 rounded-md shadow-xl sm:max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Role Selector */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-gray-100 border border-gray-300 rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => setRole("employee")}
              className={`px-5 py-2 text-sm font-medium transition-all ${
                role === "employee"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Employee
            </button>
            <button
              type="button"
              onClick={() => setRole("hr")}
              className={`px-5 py-2 text-sm font-medium transition-all ${
                role === "hr"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              HR / Company
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Common Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              placeholder="John Doe"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Location
            </label>
            <input
              name="companyLocation"
              type="text"
              placeholder="City, Country"
              required
              value={formData.companyLocation}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-blue-600"
            />
          </div>

          {role === "hr" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                name="companyName"
                type="text"
                placeholder="TechCorp Ltd."
                required
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-blue-600"
              />
            </div>
          )}

          {role === "employee" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Code
                </label>
                <input
                  name="companyCode"
                  type="text"
                  placeholder="ABC123"
                  required
                  value={formData.companyCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  name="position"
                  type="text"
                  placeholder="Software Engineer"
                  required
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-blue-600"
                />
              </div>
            </>
          )}

          {/* Password Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-blue-600"
            />
          </div>

          {/* Terms */}
          <div className="flex items-center">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              required
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="agree-terms" className="ml-2 text-sm text-gray-700">
              I agree to the{" "}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Terms and Conditions
              </a>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-md hover:shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default Register;

