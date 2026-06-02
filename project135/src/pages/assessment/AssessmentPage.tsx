import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import Card from '@/components/Card';
import ProgressBar from '@/components/ProgressBar';
import { useAppStore } from '@/store';
import { QUESTIONS, OPTIONS } from '@/data/questionnaire';
import {
  calculateConstitution,
  determineMainType,
  determineSubTypes,
  getConstitutionName,
  TOTAL_ITEMS,
} from '@/utils/constitution';
import type { ConstitutionResult } from '@/types';

const ITEMS_PER_PAGE = 10;

export default function AssessmentPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const answers = useAppStore((state) => state.currentAssessmentAnswers);
  const setAssessmentAnswer = useAppStore((state) => state.setAssessmentAnswer);
  const resetAssessment = useAppStore((state) => state.resetAssessment);
  const addConstitutionResult = useAppStore((state) => state.addConstitutionResult);

  useEffect(() => {
    if (answers.length !== TOTAL_ITEMS) {
      resetAssessment();
    }
  }, [answers.length, resetAssessment]);

  const totalPages = Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, TOTAL_ITEMS);
  const currentQuestions = QUESTIONS.slice(startIndex, endIndex);

  const answeredCount = useMemo(() => {
    if (answers.length !== TOTAL_ITEMS) return 0;
    return answers.filter((a) => a > 0).length;
  }, [answers]);

  const currentPageAnswered = useMemo(() => {
    if (answers.length !== TOTAL_ITEMS) return false;
    for (let i = startIndex; i < endIndex; i++) {
      if (answers[i] === 0 || answers[i] === undefined) return false;
    }
    return true;
  }, [answers, startIndex, endIndex]);

  const handleAnswer = (questionIndex: number, value: number) => {
    setAssessmentAnswer(questionIndex, value);
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSubmit = () => {
    if (answers.length !== TOTAL_ITEMS || answeredCount < TOTAL_ITEMS) {
      return;
    }

    const scores = calculateConstitution(answers);
    const mainType = determineMainType(scores);
    const subTypes = determineSubTypes(scores);

    const result: ConstitutionResult = {
      id: String(Date.now()),
      date: new Date().toISOString().split('T')[0],
      scores,
      mainType: getConstitutionName(mainType),
      subTypes: subTypes.map((t) => getConstitutionName(t)),
      notes: '',
    };

    addConstitutionResult(result);
    resetAssessment();

    navigate('/assessment/result', { state: { resultId: result.id } });
  };

  const getOptionStyle = (questionIndex: number, value: number) => {
    const isSelected = answers[questionIndex] === value;
    if (isSelected) {
      return 'bg-primary text-white border-primary shadow-md';
    }
    return 'bg-white text-gray-700 border-gray-200 hover:border-primary/50 hover:bg-primary/5';
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary mb-2">体质测评问卷</h1>
          <p className="text-gray-600 text-sm">
            请根据您近一年的体验和感觉，选择最符合您的选项
          </p>
        </div>

        <Card>
          <div className="mb-6">
            <ProgressBar
              value={answeredCount}
              max={TOTAL_ITEMS}
              showLabel
              label={`已完成 ${answeredCount}/${TOTAL_ITEMS} 题`}
              color="#2C5F2D"
              height="lg"
            />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              第 {currentPage + 1} 页 / 共 {totalPages} 页
            </span>
            {!currentPageAnswered && (
              <div className="flex items-center gap-1 text-sm text-secondary">
                <AlertCircle className="w-4 h-4" />
                <span>请完成本页所有题目</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {currentQuestions.map((question, idx) => {
              const globalIndex = startIndex + idx;
              return (
                <div
                  key={question.id}
                  className="p-4 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-primary text-white text-sm font-bold rounded-full">
                      {question.id}
                    </span>
                    <div>
                      <p className="text-gray-800 font-medium">{question.text}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        所属类型: {question.type}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2 ml-10">
                    {OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleAnswer(globalIndex, option.value)}
                        className={`py-2 px-1 text-xs md:text-sm font-medium rounded-lg border-2 transition-all ${getOptionStyle(
                          globalIndex,
                          option.value
                        )}`}
                      >
                        <div className="font-bold">{option.value}</div>
                        <div className="text-xs opacity-80">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-100">
            <button
              onClick={handlePrev}
              disabled={currentPage === 0}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all ${
                currentPage === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              上一页
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentPage
                      ? 'bg-primary w-6'
                      : idx < currentPage
                      ? 'bg-primary/60'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {currentPage === totalPages - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={answers.length !== TOTAL_ITEMS || answeredCount < TOTAL_ITEMS}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all ${
                  answers.length !== TOTAL_ITEMS || answeredCount < TOTAL_ITEMS
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30'
                }`}
              >
                提交测评
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={answers.length !== TOTAL_ITEMS || !currentPageAnswered}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all ${
                  answers.length !== TOTAL_ITEMS || !currentPageAnswered
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30'
                }`}
              >
                下一页
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </Card>

        <div className="text-center text-sm text-gray-500 py-4">
          <p>本测评基于《中医体质分类与判定》标准编制</p>
          <p className="mt-1">测评结果仅供参考，不作为诊断依据</p>
        </div>
      </div>
    </div>
  );
}
