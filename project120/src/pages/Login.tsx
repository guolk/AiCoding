import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Mountain, Footprints, Waves, ArrowRight, Mail, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    login(data.email, data.password);
    navigate('/app/dashboard');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-transparent to-secondary-600/20"></div>
        
        <div className="absolute top-20 left-20 animate-float">
          <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center">
            <Mountain className="text-primary-400" size={32} />
          </div>
        </div>
        <div className="absolute top-40 right-32 animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-12 h-12 bg-skate-500/20 rounded-xl flex items-center justify-center">
            <Footprints className="text-skate-400" size={24} />
          </div>
        </div>
        <div className="absolute bottom-40 left-40 animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-14 h-14 bg-surfing-500/20 rounded-xl flex items-center justify-center">
            <Waves className="text-surfing-400" size={28} />
          </div>
        </div>

        <div className="relative z-10 p-16 flex flex-col justify-center h-full">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
              <Flame className="text-white" size={32} />
            </div>
            <div>
              <h1 className="font-display font-bold text-4xl text-white">
                Extreme<span className="text-primary-500">Track</span>
              </h1>
              <p className="text-dark-400">极限运动记录与训练规划</p>
            </div>
          </div>

          <h2 className="text-4xl font-display font-bold text-white mb-4 leading-tight">
            记录每一次<br />
            <span className="gradient-text">突破极限</span>
          </h2>
          
          <p className="text-dark-300 text-lg mb-12 max-w-md">
            系统化追踪训练进度，科学规划进阶路径，全面管理运动风险。为攀岩、滑板、冲浪爱好者打造的专业平台。
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-dark-800/50 rounded-xl p-4 text-center">
              <Mountain className="text-primary-400 mx-auto mb-2" size={24} />
              <p className="text-sm text-dark-300">攀岩</p>
            </div>
            <div className="bg-dark-800/50 rounded-xl p-4 text-center">
              <Footprints className="text-skate-400 mx-auto mb-2" size={24} />
              <p className="text-sm text-dark-300">滑板</p>
            </div>
            <div className="bg-dark-800/50 rounded-xl p-4 text-center">
              <Waves className="text-surfing-400 mx-auto mb-2" size={24} />
              <p className="text-sm text-dark-300">冲浪</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Flame className="text-white" size={28} />
            </div>
            <h1 className="font-display font-bold text-2xl text-white">
              Extreme<span className="text-primary-500">Track</span>
            </h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">欢迎回来</h2>
            <p className="text-dark-400">登录您的账户继续训练</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
                <input
                  {...register('email', { required: '请输入邮箱' })}
                  type="email"
                  placeholder="your@email.com"
                  className={cn(
                    'w-full bg-dark-800 border rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-dark-500 focus:outline-none transition-colors',
                    errors.email
                      ? 'border-danger-500 focus:border-danger-500'
                      : 'border-dark-700 focus:border-primary-500'
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-danger-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label">密码</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
                <input
                  {...register('password', { required: '请输入密码' })}
                  type="password"
                  placeholder="••••••••"
                  className={cn(
                    'w-full bg-dark-800 border rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-dark-500 focus:outline-none transition-colors',
                    errors.password
                      ? 'border-danger-500 focus:border-danger-500'
                      : 'border-dark-700 focus:border-primary-500'
                  )}
                />
              </div>
              {errors.password && (
                <p className="text-danger-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-dark-400">记住我</span>
              </label>
              <a href="#" className="text-sm text-primary-400 hover:text-primary-300">
                忘记密码？
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3.5 text-base font-semibold flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  登录
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-dark-400 text-sm">
              还没有账户？
              <a href="#" className="text-primary-400 hover:text-primary-300 ml-1">
                立即注册
              </a>
            </p>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-950 text-dark-400">演示模式</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                login('demo@extremetrack.com', 'demo123');
                navigate('/app/dashboard');
              }}
              className="w-full mt-6 bg-dark-800 hover:bg-dark-700 text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-200 border border-dark-600 flex items-center justify-center gap-2"
            >
              <Flame className="text-primary-400" size={20} />
              一键进入演示
            </button>

            <div className="mt-4 p-4 bg-dark-800/50 border border-dark-700 rounded-xl">
              <p className="text-sm text-dark-300 text-center font-medium mb-2">
                🔐 测试账户
              </p>
              <p className="text-xs text-dark-400 text-center">
                邮箱：<span className="text-primary-400">demo@extremetrack.com</span>
              </p>
              <p className="text-xs text-dark-400 text-center mt-1">
                密码：<span className="text-secondary-400">demo123</span>
              </p>
              <p className="text-xs text-dark-500 text-center mt-2">
                （或任意邮箱和密码均可登录）
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
