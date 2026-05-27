import { useMemo } from 'react';
import katex from 'katex';

interface LatexRendererProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export function LatexRenderer({ latex, displayMode = false, className = '' }: LatexRendererProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        errorColor: '#EF4444',
      });
    } catch {
      return `<span class="text-danger">公式渲染错误</span>`;
    }
  }, [latex, displayMode]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
