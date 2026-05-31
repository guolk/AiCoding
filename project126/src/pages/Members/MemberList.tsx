import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit, Trash2, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import { useMemberStore } from '@/stores/useMemberStore';
import { useCardStore } from '@/stores/useCardStore';
import { getDaysBetween, getToday } from '@/utils/date';
import type { Member } from '@/types/member';

export const MemberList = () => {
  const navigate = useNavigate();
  const { members, searchMembers, deleteMember } = useMemberStore();
  const { getMemberCardsByMemberId, cardTypes } = useCardStore();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredMembers = searchMembers(keyword).filter((m) => {
    if (statusFilter === 'all') return true;
    return m.status === statusFilter;
  });

  const totalPages = Math.ceil(filteredMembers.length / pageSize);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getMemberCardInfo = (member: Member) => {
    const cards = getMemberCardsByMemberId(member.id);
    if (cards.length === 0) return { status: '无卡', color: 'text-slate-400 bg-slate-100' };
    
    const activeCard = cards.find((c) => c.status === 'active');
    if (activeCard) {
      const cardType = cardTypes.find((ct) => ct.id === activeCard.cardTypeId);
      const daysLeft = getDaysBetween(getToday(), activeCard.endDate);
      
      if (daysLeft < 0) {
        return { status: '已过期', color: 'text-rose-600 bg-rose-100' };
      } else if (daysLeft <= 7) {
        return { status: `剩${daysLeft}天`, color: 'text-orange-600 bg-orange-100' };
      }
      return { status: cardType?.name || '有效', color: 'text-emerald-600 bg-emerald-100' };
    }
    
    return { status: '已停用', color: 'text-slate-500 bg-slate-100' };
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`确定要删除会员「${name}」吗？此操作不可恢复。`)) {
      deleteMember(id);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return { text: '正常', color: 'text-emerald-600 bg-emerald-100' };
      case 'inactive':
        return { text: '停用', color: 'text-slate-500 bg-slate-100' };
      case 'expired':
        return { text: '过期', color: 'text-rose-600 bg-rose-100' };
      default:
        return { text: status, color: 'text-slate-500 bg-slate-100' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">会员管理</h1>
          <p className="text-slate-500 mt-1">管理所有会员档案信息</p>
        </div>
        <Link
          to="/members/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          新增会员
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索姓名或手机号..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
            >
              <option value="all">全部状态</option>
              <option value="active">正常</option>
              <option value="inactive">停用</option>
              <option value="expired">过期</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">会员</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">联系方式</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">加入时间</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">会员卡状态</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">状态</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.map((member) => {
                const cardInfo = getMemberCardInfo(member);
                const statusLabel = getStatusLabel(member.status);
                return (
                  <tr key={member.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="w-12 h-12 rounded-xl object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/96/user-male-circle--v1.png';
                          }}
                        />
                        <div>
                          <p className="font-medium text-slate-800">{member.name}</p>
                          <p className="text-sm text-slate-500">{member.recommender && `推荐人: ${member.recommender}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-slate-800">{member.phone}</p>
                      {member.emergencyContact && (
                        <p className="text-sm text-slate-500">紧急联系人: {member.emergencyContact}</p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-600">{member.joinDate}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${cardInfo.color}`}>
                        {cardInfo.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${statusLabel.color}`}>
                        {statusLabel.text}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/members/${member.id}`)}
                          className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/members/${member.id}`)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id, member.name)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {paginatedMembers.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无会员数据</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              共 {filteredMembers.length} 条记录，第 {currentPage} / {totalPages} 页
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
