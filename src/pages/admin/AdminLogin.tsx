import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../lib/admin-auth-context';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import logoWhite from '../../assets/logo-white.png';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { adminLogin } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate slight network delay for UI feedback
    await new Promise((resolve) => setTimeout(resolve, 500));

    const success = await adminLogin(email, password);
    
    if (success) {
      navigate('/admin');
    } else {
      setError('Invalid admin credentials');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden font-sans p-4">
      {/* Subtle top-left glow - matching the main login but maybe a different color (amber/red) */}
      <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[400px] bg-[#161b22] rounded-[20px] shadow-2xl border border-white/5 p-8 relative z-10">
        
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <img src={logoWhite} alt="Oyik logo" className="h-8 opacity-90" />
            <span className="text-white font-bold text-2xl tracking-tight">oyik.ai</span>
          </div>
          <div className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">
            Admin Panel
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Super Admin Access</h1>
          <p className="text-[#8b949e] text-sm mt-1">Sign in to manage organizations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-widest">
              Email / Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                id="email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-10 bg-[#f6f8fa] hover:bg-white focus:bg-white text-slate-900 border-transparent focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg transition-colors font-medium text-sm"
                placeholder="Enter admin username"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-widest">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-10 bg-[#f6f8fa] hover:bg-white focus:bg-white text-slate-900 border-transparent focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg transition-colors font-medium text-sm tracking-widest placeholder:tracking-normal"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-10 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-medium rounded-lg shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] transition-all duration-300 text-sm border border-blue-500/50"
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Sign in to Admin'}
            </Button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <div className="mt-8 text-center text-[11px] text-[#8b949e]">
          Super Admin Panel · Oyik.ai
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
