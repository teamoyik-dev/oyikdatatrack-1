import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const CheckEmail: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md bg-muted rounded-2xl shadow-xl border border-border/50 p-8 text-center flex flex-col items-center">
        <div className="bg-indigo-500/10 p-4 rounded-full mb-6">
          <Mail className="h-12 w-12 text-indigo-400" />
        </div>
        
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-4">
          Check your inbox
        </h1>
        
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          We've sent a confirmation link to your email address. Click the link to activate your account and access your dashboard.
        </p>
        
        <p className="text-xs text-muted-foreground/80 mb-8">
          Didn't receive it? Check your spam folder or contact{' '}
          <a href="mailto:support@oyik.ai" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            support@oyik.ai
          </a>
        </p>
        
        <Link 
          to="/login" 
          className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors hover:underline"
        >
          &larr; Back to login
        </Link>
      </div>
    </div>
  );
};

export default CheckEmail;
