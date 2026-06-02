import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/index.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card.js';
import { Button } from '@/components/ui/Button.js';
import { Input } from '@/components/ui/Input.js';
import { Badge } from '@/components/ui/Badge.js';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  BookOpen,
  AlertTriangle,
  ClipboardCheck
} from 'lucide-react';
import type { ExperimentTemplate } from '../../shared/types.js';

export const TemplateList: React.FC = () => {
  const navigate = useNavigate();
  const { templates, fetchTemplates, deleteTemplate, loading } = useStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTemplates(searchKeyword || undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchTemplates, searchKeyword]);

  const handleDelete = async (id: number) => {
    await deleteTemplate(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">实验模板管理</h1>
          <p className="text-sm text-slate-500 mt-1">管理所有实验课程的模板配置</p>
        </div>
        <Button onClick={() => navigate('/templates/new')}>
          <Plus className="w-4 h-4 mr-2" />
          新建模板
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="搜索实验名称、课程..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="info">共 {templates.length} 个模板</Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template, index) => (
            <TemplateCard
              key={template.id}
              template={template}
              index={index}
              onEdit={() => navigate(`/templates/${template.id}`)}
              onView={() => navigate(`/templates/${template.id}`)}
              onDelete={() => setDeleteConfirm(template.id)}
            />
          ))}
          {templates.length === 0 && (
            <div className="col-span-full text-center py-16">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">暂无实验模板</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/templates/new')}>
                <Plus className="w-4 h-4 mr-2" />
                创建第一个模板
              </Button>
            </div>
          )}
        </div>
      )}

      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertTriangle className="w-5 h-5 mr-2" />
                确认删除
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">确定要删除这个实验模板吗？此操作无法撤销。</p>
              <div className="flex justify-end space-x-3">
                <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
                  取消
                </Button>
                <Button variant="danger" onClick={() => handleDelete(deleteConfirm)}>
                  确认删除
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const TemplateCard: React.FC<{
  template: ExperimentTemplate;
  index: number;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
}> = ({ template, index, onEdit, onView, onDelete }) => {
  return (
    <Card
      hover
      className="animate-fade-in-up flex flex-col"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base leading-tight">{template.name}</CardTitle>
          <Badge variant="info">{template.courseName}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
          {template.purpose}
        </p>
        <div className="grid grid-cols-3 gap-2 text-xs text-slate-500">
          <div className="flex items-center">
            <BookOpen className="w-3.5 h-3.5 mr-1.5 text-primary-500" />
            {template.steps.length} 步骤
          </div>
          <div className="flex items-center">
            <ClipboardCheck className="w-3.5 h-3.5 mr-1.5 text-teal-500" />
            {template.questions.length} 题目
          </div>
          <div className="flex items-center">
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
            {template.safetyNotes.length} 注意
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            {new Date(template.updatedAt).toLocaleDateString('zh-CN')}
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={onView}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
