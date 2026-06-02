import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/store/index.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card.js';
import { Button } from '@/components/ui/Button.js';
import { TextArea, Select } from '@/components/ui/Input.js';
import { StatusBadge, Badge } from '@/components/ui/Badge.js';
import {
  ArrowLeft,
  Save,
  User,
  Calendar,
  BookOpen,
  FileText,
  MessageSquare,
  Plus,
  CheckCircle2
} from 'lucide-react';
import type { StudentReport, ReportStatus } from '../../shared/types.js';

export const ReportDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { fetchReportById, fetchComments, comments, updateReport, loading } = useStore();
  
  const [report, setReport] = useState<StudentReport | null>(null);
  const [feedback, setFeedback] = useState('');
  const [grade, setGrade] = useState('');
  const [status, setStatus] = useState<ReportStatus>('ungraded');
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    if (id) {
      loadData(parseInt(id));
    }
    fetchComments();
  }, [id, fetchReportById, fetchComments]);

  const loadData = async (reportId: number) => {
    const data = await fetchReportById(reportId);
    if (data) {
      setReport(data);
      setFeedback(data.feedback || '');
      setGrade(data.grade?.toString() || '');
      setStatus(data.status);
    }
  };

  const handleSave = async () => {
    if (!report) return;
    
    setSaving(true);
    try {
      await updateReport(report.id, {
        feedback,
        grade: grade ? parseInt(grade) : undefined,
        status
      });
      navigate('/reports');
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setSaving(false);
    }
  };

  const insertComment = (content: string) => {
    setFeedback(prev => prev ? `${prev}\n${content}` : content);
  };

  const filteredComments = selectedCategory
    ? comments.filter(c => c.category === selectedCategory)
    : comments;

  const categories = [...new Set(comments.map(c => c.category))];

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-16 text-slate-500">
        <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p>报告不存在</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/reports')}>
          返回列表
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate('/reports')} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">报告详情</h1>
            <p className="text-sm text-slate-500 mt-1">{report.templateName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <StatusBadge status={report.status} />
          <Button onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4 mr-2" />
            保存批改
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-600" />
                学生信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <InfoItem label="姓名" value={report.studentName} />
                <InfoItem label="学号" value={report.studentNo} />
                <InfoItem label="班级" value={report.className} />
                <InfoItem 
                  label="提交时间" 
                  value={new Date(report.submittedAt).toLocaleString('zh-CN')} 
                />
                {report.gradedAt && (
                  <InfoItem 
                    label="批改时间" 
                    value={new Date(report.gradedAt).toLocaleString('zh-CN')} 
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Table className="w-5 h-5 mr-2 text-primary-600" />
                实验数据
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(report.data).map(([key, value]) => (
                  <div key={key} className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">{key}</p>
                    <p className="text-sm font-medium text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
                思考题回答
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(report.answers).map(([id, answer]) => (
                <div key={id} className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-900 mb-2">第 {id} 题</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>批改操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  批改状态
                </label>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ReportStatus)}
                  options={[
                    { value: 'ungraded', label: '待批改' },
                    { value: 'graded', label: '已批改' },
                    { value: 'needs-revision', label: '需修改' }
                  ]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  评分 (0-100)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={grade || 0}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0</span>
                  <span className="text-lg font-bold text-primary-600">{grade || 0}</span>
                  <span>100</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-primary-600" />
                快捷批语
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={[
                  { value: '', label: '全部分类' },
                  ...categories.map(c => ({ value: c, label: c }))
                ]}
              />
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredComments.map(comment => (
                  <button
                    key={comment.id}
                    onClick={() => insertComment(comment.content)}
                    className="w-full text-left p-2 text-sm bg-slate-50 hover:bg-primary-50 rounded-lg transition-colors group flex items-start"
                  >
                    <Plus className="w-4 h-4 text-slate-400 group-hover:text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 group-hover:text-primary-700 line-clamp-2">
                      {comment.content}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-600" />
                批改意见
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TextArea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="输入批改意见..."
                rows={6}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-500 mb-1">{label}</p>
    <p className="text-sm font-medium text-slate-900">{value}</p>
  </div>
);

const Table: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);
