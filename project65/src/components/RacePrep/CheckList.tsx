import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckListItem } from '../../types';
import { generateId } from '../../utils/helpers';

const defaultCheckList: CheckListItem[] = [
  { id: generateId(), category: 'gear', item: '跑步鞋（比赛用）', checked: false },
  { id: generateId(), category: 'gear', item: '备用跑步鞋', checked: false },
  { id: generateId(), category: 'gear', item: '跑步袜（2双）', checked: false },
  { id: generateId(), category: 'gear', item: '比赛服/背心', checked: false },
  { id: generateId(), category: 'gear', item: '运动短裤/紧身裤', checked: false },
  { id: generateId(), category: 'gear', item: '运动内衣（女）', checked: false },
  { id: generateId(), category: 'gear', item: '帽子/空顶帽', checked: false },
  { id: generateId(), category: 'gear', item: '太阳镜', checked: false },
  { id: generateId(), category: 'gear', item: '运动手表/心率带', checked: false },
  { id: generateId(), category: 'gear', item: '号码布扣/腰带', checked: false },
  { id: generateId(), category: 'gear', item: '凡士林/防磨膏', checked: false },
  { id: generateId(), category: 'gear', item: '创可贴/乳贴', checked: false },
  { id: generateId(), category: 'gear', item: '充电宝', checked: false },
  { id: generateId(), category: 'gear', item: '保温毯（赛后）', checked: false },
  { id: generateId(), category: 'gear', item: '换洗衣物', checked: false },
  { id: generateId(), category: 'gear', item: '拖鞋/凉鞋（赛后）', checked: false },
  
  { id: generateId(), category: 'nutrition', item: '能量胶（每45分钟1个）', checked: false },
  { id: generateId(), category: 'nutrition', item: '能量棒/香蕉', checked: false },
  { id: generateId(), category: 'nutrition', item: '盐丸/电解质片', checked: false },
  { id: generateId(), category: 'nutrition', item: '运动饮料', checked: false },
  { id: generateId(), category: 'nutrition', item: '早餐（赛前3小时）', checked: false },
  { id: generateId(), category: 'nutrition', item: '赛前补给（面包、香蕉）', checked: false },
  { id: generateId(), category: 'nutrition', item: '赛后恢复餐', checked: false },
  { id: generateId(), category: 'nutrition', item: '蛋白粉/恢复奶昔', checked: false },
  
  { id: generateId(), category: 'logistics', item: '身份证/参赛确认函', checked: false },
  { id: generateId(), category: 'logistics', item: '交通预订确认', checked: false },
  { id: generateId(), category: 'logistics', item: '酒店预订确认', checked: false },
  { id: generateId(), category: 'logistics', item: '参赛包领取时间地点', checked: false },
  { id: generateId(), category: 'logistics', item: '起点交通方式', checked: false },
  { id: generateId(), category: 'logistics', item: '存包安排', checked: false },
  { id: generateId(), category: 'logistics', item: '赛后集合地点', checked: false },
  { id: generateId(), category: 'logistics', item: '紧急联系人电话', checked: false },
  { id: generateId(), category: 'logistics', item: '手机（充满电）', checked: false },
  { id: generateId(), category: 'logistics', item: '现金/零钱', checked: false },
  { id: generateId(), category: 'logistics', item: '雨具（根据天气）', checked: false },
  { id: generateId(), category: 'logistics', item: '防晒霜', checked: false }
];

const CheckList: React.FC = () => {
  const { state, dispatch } = useApp();
  const { checkList } = state;
  
  useEffect(() => {
    if (checkList.length === 0) {
      dispatch({ type: 'SET_CHECKLIST', payload: defaultCheckList });
    }
  }, []);
  
  const toggleItem = (id: string) => {
    const updated = checkList.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    dispatch({ type: 'SET_CHECKLIST', payload: updated });
  };
  
  const resetList = () => {
    if (confirm('确定要重置检查清单吗？')) {
      dispatch({ type: 'SET_CHECKLIST', payload: defaultCheckList });
    }
  };
  
  const categories = [
    { key: 'gear', label: '🏃 装备准备', icon: '🎽' },
    { key: 'nutrition', label: '🍎 营养补给', icon: '🍌' },
    { key: 'logistics', label: '🚗 交通后勤', icon: '📋' }
  ];
  
  const totalItems = checkList.length;
  const checkedItems = checkList.filter(i => i.checked).length;
  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  
  return (
    <div className="card">
      <div className="flex-between mb-md">
        <div className="card-title" style={{ marginBottom: 0 }}>比赛当天检查清单</div>
        <button className="btn btn-secondary btn-sm" onClick={resetList}>
          重置清单
        </button>
      </div>
      
      <div className="mb-md">
        <div className="flex-between mb-sm">
          <span className="font-medium">完成进度</span>
          <span className="text-primary font-bold">{checkedItems}/{totalItems} ({progress}%)</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
              background: progress === 100 ? 'var(--success-color)' : undefined
            }}
          />
        </div>
        {progress === 100 && (
          <div className="alert alert-success mt-sm">
            🎉 所有准备工作已完成！祝您比赛顺利！
          </div>
        )}
      </div>
      
      <div className="grid grid-3 gap-md">
        {categories.map(category => {
          const items = checkList.filter(i => i.category === category.key);
          const checked = items.filter(i => i.checked).length;
          
          return (
            <div key={category.key}>
              <div className="flex-between mb-sm">
                <h4 className="font-bold">{category.label}</h4>
                <span className="text-sm text-secondary">
                  {checked}/{items.length}
                </span>
              </div>
              <div className="card" style={{ padding: 0 }}>
                {items.map(item => (
                  <div
                    key={item.id}
                    className={`checkbox-item ${item.checked ? 'checked' : ''}`}
                    onClick={() => toggleItem(item.id)}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(item.id)}
                    />
                    <span className="checkbox-label">{item.item}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="alert alert-info mt-md">
        <strong>📝 建议：</strong>
        赛前一天晚上对照清单整理好所有物品，比赛当天早晨再检查一遍。
        重要物品（如身份证、手机、能量胶）放在随手可取的地方。
      </div>
    </div>
  );
};

export default CheckList;
