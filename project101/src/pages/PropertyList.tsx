import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { Property } from '@/types';
import { Plus, MapPin, Home, Ruler, Users, DollarSign, Eye, Edit2, Filter, X } from 'lucide-react';

type StatusFilter = 'all' | Property['status'];

const statusLabels: Record<Property['status'], string> = {
  available: '可订',
  occupied: '已占用',
  maintenance: '维修中',
};

const statusStyles: Record<Property['status'], string> = {
  available: 'bg-green-100 text-green-700 border-green-200',
  occupied: 'bg-red-100 text-red-700 border-red-200',
  maintenance: 'bg-amber-100 text-amber-700 border-amber-200',
};

const defaultImage = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20cozy%20apartment%20interior%20with%20natural%20light&image_size=square_hd';

export default function PropertyList() {
  const navigate = useNavigate();
  const properties = useAppStore((state) => state.properties);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredProperties = statusFilter === 'all'
    ? properties
    : properties.filter((p) => p.status === statusFilter);

  const statusCounts = {
    all: properties.length,
    available: properties.filter((p) => p.status === 'available').length,
    occupied: properties.filter((p) => p.status === 'occupied').length,
    maintenance: properties.filter((p) => p.status === 'maintenance').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">房源管理</h1>
              <p className="mt-1 text-sm text-gray-500">
                共 {properties.length} 套房源
              </p>
            </div>
            <button
              onClick={() => navigate('/properties/new')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-600 hover:to-orange-600 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              添加新房源
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">状态筛选:</span>
          </div>
          {(['all', 'available', 'occupied', 'maintenance'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                statusFilter === status
                  ? 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-200 hover:text-emerald-700'
              }`}
            >
              {status === 'all' ? '全部' : statusLabels[status]}
              <span className={`ml-1.5 ${
                statusFilter === status ? 'text-emerald-100' : 'text-gray-400'
              }`}>
                ({statusCounts[status]})
              </span>
            </button>
          ))}
        </div>

        {filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Home className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无房源</h3>
            <p className="text-gray-500 mb-4">
              {statusFilter === 'all'
                ? '还没有添加任何房源'
                : `没有${statusLabels[statusFilter as Property['status']]}的房源`}
            </p>
            <button
              onClick={() => navigate('/properties/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加第一套房源
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-emerald-100 transition-all duration-300 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={property.photos[0] || defaultImage}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[property.status]}`}>
                      {statusLabels[property.status]}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {property.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                    <span className="line-clamp-1">
                      {property.address.province} {property.address.city} {property.address.district} {property.address.street}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Home className="w-4 h-4 text-emerald-600" />
                      <span>{property.layout.bedrooms}室{property.layout.livingRooms}厅{property.layout.bathrooms}卫</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Ruler className="w-4 h-4 text-emerald-600" />
                      <span>{property.area}㎡</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span>{property.maxGuests}人</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-baseline gap-1">
                      <DollarSign className="w-4 h-4 text-amber-500" />
                      <span className="text-2xl font-bold text-gray-900">{property.basePrice}</span>
                      <span className="text-sm text-gray-500">/晚</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/properties/${property.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        详情
                      </button>
                      <button
                        onClick={() => navigate(`/properties/${property.id}/edit`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        编辑
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
