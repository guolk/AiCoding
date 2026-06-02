import React, { useState } from 'react';
import { CheckSquare, Clock, FileText, Mic, Radio, Users, ChevronDown, ChevronUp, Edit2, Save, RotateCcw } from 'lucide-react';
import Card from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import { useAppStore } from '../../store/useAppStore';

interface CheckItem {
  id: string;
  name: string;
  category: string;
  completed: boolean;
  notes?: string;
}

const PrepChecklist: React.FC = () => {
  const { matches, prepChecklists, updatePrepChecklist } = useAppStore();
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0]?.id || '');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    data: true,
    equipment: true,
    script: true,
    rehearsal: false,
  });

  const currentChecklist = prepChecklists.find(p => p.matchId === selectedMatchId);
  const currentMatch = matches.find(m => m.id === selectedMatchId);

  const [checkItems, setCheckItems] = useState<CheckItem[]>([
    { id: '1', name: '收集两队近期战绩和排名', category: 'data', completed: true },
    { id: '2', name: '整理核心球员数据和伤病情况', category: 'data', completed: true },
    { id: '3', name: '准备历史交锋记录', category: 'data', completed: false },
    { id: '4', name: '查找教练战术风格资料', category: 'data', completed: false },
    { id: '5', name: '收集球员趣闻和故事素材', category: 'data', completed: true },
    { id: '6', name: '测试麦克风音质', category: 'equipment', completed: true },
    { id: '7', name: '检查网络连接稳定性', category: 'equipment', completed: true },
    { id: '8', name: '测试直播推流设备', category: 'equipment', completed: false },
    { id: '9', name: '准备备用耳机和麦克风', category: 'equipment', completed: true },
    { id: '10', name: '检查直播间灯光和背景', category: 'equipment', completed: false },
    { id: '11', name: '完成开场词和背景介绍', category: 'script', completed: true },
    { id: '12', name: '准备战术分析要点', category: 'script', completed: false },
    { id: '13', name: '设置关键时间节点提醒', category: 'script', completed: true },
    { id: '14', name: '准备紧急情况备用台词', category: 'script', completed: true },
    { id: '15', name: '完成互动环节设计', category: 'script', completed: false },
    { id: '16', name: '进行30分钟模拟解说', category: 'rehearsal', completed: false },
    { id: '17', name: '调整语速和语调', category: 'rehearsal', completed: false },
    { id: '18', name: '检查专业术语发音', category: 'rehearsal', completed: false },
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleItem = (id: string) => {
    setCheckItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const updateItemNotes = (id: string, notes: string) => {
    setCheckItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, notes } : item
      )
    );
  };

  const getItemsByCategory = (category: string) => {
    return checkItems.filter(item => item.category === category);
  };

  const getCategoryProgress = (category: string) => {
    const items = getItemsByCategory(category);
    const completed = items.filter(i => i.completed).length;
    return items.length > 0 ? Math.round((completed / items.length) * 100) : 0;
  };

  const totalProgress = Math.round(
    (checkItems.filter(i => i.completed).length / checkItems.length) * 100
  );

  const categoryConfig: Record<string, { name: string; icon: React.ReactNode; color: string }> = {
    data: { name: '资料收集', icon: <FileText className="w-4 h-4" />, color: 'bg-blue-500' },
    equipment: { name: '器材测试', icon: <Radio className="w-4 h-4" />, color: 'bg-green-500' },
    script: { name: '备稿准备', icon: <Edit2 className="w-4 h-4" />, color: 'bg-orange-500' },
    rehearsal: { name: '彩排演练', icon: <Mic className="w-4 h-4" />, color: 'bg-purple-500' },
  };

  const handleSave = () => {
    if (currentChecklist) {
      updatePrepChecklist(currentChecklist.id, {
        items: checkItems.map(item => ({
          id: item.id,
          title: item.name,
          description: item.notes || '',
          category: item.category as any,
          completed: item.completed,
        })),
      });
    }
  };

  const handleReset = () => {
    setCheckItems(prev => prev.map(item => ({ ...item, completed: false, notes: '' })));
  };

  const getMatchTime = (startTime: string) => {
    const date = new Date(startTime);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">赛前准备清单</h1>
          <p className="text-gray-500 mt-1">确保每场解说准备充分</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            重置
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <Card.Title className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-indigo-600" />
                  准备进度
                </Card.Title>
                <Badge variant={totalProgress === 100 ? 'success' : 'primary'}>
                  {totalProgress}% 完成
                </Badge>
              </div>
            </Card.Header>
            <Card.Content>
              <Progress value={totalProgress} className="h-3" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {Object.entries(categoryConfig).map(([key, config]) => {
                  const progress = getCategoryProgress(key);
                  return (
                    <div key={key} className="text-center">
                      <div className={`w-12 h-12 rounded-full ${config.color} bg-opacity-20 flex items-center justify-center mx-auto mb-2`}>
                        <span className={config.color.replace('bg-', 'text-')}>{config.icon}</span>
                      </div>
                      <p className="font-medium text-gray-900">{config.name}</p>
                      <p className="text-2xl font-bold text-gray-700">{progress}%</p>
                    </div>
                  );
                })}
              </div>
            </Card.Content>
          </Card>

          {Object.entries(categoryConfig).map(([key, config]) => (
            <Card key={key}>
              <Card.Header>
                <button
                  className="w-full flex items-center justify-between"
                  onClick={() => toggleSection(key)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${config.color} bg-opacity-20 flex items-center justify-center`}>
                      <span className={config.color.replace('bg-', 'text-')}>{config.icon}</span>
                    </div>
                    <div className="text-left">
                      <Card.Title className="text-base">{config.name}</Card.Title>
                      <p className="text-sm text-gray-500">
                        {getItemsByCategory(key).filter(i => i.completed).length} / {getItemsByCategory(key).length} 已完成
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24">
                      <Progress value={getCategoryProgress(key)} />
                    </div>
                    {expandedSections[key] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
              </Card.Header>
              {expandedSections[key] && (
                <Card.Content className="pt-0">
                  <div className="space-y-3">
                    {getItemsByCategory(key).map(item => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg border transition-all ${
                          item.completed
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleItem(item.id)}
                            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              item.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {item.completed && (
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <div className="flex-1">
                            <p className={`font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                              {item.name}
                            </p>
                            <input
                              type="text"
                              placeholder="添加备注..."
                              value={item.notes || ''}
                              onChange={(e) => updateItemNotes(item.id, e.target.value)}
                              className="mt-1 w-full text-sm text-gray-500 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Content>
              )}
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                选择比赛
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <select
                value={selectedMatchId}
                onChange={(e) => setSelectedMatchId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {matches.map(match => (
                  <option key={match.id} value={match.id}>
                    {match.homeTeam?.name} vs {match.awayTeam?.name}
                  </option>
                ))}
              </select>
            </Card.Content>
          </Card>

          {currentMatch && (
            <Card>
              <Card.Header>
                <Card.Title className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  倒计时
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">距离比赛开始还有</p>
                  <div className="flex justify-center gap-2">
                    <div className="bg-indigo-100 rounded-lg p-3">
                      <p className="text-2xl font-bold text-indigo-600">2</p>
                      <p className="text-xs text-gray-500">天</p>
                    </div>
                    <div className="bg-indigo-100 rounded-lg p-3">
                      <p className="text-2xl font-bold text-indigo-600">05</p>
                      <p className="text-xs text-gray-500">时</p>
                    </div>
                    <div className="bg-indigo-100 rounded-lg p-3">
                      <p className="text-2xl font-bold text-indigo-600">32</p>
                      <p className="text-xs text-gray-500">分</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">
                    {new Date(currentMatch.startTime).toLocaleDateString('zh-CN')} {getMatchTime(currentMatch.startTime)}
                  </p>
                </div>
              </Card.Content>
            </Card>
          )}

          <Card>
            <Card.Header>
              <Card.Title>快速提示</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                  <p className="text-gray-600">提前24小时完成资料收集</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></span>
                  <p className="text-gray-600">赛前1小时完成器材测试</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></span>
                  <p className="text-gray-600">准备至少3条备用台词</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></span>
                  <p className="text-gray-600">彩排时录屏自查语速</p>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrepChecklist;
