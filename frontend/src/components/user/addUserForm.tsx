
import React, { useState } from 'react';
import { userService } from '../../services/userService';
import type { AddUserRequest } from '../../models/user';

interface AddUserFormProps {
  onSubmit: (data: AddUserRequest) => void;
}

export const AddUserForm: React.FC<AddUserFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<AddUserRequest>({
    email: '',
    username: '',
    password: '',
    _id: '',
  });

  const [errors, setErrors] = useState<Partial<Omit<AddUserRequest, 'password'>>>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);

  // Individual password criteria rules
  const hasMinLength = formData.password.length >= 8;
  const hasNumber = /\d/.test(formData.password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_]/.test(formData.password);
  const isPasswordValid = hasMinLength && hasNumber && hasSpecialChar;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Omit<AddUserRequest, 'password'>> = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && isPasswordValid;
  };

const [isLoading, setIsLoading] = useState<boolean>(false);
const [apiMessage, setApiMessage] = useState<string | null>(null);
const [apiSuccess, setApiSuccess] = useState<boolean>(false);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setApiMessage(null);

  if (validateForm()) {
    setIsLoading(true);
    
    try {
      console.log('Submitting form data:', formData);
      const result = await userService.createUser(formData);
      onSubmit(result);
      setFormData({ email: '', username: '', password: '', _id: '' });
      setApiMessage('User created successfully');
      setApiSuccess(true);
    } catch (error: any) {
      if (error.response?.status === 409) {
        const conflictData = error.response.data;
        if (conflictData.errors) {
          setErrors((prev) => ({ ...prev, ...conflictData.errors }));
        }
        return;
      }
      setApiMessage(error.response?.data?.message || error.message || 'Failed to connect to the server');
      setApiSuccess(false);
    } finally {
      setIsLoading(false);
    }
  }
};

  // Determine if the checklist should be visible (focused or already typed into)
  const shouldShowChecklist = isPasswordFocused || formData.password.length > 0;
  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md space-y-4" noValidate>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New User</h2>
      
      {apiMessage && (
          <div className={`p-3 border text-sm rounded-md ${apiSuccess ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {apiMessage}
          </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
            className={`w-full pl-3 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              formData.password && !isPasswordValid ? 'border-amber-500 focus:ring-amber-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Animated Real-time Checklist Wrapper */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            shouldShowChecklist ? 'max-h-24 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'
          }`}
        >
          <div className="space-y-1 text-xs border-l-2 border-gray-100 pl-2">
            <p className={hasMinLength ? 'text-green-600 font-medium' : 'text-gray-400'}>
              {hasMinLength ? '✓' : '•'} At least 8 characters
            </p>
            <p className={hasNumber ? 'text-green-600 font-medium' : 'text-gray-400'}>
              {hasNumber ? '✓' : '•'} At least 1 number
            </p>
            <p className={hasSpecialChar ? 'text-green-600 font-medium' : 'text-gray-400'}>
              {hasSpecialChar ? '✓' : '•'} At least 1 special character
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || (formData.password.length > 0 && !isPasswordValid)}
        className={`w-full py-2 px-4 text-white font-semibold rounded-md transition duration-200 ${
          isLoading || (formData.password.length > 0 && !isPasswordValid)
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isLoading ? 'Creating User...' : 'Add User'}
      </button>
    </form>
  );
};

export default AddUserForm;