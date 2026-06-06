import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store';
import { LoadingSpinner } from '@/components';
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter';
import { cn } from '@/lib/utils';

type LoginMode = 'login' | 'register';

export default function Login() {
  const navigate = useNavigate();
  const { authenticate, initializeVault, isAuthenticated, loading, error } = useAppStore();
  const [mode, setMode] = useState<LoginMode>('login');
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const storedData = localStorage.getItem('guardvault_data');
    setMode(storedData ? 'login' : 'register');
  }, []);

  const validatePasswords = (): boolean => {
    if (mode === 'register') {
      if (!masterPassword) {
        setLocalError('请输入主密码');
        return false;
      }
      if (masterPassword.length < 8) {
        setLocalError('主密码至少需要8个字符');
        return false;
      }
      if (masterPassword !== confirmPassword) {
        setLocalError('两次输入的密码不一致');
        return false;
      }
    } else {
      if (!masterPassword) {
        setLocalError('请输入主密码');
        return false;
      }
    }
    setLocalError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswords()) return;

    let success = false;
    if (mode === 'register') {
      success = await initializeVault(masterPassword);
    } else {
      success = await authenticate(masterPassword);
    }

    if (success) {
      navigate('/');
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setMasterPassword('');
    setConfirmPassword('');
    setLocalError(null);
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-white/20">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">GuardVault</h1>
          <p className="text-white/70">您的数字资产安全守护者</p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'login' ? '欢迎回来' : '设置主密码'}
            </h2>
            <p className="text-gray-500 mt-1">
              {mode === 'login'
                ? '输入主密码以解锁您的保险库'
                : '创建一个强密码来保护您的数据'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {displayError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-600 dark:text-red-400">{displayError}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                主密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  placeholder="请输入主密码"
                  className={cn(
                    'w-full px-4 py-3 pr-12 border rounded-lg transition-colors',
                    'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
                    'focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none',
                    'text-gray-900 dark:text-white placeholder-gray-400'
                  )}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    确认主密码
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="再次输入主密码"
                      className={cn(
                        'w-full px-4 py-3 pr-12 border rounded-lg transition-colors',
                        'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
                        'focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none',
                        'text-gray-900 dark:text-white placeholder-gray-400'
                      )}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {masterPassword && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <PasswordStrengthMeter password={masterPassword} />
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full py-3 px-4 rounded-lg font-semibold text-white transition-all',
                'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
                'shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
                'flex items-center justify-center gap-2'
              )}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>处理中...</span>
                </>
              ) : (
                <span>{mode === 'login' ? '登录' : '创建保险库'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {mode === 'login' ? '首次使用？' : '已有保险库？'}
              <button
                type="button"
                onClick={switchMode}
                className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
              >
                {mode === 'login' ? '创建新保险库' : '登录现有保险库'}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-white/60 text-sm">
          <p>所有数据均在本地加密存储，永不上传</p>
        </div>
      </div>
    </div>
  );
}
