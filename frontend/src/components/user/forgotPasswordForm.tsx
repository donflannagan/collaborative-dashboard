import React, { useState } from 'react';
import { userService } from '../../services/userService';
import type { ResetPasswordRequest } from '../../models/user';

export default function ForgotPasswordForm() {
    const [password, setPassword] = useState('');

    return (
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
    );
}