import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { DiffWord } from '../types';

interface DiffViewerProps {
  diff: DiffWord[];
  standardText: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ diff, standardText }) => {
  const renderWord = (word: DiffWord) => {
    const baseClass = 'inline-block px-1 py-0.5 rounded mx-0.5 transition-all';
    
    switch (word.type) {
      case 'correct':
        return (
          <span key={`${word.text}-${word.index}`} className={`${baseClass} bg-green-100 text-green-800`}>
            {word.text}
          </span>
        );
      case 'wrong':
        return (
          <span key={`${word.text}-${word.index}`} className={`${baseClass} bg-red-100 text-red-800 line-through`}>
            {word.text}
          </span>
        );
      case 'missing':
        return (
          <span key={`${word.text}-${word.index}`} className={`${baseClass} bg-yellow-100 text-yellow-800 border-2 border-dashed border-yellow-400`}>
            [{word.text}]
          </span>
        );
      case 'extra':
        return (
          <span key={`${word.text}-${word.index}`} className={`${baseClass} bg-red-200 text-red-900`}>
            {word.text}
            <XCircle className="inline w-3 h-3 ml-1" />
          </span>
        );
      default:
        return <span key={`${word.text}-${word.index}`}>{word.text}</span>;
    }
  };

  const correctCount = diff.filter(d => d.type === 'correct').length;
  const totalCount = diff.filter(d => d.type !== 'extra').length;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${accuracy >= 80 ? 'bg-green-100' : accuracy >= 60 ? 'bg-yellow-100' : 'bg-red-100'}`}>
          {accuracy >= 80 ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : accuracy >= 60 ? (
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600" />
          )}
        </div>
        <div>
          <h4 className="font-semibold text-gray-800">听写结果</h4>
          <p className="text-2xl font-bold text-[#1E3A5F]">{accuracy}%</p>
        </div>
        <div className="ml-auto text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" /> {correctCount} 正确
          </span>
          <span className="mx-2">|</span>
          <span className="inline-flex items-center gap-1">
            <XCircle className="w-4 h-4 text-red-500" /> {totalCount - correctCount} 错误
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-4 bg-white rounded-xl border border-gray-200">
          <h5 className="text-sm font-medium text-gray-500 mb-2">你的答案：</h5>
          <div className="text-lg leading-relaxed">
            {diff.map(renderWord)}
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
          <h5 className="text-sm font-medium text-green-700 mb-2">正确答案：</h5>
          <p className="text-lg text-green-900 leading-relaxed">{standardText}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-green-100"></span>
          <span className="text-gray-600">正确</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-red-100"></span>
          <span className="text-gray-600">错误</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-yellow-100 border-2 border-dashed border-yellow-400"></span>
          <span className="text-gray-600">遗漏</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-red-200"></span>
          <span className="text-gray-600">多余</span>
        </div>
      </div>
    </div>
  );
};
