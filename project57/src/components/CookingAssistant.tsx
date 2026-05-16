import React, { useState, useEffect } from 'react';
import { ChefHat, Play, Pause, SkipForward, SkipBack, Clock } from 'lucide-react';

interface CookingAssistantProps {
  recipe: any;
  onBack: () => void;
}

const CookingAssistant: React.FC<CookingAssistantProps> = ({ recipe, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [servings, setServings] = useState(recipe?.servings || 2);
  const [timerRunning, setTimerRunning] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerRunning !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setTimerRunning(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  if (!recipe) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <ChefHat size={64} className="mb-4" />
        <p className="text-lg mb-2">请先选择一个食谱</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
        >
          返回食谱库
        </button>
      </div>
    );
  }

  const nextStep = () => {
    if (currentStep < recipe.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const startTimer = () => {
    const step = recipe.steps[currentStep];
    if (step && step.duration) {
      setTimerSeconds(step.duration * 60);
      setTimerRunning(currentStep);
    }
  };

  const stopTimer = () => {
    setTimerRunning(null);
    setTimerSeconds(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentStepData = recipe.steps[currentStep];
  const progress = ((currentStep + 1) / recipe.steps.length) * 100;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700"
          >
            ← 返回
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{recipe.name}</h1>
            <p className="text-sm text-gray-500">步骤 {currentStep + 1} / {recipe.steps.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-sm">份量：</span>
            <button
              onClick={() => setServings(prev => Math.max(1, prev - 1))}
              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
            >
              -
            </button>
            <span className="w-8 text-center font-semibold">{servings}</span>
            <button
              onClick={() => setServings(prev => prev + 1)}
              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col justify-center p-8 rounded-xl mb-6 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-indigo-500 text-white rounded-xl flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {currentStep + 1}
            </div>
            <div className="flex-1">
              <p className="text-xl font-medium leading-relaxed text-gray-800">
                {currentStepData?.instruction}
              </p>
            </div>
          </div>

          {currentStepData?.duration && (
            <div className="p-4 rounded-xl mb-6 bg-white border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="text-orange-500" size={24} />
                  <div>
                    <p className="font-semibold text-gray-800">步骤计时器</p>
                    <p className="text-3xl font-bold font-mono text-orange-600">
                      {timerRunning !== null ? formatTime(timerSeconds) : `${currentStepData.duration}:00`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {timerRunning !== null ? (
                    <button
                      onClick={stopTimer}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                    >
                      <Pause size={18} />
                      暂停
                    </button>
                  ) : (
                    <button
                      onClick={startTimer}
                      className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-2"
                    >
                      <Play size={18} />
                      开始计时
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                currentStep === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <SkipBack size={20} />
              上一步
            </button>
            <button
              onClick={nextStep}
              disabled={currentStep === recipe.steps.length - 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                currentStep === recipe.steps.length - 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-500 text-white hover:bg-indigo-600'
              }`}
            >
              下一步
              <SkipForward size={20} />
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <h2 className="font-semibold mb-3 flex items-center gap-2 text-gray-800">
            <ChefHat size={20} />
            本步骤食材
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {recipe.ingredients.map((ing: any) => {
              const adjustedAmount = recipe.servings ? (ing.amount / recipe.servings * servings).toFixed(1) : ing.amount;
              return (
                <div key={ing.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-800 text-sm">{ing.name}</span>
                  <span className="text-gray-600 text-sm">{adjustedAmount} {ing.unit}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookingAssistant;
