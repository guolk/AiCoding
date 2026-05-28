import { useState } from 'react';
import { Plus, Edit2, Trash2, Heart, AlertTriangle, Calendar } from 'lucide-react';
import { useStore } from '../store';
import type { EmotionRecord, BiasRecognition } from '../types';

type TabType = 'emotions' | 'biases';

export default function Psychology() {
  const [activeTab, setActiveTab] = useState<TabType>('emotions');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionRecord | null>(null);
  const [selectedBias, setSelectedBias] = useState<BiasRecognition | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    emotion: 'calm' as 'fear' | 'greed' | 'calm',
    context: '',
    impact: '',
    bias_type: 'confirmation' as 'confirmation' | 'anchoring' | 'overconfidence' | 'loss_aversion' | 'herding',
    description: '',
    awareness: '',
  });

  const {
    emotionRecords,
    biasRecognitions,
    addEmotionRecord,
    updateEmotionRecord,
    deleteEmotionRecord,
    addBiasRecognition,
    updateBiasRecognition,
    deleteBiasRecognition,
  } = useStore();

  const handleSave = () => {
    if (activeTab === 'emotions') {
      if (selectedEmotion) {
        updateEmotionRecord(selectedEmotion.id, {
          emotion: formData.emotion,
          context: formData.context,
          impact: formData.impact,
        });
      } else {
        addEmotionRecord({
          emotion: formData.emotion,
          context: formData.context,
          impact: formData.impact,
        });
      }
    } else {
      if (selectedBias) {
        updateBiasRecognition(selectedBias.id, {
          bias_type: formData.bias_type,
          description: formData.description,
          awareness: formData.awareness,
        });
      } else {
        addBiasRecognition({
          bias_type: formData.bias_type,
          description: formData.description,
          awareness: formData.awareness,
        });
      }
    }
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      emotion: 'calm',
      context: '',
      impact: '',
      bias_type: 'confirmation',
      description: '',
      awareness: '',
    });
    setSelectedEmotion(null);
    setSelectedBias(null);
    setShowForm(false);
  };

  const handleEdit = (item: EmotionRecord | BiasRecognition) => {
    if ('emotion' in item) {
      const emotion = item as EmotionRecord;
      setSelectedEmotion(emotion);
      setFormData({
        ...formData,
        emotion: emotion.emotion,
        context: emotion.context,
        impact: emotion.impact,
      });
    } else {
      const bias = item as BiasRecognition;
      setSelectedBias(bias);
      setFormData({
        ...formData,
        bias_type: bias.bias_type,
        description: bias.description,
        awareness: bias.awareness,
      });
    }
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (activeTab === 'emotions') {
      deleteEmotionRecord(id);
    } else {
      deleteBiasRecognition(id);
    }
  };

  const emotionConfig = {
    fear: { label: '恐惧', color: 'bg-red-100 text-red-600', icon: '😰' },
    greed: { label: '贪婪', color: 'bg-orange-100 text-orange-600', icon: '🤑' },
    calm: { label: '平静', color: 'bg-green-100 text-green-600', icon: '😌' },
  };

  const biasConfig = {
    confirmation: { label: '确认偏差', desc: '只关注支持自己观点的信息' },
    anchoring: { label: '锚定效应', desc: '过度依赖初始信息' },
    overconfidence: { label: '过度自信', desc: '高估自己的判断能力' },
    loss_aversion: { label: '损失厌恶', desc: '对损失的感受强于收益' },
    herding: { label: '从众心理', desc: '跟随大众的投资决策' },
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">投资心理</h1>
          <p className="text-gray-500 mt-1">记录情绪影响和行为偏差的自我识别</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg animate-pulse">
            <span className="text-green-600">✓</span>
            保存成功！
          </div>
        )}
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'emotions', label: '情绪记录', icon: Heart },
          { id: 'biases', label: '行为偏差', icon: AlertTriangle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as TabType);
              // 切换标签时保持表单状态不变，只重置选中项
              setSelectedEmotion(null);
              setSelectedBias(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {activeTab === 'emotions' && (
            <>
              {emotionRecords.length > 0 ? (
                emotionRecords.map((emotion) => (
                  <div key={emotion.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                          emotionConfig[emotion.emotion].color
                        }`}>
                          {emotionConfig[emotion.emotion].icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{emotionConfig[emotion.emotion].label}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(emotion.created_at).toLocaleString('zh-CN')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(emotion)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emotion.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">情境描述</p>
                        <p className="text-gray-600">{emotion.context}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-blue-800">影响与应对</p>
                        <p className="text-blue-700 mt-1">{emotion.impact}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-gray-500 mt-4">暂无情绪记录</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'biases' && (
            <>
              {biasRecognitions.length > 0 ? (
                biasRecognitions.map((bias) => (
                  <div key={bias.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{biasConfig[bias.bias_type].label}</h3>
                            <p className="text-sm text-gray-500">{biasConfig[bias.bias_type].desc}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(bias.created_at).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(bias)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(bias.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">具体表现</p>
                        <p className="text-gray-600">{bias.description}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-green-800">自我觉察与改进</p>
                        <p className="text-green-700 mt-1">{bias.awareness}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
                  <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-gray-500 mt-4">暂无行为偏差记录</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">{showForm ? '编辑' : '添加'}</h3>
              {showForm && (
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  取消
                </button>
              )}
            </div>

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                添加{activeTab === 'emotions' ? '情绪记录' : '行为偏差'}
              </button>
            ) : (
              <div className="space-y-4">
                {activeTab === 'emotions' && (
                  <>
                    <select
                      value={formData.emotion}
                      onChange={(e) => setFormData({ ...formData, emotion: e.target.value as 'fear' | 'greed' | 'calm' })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="fear">😰 恐惧</option>
                      <option value="greed">🤑 贪婪</option>
                      <option value="calm">😌 平静</option>
                    </select>
                    <textarea
                      placeholder="情境描述（当时发生了什么？）"
                      value={formData.context}
                      onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                    <textarea
                      placeholder="影响与应对（情绪如何影响决策？如何应对？）"
                      value={formData.impact}
                      onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </>
                )}

                {activeTab === 'biases' && (
                  <>
                    <select
                      value={formData.bias_type}
                      onChange={(e) => setFormData({ ...formData, bias_type: e.target.value as 'confirmation' | 'anchoring' | 'overconfidence' | 'loss_aversion' | 'herding' })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="confirmation">确认偏差</option>
                      <option value="anchoring">锚定效应</option>
                      <option value="overconfidence">过度自信</option>
                      <option value="loss_aversion">损失厌恶</option>
                      <option value="herding">从众心理</option>
                    </select>
                    <textarea
                      placeholder="具体表现（在什么情况下出现了这种偏差？）"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                    <textarea
                      placeholder="自我觉察与改进（如何识别和改进？）"
                      value={formData.awareness}
                      onChange={(e) => setFormData({ ...formData, awareness: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </>
                )}

                <button
                  onClick={handleSave}
                  className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  保存
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
