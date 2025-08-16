import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DollarSign, TrendingUp, Shield, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const { isAuthenticated, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      // Call the login function directly
      const success = await login();
      
      if (!success) {
        toast.error('Login failed. Please try again.');
        return;
      }
      
      // Login successful - navigate to dashboard
      window.location.href = '/';
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Track performance with detailed metrics and beautiful charts'
    },
    {
      icon: Users,
      title: 'Social Trading',
      description: 'Connect with traders, share insights, and learn together'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex">
      {/* Left Section */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Traders Vault</h1>
                <p className="text-primary-400">by TWIQ</p>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-primary-300">
              Join the premier trading journal platform with social features
            </p>
          </div>

          <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-100 text-primary-900 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-900"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-primary-400">
                By continuing, you agree to our Terms of Service and Privacy Policy.
                <br />
                <span className="text-gold-400 font-medium">
                  Admin approval required for new accounts.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 bg-primary-800 p-8 flex flex-col justify-center border-l border-primary-700">
        <div className="max-w-lg">
          <h3 className="text-2xl font-bold text-white mb-6">
            Professional Trading Journal
          </h3>
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gold-500/20 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                  <p className="text-primary-300">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-primary-700 rounded-lg border border-primary-600">
            <p className="text-primary-200 text-sm">
              "Traders Vault has transformed how I track and analyze my trades. 
              The social features help me learn from other successful traders."
            </p>
            <div className="mt-3 flex items-center space-x-2">
              <img
                src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Testimonial"
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="text-white text-sm font-medium">Alex Thompson</p>
                <p className="text-primary-400 text-xs">Professional Trader</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;