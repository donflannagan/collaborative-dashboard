
export default function LoginForm() {
  return (
  <div className="max-w-4xl mx-auto px-6">
      <form className="space-y-6">
        <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-3 py-2 
                    border border-gray-300 rounded-md shadow-sm 
                    focus:outline-none focus:ring-indigo-500 
                    focus:border-indigo-500 sm:text-sm"
            />  
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
                type="password"
                name="password"
                id="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full px-3 py-2 
                    border border-gray-300 rounded-md shadow-sm 
                    focus:outline-none focus:ring-indigo-500 
                    focus:border-indigo-500 sm:text-sm"
            />  
        </div>
        <div>
            <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Sign In
            </button>
        </div>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Don't have an account? <a href="/register" className="text-indigo-600 hover:text-indigo-500">Register</a>
      </p>
      <p className="mt-4 text-sm text-gray-600">
        Forgot your password? <a href="/forgot-password" className="text-indigo-600 hover:text-indigo-500">Reset it</a>
      </p>              
    </div>
)}
