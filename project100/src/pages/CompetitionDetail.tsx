import React, { useState, useEffect } from 'react';
import { Card, Button, Progress, Radio, Space, Statistic, Table, Modal, Result } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import { Competition, Question } from '../types';
import dayjs from 'dayjs';

interface CompetitionDetailProps {
  competition: Competition;
  onBack: () => void;
}

const CompetitionDetail: React.FC<CompetitionDetailProps> = ({ competition, onBack }) => {
  const { questions, setCompetitions, setUser, user } = useAppContext();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number[] }>({});
  const [timeLeft, setTimeLeft] = useState(competition.duration * 60);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [competitionQuestions, setCompetitionQuestions] = useState<Question[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<{ [key: number]: { options: string[]; originalIndices: number[] } }>({});

  useEffect(() => {
    const filteredQuestions = questions.filter(q => 
      q.isActive && 
      competition.categories.includes(q.category) && 
      competition.difficulties.includes(q.difficulty)
    );
    
    let selected = [...filteredQuestions];
    if (competition.randomQuestions) {
      selected = selected.sort(() => Math.random() - 0.5);
    }
    selected = selected.slice(0, competition.questionCount);
    
    const shuffled: { [key: number]: { options: string[]; originalIndices: number[] } } = {};
    if (competition.shuffleOptions) {
      selected.forEach((q, idx) => {
        const indices = q.options.map((_, i) => i);
        const shuffledIndices = indices.sort(() => Math.random() - 0.5);
        const shuffledOpts = shuffledIndices.map(i => q.options[i]);
        shuffled[idx] = { options: shuffledOpts, originalIndices: shuffledIndices };
      });
    }
    
    setCompetitionQuestions(selected);
    setShuffledOptions(shuffled);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStarted && timeLeft > 0 && !isFinished) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isStarted, timeLeft, isFinished]);

  const handleStart = () => {
    setIsStarted(true);
  };

  const handleAnswer = (questionIndex: number, answer: number | number[]) => {
    const answers = Array.isArray(answer) ? answer : [answer];
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answers
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < competitionQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!competition.noBacktrack && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    setIsFinished(true);
    
    let correctCount = 0;
    competitionQuestions.forEach((q, idx) => {
      const userAnswers = selectedAnswers[idx] || [];
      let correctAnswers = q.correctAnswers;
      
      if (competition.shuffleOptions && shuffledOptions[idx]) {
        const originalUserAnswers = userAnswers.map(a => shuffledOptions[idx].originalIndices[a]);
        correctAnswers = q.correctAnswers.sort();
        const sortedUserAnswers = originalUserAnswers.sort();
        if (JSON.stringify(sortedUserAnswers) === JSON.stringify(correctAnswers)) {
          correctCount++;
        }
      } else {
        const sortedUserAnswers = userAnswers.sort();
        const sortedCorrect = q.correctAnswers.sort();
        if (JSON.stringify(sortedUserAnswers) === JSON.stringify(sortedCorrect)) {
          correctCount++;
        }
      }
    });

    const finalScore = Math.round((correctCount / competitionQuestions.length) * 100);
    setScore(finalScore);

    const timeSpent = competition.duration * 60 - timeLeft;
    const newLeaderboardItem = {
      userId: user.id,
      userName: user.name,
      score: finalScore,
      timeSpent,
      completedAt: dayjs().toISOString()
    };

    setCompetitions(prev => prev.map(c => {
      if (c.id === competition.id) {
        const newLeaderboard = [...c.leaderboard, newLeaderboardItem]
          .sort((a, b) => b.score - a.score || a.timeSpent - b.timeSpent);
        return {
          ...c,
          participants: [...c.participants, user.id],
          leaderboard: newLeaderboard
        };
      }
      return c;
    }));

    const userRank = competition.leaderboard.findIndex(l => l.userId === user.id) + 1;
    setUser(prev => ({
      ...prev,
      competitionHistory: [
        ...prev.competitionHistory,
        {
          competitionId: competition.id,
          competitionTitle: competition.title,
          score: finalScore,
          rank: userRank || competition.leaderboard.length + 1,
          completedAt: dayjs().toISOString()
        }
      ]
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isStarted) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack} style={{ marginBottom: 24 }}>
            返回
          </Button>
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <h1>{competition.title}</h1>
            <p style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>{competition.description}</p>
            <Space size="large" style={{ marginBottom: 32 }}>
              <Statistic title="题目数量" value={competitionQuestions.length} />
              <Statistic title="答题时间" value={competition.duration} suffix="分钟" />
            </Space>
            {competition.shuffleOptions && <p>⚠️ 题目选项将随机打乱</p>}
            {competition.noBacktrack && <p>⚠️ 答题过程中禁止回退</p>}
            <Button type="primary" size="large" onClick={handleStart}>
              开始答题
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isFinished) {
    const rank = competition.leaderboard.findIndex(l => l.userId === user.id) + 1 || competition.leaderboard.length;
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Result
            status="success"
            title="答题完成！"
            subTitle={`您的得分：${score}分，排名：第${rank}名`}
            extra={[
              <Button type="primary" key="back" onClick={onBack}>
                返回列表
              </Button>
            ]}
          />
        </Card>
      </div>
    );
  }

  const currentQuestion = competitionQuestions[currentQuestionIndex];
  const currentOptions = competition.shuffleOptions && shuffledOptions[currentQuestionIndex]
    ? shuffledOptions[currentQuestionIndex].options
    : currentQuestion.options;

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2>{competition.title}</h2>
            <Progress 
              percent={Math.round(((currentQuestionIndex + 1) / competitionQuestions.length) * 100)} 
              style={{ width: 300 }}
            />
          </div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: timeLeft < 60 ? '#f5222d' : '#1890ff' }}>
            ⏱️ {formatTime(timeLeft)}
          </div>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <h3>第 {currentQuestionIndex + 1} 题</h3>
          <p style={{ fontSize: 16, marginBottom: 24 }}>{currentQuestion.content}</p>
          
          {currentQuestion.type === 'multiple' ? (
            <Radio.Group
              value={selectedAnswers[currentQuestionIndex] || []}
              onChange={(e) => handleAnswer(currentQuestionIndex, e.target.value)}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {currentOptions.map((option, idx) => (
                  <Radio.Button key={idx} value={idx} style={{ width: '100%', textAlign: 'left', padding: '12px 16px' }}>
                    {String.fromCharCode(65 + idx)}. {option}
                  </Radio.Button>
                ))}
              </Space>
            </Radio.Group>
          ) : (
            <Radio.Group
              value={selectedAnswers[currentQuestionIndex]?.[0]}
              onChange={(e) => handleAnswer(currentQuestionIndex, e.target.value)}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {currentOptions.map((option, idx) => (
                  <Radio.Button key={idx} value={idx} style={{ width: '100%', textAlign: 'left', padding: '12px 16px' }}>
                    {String.fromCharCode(65 + idx)}. {option}
                  </Radio.Button>
                ))}
              </Space>
            </Radio.Group>
          )}
        </Card>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handlePrev}
            disabled={competition.noBacktrack || currentQuestionIndex === 0}
          >
            上一题
          </Button>
          
          {currentQuestionIndex < competitionQuestions.length - 1 ? (
            <Button 
              type="primary" 
              icon={<ArrowRightOutlined />} 
              onClick={handleNext}
            >
              下一题
            </Button>
          ) : (
            <Button type="primary" onClick={handleFinish}>
              交卷
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CompetitionDetail;
