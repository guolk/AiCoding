import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Building2, Heart } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Modal, RatingStars } from '@/components/ui';
import { InstitutionForm } from '@/components/forms';
import type { Institution } from '../../shared/types';

function formatAmount(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Institutions() {
  const navigate = useNavigate();
  const {
    institutions,
    statistics,
    loading,
    loadInstitutions,
    loadStatistics,
    addInstitution,
    updateInstitution,
    deleteInstitution,
  } = useAppStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);

  useEffect(() => {
    loadInstitutions();
    loadStatistics();
  }, [loadInstitutions, loadStatistics]);

  const getInstitutionDonations = (id: number) => {
    const stat = statistics.find(s => s.institution_id === id);
    return stat ? stat.total_amount : 0;
  };

  const handleAdd = () => {
    setEditingInstitution(null);
    setModalOpen(true);
  };

  const handleEdit = (e: React.MouseEvent, institution: Institution) => {
    e.stopPropagation();
    setEditingInstitution(institution);
    setModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('确定要删除这个机构吗？')) {
      await deleteInstitution(id);
    }
  };

  const handleSubmit = async (data: Partial<Institution>) => {
    let success = false;
    if (editingInstitution) {
      success = await updateInstitution(editingInstitution.id, data);
    } else {
      success = await addInstitution(data);
    }
    if (success) {
      setModalOpen(false);
      setEditingInstitution(null);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    setEditingInstitution(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-terracotta-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-forest-500">机构研究</h2>
          <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            添加机构
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {institutions.map((institution) => (
            <div
              key={institution.id}
              onClick={() => navigate(`/institutions/${institution.id}`)}
              className="card hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center">
                  <Building2 className="text-white" size={28} />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleEdit(e, institution)}
                    className="p-2 text-forest-400 hover:text-terracotta-500 hover:bg-terracotta-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, institution.id)}
                    className="p-2 text-forest-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="font-display font-bold text-xl text-forest-500 mt-4">
                {institution.name}
              </h3>

              <p className="text-sm text-forest-400 mt-2 line-clamp-2 min-h-[40px]">
                {institution.mission}
              </p>

              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-forest-500 font-medium">透明度：</span>
                <RatingStars rating={institution.transparency_rating} size="sm" />
              </div>

              <div className="mt-4 pt-4 border-t border-forest-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="text-terracotta-500" size={18} />
                  <span className="text-sm text-forest-400">累计捐款</span>
                </div>
                <span className="font-bold text-terracotta-500">
                  {formatAmount(getInstitutionDonations(institution.id))}
                </span>
              </div>
            </div>
          ))}
        </div>

        {institutions.length === 0 && (
          <div className="card text-center py-12">
            <Building2 className="mx-auto text-forest-200" size={48} />
            <p className="text-forest-400 mt-4">暂无机构数据，点击右上角添加</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        title={editingInstitution ? '编辑机构' : '添加机构'}
        onClose={handleCancel}
      >
        <InstitutionForm
          initialData={editingInstitution || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Modal>
    </>
  );
}
