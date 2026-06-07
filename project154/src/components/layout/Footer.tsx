import { Bike, Github, Heart, Twitter } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Bike className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">骑行路线</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              专业的城市单车骑行路线评测和分享平台，为骑行爱好者提供最全面的路线信息、评测体系和社区服务。
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-teal-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-teal-600 transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li><a href="/routes" className="text-gray-400 hover:text-teal-400 transition-colors">路线库</a></li>
              <li><a href="/records" className="text-gray-400 hover:text-teal-400 transition-colors">骑行记录</a></li>
              <li><a href="/community" className="text-gray-400 hover:text-teal-400 transition-colors">社区广场</a></li>
              <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">热门路线</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">关于我们</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">项目介绍</a></li>
              <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">使用指南</a></li>
              <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">联系我们</a></li>
              <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">隐私政策</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2024 骑行路线. 保留所有权利.
          </p>
          <p className="text-gray-400 text-sm flex items-center gap-1">
            用 <Heart className="w-4 h-4 text-red-500 fill-red-500" /> 为骑行爱好者打造
          </p>
        </div>
      </div>
    </footer>
  );
};
