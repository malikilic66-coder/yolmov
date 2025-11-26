import React, { useState } from 'react';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminLoginPageProps {
  onLogin: () => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock admin credentials
    if (email === 'admin@yolmov.com' && password === 'admin123') {
      onLogin();
    } else {
      setError('Geçersiz e-posta veya şifre');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield size={40} className="text-orange-500" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2">YOLMOV</h1>
            <p className="text-orange-100 text-sm font-medium">Admin Panel Girişi</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
              >
                <AlertCircle size={20} className="text-red-600 shrink-0" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </motion.div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  E-posta
                </label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:border-orange-500 focus:bg-white focus:ring-0 outline-none transition-all"
                    placeholder="admin@yolmov.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:border-orange-500 focus:bg-white focus:ring-0 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              Giriş Yap
            </button>

            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500">
                Demo: admin@yolmov.com / admin123
              </p>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            © 2024 YOLMOV. Tüm hakları saklıdır.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
