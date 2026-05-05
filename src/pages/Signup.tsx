import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import logoWhite from '../assets/logo-white.png';
import { User, Lock, Eye, EyeOff, Building2, Mail } from 'lucide-react';

const Signup: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await signup(email, password, companyName, fullName);
      navigate('/check-email');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create an account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d1117] relative overflow-hidden font-sans p-4">
      {/* Subtle top-left glow */}
      <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[400px] bg-[#161b22] rounded-[20px] shadow-2xl border border-white/5 p-8 relative z-10">
        
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-6">
            <img src={logoWhite} alt="Oyik logo" className="h-8 opacity-90" />
            <span className="text-white font-bold text-2xl tracking-tight">oyik.ai</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Create an account</h1>
          <p className="text-[#8b949e] text-sm mt-1">Sign up to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="companyName" className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-widest">
              Company Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Building2 className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                id="companyName"
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="pl-10 h-10 bg-[#f6f8fa] hover:bg-white focus:bg-white text-slate-900 border-transparent focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg transition-colors font-medium text-sm"
                placeholder="Acme Corp"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-widest">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 h-10 bg-[#f6f8fa] hover:bg-white focus:bg-white text-slate-900 border-transparent focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg transition-colors font-medium text-sm"
                placeholder="Jane Doe"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-widest">
              Work Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-10 bg-[#f6f8fa] hover:bg-white focus:bg-white text-slate-900 border-transparent focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg transition-colors font-medium text-sm"
                placeholder="name@company.com"
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
                placeholder="••••••••••••"
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

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-widest">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10 h-10 bg-[#f6f8fa] hover:bg-white focus:bg-white text-slate-900 border-transparent focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg transition-colors font-medium text-sm tracking-widest placeholder:tracking-normal"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full h-10 bg-gradient-to-b from-[#5c98ff] to-[#3B82F6] hover:from-[#4a8bff] hover:to-[#2563EB] text-white font-medium rounded-lg shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] transition-all duration-300 text-sm border border-[#5c98ff]/50"
              disabled={isLoading}
            >
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </Button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <div className="mt-6 text-center text-[11px] text-[#8b949e]">
          Protected dashboard · Oyik.ai
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-[#8b949e] relative z-10">
        Already have an account?{' '}
        <Link to="/login" className="text-[#5c98ff] hover:text-[#7baaff] font-medium transition-colors">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Signup;
