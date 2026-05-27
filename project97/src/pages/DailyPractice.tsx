import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, SkipForward } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { DifficultyBadge } from '../components/common/DifficultyBadge';
import { LatexRenderer } from '../components/common/LatexRenderer';
import { useQuestionStore } from '../stores/questionStore';
import { useWrongNoteStore } from '../stores/wrongNoteStore';
import { useTrainingStore } from '../stores/trainingStore';
import type { Question } from '../types';
import { format } from 'date-fns';

export function DailyPractice() {
  const navigate = useNavigate();
  const { questions, loadQuestions } = useQuestionStore();
  const { addWrongNote } = useWrongNoteStore();
  const { getTodayProgress, updateDailyProgress, setDailyGoal } = useTrainingStore();

  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [targetCount, setTargetCount] = useState(5);

  useEffect(() => {
    loadQuestions();
    const progress = getTodayProgress();
    setTargetCount(progress.target || 5);
  }, []);

  useEffect(() => {
    if (questions.length > 0 && practiceQuestions.length === 0) {
      const shuffled = [...questions].sort(() => Math.random() - 0.5);
      setPracticeQuestions(shuffled.slice(0, Math.min(targetCount, questions.length)));
    }
  }, [questions, targetCount]);

  const currentQuestion = practiceQuestions[currentIndex];
  const today = format(new Date(), 'yyyy-MM-dd');

  const handleAnswer = (isCorrect: boolean) => {
    if (!currentQuestion) return;

    const newCompleted = { ...completed, [currentQuestion.id]: isCorrect };
    setCompleted(newCompleted);

    if (!isCorrect) {
      addWrongNote({
        questionId: currentQuestion.id,
        errorReason: 'approach',
        errorReasonText: '',
        correctSolution: currentQuestion.solutions[0]?.content || '',
      });
    }

    const correctCount = Object.values(newCompleted).filter(Boolean).length;
    updateDailyProgress(today, correctCount, []);

    setShowAnswer(false);

    if (currentIndex < practiceQuestions.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 500);
    } else {
      setDailyGoal({
        date: today,
        targetCount,
        completedCount: correctCount,
        knowledgeCoverage: [],
        actualCoverage: [],
      });
    }
  };

  const handleSkip = () => {
    if (currentIndex < practiceQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const progress = getTodayProgress();
  const isFinished = currentIndex >= practiceQuestions.length - 1 && Object.keys(completed).length === practiceQuestions.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/training')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">每日刷题</h1>
            <p className="text-text-secondary">
              已完成 {Object.keys(completed).length} / {practiceQuestions.length} 题
            </p>
          </div>
        </div>
      </div>

      <div className="h-2 bg-background-hover rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-300"
          style={{
            width: `${(Object.keys(completed).length / practiceQuestions.length) * 100}%`,
          }}
        />
      </div>

      {isFinished ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-2">今日刷题完成！</h2>
            <p className="text-text-secondary mb-6">
              正确率 {Math.round((Object.values(completed).filter(Boolean).length / practiceQuestions.length) * 100)}%
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={() => navigate('/training')}>
                返回训练计划
              </Button>
              <Button onClick={() => navigate('/progress')}>
                查看进度
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : currentQuestion ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>题目 {currentIndex + 1}</CardTitle>
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty={currentQuestion.difficulty} />
                  <span className="text-sm text-text-muted">
                    {currentQuestion.topic === 'number_theory' && '数论'}
                    {currentQuestion.topic === 'combinatorics' && '组合'}
                    {currentQuestion.topic === 'algebra' && '代数'}
                    {currentQuestion.topic === 'geometry' && '几何'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-mono leading-relaxed">
                <LatexRenderer latex={currentQuestion.content} />
              </p>
            </CardContent>
          </Card>

          {showAnswer && currentQuestion.solutions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>参考解法</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentQuestion.solutions.map((solution) => (
                  <div key={solution.id} className="p-4 bg-background-hover rounded-lg">
                    <p className="font-medium text-primary mb-2">{solution.method}</p>
                    <p className="text-text-secondary mb-2">{solution.idea}</p>
                    <p className="text-text-primary font-mono text-sm">
                      <LatexRenderer latex={solution.content} />
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            {!showAnswer ? (
              <>
                <Button
                  variant="success"
                  size="lg"
                  className="flex-1"
                  onClick={() => setShowAnswer(true)}
                >
                  查看答案
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleSkip}
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="success"
                  size="lg"
                  className="flex-1"
                  onClick={() => handleAnswer(true)}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  正确
                </Button>
                <Button
                  variant="danger"
                  size="lg"
                  className="flex-1"
                  onClick={() => handleAnswer(false)}
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  错误
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-text-muted">题目库为空，请先录入题目</p>
            <Button className="mt-4" onClick={() => navigate('/questions/new')}>
              录入题目
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
