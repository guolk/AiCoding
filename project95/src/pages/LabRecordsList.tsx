import { useState } from 'react';
import { Plus, Search, Calendar, User, FlaskConical, Eye, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';

export default function LabRecordsList() {
  const navigate = useNavigate();
  const { labRecords, projects, users, deleteLabRecord, showToast } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);

  const filteredRecords = labRecords.filter((record) => {
    const matchesSearch = record.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.conclusion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = filterProject === 'all' || record.project_id === parseInt(filterProject);
    return matchesSearch && matchesProject;
  });

  const getProjectName = (projectId: number) => projects.find((p) => p.id === projectId)?.name || '未知项目';
  const getUserName = (userId: number) => users.find((u) => u.id === userId)?.name || '未知';

  const handleDelete = () => {
    if (recordToDelete) {
      deleteLabRecord(recordToDelete);
      showToast('实验记录删除成功', 'success');
      setDeleteModalOpen(false);
      setRecordToDelete(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">实验记录</h1>
          <p className="text-sm text-neutral-500">管理和查看实验记录</p>
        </div>
        <button
          onClick={() => navigate('/lab-records/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建记录
        </button>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="搜索实验记录..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="input-field w-48"
          >
            <option value="all">全部项目</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="p-4 border border-neutral-100 rounded-xl hover:border-accent-200 hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(`/lab-records/${record.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-accent-600" />
                  <span className="font-medium text-neutral-900">{record.purpose}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/lab-records/${record.id}/edit`);
                    }}
                    className="p-1.5 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRecordToDelete(record.id);
                      setDeleteModalOpen(true);
                    }}
                    className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-neutral-500 line-clamp-2 mb-3">{record.conclusion}</p>

              <div className="flex items-center gap-4 text-xs text-neutral-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {record.experiment_date}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {getUserName(record.user_id)}
                </span>
                <span className="flex items-center gap-1">
                  <FlaskConical className="w-3 h-3" />
                  {getProjectName(record.project_id)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredRecords.length === 0 && (
          <div className="py-12 text-center">
            <FlaskConical className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">没有找到匹配的实验记录</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRecordToDelete(null);
        }}
        title="确认删除"
        footer={
          <>
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setRecordToDelete(null);
              }}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleDelete} className="btn-primary">
              确认删除
            </button>
          </>
        }
      >
        <p className="text-neutral-700">确定要删除这条实验记录吗？此操作无法撤销。</p>
      </Modal>
    </div>
  );
}
