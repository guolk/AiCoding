import { useState, useEffect } from 'react';
import { Plus, X, Check, Trash2, Edit, TrendingDown, Calendar, Flame } from 'lucide-react';
import { useSavingStore } from '../store/savingStore';
import { SavingMeasure, SavingGoal, HabitType, HABIT_INFO } from '../types';
import { generateId } from '../utils/formatter';

export default function Saving() {
  const { 
    measures, 
    goals, 
    habitChecks,
    initData, 
    addMeasure, 
    deleteMeasure,
    toggleHabit,
    isHabitCompleted,
    getStreak,
    addGoal,
    deleteGoal,
    updateGoalProgress
  } = useSavingStore();
  
  const [showMeasureModal, setShowMeasureModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [measureForm, setMeasureForm] = useState({
    name: '',
    category: 'lighting',
    cost: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    estimatedSavings: '',
  });
  const [goalForm, setGoalForm] = useState({
    type: 'cost_saving' as SavingGoal['type'],
    targetValue: '',
    currentValue: '0',
    period: 'monthly' as SavingGoal['period'],
    description: '',
    startDate: new Date().toISOString().split('T')[0],
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  useEffect(() => {
    initData();
  }, [initData]);
  
  const handleAddMeasure = () => {
    addMeasure({
      name: measureForm.name,
      category: measureForm.category,
      cost: parseFloat(measureForm.cost) || 0,
      date: measureForm.date,
      description: measureForm.description,
      estimatedSavings: parseFloat(measureForm.estimatedSavings) || 0,
    });
    setShowMeasureModal(false);
    setMeasureForm({
      name: '',
      category: 'lighting',
      cost: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      estimatedSavings: '',
    });
  };
  
  const handleAddGoal = () => {
    addGoal({
      type: goalForm.type,
      targetValue: parseFloat(goalForm.targetValue) || 0,
      currentValue: parseFloat(goalForm.currentValue) || 0,
      period: goalForm.period,
      description: goalForm.description,
      startDate: goalForm.startDate,
    });
    setShowGoalModal(false);
    setGoalForm({
      type: 'cost_saving',
      targetValue: '',
      currentValue: '0',
      period: 'monthly',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
    });
  };
  
  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };
  
  const weekDates = getWeekDates();
  
  const getHabitIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      Lightbulb: <Flame className="w-4 h-4" />,
      Droplets: <Flame className="w-4 h-4" />,
      Timer: <Calendar className="w-4 h-4" />,
      Plug: <Flame className="w-4 h-4" />,
      Leaf: <Flame className="w-4 h-4" />,
    };
    return icons[iconName] || <Check className="w-4 h-4" />;
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">节能习惯打卡</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">本周</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {(Object.keys(HABIT_INFO) as HabitType[]).map(habitType => {
              const info = HABIT_INFO[habitType];
              const streak = getStreak(habitType);
              
              return (
                <div key={habitType} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
                        {getHabitIcon(info.icon)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{info.name}</p>
                        <p className="text-xs text-gray-500">{info.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary-600">{streak}天</p>
                      <p className="text-xs text-gray-400">连续打卡</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {weekDates.map(date => {
                      const completed = isHabitCompleted(habitType, date);
                      const dayName = new Date(date).toLocaleDateString('zh-CN', { weekday: 'short' });
                      
                      return (
                        <button
                          key={date}
                          onClick={() => toggleHabit(habitType, date)}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                            completed
                              ? 'bg-primary-500 text-white shadow-md'
                              : 'bg-white text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          <div className="mb-1">{dayName}</div>
                          <div className={`w-4 h-4 mx-auto rounded-full ${
                            completed ? 'bg-white/30' : 'border border-gray-300'
                          }`}>
                            {completed && <Check className="w-3 h-3 mx-auto text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">节能目标</h3>
            <button
              onClick={() => setShowGoalModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              添加目标
            </button>
          </div>
          
          <div className="space-y-4">
            {goals.map(goal => {
              const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
              const typeLabels: Record<string, string> = {
                cost_saving: '节省金额',
                usage_reduction: '减少用量',
                carbon_reduction: '减少碳排放',
              };
              
              return (
                <div key={goal.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-600 rounded text-xs font-medium">
                        {goal.period === 'monthly' ? '月度' : '年度'}
                      </span>
                      <span className="text-sm text-gray-500">{typeLabels[goal.type]}</span>
                    </div>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-medium text-gray-800 mb-3">{goal.description}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            progress >= 100 
                              ? 'bg-gradient-to-r from-green-400 to-green-500' 
                              : 'bg-gradient-to-r from-primary-400 to-primary-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 min-w-[80px] text-right">
                      {goal.currentValue}/{goal.targetValue}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="range"
                      min="0"
                      max={goal.targetValue * 2}
                      value={goal.currentValue}
                      onChange={e => updateGoalProgress(goal.id, parseFloat(e.target.value))}
                      className="flex-1 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">节能措施</h3>
            <p className="text-sm text-gray-500">记录您采取的节能措施和效果</p>
          </div>
          <button
            onClick={() => setShowMeasureModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 btn-primary"
          >
            <Plus className="w-4 h-4" />
            添加措施
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {measures.map(measure => (
            <div key={measure.id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <button
                  onClick={() => deleteMeasure(measure.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <h4 className="font-semibold text-gray-800 mb-1">{measure.name}</h4>
              <p className="text-sm text-gray-500 mb-3">{measure.description}</p>
              
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">投入成本</p>
                  <p className="font-semibold text-gray-700">¥{measure.cost}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">预计月省</p>
                  <p className="font-semibold text-primary-600">¥{measure.estimatedSavings || 0}</p>
                </div>
                {measure.actualSavings && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">实际月省</p>
                    <p className="font-semibold text-green-600">¥{measure.actualSavings}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {showMeasureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800">添加节能措施</h3>
              <button
                onClick={() => setShowMeasureModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">措施名称</label>
                <input
                  type="text"
                  value={measureForm.name}
                  onChange={e => setMeasureForm({ ...measureForm, name: e.target.value })}
                  className="input-field"
                  placeholder="如：更换LED灯泡"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">投入成本 (元)</label>
                  <input
                    type="number"
                    value={measureForm.cost}
                    onChange={e => setMeasureForm({ ...measureForm, cost: e.target.value })}
                    className="input-field"
                    placeholder="200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">预计月省 (元)</label>
                  <input
                    type="number"
                    value={measureForm.estimatedSavings}
                    onChange={e => setMeasureForm({ ...measureForm, estimatedSavings: e.target.value })}
                    className="input-field"
                    placeholder="50"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">实施日期</label>
                <input
                  type="date"
                  value={measureForm.date}
                  onChange={e => setMeasureForm({ ...measureForm, date: e.target.value })}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">详细描述</label>
                <textarea
                  value={measureForm.description}
                  onChange={e => setMeasureForm({ ...measureForm, description: e.target.value })}
                  className="input-field h-24 resize-none"
                  placeholder="详细描述节能措施..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowMeasureModal(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleAddMeasure}
                className="flex-1 btn-primary"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800">设置节能目标</h3>
              <button
                onClick={() => setShowGoalModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">目标类型</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'cost_saving', label: '节省金额' },
                    { value: 'usage_reduction', label: '减少用量' },
                    { value: 'carbon_reduction', label: '减少碳排' },
                  ] as const).map(type => (
                    <button
                      key={type.value}
                      onClick={() => setGoalForm({ ...goalForm, type: type.value })}
                      className={`py-2 rounded-xl border-2 transition-all text-sm font-medium ${
                        goalForm.type === type.value
                          ? 'border-primary-500 bg-primary-50 text-primary-600'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">目标值</label>
                  <input
                    type="number"
                    value={goalForm.targetValue}
                    onChange={e => setGoalForm({ ...goalForm, targetValue: e.target.value })}
                    className="input-field"
                    placeholder="200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">周期</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['monthly', 'yearly'] as const).map(period => (
                      <button
                        key={period}
                        onClick={() => setGoalForm({ ...goalForm, period })}
                        className={`py-2.5 rounded-xl border-2 transition-all text-sm font-medium ${
                          goalForm.period === period
                            ? 'border-primary-500 bg-primary-50 text-primary-600'
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {period === 'monthly' ? '月度' : '年度'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">目标描述</label>
                <input
                  type="text"
                  value={goalForm.description}
                  onChange={e => setGoalForm({ ...goalForm, description: e.target.value })}
                  className="input-field"
                  placeholder="本月节省电费200元"
                />
              </div>
            </div>
            
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowGoalModal(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleAddGoal}
                className="flex-1 btn-primary"
              >
                确认设置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
