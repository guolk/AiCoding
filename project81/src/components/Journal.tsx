import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getGuidedPrompts } from '../utils/guidedPrompts';
import { extractWords } from '../utils/wordCloud';
import WordCloud from 'wordcloud';

const Journal: React.FC = () => {
  const { state, addJournal, deleteJournal } = useApp();
  const [content, setContent] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [showWordCloud, setShowWordCloud] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const wordCloudRef = useRef<HTMLCanvasElement>(null);

  const latestMood = state.moodRecords[state.moodRecords.length - 1];
  const prompts = latestMood ? getGuidedPrompts(latestMood.dimensions) : [];

  useEffect(() => {
    if (showWordCloud && wordCloudRef.current && state.journals.length > 0) {
      const words = extractWords(state.journals.map(j => j.content));
      if (words.length > 0) {
        const maxCount = Math.max(...words.map(w => w[1]));
        const wordList: [string, number][] = words.map(([word, count]) => [word, Math.max(12, (count / maxCount) * 40)]);
        
        WordCloud(wordCloudRef.current, {
          list: wordList,
          gridSize: 8,
          weightFactor: 1,
          fontFamily: 'Microsoft YaHei, sans-serif',
          color: () => {
            const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'];
            return colors[Math.floor(Math.random() * colors.length)];
          },
          rotateRatio: 0.3,
          backgroundColor: 'transparent'
        } as any);
      }
    }
  }, [showWordCloud, state.journals]);

  const handleSubmit = () => {
    if (!content.trim()) return;
    addJournal({
      content,
      moodRecordId: latestMood?.id,
      guidedPrompt: selectedPrompt || undefined
    });
    setContent('');
    setSelectedPrompt('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这篇日记吗？')) {
      deleteJournal(id);
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

  return (
    <div className="card">
      <h2>📔 日记</h2>
      
      {saveSuccess && (
        <div className="success-toast">
          ✅ 日记已保存成功！
        </div>
      )}

      {prompts.length > 0 && (
        <div className="section">
          <h3>💡 基于当前情绪的写作提示</h3>
          <div className="prompt-list">
            {prompts.map((prompt, i) => (
              <button
                key={i}
                className={`prompt-btn ${selectedPrompt === prompt ? 'selected' : ''}`}
                onClick={() => setSelectedPrompt(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="section">
        <h3>✍️ 写日记</h3>
        {selectedPrompt && (
          <div className="selected-prompt">
            📌 {selectedPrompt}
          </div>
        )}
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={selectedPrompt || '开始记录你的想法...'}
          rows={6}
        />
        <button className="submit-btn" onClick={handleSubmit}>
          💾 保存日记
        </button>
      </div>

      <div className="section">
        <div className="section-header">
          <h3>📊 词云分析</h3>
          <button className="toggle-btn" onClick={() => setShowWordCloud(!showWordCloud)}>
            {showWordCloud ? '隐藏' : '显示'}
          </button>
        </div>
        {showWordCloud && (
          <div className="wordcloud-container">
            {state.journals.length > 0 ? (
              <canvas ref={wordCloudRef} width={400} height={250} />
            ) : (
              <p style={{ textAlign: 'center', color: '#888' }}>
                还没有日记数据，先写几篇日记吧~
              </p>
            )}
          </div>
        )}
      </div>

      <div className="section">
        <h3>📜 日记历史</h3>
        {state.journals.length === 0 ? (
          <p className="empty-state">还没有日记记录</p>
        ) : (
          <div className="journal-list">
            {[...state.journals].reverse().slice(0, 5).map(journal => (
              <div key={journal.id} className="journal-item">
                <div className="journal-item-header">
                  <span className="journal-date">{formatDate(journal.timestamp)}</span>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(journal.id)}
                  >
                    🗑️ 删除
                  </button>
                </div>
                {journal.guidedPrompt && (
                  <div className="journal-prompt">📌 {journal.guidedPrompt}</div>
                )}
                <div className="journal-content">{journal.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;
