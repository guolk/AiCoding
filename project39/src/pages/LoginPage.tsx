import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { loginSchema, LoginFormData } from '@/schemas';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Loading from '@/components/Loading';

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      showSuccess('登录成功，欢迎回来！');
      reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败';
      showError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">用户管理系统</h1>
            <p className="text-indigo-100">请登录您的账户</p>
          </div>

          <div className="px-8 py-10">
            <Loading isLoading={isLoading} fullScreen>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="用户名"
                  type="text"
                  placeholder="请输入用户名"
                  isRequired
                  error={errors.username?.message}
                  register={register('username')}
                  fullWidth
                />

                <Input
                  label="密码"
                  type="password"
                  placeholder="请输入密码"
                  isRequired
                  error={errors.password?.message}
                  register={register('password')}
                  fullWidth
                />

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    {...register('remember')}
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    记住我
                  </label>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  isLoading={isLoading}
                >
                  登录
                </Button>
              </form>
            </Loading>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>测试账号：</strong>
              </p>
              <p className="text-xs text-gray-500">
                管理员: admin / admin123
              </p>
              <p className="text-xs text-gray-500">
                编辑: editor / editor123
              </p>
              <p className="text-xs text-gray-500">
                用户: user1 / user123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
