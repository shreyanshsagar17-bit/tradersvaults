import React from 'react';
import { Clock, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PendingApproval: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-gold-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">Approval Pending</h1>
        
        <div className="bg-primary-800 rounded-lg p-6 border border-primary-700 mb-6">
          <p className="text-primary-200 mb-4">
            Your account is currently under review by our admin team. 
            You'll receive an email notification once your access has been approved.
          </p>
          
          <div className="flex items-center justify-center space-x-2 text-gold-400">
            <Mail className="w-4 h-4" />
            <span className="text-sm">We'll notify you at your registered email</span>
          </div>
        </div>

        <div className="bg-primary-800/50 rounded-lg p-4 border border-primary-700">
          <p className="text-sm text-primary-300 mb-2">
            <strong className="text-white">Admin Contact:</strong>
          </p>
          <p className="text-sm text-primary-200">
            For urgent matters, contact Shreyansh at admin@twiq.com
          </p>
        </div>

        <Link
          to="/login"
          className="inline-flex items-center space-x-2 text-gold-400 hover:text-gold-300 transition-colors mt-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>
      </div>
    </div>
  );
};

export default PendingApproval;