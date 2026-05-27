import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Award,
  FileText,
  Phone,
  Mail,
  MapPin,
  Edit,
  Download,
  Star,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';

export default function VolunteerDetail() {
  const { id } = useParams<{ id: string }>();
  const { volunteers, activities } = useStore();
  
  const volunteer = volunteers.find((v) => v.id === id);
  const [activeTab, setActiveTab] = useState<'info' | 'activities' | 'certifications' | 'awards'>('info');

  if (!volunteer) {
    return (
      <div className="card p-12 text-center">
        <p className="text-gray-500">志愿者不存在</p>
        <Link to="/volunteers" className="btn btn-primary mt-4">返回列表</Link>
      </div>
    );
  }

  const volunteerActivities = activities.filter((a) =>
    volunteer.activities.includes(a.id)
  );

  const handleGenerateCertificate = () => {
    alert('志愿服务证明生成功能演示');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={volunteer.avatar}
            alt={volunteer.name}
            className="w-20 h-20 rounded-full bg-primary-100"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{volunteer.name}</h1>
            <p className="text-gray-500 mt-1">
              加入于 {format(new Date(volunteer.joinDate), 'yyyy年MM月dd日')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleGenerateCertificate} className="btn btn-secondary">
            <Download className="w-4 h-4" />
            生成服务证明
          </button>
          <Link to={`/volunteers/${volunteer.id}/edit`} className="btn btn-primary">
            <Edit className="w-4 h-4" />
            编辑资料
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <Clock className="w-8 h-8 text-primary-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{volunteer.totalHours}</p>
          <p className="text-sm text-gray-500">累计服务时长</p>
        </div>
        <div className="card p-4 text-center">
          <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{volunteer.activities.length}</p>
          <p className="text-sm text-gray-500">参与活动数</p>
        </div>
        <div className="card p-4 text-center">
          <FileText className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{volunteer.certifications.length}</p>
          <p className="text-sm text-gray-500">证书数量</p>
        </div>
        <div className="card p-4 text-center">
          <Award className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{volunteer.awards.length}</p>
          <p className="text-sm text-gray-500">获得表彰</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { key: 'info', label: '基本信息' },
            { key: 'activities', label: `服务历史 (${volunteerActivities.length})` },
            { key: 'certifications', label: `证书资质 (${volunteer.certifications.length})` },
            { key: 'awards', label: `表彰荣誉 (${volunteer.awards.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="card p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">联系方式</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span>{volunteer.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span>{volunteer.email}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">可参与时间</h3>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>{volunteer.availableTime}</span>
              </div>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">技能特长</h3>
              <div className="flex flex-wrap gap-2">
                {volunteer.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="space-y-4">
          {volunteerActivities.length === 0 ? (
            <div className="card p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无参与活动记录</p>
            </div>
          ) : (
            volunteerActivities.map((activity) => (
              <Link
                key={activity.id}
                to={`/activities/${activity.id}`}
                className="card p-4 hover:shadow-md transition-shadow block"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{activity.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(new Date(activity.startTime), 'yyyy-MM-dd HH:mm')} · {activity.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    3小时
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {activeTab === 'certifications' && (
        <div className="space-y-4">
          {volunteer.certifications.length === 0 ? (
            <div className="card p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无证书资质</p>
            </div>
          ) : (
            volunteer.certifications.map((cert) => (
              <div key={cert.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{cert.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      颁发机构：{cert.issuer}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {format(new Date(cert.issueDate), 'yyyy-MM-dd')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'awards' && (
        <div className="space-y-4">
          {volunteer.awards.length === 0 ? (
            <div className="card p-12 text-center">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无表彰荣誉</p>
            </div>
          ) : (
            volunteer.awards.map((award) => (
              <div key={award.id} className="card p-4 bg-gradient-to-r from-yellow-50 to-orange-50">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{award.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{award.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {format(new Date(award.issueDate), 'yyyy年MM月dd日')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
