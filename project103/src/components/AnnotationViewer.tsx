import React, { useState } from 'react';
import { Info, Volume2 } from 'lucide-react';
import type { Annotation, Segment } from '../types';
import { AnnotationTypeLabels } from '../types';

interface AnnotationViewerProps {
  segment: Segment;
  onPlayWord?: (word: string) => void;
}

const annotationColors = {
  linking: 'bg-blue-100 text-blue-800 border-blue-300',
  reduction: 'bg-purple-100 text-purple-800 border-purple-300',
  elision: 'bg-orange-100 text-orange-800 border-orange-300',
  intonation: 'bg-teal-100 text-teal-800 border-teal-300',
};

const annotationIcons = {
  linking: '🔗',
  reduction: '↘️',
  elision: '✂️',
  intonation: '📈',
};

export const AnnotationViewer: React.FC<AnnotationViewerProps> = ({ segment, onPlayWord }) => {
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);

  const renderAnnotatedText = () => {
    const text = segment.text;
    if (segment.annotations.length === 0) {
      return <span>{text}</span>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    const sortedAnnotations = [...segment.annotations].sort((a, b) => a.startIndex - b.startIndex);

    sortedAnnotations.forEach((annotation, idx) => {
      if (annotation.startIndex > lastIndex) {
        parts.push(<span key={`text-${idx}`}>{text.slice(lastIndex, annotation.startIndex)}</span>);
      }

      const annotatedWord = text.slice(annotation.startIndex, annotation.endIndex);
      parts.push(
        <span
          key={`ann-${idx}`}
          className={`inline-block px-1 py-0.5 rounded cursor-pointer border-b-2 transition-all hover:scale-105 ${annotationColors[annotation.type]}`}
          onClick={() => setSelectedAnnotation(annotation)}
          title={annotation.description}
        >
          {annotatedWord}
          <sup className="ml-0.5">{annotationIcons[annotation.type]}</sup>
        </span>
      );
      lastIndex = annotation.endIndex;
    });

    if (lastIndex < text.length) {
      parts.push(<span key="text-end">{text.slice(lastIndex)}</span>);
    }

    return parts;
  };

  return (
    <div className="space-y-4">
      <div className="p-6 bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-500">发音标注</h4>
          <button
            onClick={() => onPlayWord?.(segment.text)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Volume2 className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <p className="text-xl leading-relaxed">
          {renderAnnotatedText()}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {segment.annotations.map((annotation, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedAnnotation(annotation)}
            className={`p-3 rounded-lg border-2 text-left transition-all ${selectedAnnotation?.id === annotation.id ? 'border-[#1E3A5F] bg-[#1E3A5F]/5' : 'border-gray-100 hover:border-gray-200'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span>{annotationIcons[annotation.type]}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${annotationColors[annotation.type]}`}>
                {AnnotationTypeLabels[annotation.type]}
              </span>
            </div>
            <p className="text-sm text-gray-700 line-clamp-2">{annotation.description}</p>
          </button>
        ))}
      </div>

      {selectedAnnotation && (
        <div className="p-4 bg-gradient-to-r from-[#1E3A5F]/5 to-[#F59E0B]/5 rounded-xl border border-[#1E3A5F]/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#1E3A5F] flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-gray-800 mb-1">
                {annotationIcons[selectedAnnotation.type]} {AnnotationTypeLabels[selectedAnnotation.type]}
              </h5>
              <p className="text-gray-600">{selectedAnnotation.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                标注位置："{segment.text.slice(selectedAnnotation.startIndex, selectedAnnotation.endIndex)}"
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 p-3 bg-gray-50 rounded-lg text-sm">
        <div className="flex items-center gap-1.5">
          <span>🔗</span>
          <span className="text-gray-600">连读</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>↘️</span>
          <span className="text-gray-600">弱读</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>✂️</span>
          <span className="text-gray-600">吞音</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>📈</span>
          <span className="text-gray-600">语调</span>
        </div>
      </div>
    </div>
  );
};
