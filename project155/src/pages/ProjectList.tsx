import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, TrendingUp, MoreVertical, Building2 } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { useProjectStore } from '@/store/useProjectStore';
import { formatCurrency } from '@/utils/numberUtils';
import { formatDate, getCurrentDate } from '@/utils/dateUtils';
import type { Project } from '@/types';

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'outline' }> = {
  planning: { label: '规划中', variant: 'default' },
  in_progress: { label: '进行中', variant: 'warning' },
  completed: { label: '已完成', variant: 'success' },
};

export default function ProjectList() {
  const navigate = useNavigate();
  const { projects, addProject } = useProjectStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    totalArea: '',
    totalBudget: '',
    startDate: '',
    endDate: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入项目名称';
    if (!formData.address.trim()) newErrors.address = '请输入项目地址';
    if (!formData.totalArea || Number(formData.totalArea) <= 0) newErrors.totalArea = '请输入有效面积';
    if (!formData.totalBudget || Number(formData.totalBudget) <= 0) newErrors.totalBudget = '请输入有效预算';
    if (!formData.startDate) newErrors.startDate = '请选择开始日期';
    if (!formData.endDate) newErrors.endDate = '请选择结束日期';
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = '结束日期不能早于开始日期';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateProject = () => {
    if (!validateForm()) return;

    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      address: formData.address,
      location: formData.address,
      totalArea: Number(formData.totalArea),
      totalBudget: Number(formData.totalBudget),
      spentAmount: 0,
      progress: 0,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: 'planning',
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate(),
      coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20boutique%20hotel%20exterior%20design%20with%20warm%20lighting&image_size=square_hd',
    };

    addProject(newProject);
    setShowCreateModal(false);
    setFormData({
      name: '',
      address: '',
      totalArea: '',
      totalBudget: '',
      startDate: '',
      endDate: '',
      description: '',
    });
    
    setTimeout(() => {
      navigate(`/projects/${newProject.id}`);
    }, 300);
  };

  const handleEnterProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">项目管理</h1>
            <p className="text-gray-500 mt-1">管理您的所有民宿改造项目</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            新建项目
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <Card
              key={project.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 group"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={project.coverImage}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant={statusConfig[project.status].variant}>
                    {statusConfig[project.status].label}
                  </Badge>
                </div>
                <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-semibold text-white truncate">{project.name}</h3>
                  <div className="flex items-center text-white/80 text-sm mt-1">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    <span className="truncate">{project.address}</span>
                  </div>
                </div>
              </div>

              <CardContent className="pt-5">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">项目进度</span>
                      <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center text-gray-500 text-sm mb-1">
                        <TrendingUp className="w-4 h-4 mr-1.5 text-blue-500" />
                        总预算
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(project.totalBudget)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        已支出 {formatCurrency(project.spentAmount)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center text-gray-500 text-sm mb-1">
                        <Building2 className="w-4 h-4 mr-1.5 text-green-500" />
                        总面积
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {project.totalArea}㎡
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round(project.totalBudget / project.totalArea)}/㎡
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      <span>起止日期</span>
                    </div>
                    <span className="text-gray-700">
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t border-gray-100 pt-4">
                <div className="flex gap-3 w-full">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEnterProject(project.id)}
                  >
                    查看详情
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEnterProject(project.id)}
                  >
                    进入项目
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">创建新项目</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">项目名称 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  placeholder="请输入项目名称"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">项目地址 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  placeholder="请输入项目地址"
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">总面积(㎡) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={formData.totalArea}
                    onChange={(e) => handleInputChange('totalArea', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${errors.totalArea ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                    placeholder="300"
                  />
                  {errors.totalArea && <p className="text-red-500 text-xs mt-1">{errors.totalArea}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">总预算(元) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={formData.totalBudget}
                    onChange={(e) => handleInputChange('totalBudget', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${errors.totalBudget ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                    placeholder="500000"
                  />
                  {errors.totalBudget && <p className="text-red-500 text-xs mt-1">{errors.totalBudget}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">开始日期 <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${errors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">结束日期 <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${errors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">项目描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  rows={3}
                  placeholder="请输入项目描述"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowCreateModal(false);
                  setErrors({});
                }}
              >
                取消
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateProject}
              >
                创建项目
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
