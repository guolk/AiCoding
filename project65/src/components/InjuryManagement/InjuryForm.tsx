import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InjuryRecord } from '../../types';
import { generateId } from '../../utils/helpers';

interface InjuryFormProps {
  onClose: () => void;
  editInjury?: InjuryRecord;
}

const commonInjuries = [
  '跑步膝（髌股关节疼痛综合征）',
  '胫骨内侧应力综合征',
  '跟腱炎',
  '足底筋膜炎',
  '髂胫束摩擦综合征',
  '肌肉拉伤',
  '应力性骨折',
  '踝关节扭伤',
  '其他'
];

const InjuryForm: React.FC<InjuryFormProps> = ({ onClose, editInjury }) => {
  const { dispatch } = useApp();
  
  const [formData, setFormData] = useState<Partial<InjuryRecord>>({
    startDate: new Date().toISOString().split('T')[0],
    type: '',
    severity: 'mild',
    description: '',
    recommendations: '',
    active: true,
    ...editInjury
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.startDate) {
      alert('请填写受伤类型和日期');
      return;
    }
    
    const recommendations = getRecommendations(formData.type || '', formData.severity || 'mild');
    
    const injury: InjuryRecord = {
      id: editInjury?.id || generateId(),
      startDate: formData.startDate!,
      endDate: formData.endDate,
      type: formData.type!,
      severity: formData.severity as InjuryRecord['severity'],
      description: formData.description || '',
      recommendations: formData.recommendations || recommendations,
      active: formData.active ?? true,
    };
    
    if (editInjury) {
      dispatch({ type: 'UPDATE_INJURY', payload: injury });
    } else {
      dispatch({ type: 'ADD_INJURY', payload: injury });
    }
    
    onClose();
  };
  
  const getRecommendations = (type: string, severity: string): string => {
    const baseRecommendations: Record<string, string> = {
      '跑步膝（髌股关节疼痛综合征）': '休息2-4周，避免下坡跑，加强股四头肌力量训练，检查跑鞋是否合适',
      '胫骨内侧应力综合征': '减少跑量50%，避免硬地跑步，加强小腿肌肉力量，进行冰敷',
      '跟腱炎': '停止跑步7-14天，进行跟腱拉伸和离心训练，夜间佩戴支具',
      '足底筋膜炎': '休息，足底拉伸和按摩，使用足弓支撑，避免赤脚走路',
      '髂胫束摩擦综合征': '减少跑量，进行髂胫束拉伸，加强臀中肌训练',
      '肌肉拉伤': '立即停止运动，RICE原则（休息、冰敷、加压、抬高），完全恢复后再逐渐恢复训练',
      '应力性骨折': '立即停止跑步，就医检查，可能需要石膏或支具固定，恢复期2-3个月',
      '踝关节扭伤': 'RICE原则，佩戴护踝，进行踝关节稳定性训练',
      '其他': '建议就医诊断，遵循医生建议进行恢复'
    };
    
    let rec = baseRecommendations[type] || '建议适当休息，观察症状变化，必要时就医。';
    
    if (severity === 'severe') {
      rec += '\n\n⚠️ 严重损伤：强烈建议立即停止所有跑步训练，尽早就医诊断和治疗。';
    } else if (severity === 'moderate') {
      rec += '\n\n⚠️ 中度损伤：减少训练量70%，以交叉训练为主，密切关注症状变化。';
    } else {
      rec += '\n\n💡 轻度损伤：减少训练量50%，多做交叉训练（游泳、自行车），注意恢复。';
    }
    
    return rec;
  };
  
  return (
    <>
      <div className="modal-header">
        <div className="modal-title">{editInjury ? '编辑伤病记录' : '记录伤病'}</div>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      
      <form onSubmit={handleSubmit}>
          <div className="grid grid-2 gap-md">
            <div className="form-group">
              <label className="form-label">受伤日期</label>
              <input
                type="date"
                className="form-input"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">严重程度</label>
              <select
                className="form-select"
                value={formData.severity}
                onChange={e => setFormData({ ...formData, severity: e.target.value as any })}
              >
                <option value="mild">🟡 轻度</option>
                <option value="moderate">🟠 中度</option>
                <option value="severe">🔴 严重</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">伤病类型</label>
            <select
              className="form-select"
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="">请选择伤病类型</option>
              {commonInjuries.map(injury => (
                <option key={injury} value={injury}>{injury}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">症状描述</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="描述您的症状、疼痛部位、疼痛程度等..."
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              康复建议
              <span className="text-sm text-secondary ml-sm">（将根据伤病类型自动生成，可编辑）</span>
            </label>
            <textarea
              className="form-textarea"
              value={formData.recommendations || getRecommendations(formData.type || '', formData.severity || 'mild')}
              onChange={e => setFormData({ ...formData, recommendations: e.target.value })}
              rows={6}
            />
          </div>
          
          {editInjury && (
            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={e => setFormData({ ...formData, active: e.target.checked })}
                  className="mr-sm"
                />
                仍在恢复中
              </label>
              {!formData.active && (
                <div className="mt-sm">
                  <label className="form-label">康复日期</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.endDate || ''}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end gap-sm mt-lg">
            <button type="button" className="btn btn-secondary" onClick={onClose}>取消</button>
            <button type="submit" className="btn btn-primary">{editInjury ? '保存修改' : '添加记录'}</button>
          </div>
        </form>
    </>
  );
};

export default InjuryForm;
