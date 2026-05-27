

import React from 'react';
import { FileText, Table, Image as ImageIcon, Code2, Zap } from 'lucide-react';
import ToolCard from '../components/ToolCard';

const Home: React.FC = () => {
  const tools = [
    {
      title: '文本处理',
      description: 'Markdown预览转换、JSON格式化、Base64编解码、URL编解码、正则测试、文字统计',
      icon: FileText,
      path: '/text',
      color: '#3b82f6'
    },
    {
      title: '数据处理',
      description: 'CSV/JSON可视化预览、数据过滤排序、CSV与JSON互转',
      icon: Table,
      path: '/data',
      color: '#8b5cf6'
    },
    {
      title: '图片处理',
      description: '图片压缩格式转换、裁剪缩放、EXIF信息查看清除',
      icon: ImageIcon,
      path: '/image',
      color: '#10b981'
    },
    {
      title: '开发工具',
      description: '颜色选择转换、时间戳转换、哈希值计算',
      icon: Code2,
      path: '/dev',
      color: '#f59e0b'
    },
    {
      title: '效率工具',
      description: '番茄钟计时器、随机密码生成器、单位换算器',
      icon: Zap,
      path: '/productivity',
      color: '#ef4444'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Zap className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              全能工具箱
            </span>
          </h1>
          <p className="text-xl text-gray-600">一站式日常效率工具集合，全部在浏览器端完成，保护您的数据安全</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, index) => (
            <ToolCard
              key={index}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              path={tool.path}
              color={tool.color}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">为什么选择我们？</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-700">数据安全</h4>
                <p className="text-sm text-gray-500">所有处理在本地完成</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-700">无需安装</h4>
                <p className="text-sm text-gray-500">打开浏览器即可使用</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-700">完全免费</h4>
                <p className="text-sm text-gray-500">所有功能免费使用</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

