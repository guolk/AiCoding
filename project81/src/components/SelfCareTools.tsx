import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const strategies = [
  '深呼吸练习',
  '正念冥想',
  '身体活动',
  '社交倾诉',
  '听音乐',
  '写日记',
  '短暂休息',
  '户外散步'
];

const mindfulnessExercises = [
  {
    title: '呼吸觉察',
    steps: [
      '找一个舒适的姿势坐下',
      '闭上眼睛，将注意力集中在呼吸上',
      '感受空气进入和离开鼻腔',
      '如果思绪飘走，轻轻地把注意力带回呼吸',
      '持续 2-3 分钟'
    ]
  },
  {
    title: '身体扫描',
    steps: [
      '平躺或舒适地坐着',
      '从头顶开始，逐渐向下扫描身体',
      '注意每个部位的感觉，不要评判',
      '如果发现紧张，试着放松那个部位',
      '完成整个身体的扫描'
    ]
  },
  {
    title: '五感觉察',
    steps: [
      '说出你能看到的 5 件东西',
      '说出你能摸到的 4 种触感',
      '说出你能听到的 3 种声音',
      '说出你能闻到的 2 种气味',
      '说出你能尝到的 1 种味道'
    ]
  }
];

const SelfCareTools: React.FC = () => {
  const { addCBTSession, addStrategy, state } = useApp();
  const [activeTab, setActiveTab] = useState<'cbt' | 'mindfulness' | 'strategy'>('cbt');

  const [cbtForm, setCbtForm] = useState({
    automaticThought: '',
    evidence: '',
    alternativeThought: '',
    outcome: ''
  });

  const [strategyForm, setStrategyForm] = useState({
    strategy: '',
    beforeMood: 5,
    afterMood: 5,
    effectiveness: 5
  });

  const [mindfulnessActive, setMindfulnessActive] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(mindfulnessExercises[0]);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderInterval, setReminderInterval] = useState(60);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (reminderEnabled) {
      interval = setInterval(() => {
        if (Notification.permission === 'granted') {
          new Notification('正念提醒', {
            body: '是时候做一个简短的正念练习了 🧘',
            icon: '🧘'
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
      }, reminderInterval * 60 * 1000);
    }
    return () => clearInterval(interval);
  }, [reminderEnabled, reminderInterval]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCBTSumbit = () => {
    if (!cbtForm.automaticThought.trim()) return;
    addCBTSession(cbtForm);
    setCbtForm({ automaticThought: '', evidence: '', alternativeThought: '', outcome: '' });
    alert('CBT 练习已保存！');
  };

  const handleStrategySubmit = () => {
    if (!strategyForm.strategy) return;
    addStrategy(strategyForm);
    setStrategyForm({ strategy: '', beforeMood: 5, afterMood: 5, effectiveness: 5 });
    alert('策略效果已记录！');
  };

  const startMindfulness = useCallback(() => {
    setMindfulnessActive(true);
    setCurrentStep(0);
    setTimer(0);
    setTimerRunning(true);
  }, []);

  const nextStep = () => {
    if (currentStep < currentExercise.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setTimerRunning(false);
      setMindfulnessActive(false);
      alert('正念练习完成！做得好 🌟');
    }
  };

  const strategyData = state.strategies.slice(0, 10).map(s => ({
    name: s.strategy.length > 6 ? s.strategy.slice(0, 6) + '...' : s.strategy,
    效果: s.effectiveness,
    情绪改善: Math.max(0, s.afterMood - s.beforeMood)
  }));

  return (
    <div className="card">
      <h2>🛠️ 自我改善工具</h2>

      <div className="tabs">
        <button className={`tab ${activeTab === 'cbt' ? 'active' : ''}`} onClick={() => setActiveTab('cbt')}>
          🧠 CBT 认知重构
        </button>
        <button className={`tab ${activeTab === 'mindfulness' ? 'active' : ''}`} onClick={() => setActiveTab('mindfulness')}>
          🧘 正念练习
        </button>
        <button className={`tab ${activeTab === 'strategy' ? 'active' : ''}`} onClick={() => setActiveTab('strategy')}>
          📈 策略追踪
        </button>
      </div>

      {activeTab === 'cbt' && (
        <div className="section">
          <div className="cbt-intro">
            <p><strong>认知行为疗法 (CBT)</strong> 帮助你识别和改变负面思维模式。</p>
          </div>

          <div className="cbt-step">
            <h4>Step 1: 自动想法</h4>
            <p className="cbt-hint">当你感到情绪低落时，脑海中出现了什么想法？</p>
            <textarea
              value={cbtForm.automaticThought}
              onChange={e => setCbtForm({ ...cbtForm, automaticThought: e.target.value })}
              placeholder="例如：我总是搞砸事情..."
              rows={2}
            />
          </div>

          <div className="cbt-step">
            <h4>Step 2: 寻找证据</h4>
            <p className="cbt-hint">有什么证据支持或反对这个想法？</p>
            <textarea
              value={cbtForm.evidence}
              onChange={e => setCbtForm({ ...cbtForm, evidence: e.target.value })}
              placeholder="支持的证据：... 反对的证据：..."
              rows={2}
            />
          </div>

          <div className="cbt-step">
            <h4>Step 3: 替代想法</h4>
            <p className="cbt-hint">有没有更平衡、更现实的思考方式？</p>
            <textarea
              value={cbtForm.alternativeThought}
              onChange={e => setCbtForm({ ...cbtForm, alternativeThought: e.target.value })}
              placeholder="更现实的想法是：..."
              rows={2}
            />
          </div>

          <div className="cbt-step">
            <h4>Step 4: 结果</h4>
            <p className="cbt-hint">改变想法后，你现在感觉如何？</p>
            <textarea
              value={cbtForm.outcome}
              onChange={e => setCbtForm({ ...cbtForm, outcome: e.target.value })}
              placeholder="现在我感觉：..."
              rows={2}
            />
          </div>

          <button className="submit-btn" onClick={handleCBTSumbit}>
            💾 保存 CBT 练习
          </button>

          {state.cbtSessions.length > 0 && (
            <div className="cbt-history">
              <h4>📜 历史记录</h4>
              {[...state.cbtSessions].reverse().slice(0, 3).map(session => (
                <div key={session.id} className="cbt-history-item">
                  <div className="cbt-history-date">
                    {new Date(session.timestamp).toLocaleDateString('zh-CN')}
                  </div>
                  <div className="cbt-history-thought">
                    💭 {session.automaticThought}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'mindfulness' && (
        <div className="section">
          <div className="mindfulness-timer">
            <div className="timer-display">{formatTime(timer)}</div>
          </div>

          {!mindfulnessActive ? (
            <>
              <div className="exercise-select">
                <h4>选择练习：</h4>
                <div className="exercise-buttons">
                  {mindfulnessExercises.map((ex, i) => (
                    <button
                      key={i}
                      className={`exercise-btn ${currentExercise.title === ex.title ? 'selected' : ''}`}
                      onClick={() => setCurrentExercise(ex)}
                    >
                      {ex.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="reminder-settings">
                <h4>⏰ 正念提醒</h4>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={e => setReminderEnabled(e.target.checked)}
                  />
                  <span className="slider-round"></span>
                </label>
                {reminderEnabled && (
                  <div className="interval-select">
                    <span>每</span>
                    <select
                      value={reminderInterval}
                      onChange={e => setReminderInterval(Number(e.target.value))}
                    >
                      <option value={30}>30</option>
                      <option value={60}>60</option>
                      <option value={90}>90</option>
                      <option value={120}>120</option>
                    </select>
                    <span>分钟提醒一次</span>
                  </div>
                )}
              </div>

              <button className="submit-btn mindfulness-start" onClick={startMindfulness}>
                🧘 开始练习
              </button>
            </>
          ) : (
            <div className="mindfulness-active">
              <h4>{currentExercise.title}</h4>
              <div className="step-indicator">
                步骤 {currentStep + 1} / {currentExercise.steps.length}
              </div>
              <div className="current-step">
                {currentExercise.steps[currentStep]}
              </div>
              <button className="submit-btn" onClick={nextStep}>
                {currentStep < currentExercise.steps.length - 1 ? '下一步 →' : '完成 ✓'}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'strategy' && (
        <div className="section">
          <h4>记录情绪管理策略效果</h4>

          <div className="strategy-select">
            <p>选择策略：</p>
            <div className="tag-group">
              {strategies.map(s => (
                <button
                  key={s}
                  className={`tag ${strategyForm.strategy === s ? 'selected' : ''}`}
                  onClick={() => setStrategyForm({ ...strategyForm, strategy: s })}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="slider-group">
            <label>使用前心情：<strong>{strategyForm.beforeMood}</strong></label>
            <input
              type="range"
              min="1"
              max="10"
              value={strategyForm.beforeMood}
              onChange={e => setStrategyForm({ ...strategyForm, beforeMood: Number(e.target.value) })}
            />
          </div>

          <div className="slider-group">
            <label>使用后心情：<strong>{strategyForm.afterMood}</strong></label>
            <input
              type="range"
              min="1"
              max="10"
              value={strategyForm.afterMood}
              onChange={e => setStrategyForm({ ...strategyForm, afterMood: Number(e.target.value) })}
            />
          </div>

          <div className="slider-group">
            <label>效果评分：<strong>{strategyForm.effectiveness}</strong></label>
            <input
              type="range"
              min="1"
              max="10"
              value={strategyForm.effectiveness}
              onChange={e => setStrategyForm({ ...strategyForm, effectiveness: Number(e.target.value) })}
            />
          </div>

          <button className="submit-btn" onClick={handleStrategySubmit}>
            💾 记录效果
          </button>

          {strategyData.length > 0 && (
            <div className="strategy-chart">
              <h4>📊 策略效果统计</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={strategyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="效果" fill="#4ECDC4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelfCareTools;
