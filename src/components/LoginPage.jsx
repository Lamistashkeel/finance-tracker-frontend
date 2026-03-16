// LoginPage.jsx - Improved Login/Register Component
// Create this as: frontend/src/components/LoginPage.jsx

import React, { useState } from 'react';
import { DollarSign, Eye, EyeOff, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { authAPI } from '../services/api';

const LoginPage = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [validationErrors, setValidationErrors] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    
    if (authMode === 'register' && !formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      console.log('🚀 Starting authentication...');
      console.log('📝 Mode:', authMode);
      console.log('📧 Email:', formData.email);
      console.log('📦 Full data being sent:', {
        name: formData.name,
        email: formData.email,
        password: '***hidden***'
      });

      let response;
      
      if (authMode === 'register') {
        console.log('📤 Calling authAPI.register...');
        response = await authAPI.register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        setSuccess('Account created successfully! Logging you in...');
      } else {
        console.log('📤 Calling authAPI.login...');
        response = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
        setSuccess('Login successful! Loading your dashboard...');
      }
      
      console.log('✅ Response received:', response);
      
      // Wait a moment to show success message
      setTimeout(() => {
        onLoginSuccess(response.user);
      }, 1000);
      
    } catch (err) {
      console.error('❌ Authentication error:', err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error data:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      
      // Detailed error handling
      if (err.response) {
        // Server responded with error
        const status = err.response.status;
        const message = err.response.data?.message || 'An error occurred';
        
        switch (status) {
          case 400:
            setError(`Invalid request: ${message}`);
            break;
          case 401:
            setError('Invalid email or password');
            break;
          case 409:
          case 11000:
            setError('An account with this email already exists');
            break;
          case 500:
            setError('Server error. Please try again later');
            break;
          default:
            setError(message);
        }
      } else if (err.request) {
        // Request made but no response
        console.error('❌ No response from server');
        setError('Cannot connect to server. Make sure backend is running at http://localhost:5000');
      } else {
        // Something else happened
        setError('An unexpected error occurred: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear validation error when user types
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' });
    }
    // Clear general error
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
            <DollarSign className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Finance Manager</h1>
          <p className="text-gray-600">Take control of your budget</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => {
              setAuthMode('login');
              setError('');
              setSuccess('');
              setValidationErrors({});
            }}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              authMode === 'login'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setAuthMode('register');
              setError('');
              setSuccess('');
              setValidationErrors({});
            }}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              authMode === 'register'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Authentication Failed</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Success!</p>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field (Register Only) */}
          {authMode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  validationErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John Doe"
              />
              {validationErrors.name && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.name}</p>
              )}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                validationErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {validationErrors.email && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  validationErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.password}</p>
            )}
            {authMode === 'register' && !validationErrors.password && (
              <p className="mt-1 text-xs text-gray-500">At least 6 characters</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Please wait...</span>
              </>
            ) : (
              <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          {authMode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setAuthMode('register');
                  setError('');
                  setSuccess('');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setAuthMode('login');
                  setError('');
                  setSuccess('');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default LoginPage;