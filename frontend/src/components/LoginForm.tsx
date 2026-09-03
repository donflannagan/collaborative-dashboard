import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AppContext';
import { userService } from '../services/userService';
import type { UserLookupResponse } from '../models/user';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent page refresh
    setError('');
    setIsLoading(true);

    try {
      const response: UserLookupResponse = await userService.getUserByEmail(email);
      const user = response.user.length > 0 ? response.user[0] : null;
      if(user) {
        login(user._id);
        setError(''); 
        setPassword(''); 
        setEmail('');
        navigate('/boards');
      } else {
        setError('Invalid email or password. Please try again.');
      } 
    } catch (err) {
      console.log((err as Error).message);
      console.error(err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Dynamic Global Server Error Alert */}
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4"> {/* Grouped inputs nicely inside a layout spacer */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="mt-1 block w-full px-3 py-2 
                  border border-gray-300 rounded-md shadow-sm 
                  focus:outline-none focus:ring-indigo-500 
                  focus:border-indigo-500 sm:text-sm"
            />  
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="mt-1 block w-full px-3 py-2 
                  border border-gray-300 rounded-md shadow-sm 
                  focus:outline-none focus:ring-indigo-500 
                  focus:border-indigo-500 sm:text-sm"
            />  
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center 
                py-2 px-4 border border-transparent rounded-md 
                shadow-sm text-sm font-medium text-white 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        Don't have an account? <a href="/user/addUser" className="text-indigo-600 hover:text-indigo-500">Register</a>
      </p>
      <p className="mt-4 text-sm text-gray-600">
        Forgot your password? <a href="/user/forgotPassword" className="text-indigo-600 hover:text-indigo-500">Reset it</a>
      </p>              
    </div>
  );
}