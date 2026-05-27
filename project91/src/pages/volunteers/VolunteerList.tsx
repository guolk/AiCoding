import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Clock, Award, Calendar, Phone, Mail } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';

export default function VolunteerList() {
  const { volunteers } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'hours' | 'joinDate'>('name');

  const filteredVolunteers = [...volunteers]
    .filter((v) => {
      const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.phone.includes(searchTerm) ||
        v.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'hours') return b.totalHours - a.totalHours;
      if (sortBy === 'joinDate') return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">志愿者档案</h1>
          <p className="text-gray-500 mt-1">管理所有志愿者的个人信息和服务记录</p>
        </div>
        <Link to="/volunteers/new" className="btn btn-primary">
          <Plus className="w-4 h-4" />
          添加志愿者
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索姓名、电话或邮箱..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="input sm:w-48"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          >
            <option value="name">按姓名排序</option>
            <option value="hours">按时长排序</option>
            <option value="joinDate">按加入时间排序</option>
          </select>
        </div>
      </div>

      {/* Volunteer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVolunteers.map((volunteer) => (
          <Link
            key={volunteer.id}
            to={`/volunteers/${volunteer.id}`}
            className="card p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <img
                src={volunteer.avatar}
                alt={volunteer.name}
                className="w-16 h-16 rounded-full bg-primary-100"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{volunteer.name}</h3>
                <div className="mt-1 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="truncate">{volunteer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{volunteer.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-4 h-4 text-primary-500" />
                  <span>{volunteer.totalHours} 小时</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span>{volunteer.awards.length} 项表彰</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>{volunteer.activities.length} 次活动</span>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">技能特长</p>
              <div className="flex flex-wrap gap-1">
                {volunteer.skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {volunteer.skills.length > 4 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{volunteer.skills.length - 4}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-400">
              加入时间：{format(new Date(volunteer.joinDate), 'yyyy-MM-dd')}
            </div>
          </Link>
        ))}
      </div>

      {filteredVolunteers.length === 0 && (
        <div className="card p-12 text-center">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">未找到匹配的志愿者</p>
        </div>
      )}
    </div>
  );
}
