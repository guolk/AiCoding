import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EmotionTag, TriggerFactor, MoodDimensions, SleepQuality, MoodRecord } from '../types';

const emotions: EmotionTag[] = [
  '期待', '感激', '烦躁', '沮丧', '平静', '开心', '焦虑', '愤怒', '悲伤', '兴奋', '疲惫', '满足'
];

const triggers: TriggerFactor[] = ['工作', '人际', '健康', '财务', '未知'];

const sleepQualities: SleepQuality[] = ['很差', '较差', '一般', '较好', '很好'];

const dimensionLabels: Record<keyof MoodDimensions, { label: string; color: string; emoji: string }> = {
  pleasure: { label: '愉悦度', color: '#FF6B6B', emoji: '😊' },
  energy: { label: '精力', color: '#4ECDC4', emoji: '⚡' },
  anxiety: { label: '焦虑度', color: '#FFE66D', emoji: '😰' },
  stress: { label: '压力', color: '#95E1D3', emoji: '💪' }
};

const MoodRecorder: React.FC = () => {
  const { state, addMoodRecord, deleteMoodRecord } = useApp();
  const [dimensions, setDimensions] = useState<MoodDimensions>({
    pleasure: 5,
    energy: 5,
    anxiety: 5,
    stress: 5
  });
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionTag[]>([]);
  const [selectedTriggers, setSelectedTriggers] = useState<TriggerFactor[]>([]);
  const [note, setNote] = useState('');
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | undefined>();
  const [showSleep, setShowSleep] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleEmotion = (emotion: EmotionTag) => {
    setSelectedEmotions(prev =>
      prev.includes(emotion)
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const toggleTrigger = (trigger: TriggerFactor) => {
    setSelectedTriggers(prev =>
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const handleSubmit = () => {
    addMoodRecord({
      dimensions,
      emotions: selectedEmotions,
      triggers: selectedTriggers,
      note: note || undefined,
      sleepQuality
    });
    setDimensions({ pleasure: 5, energy: 5, anxiety: 5, stress: 5 });
    setSelectedEmotions([]);
    setSelectedTriggers([]);
    setNote('');
    setSleepQuality(undefined);
    setShowSleep(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条情绪记录吗？')) {
      deleteMoodRecord(id);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMoodSummary = (record: MoodRecord) => {
    const avg = (record.dimensions.pleasure + record.dimensions.energy) / 2;
    if (avg >= 8) return '😄 非常好';
    if (avg >= 6) return '🙂 不错';
    if (avg >= 4) return '😐 一般';
    if (avg >= 2) return '😔 低落';
    return '😢 很差';
  };

  return (
    <div className="card">
      <h2>📝 情绪记录</h2>
      
      {saveSuccess && (
        <div className="success-toast">
          ✅ 情绪记录已保存成功！
        </div>
      )}

      <div className="section">
        <h3>多维度评分（1-10）</h3>
        {(Object.keys(dimensions) as Array<keyof MoodDimensions>).map(key => (
          <div key={key} className="slider-group">
            <label style={{ color: dimensionLabels[key].color }}>
              {dimensionLabels[key].emoji} {dimensionLabels[key].label}: <strong>{dimensions[key]}</strong>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={dimensions[key]}
              onChange={e => setDimensions({ ...dimensions, [key]: Number(e.target.value) })}
              style={{ accentColor: dimensionLabels[key].color }}
            />
            <div className="slider-labels">
              <span>低</span>
              <span>高</span>
            </div>
          </div>
        ))}
      </div>

      <div className="section">
        <h3>情绪标签</h3>
        <div className="tag-group">
          {emotions.map(emotion => (
            <button
              key={emotion}
              className={`tag ${selectedEmotions.includes(emotion) ? 'selected' : ''}`}
              onClick={() => toggleEmotion(emotion)}
            >
              {emotion}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <h3>触发因素</h3>
        <div className="tag-group">
          {triggers.map(trigger => (
            <button
              key={trigger}
              className={`tag trigger ${selectedTriggers.includes(trigger) ? 'selected' : ''}`}
              onClick={() => toggleTrigger(trigger)}
            >
              {trigger}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <button className="toggle-btn" onClick={() => setShowSleep(!showSleep)}>
          {showSleep ? '▽ 隐藏睡眠记录' : '▷ 添加睡眠质量记录'}
        </button>
        {showSleep && (
          <div className="sleep-group">
            <p>昨晚的睡眠质量：</p>
            <div className="tag-group">
              {sleepQualities.map(sq => (
                <button
                  key={sq}
                  className={`tag sleep ${sleepQuality === sq ? 'selected' : ''}`}
                  onClick={() => setSleepQuality(sq)}
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="section">
        <h3>备注（可选）</h3>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="此刻的想法..."
          rows={3}
        />
      </div>

      <button className="submit-btn" onClick={handleSubmit}>
        💾 保存记录
      </button>

      <div className="section">
        <div className="section-header">
          <h3>📋 最近记录 ({state.moodRecords.length})</h3>
          <button className="toggle-btn" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? '收起' : '展开'}
          </button>
        </div>
        {showHistory && (
          <div className="mood-history">
            {state.moodRecords.length === 0 ? (
              <p className="empty-state">还没有情绪记录</p>
            ) : (
              <div className="mood-list">
                {[...state.moodRecords].reverse().slice(0, 5).map(record => (
                  <div key={record.id} className="mood-history-item">
                    <div className="mood-history-header">
                      <span className="mood-date">{formatDate(record.timestamp)}</span>
                      <span className="mood-summary">{getMoodSummary(record)}</span>
                    </div>
                    <div className="mood-dimensions">
                      {(Object.keys(record.dimensions) as Array<keyof MoodDimensions>).map(key => (
                        <span 
                          key={key} 
                          className="mood-dimension-tag"
                          style={{ color: dimensionLabels[key].color }}
                        >
                          {dimensionLabels[key].emoji} {dimensionLabels[key].label}: {record.dimensions[key]}
                        </span>
                      ))}
                    </div>
                    {record.emotions.length > 0 && (
                      <div className="mood-emotions">
                        {record.emotions.map(e => (
                          <span key={e} className="mini-tag">{e}</span>
                        ))}
                      </div>
                    )}
                    {record.triggers.length > 0 && (
                      <div className="mood-triggers">
                        <span style={{ color: '#999', fontSize: '0.85rem' }}>触发因素: </span>
                        {record.triggers.map(t => (
                          <span key={t} className="mini-tag trigger">{t}</span>
                        ))}
                      </div>
                    )}
                    {record.note && (
                      <div className="mood-note">📝 {record.note}</div>
                    )}
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(record.id)}
                    >
                      🗑️ 删除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodRecorder;
