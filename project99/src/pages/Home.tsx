import React from 'react';
import { Link } from 'react-router-dom';
import { Users, History, BookOpen, Search, Share2, Calendar, Image, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Home: React.FC = () => {
  const { data } = useAppContext();

  const stats = [
    { label: '家族成员', value: data.members.length, icon: Users, color: 'text-brown-700', bg: 'bg-brown-100' },
    { label: '历史事件', value: data.events.length, icon: Calendar, color: 'text-brown-600', bg: 'bg-brown-100' },
    { label: '照片存档', value: data.photos.length, icon: Image, color: 'text-brown-500', bg: 'bg-brown-100' },
    { label: '口述历史', value: data.oralHistories.length, icon: User, color: 'text-brown-400', bg: 'bg-brown-100' },
  ];

  const quickLinks = [
    { path: '/family-tree', label: '家谱管理', icon: Users, desc: '管理家族成员信息', color: 'from-brown-600 to-brown-800' },
    { path: '/history', label: '历史记录', icon: History, desc: '查看家族大事记', color: 'from-brown-500 to-brown-700' },
    { path: '/stories', label: '故事整理', icon: BookOpen, desc: '记录家族故事', color: 'from-brown-400 to-brown-600' },
    { path: '/research', label: '数据考证', icon: Search, desc: '考证信息来源', color: 'from-brown-300 to-brown-500' },
    { path: '/share', label: '分享家谱', icon: Share2, desc: '分享家族历史', color: 'from-brown-200 to-brown-400' },
  ];

  return (
    <div className="min-h-screen bg-warm-beige">
      <div className="relative overflow-hidden bg-gradient-to-br from-brown-700 via-brown-800 to-brown-900 text-white">
        <div className="absolute inset-0 opacity-10 wood-texture"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-song mb-6 text-shadow-sm">
              家族历史管理系统
            </h1>
            <p className="text-xl sm:text-2xl text-brown-200 max-w-3xl mx-auto leading-relaxed">
              记录家族故事，传承家族精神，让后代了解家族的过去与现在
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`${stat.bg} w-12 h-12 rounded-full flex items-center justify-center mb-4`}>
                  <Icon className={`${stat.color} w-6 h-6`} />
                </div>
                <div className="text-3xl font-bold text-brown-800 mb-1">{stat.value}</div>
                <div className="text-sm text-brown-600">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold font-song text-brown-800 mb-8 text-center">
          快速导航
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={index}
                to={link.path}
                className="group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                <div className="p-6">
                  <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-brown-800 mb-2">{link.label}</h3>
                  <p className="text-brown-600">{link.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {data.familyTraits.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold font-song text-brown-800 mb-6 text-center">
              家族精神
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.familyTraits.map((trait) => (
                <div
                  key={trait.id}
                  className="bg-antique-white rounded-lg p-6 border border-brown-200"
                >
                  <h3 className="text-lg font-semibold text-brown-700 mb-3">{trait.title}</h3>
                  <p className="text-brown-600 leading-relaxed">{trait.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
