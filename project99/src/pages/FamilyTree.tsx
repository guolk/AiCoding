import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Users, Layout, User, Calendar, MapPin, Briefcase, Eye } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { FamilyMember } from '../types';
import Tree from 'react-d3-tree';

export const FamilyTree: React.FC = () => {
  const { data, addMember, updateMember, deleteMember } = useAppContext();
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [formData, setFormData] = useState<Partial<FamilyMember>>({
    name: '',
    birthDate: '',
    deathDate: '',
    birthPlace: '',
    occupation: '',
    photo: '',
    children: [],
    spouse: '',
    parent: '',
    notes: '',
  });

  const treeData = useMemo(() => {
    const buildTree = (memberId: string): any => {
      const member = data.members.find(m => m.id === memberId);
      if (!member) return null;
      const spouse = member.spouse ? data.members.find(m => m.id === member.spouse) : null;
      const children = member.children.map(childId => buildTree(childId)).filter(Boolean);
      
      return {
        name: member.name + (spouse ? ` & ${spouse.name}` : ''),
        attributes: member,
        children,
      };
    };

    const rootMember = data.members.find(m => !m.parent);
    return rootMember ? [buildTree(rootMember.id)] : [];
  }, [data.members]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingMember ? editingMember.id : Date.now().toString();
    
    if (editingMember) {
      updateMember(id, formData);
    } else {
      addMember({ ...formData, id } as FamilyMember);
    }
    
    setShowModal(false);
    setEditingMember(null);
    setFormData({
      name: '',
      birthDate: '',
      deathDate: '',
      birthPlace: '',
      occupation: '',
      photo: '',
      children: [],
      spouse: '',
      parent: '',
      notes: '',
    });
  };

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setFormData(member);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这位家族成员吗？')) {
      deleteMember(id);
    }
  };

  const getRelation = (member: FamilyMember) => {
    if (member.parent) {
      const parent = data.members.find(m => m.id === member.parent);
      if (parent) {
        if (parent.spouse === member.spouse || parent.children.includes(member.id)) {
          return parent.children.includes(member.id) ? '子女' : '配偶';
        }
      }
    }
    return '其他';
  };

  return (
    <div className="min-h-screen bg-warm-beige py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-song text-brown-800 mb-2">家谱管理</h1>
            <p className="text-brown-600">管理家族成员信息，查看家族关系图谱</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-lg shadow-sm p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-brown-600 text-white'
                    : 'text-brown-600 hover:bg-brown-50'
                }`}
              >
                <Users className="w-4 h-4" />
                列表
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                  viewMode === 'tree'
                    ? 'bg-brown-600 text-white'
                    : 'text-brown-600 hover:bg-brown-50'
                }`}
              >
                <Layout className="w-4 h-4" />
                图谱
              </button>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-brown-600 text-white px-4 py-2 rounded-lg shadow hover:bg-brown-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加成员
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.members.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="bg-gradient-to-r from-brown-400 to-brown-600 p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-brown-700 shadow">
                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        member.name.charAt(0)
                      )}
                    </div>
                    <div className="text-white">
                      <h3 className="text-xl font-semibold">{member.name}</h3>
                      <p className="text-brown-100 text-sm">{member.occupation || '职业未知'}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2 text-sm text-brown-700">
                    {member.birthDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brown-500" />
                        <span>
                          生于 {member.birthDate}
                          {member.deathDate && ` - 卒于 ${member.deathDate}`}
                        </span>
                      </div>
                    )}
                    {member.birthPlace && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brown-500" />
                        <span>{member.birthPlace}</span>
                      </div>
                    )}
                    {member.occupation && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-brown-500" />
                        <span>{member.occupation}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-brown-500" />
                      <span>关系：{getRelation(member)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-brown-100">
                    <button
                      onClick={() => handleEdit(member)}
                      className="flex-1 py-2 px-3 text-brown-600 hover:bg-brown-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="flex-1 py-2 px-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="h-[600px] w-full">
              {treeData.length > 0 ? (
                <Tree
                  data={treeData}
                  orientation="vertical"
                  translate={{ x: 400, y: 100 }}
                  nodeSize={{ x: 200, y: 150 }}
                  separation={{ siblings: 2, nonSiblings: 2.5 }}
                  pathFunc="diagonal"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-brown-500">
                  暂无家族成员数据，请先添加成员
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-brown-100">
              <h2 className="text-2xl font-bold font-song text-brown-800">
                {editingMember ? '编辑成员' : '添加成员'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">姓名 *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">出生日期</label>
                  <input
                    type="date"
                    value={formData.birthDate || ''}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1">逝世日期</label>
                  <input
                    type="date"
                    value={formData.deathDate || ''}
                    onChange={(e) => setFormData({ ...formData, deathDate: e.target.value })}
                    className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">出生地</label>
                <input
                  type="text"
                  value={formData.birthPlace || ''}
                  onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                  className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">职业</label>
                <input
                  type="text"
                  value={formData.occupation || ''}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">照片 URL</label>
                <input
                  type="url"
                  value={formData.photo || ''}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">父/母 ID</label>
                <select
                  value={formData.parent || ''}
                  onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                  className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                >
                  <option value="">无</option>
                  {data.members
                    .filter(m => !editingMember || m.id !== editingMember.id)
                    .map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">配偶 ID</label>
                <select
                  value={formData.spouse || ''}
                  onChange={(e) => setFormData({ ...formData, spouse: e.target.value })}
                  className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                >
                  <option value="">无</option>
                  {data.members
                    .filter(m => !editingMember || m.id !== editingMember.id)
                    .map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">备注</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-brown-600 text-white py-2 px-4 rounded-lg hover:bg-brown-700 transition-colors"
                >
                  {editingMember ? '保存修改' : '添加成员'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingMember(null);
                    setFormData({
                      name: '',
                      birthDate: '',
                      deathDate: '',
                      birthPlace: '',
                      occupation: '',
                      photo: '',
                      children: [],
                      spouse: '',
                      parent: '',
                      notes: '',
                    });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
