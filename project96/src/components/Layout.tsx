
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Table, 
  Image as ImageIcon, 
  Code2, 
  Zap, 
  Home,
  ArrowLeft
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/text', icon: FileText, label: '文本处理' },
    { path: '/data', icon: Table, label: '数据处理' },
    { path: '/image', icon: ImageIcon, label: '图片处理' },
    { path: '/dev', icon: Code2, label: '开发工具' },
    { path: '/productivity', icon: Zap, label: '效率工具' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-white shadow-lg border-r border-gray-100">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                工具箱
              </h1>
            </div>

            <nav className="space-y-2">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                  location.pathname === '/'
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>首页</span>
              </Link>

              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                      location.pathname === item.path
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-8">
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回</span>
            </button>
            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

