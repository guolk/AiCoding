import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Star,
  Plus,
  Flame,
  Award,
  Activity,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { usePracticeStore } from '@/stores/practiceStore';
import { usePoseStore } from '@/stores/poseStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MasteryTag, Tag } from '@/components/ui/Tags';
import { ProgressCircle } from '@/components/ui/ProgressCircle';
import { 
  PracticeRecord, 
  FlexibilityMeasurement, 
  MasteryLevel, 
  MASTERY_LEVELS,
  OverallRating
} from '@/types';
import { formatDuration, formatDateChinese, getMasteryLabel, formatDate } from '@/utils';

export const PracticeHistory: React.FC = () => {
  const location = useLocation();
  const { getRecords, getStatistics, loadData } = usePracticeStore();
  
  useEffect(() => {
    loadData();
  }, [loadData]);

  const records = getRecords();
  const stats = getStatistics();

  const activeTab = location.pathname === '/practice/progress' 
    ? 'progress' 
    : location.pathname === '/practice/flexibility'
    ? 'flexibility'
    : 'history';

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl font-semibold text-sage-800 mb-2">
            练习追踪
          </h1>
          <p className="text-sage-600">记录和追踪你的瑜伽之旅</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="text-center">
            <Flame size={24} className="mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-semibold text-sage-800">{stats.currentStreak}</div>
            <div className="text-xs text-sage-500">连续练习(天)</div>
          </Card>
          <Card className="text-center">
            <Award size={24} className="mx-auto mb-2 text-sage-500" />
            <div className="text-2xl font-semibold text-sage-800">{stats.totalPractices}</div>
            <div className="text-xs text-sage-500">总练习次数</div>
          </Card>
          <Card className="text-center">
            <Clock size={24} className="mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-semibold text-sage-800">{stats.totalMinutes}</div>
            <div className="text-xs text-sage-500">总分钟数</div>
          </Card>
          <Card className="text-center">
            <TrendingUp size={24} className="mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-semibold text-sage-800">{stats.longestStreak}</div>
            <div className="text-xs text-sage-500">最长连续</div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Link
            to="/practice"
            className={`flex-1 text-center py-3 rounded-xl font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-sage-500 text-white'
                : 'bg-white text-sage-600 hover:bg-sage-50'
            }`}
          >
            练习历史
          </Link>
          <Link
            to="/practice/progress"
            className={`flex-1 text-center py-3 rounded-xl font-medium transition-all ${
              activeTab === 'progress'
                ? 'bg-sage-500 text-white'
                : 'bg-white text-sage-600 hover:bg-sage-50'
            }`}
          >
            体式进度
          </Link>
          <Link
            to="/practice/flexibility"
            className={`flex-1 text-center py-3 rounded-xl font-medium transition-all ${
              activeTab === 'flexibility'
                ? 'bg-sage-500 text-white'
                : 'bg-white text-sage-600 hover:bg-sage-50'
            }`}
          >
            柔韧性自测
          </Link>
        </div>

        {/* History List */}
        <PracticeRecordsList records={records} />
      </div>
    </div>
  );
};

interface PracticeRecordsListProps {
  records: PracticeRecord[];
}

const PracticeRecordsList: React.FC<PracticeRecordsListProps> = ({ records }) => {
  if (records.length === 0) {
    return (
      <Card className="text-center py-12">
        <Calendar size={48} className="mx-auto text-sage-300 mb-4" />
        <p className="text-sage-500 mb-4">还没有练习记录</p>
        <Link to="/sequences">
          <Button>开始第一次练习</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <Card key={record.id} className="hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sage-400 to-olive-500 flex items-center justify-center text-white">
                <Activity size={24} />
              </div>
              <div>
                <div className="font-semibold text-sage-800">{record.sequenceName}</div>
                <div className="text-sm text-sage-500">{formatDateChinese(record.date)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-sage-700">{formatDuration(record.duration)}</div>
              <div className="flex items-center gap-2 mt-1">
                <Tag color={record.energyLevel === 'high' ? 'terracotta' : record.energyLevel === 'medium' ? 'sage' : 'cream'}>
                  能量: {record.energyLevel === 'high' ? '高' : record.energyLevel === 'medium' ? '中' : '低'}
                </Tag>
              </div>
            </div>
          </div>
          {record.bodyFeelings && (
            <div className="mt-3 pt-3 border-t border-cream-100">
              <p className="text-sm text-sage-600">
                <span className="text-sage-500">感受:</span> {record.bodyFeelings}
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export const PoseProgressPage: React.FC = () => {
  const { loadData, poseProgress, setMasteryLevel, getPoseProgress } = usePracticeStore();
  const { poses } = usePoseStore();
  
  const [selectedPoseId, setSelectedPoseId] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const posesWithProgress = poses.map(pose => ({
    ...pose,
    progress: getPoseProgress(pose.id),
  }));

  const selectedPose = selectedPoseId ? poses.find(p => p.id === selectedPoseId) : null;
  const selectedProgress = selectedPoseId ? getPoseProgress(selectedPoseId) : null;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold text-sage-800 mb-2">
            体式掌握进度
          </h1>
          <p className="text-sage-600">追踪你对每个体式的掌握程度</p>
        </div>

        {/* Add Progress */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sage-800">更新体式进度</h3>
              <p className="text-sm text-sage-500">选择一个体式并评估你的掌握程度</p>
            </div>
            <Button onClick={() => setShowSelector(true)}>
              <Plus size={18} />
              选择体式
            </Button>
          </div>

          {selectedPose && selectedProgress && (
            <div className="mt-6 p-4 bg-sage-50 rounded-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sage-400 to-olive-500 flex items-center justify-center text-white text-2xl">
                  🧘
                </div>
                <div>
                  <div className="font-semibold text-sage-800">{selectedPose.nameChinese}</div>
                  <div className="text-sm text-sage-500">{selectedPose.nameSanskrit}</div>
                  {selectedProgress.practiceCount > 0 && (
                    <div className="text-xs text-sage-400 mt-1">
                      已练习 {selectedProgress.practiceCount} 次
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {MASTERY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setMasteryLevel(selectedPose.id, level.value)}
                    className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                      selectedProgress.masteryLevel === level.value
                        ? 'bg-sage-500 text-white'
                        : 'bg-white text-sage-600 hover:bg-sage-100'
                    }`}
                  >
                    {getMasteryLabel(level.value)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Progress Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {posesWithProgress.map(({ progress, ...pose }) => {
            const masteryPercentage = MASTERY_LEVELS.find(
              (m) => m.value === progress.masteryLevel
            )?.percentage || 0;

            return (
              <Card
                key={pose.id}
                className="text-center cursor-pointer"
                onClick={() => {
                  setSelectedPoseId(pose.id);
                  setShowSelector(true);
                }}
              >
                <ProgressCircle progress={masteryPercentage} size={60} strokeWidth={5}>
                  <span className="text-xs font-semibold text-sage-700">
                    {masteryPercentage}%
                  </span>
                </ProgressCircle>
                <div className="mt-3">
                  <div className="text-sm font-medium text-sage-800">{pose.nameChinese}</div>
                  <MasteryTag level={progress.masteryLevel} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Pose Selector Modal */}
        {showSelector && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-sage-800">选择体式</h3>
                <button
                  onClick={() => setShowSelector(false)}
                  className="p-2 hover:bg-sage-50 rounded-lg"
                >
                  <span className="text-sage-500">✕</span>
                </button>
              </div>
              <div className="overflow-y-auto max-h-96">
                {poses.map((pose) => {
                  const progress = getPoseProgress(pose.id);
                  return (
                    <button
                      key={pose.id}
                      onClick={() => {
                        setSelectedPoseId(pose.id);
                        setShowSelector(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-sage-50 transition-colors text-left ${
                        selectedPoseId === pose.id ? 'bg-sage-50' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-sage-100 flex items-center justify-center">
                        <span className="text-lg">🧘</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sage-800">{pose.nameChinese}</div>
                        <div className="text-xs text-sage-500">{pose.nameSanskrit}</div>
                      </div>
                      <MasteryTag level={progress.masteryLevel} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const FlexibilityTestPage: React.FC = () => {
  const { loadData, flexibilityTests, addFlexibilityTest, getFlexibilityTrend } = usePracticeStore();
  
  const [showForm, setShowForm] = useState(false);
  const [measurements, setMeasurements] = useState<FlexibilityMeasurement>({
    hamstrings: 50,
    shoulders: 50,
    hips: 50,
    spine: 50,
  });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [loadData]);

  const trend = getFlexibilityTrend();

  const handleSubmit = () => {
    addFlexibilityTest(measurements, notes);
    setShowForm(false);
    setMeasurements({ hamstrings: 50, shoulders: 50, hips: 50, spine: 50 });
    setNotes('');
  };

  const ratingColors: Record<OverallRating, string> = {
    poor: 'text-red-500',
    fair: 'text-orange-500',
    good: 'text-sage-500',
    excellent: 'text-green-600',
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold text-sage-800 mb-2">
              柔韧性自测
            </h1>
            <p className="text-sage-600">定期自测，追踪你的柔韧性改善</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={18} />
            新建自测
          </Button>
        </div>

        {/* Latest Test */}
        {trend.length > 0 && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sage-800">最近自测</h3>
              <span className="text-sm text-sage-500">{formatDateChinese(trend[0].date)}</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {Object.entries(trend[0].measurements).map(([key, value]) => (
                <div key={key} className="text-center">
                  <ProgressCircle progress={value} size={80} strokeWidth={6}>
                    <span className="text-lg font-semibold text-sage-700">{value}</span>
                  </ProgressCircle>
                  <div className="text-sm text-sage-600 mt-2">
                    {key === 'hamstrings' ? '腘绳肌' : 
                     key === 'shoulders' ? '肩部' :
                     key === 'hips' ? '髋部' : '脊柱'}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-cream-100">
              <span className="text-sage-600">总体评价</span>
              <span className={`font-semibold ${ratingColors[trend[0].overallRating]}`}>
                {trend[0].overallRating === 'excellent' ? '优秀' :
                 trend[0].overallRating === 'good' ? '良好' :
                 trend[0].overallRating === 'fair' ? '一般' : '较差'}
              </span>
            </div>
          </Card>
        )}

        {/* History */}
        {trend.length > 1 && (
          <div>
            <h3 className="font-semibold text-sage-800 mb-3">历史记录</h3>
            <div className="space-y-3">
              {trend.slice(1).map((test) => (
                <Card key={test.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sage-800">{formatDate(test.date)}</div>
                    <div className="flex gap-2 mt-1">
                      {Object.entries(test.measurements).map(([key, value]) => (
                        <span key={key} className="text-xs text-sage-500">
                          {key === 'hamstrings' ? '腘' : 
                           key === 'shoulders' ? '肩' :
                           key === 'hips' ? '髋' : '脊'}: {value}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Tag color={
                    test.overallRating === 'excellent' ? 'olive' :
                    test.overallRating === 'good' ? 'sage' :
                    test.overallRating === 'fair' ? 'cream' : 'terracotta'
                  }>
                    {test.overallRating === 'excellent' ? '优秀' :
                     test.overallRating === 'good' ? '良好' :
                     test.overallRating === 'fair' ? '一般' : '较差'}
                  </Tag>
                </Card>
              ))}
            </div>
          </div>
        )}

        {trend.length === 0 && (
          <Card className="text-center py-12">
            <Star size={48} className="mx-auto text-sage-300 mb-4" />
            <p className="text-sage-500 mb-4">还没有柔韧性自测记录</p>
            <Button onClick={() => setShowForm(true)}>
              开始第一次自测
            </Button>
          </Card>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="font-display text-xl font-semibold text-sage-800 mb-6">
                柔韧性自测
              </h3>

              <div className="space-y-6">
                {Object.entries(measurements).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-medium text-sage-700">
                        {key === 'hamstrings' ? '腘绳肌柔韧性' : 
                         key === 'shoulders' ? '肩部柔韧性' :
                         key === 'hips' ? '髋部柔韧性' : '脊柱柔韧性'}
                      </label>
                      <span className="text-sage-600 font-medium">{value}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) => setMeasurements(prev => ({
                        ...prev,
                        [key]: parseInt(e.target.value)
                      }))}
                      className="w-full h-2 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-sage-500"
                    />
                    <div className="flex justify-between text-xs text-sage-400 mt-1">
                      <span>0</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                  </div>
                ))}

                <div>
                  <label className="block font-medium text-sage-700 mb-2">备注（可选）</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="记录今天的感受..."
                    rows={2}
                    className="input-field resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  保存
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeHistory;
