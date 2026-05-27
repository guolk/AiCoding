import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { DifficultyBadge } from '../components/common/DifficultyBadge';
import { LatexRenderer } from '../components/common/LatexRenderer';
import { useQuestionStore } from '../stores/questionStore';
import { useWrongNoteStore } from '../stores/wrongNoteStore';
import { useTrainingStore } from '../stores/trainingStore';
import type { Question } from '../types';

const EXAM_DURATIONS = [
  { label: '90 分钟', value: 90 },
  { label: '120 分钟', value: 120 },
  { label: '150 分钟', value: 150 },
];

export function MockExam() {
  const navigate = useNavigate();
  const { questions } = useQuestionStore();
  const { addWrongNote } = useWrongNoteStore();
  const { addTrainingRecord } = useTrainingStore();

  const [examStarted, setExamStarted] = useState(false);
  const [examDuration, setExamDuration] = useState(120);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(examDuration * 60);
  const [examFinished, setExamFinished] = useState(false);

  useEffect(() => {
    if (examStarted && timeLeft > 0 && !examFinished) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examStarted, timeLeft, examFinished]);

  const startExam = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(5, questions.length));
    setExamQuestions(selected);
    setExamStarted(true);
    setTimeLeft(examDuration * 60);
    setAnswers({});
    setCurrentIndex(0);
    setExamFinished(false);
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (!examQuestions[currentIndex]) return;

    const questionId = examQuestions[currentIndex].id;
    setAnswers((prev) => ({ ...prev, [questionId]: isCorrect }));

    if (!isCorrect) {
      addWrongNote({
        questionId,
        errorReason: 'approach',
        errorReasonText: '考试中出错',
        correctSolution: examQuestions[currentIndex].solutions[0]?.content || '',
      });
    }

    if (currentIndex < examQuestions.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    }
  };

  const handleSubmitExam = useCallback(() => {
    const correctCount = Object.values(answers).filter(Boolean).length;
    const score = Math.round((correctCount / examQuestions.length) * 100);

    addTrainingRecord({
      type: 'exam',
      questionIds: examQuestions.map((q) => q.id),
      results: answers,
      score,
      duration: examDuration - Math.ceil(timeLeft / 60),
      examDuration,
    });

    setExamFinished(true);
  }, [answers, examQuestions, examDuration, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!examStarted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/training')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-text-primary">模拟考试</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>考试设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-3">
                选择考试时长
              </label>
              <div className="flex gap-3">
                {EXAM_DURATIONS.map((duration) => (
                  <button
                    key={duration.value}
                    onClick={() => setExamDuration(duration.value)}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      examDuration === duration.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-background-hover hover:border-primary/50'
                    }`}
                  >
                    <Clock className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">{duration.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-background-hover rounded-xl">
              <h4 className="font-medium text-text-primary mb-2">考试说明</h4>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• 共 5 道题目，从题库随机抽取</li>
                <li>• 每题作答后自动进入下一题</li>
                <li>• 时间到达自动交卷</li>
                <li>• 错误题目会自动加入错题本</li>
              </ul>
            </div>

            <Button size="lg" className="w-full" onClick={startExam}>
              开始考试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (examFinished) {
    const correctCount = Object.values(answers).filter(Boolean).length;
    const score = Math.round((correctCount / examQuestions.length) * 100);

    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold text-text-primary mb-6">考试完成</h2>
            <div className="text-6xl font-bold mb-4">
              <span className={score >= 60 ? 'text-success' : 'text-danger'}>{score}</span>
              <span className="text-2xl text-text-muted">分</span>
            </div>
            <p className="text-text-secondary mb-2">
              正确 {correctCount} / {examQuestions.length} 题
            </p>
            <p className="text-text-muted text-sm mb-8">
              用时 {examDuration - Math.ceil(timeLeft / 60)} 分钟
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={() => navigate('/training')}>
                返回训练
              </Button>
              <Button onClick={() => navigate('/progress')}>
                查看分析
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = examQuestions[currentIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/training')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-text-primary">模拟考试</h1>
            <p className="text-text-secondary text-sm">
              题目 {currentIndex + 1} / {examQuestions.length}
            </p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-xl ${timeLeft < 300 ? 'bg-danger/10 text-danger' : 'bg-background-card'}`}>
          <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="h-2 bg-background-hover rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / examQuestions.length) * 100}%` }}
        />
      </div>

      {currentQuestion && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>第 {currentIndex + 1} 题</CardTitle>
              <DifficultyBadge difficulty={currentQuestion.difficulty} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-mono leading-relaxed">
              <LatexRenderer latex={currentQuestion.content} />
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
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
      </div>

      <div className="flex justify-center gap-2">
        {examQuestions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
              i === currentIndex
                ? 'bg-primary text-white'
                : answers[q.id] !== undefined
                ? answers[q.id]
                  ? 'bg-success/20 text-success'
                  : 'bg-danger/20 text-danger'
                : 'bg-background-hover text-text-muted'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <Button variant="secondary" className="w-full" onClick={handleSubmitExam}>
        提交试卷
      </Button>
    </div>
  );
}
