import { useState } from 'react';
import { Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Send the request to your Node.js backend
      const response = await api.post('/auth/login', { username, password });
      
      const { token, user } = response.data;

      // Save the token and role in the browser's local storage
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('username', user.username);

      // Route them to the right page based on their database role
      if (user.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/pos');
      }
    } catch (err) {
      // Show the error message sent from your backend (e.g., "Invalid password")
      setError(err.response?.data?.error || 'Cannot connect to server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 p-8 rounded-2xl shadow-xl shadow-slate-200/50">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-md shadow-blue-600/20">
            <Activity className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">StockFlow</h1>
          <p className="text-sm text-gray-500">Sign in to manage your inventory</p>
        </div>

        {/* Display Error Message if login fails */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400"
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2.5 rounded-lg shadow-sm transition-all mt-2"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;