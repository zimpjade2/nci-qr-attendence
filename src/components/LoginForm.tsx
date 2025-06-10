import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Mail, Lock, UserPlus, Eye, EyeOff } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const LoginForm: React.FC = () => {
  const { login, createUser } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    studentId: '',
    department: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const success = await login(formData.email, formData.password);
        if (success) {
          toast.success('Login successful!');
        } else {
          toast.error('Invalid email or password');
        }
      } else {
        // Validate password strength
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters long');
          setIsLoading(false);
          return;
        }

        await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'student', // Always student for signup
          studentId: formData.studentId || undefined,
          department: formData.department || undefined
        });
        
        toast.success('Account created successfully! You can now login.');
        setIsLogin(true);
        setFormData({ email: formData.email, password: '', name: '', studentId: '', department: '' });
      }
    } catch (error: any) {
      if (error.message?.includes('UNIQUE constraint failed')) {
        toast.error('An account with this email already exists');
      } else {
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">NCI - Attendance App</h2>
          <p className="mt-1 text-white/60 text-sm">by Noble Computers</p>
          <p className="mt-2 text-white/70">
            {isLogin ? 'Sign in to your account' : 'Create your student account'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Full Name *</label>
                  <input
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Student ID</label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your student ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your department"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-white mb-2">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password * {!isLogin && <span className="text-white/50 text-xs">(minimum 6 characters)</span>}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder={isLogin ? "Enter your password" : "Create a secure password"}
                  minLength={isLogin ? undefined : 6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? <Lock className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ email: '', password: '', name: '', studentId: '', department: '' });
                setShowPassword(false);
              }}
              className="text-white/70 hover:text-white transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          {isLogin && (
            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-white/70 text-center mb-2">
                <strong>Demo Login:</strong>
              </p>
              <p className="text-xs text-white/60 text-center">
                Email: admin@attendance.app<br />
                Password: admin123
              </p>
            </div>
          )}

          {!isLogin && (
            <div className="mt-4 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <p className="text-sm text-blue-200 text-center">
                <strong>Note:</strong> New accounts are created as students. Contact an administrator to upgrade to admin privileges.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-white/50 text-sm">
            © 2025 Noble Computers. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};