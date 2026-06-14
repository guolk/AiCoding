import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/store/projectStore';
import { ProjectCard } from '@/components/UI';
import { EmptyState } from '@/components/UI';
import { ProjectTypeMap, ProjectStatusMap, type Project } from '@/types';

const FILTER_TYPES = [
  { key: 'all', label: '全部' },
  { key: 'infrastructure', label: '基础设施' },
  { key: 'industry', label: '产业发展' },
  { key: 'training', label: '技能培训' },
  { key: 'environment', label: '环境治理' },
  { key: 'other', label: '其他' },
];

const FILTER_STATUSES = [
  { key: 'all', label: '全部状态' },
  { key: 'planning', label: '规划中' },
  { key: 'ongoing', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'suspended', label: '已暂停' },
];

const PAGE_SIZE = 8;

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="h-5 bg-gray-200 rounded-full w-16"></div>
          <div className="h-5 bg-gray-200 rounded-full w-16"></div>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
        <div className="h-2 bg-gray-200 rounded-full w-full"></div>
      </div>
      <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  );
}

export default function ProjectList() {
  const navigate = useNavigate();
  const { projects, loading, getProjectMilestones, initializeData } = useProjectStore();

  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchText.toLowerCase()) ||
        project.village.toLowerCase().includes(searchText.toLowerCase());
      const matchesType = typeFilter === 'all' || project.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [projects, searchText, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filteredProjects.length / PAGE_SIZE);
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredProjects.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredProjects, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, typeFilter, statusFilter]);

  const handleNewProject = () => {
    navigate('/projects/new');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg border transition-colors',
            currentPage === 1
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-200 text-gray-600 hover:border-primary-500 hover:text-primary-600'
          )}
        >
          <ChevronLeft size={20} />
        </button>
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-lg border transition-colors font-medium',
              currentPage === page
                ? 'border-primary-500 bg-primary-500 text-white'
                : 'border-gray-200 text-gray-600 hover:border-primary-500 hover:text-primary-600'
            )}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg border transition-colors',
            currentPage === totalPages
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-200 text-gray-600 hover:border-primary-500 hover:text-primary-600'
          )}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">项目列表</h1>
        <p className="mt-1 text-sm text-gray-500">管理所有乡村振兴项目</p>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索项目名称、村庄..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'btn-secondary flex items-center gap-2',
                (typeFilter !== 'all' || statusFilter !== 'all') && 'border-primary-500 text-primary-600'
              )}
            >
              <Filter size={18} />
              筛选
              {(typeFilter !== 'all' || statusFilter !== 'all') && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs text-white">
                  {(typeFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>
            <button onClick={handleNewProject} className="btn-primary flex items-center gap-2">
              <Plus size={18} />
              新建项目
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            <div>
              <label className="label">项目类型</label>
              <div className="flex flex-wrap gap-2">
                {FILTER_TYPES.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setTypeFilter(item.key)}
                    className={cn(
                      'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                      typeFilter === item.key
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">项目状态</label>
              <div className="flex flex-wrap gap-2">
                {FILTER_STATUSES.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setStatusFilter(item.key)}
                    className={cn(
                      'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                      statusFilter === item.key
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <LayoutGrid size={16} />
          <span>共 {filteredProjects.length} 个项目</span>
          {typeFilter !== 'all' && (
            <span className="badge badge-info">{ProjectTypeMap[typeFilter]}</span>
          )}
          {statusFilter !== 'all' && (
            <span className="badge badge-info">{ProjectStatusMap[statusFilter]}</span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title="暂无项目"
          description={
            searchText || typeFilter !== 'all' || statusFilter !== 'all'
              ? '没有找到符合条件的项目，请尝试调整搜索条件'
              : '还没有创建任何项目，点击下方按钮创建第一个项目'
          }
          action={
            <button onClick={handleNewProject} className="btn-primary flex items-center gap-2">
              <Plus size={18} />
              新建项目
            </button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {paginatedProjects.map((project: Project) => (
              <ProjectCard
                key={project.id}
                project={project}
                milestones={getProjectMilestones(project.id)}
              />
            ))}
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
}
