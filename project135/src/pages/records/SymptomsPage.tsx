import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Save, X, Filter, AlertTriangle, MapPin, Calendar, Info, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '@/components/Card';
import { useAppStore } from '@/store';
import { HEALTH_ADVICE } from '@/data/healthAdvice';
import { formatDate, formatDateCN } from '@/utils/date';
import type { Symptom } from '@/types';

const CONSTITUTION_TYPES = ['平和质', '气虚质', '阳虚质', '阴虚质', '痰湿质', '湿热质', '血瘀质', '气郁质', '特禀质'];

const BODY_LOCATIONS = ['头部', '颈部', '胸部', '腹部', '背部', '腰部', '上肢', '下肢', '全身', '其他'];

const COMMON_SYMPTOMS = ['头痛', '头晕', '失眠', '疲劳', '胃痛', '腹痛', '腹泻', '便秘', '咳嗽', '胸闷', '心悸', '关节痛', '肌肉酸痛', '皮肤瘙痒', '口干', '口苦', '口臭', '食欲不振', '恶心', '呕吐'];

export default function SymptomsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<number | ''>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedConstitution, setSelectedConstitution] = useState('');

  const [formData, setFormData] = useState<Omit<Symptom, 'id'>>({
    name: '',
    date: formatDate(new Date()),
    severity: 5,
    location: '',
    relatedConstitution: '',
    notes: '',
  });

  const addSymptom = useAppStore((state) => state.addSymptom);
  const updateSymptom = useAppStore((state) => state.updateSymptom);
  const deleteSymptom = useAppStore((state) => state.deleteSymptom);
  const symptoms = useAppStore((state) => state.symptoms);

  const filteredSymptoms = useMemo(() => {
    return symptoms
      .filter((s) => !filterDate || s.date === filterDate)
      .filter((s) => filterSeverity === '' || s.severity === filterSeverity)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [symptoms, filterDate, filterSeverity]);

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      date: formatDate(new Date()),
      severity: 5,
      location: '',
      relatedConstitution: '',
      notes: '',
    });
    setShowForm(true);
  };

  const handleEdit = (symptom: Symptom) => {
    setEditingId(symptom.id);
    setFormData({
      name: symptom.name,
      date: symptom.date,
      severity: symptom.severity,
      location: symptom.location,
      relatedConstitution: symptom.relatedConstitution,
      notes: symptom.notes,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条症状记录吗？')) {
      deleteSymptom(id);
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert('请输入症状名称');
      return;
    }

    if (editingId) {
      updateSymptom(editingId, formData);
    } else {
      const newSymptom: Symptom = {
        ...formData,
        id: String(Date.now()),
      };
      addSymptom(newSymptom);
    }
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return 'text-red-600 bg-red-50 border-red-200';
    if (severity >= 5) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity >= 8) return '严重';
    if (severity >= 5) return '中度';
    return '轻微';
  };

  const getConstitutionAdvice = (constitution: string) => {
    if (!constitution) return null;
    const advice = HEALTH_ADVICE.find((h) => h.type === constitution);
    return advice;
  };

  const getSymptomConstitutionRelation = (symptomName: string): string => {
    const relations: Record<string, string[]> = {
      '气虚质': ['疲劳', '头晕', '食欲不振', '心悸'],
      '阳虚质': ['怕冷', '手脚冰凉', '腹泻', '腹痛'],
      '阴虚质': ['口干', '失眠', '头晕', '皮肤瘙痒'],
      '痰湿质': ['胸闷', '恶心', '食欲不振', '疲劳'],
      '湿热质': ['口苦', '口臭', '便秘', '皮肤瘙痒'],
      '血瘀质': ['头痛', '关节痛', '肌肉酸痛', '胸闷'],
      '气郁质': ['失眠', '头痛', '胸闷', '食欲不振'],
      '特禀质': ['皮肤瘙痒', '咳嗽', '打喷嚏', '皮疹'],
    };
    for (const [constitution, symptoms] of Object.entries(relations)) {
      if (symptoms.some((s) => symptomName.includes(s))) {
        return constitution;
      }
    }
    return '';
  };

  const relatedConstitution = formData.relatedConstitution || getSymptomConstitutionRelation(formData.name);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">症状日记</h1>
            <p className="text-gray-600">记录身体不适，分析症状与体质关系</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            添加症状
          </button>
        </div>

        <Card>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">筛选：</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gray-500" />
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                >
                  <option value="">全部严重程度</option>
                  <option value="1">轻微 (1-3)</option>
                  <option value="5">中度 (4-7)</option>
                  <option value="8">严重 (8-10)</option>
                </select>
              </div>
              {(filterDate || filterSeverity !== '') && (
                <button
                  onClick={() => {
                    setFilterDate('');
                    setFilterSeverity('');
                  }}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  清除筛选
                </button>
              )}
            </div>
          </div>
        </Card>

        {showForm && (
          <Card title={editingId ? '编辑症状' : '添加症状'}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">症状名称 *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="输入或选择常见症状"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {COMMON_SYMPTOMS.slice(0, 10).map((symptom) => (
                      <button
                        key={symptom}
                        onClick={() => setFormData({ ...formData, name: symptom })}
                        className={`px-2 py-1 text-xs rounded-full transition-colors ${
                          formData.name === symptom
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">日期</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    严重程度：{formData.severity} / 10 ({getSeverityLabel(formData.severity)})
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>轻微</span>
                    <span>中度</span>
                    <span>严重</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">部位</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    >
                      <option value="">选择部位</option>
                      {BODY_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">关联体质</label>
                <select
                  value={formData.relatedConstitution}
                  onChange={(e) => setFormData({ ...formData, relatedConstitution: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                >
                  <option value="">{relatedConstitution ? `建议关联：${relatedConstitution}` : '选择关联体质'}</option>
                  {CONSTITUTION_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {relatedConstitution && !formData.relatedConstitution && (
                  <p className="text-xs text-amber-600 mt-1">
                    <Info className="w-3 h-3 inline mr-1" />
                    根据症状名称，建议关联「{relatedConstitution}」
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="记录症状的详细描述、诱发因素、缓解方式等..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition-all"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  <X className="w-4 h-4 inline mr-1" />
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  {editingId ? '更新' : '保存'}
                </button>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-3">
          {filteredSymptoms.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">暂无症状记录</p>
                <p className="text-sm text-gray-400 mt-1">点击上方「添加症状」开始记录</p>
              </div>
            </Card>
          ) : (
            filteredSymptoms.map((symptom) => (
              <Card key={symptom.id}>
                <div
                  className="cursor-pointer"
                  onClick={() => setExpandedId(expandedId === symptom.id ? null : symptom.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`px-3 py-1 rounded-lg text-sm font-medium border ${getSeverityColor(symptom.severity)}`}>
                        {symptom.severity}分
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-800">{symptom.name}</h3>
                          {symptom.location && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {symptom.location}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDateCN(new Date(symptom.date))}
                          </span>
                          {symptom.relatedConstitution && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                              {symptom.relatedConstitution}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(symptom);
                        }}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(symptom.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {expandedId === symptom.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedId === symptom.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {symptom.notes && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">详细描述</p>
                        <p className="text-gray-700">{symptom.notes}</p>
                      </div>
                    )}
                    {symptom.relatedConstitution && (
                      <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                        <h4 className="font-medium text-primary mb-2 flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          {symptom.relatedConstitution}相关建议
                        </h4>
                        {getConstitutionAdvice(symptom.relatedConstitution) && (
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">体质特点</p>
                              <p className="text-sm text-gray-700">
                                {getConstitutionAdvice(symptom.relatedConstitution)?.description}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">饮食建议</p>
                              <ul className="text-sm text-gray-700 space-y-1">
                                {getConstitutionAdvice(symptom.relatedConstitution)?.diet.slice(0, 3).map((d, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    {d}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">生活方式建议</p>
                              <ul className="text-sm text-gray-700 space-y-1">
                                {getConstitutionAdvice(symptom.relatedConstitution)?.lifestyle.slice(0, 3).map((l, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    {l}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        <Card title="症状与体质关联分析">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">选择体质查看相关症状建议</label>
            <select
              value={selectedConstitution}
              onChange={(e) => setSelectedConstitution(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option value="">请选择体质类型</option>
              {CONSTITUTION_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          {selectedConstitution && getConstitutionAdvice(selectedConstitution) && (
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <h4 className="font-medium text-primary mb-2">{selectedConstitution}特点</h4>
                <p className="text-sm text-gray-700">{getConstitutionAdvice(selectedConstitution)?.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <h5 className="font-medium text-green-700 mb-2">常见相关症状</h5>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const constitutionSymptoms: Record<string, string[]> = {
                        '气虚质': ['疲劳', '头晕', '食欲不振', '心悸', '气短', '易感冒'],
                        '阳虚质': ['怕冷', '手脚冰凉', '腹泻', '腹痛', '腰膝酸软'],
                        '阴虚质': ['口干', '失眠', '头晕', '皮肤瘙痒', '手足心热'],
                        '痰湿质': ['胸闷', '恶心', '食欲不振', '疲劳', '身体沉重'],
                        '湿热质': ['口苦', '口臭', '便秘', '皮肤瘙痒', '面垢油光'],
                        '血瘀质': ['头痛', '关节痛', '肌肉酸痛', '胸闷', '肤色晦暗'],
                        '气郁质': ['失眠', '头痛', '胸闷', '食欲不振', '情绪低落'],
                        '特禀质': ['皮肤瘙痒', '咳嗽', '打喷嚏', '皮疹', '鼻塞'],
                        '平和质': ['精力充沛', '睡眠良好', '食欲佳', '二便调'],
                      };
                      return constitutionSymptoms[selectedConstitution]?.map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          {s}
                        </span>
                      ));
                    })()}
                  </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <h5 className="font-medium text-amber-700 mb-2">调理建议</h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {getConstitutionAdvice(selectedConstitution)?.lifestyle.slice(0, 4).map((l, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-600">•</span>
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
