import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import logoWhite from '../assets/logo-white.png';
import { User, ArrowLeft } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d1117] relative overflow-hidden font-sans p-4">
      {/* Subtle top-left glow */}
      <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[400px] bg-[#161b22] rounded-[20px] shadow-2xl border border-white/5 p-8 relative z-10">
        
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-6">
            <img src={logoWhite} alt="Oyik logo" className="h-8 opacity-90" />
            <span className="text-white font-bold text-2xl tracking-tight">oyik.ai</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Reset Password</h1>
          <p className="text-[#8b949e] text-sm mt-1 text-center">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {success ? (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm font-medium">
              Check your inbox! A password reset link has been sent to {email}.
            </div>
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-[#5c98ff] hover:text-[#7baaff] font-medium transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-10 bg-[#f6f8fa] hover:bg-white focus:bg-white text-slate-900 border-transparent focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg transition-colors font-medium text-sm"
                  placeholder="Enter email"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-b from-[#5c98ff] to-[#3B82F6] hover:from-[#4a8bff] hover:to-[#2563EB] text-white font-medium rounded-lg shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] transition-all duration-300 text-sm border border-[#5c98ff]/50"
                disabled={isLoading}
              >
                {isLoading ? 'Sending Link...' : 'Send Reset Link'}
              </Button>
            </div>
          </form>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center font-medium">
            {error}
          </div>
        )}

        {!success && (
          <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-[#8b949e] hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
