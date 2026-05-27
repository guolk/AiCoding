import katex from 'katex';

export function renderLatex(latex: string, displayMode = false): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      errorColor: '#EF4444',
    });
  } catch {
    return `<span class="text-danger">公式渲染错误: ${latex}</span>`;
  }
}

export function escapeLatex(text: string): string {
  const replacements: Record<string, string> = {
    '\\': '\\\\',
    '{': '\\{',
    '}': '\\}',
    '$': '\\$',
    '%': '\\%',
    '_': '\\_',
    '#': '\\#',
    '&': '\\&',
    '~': '\\textasciitilde{}',
    '^': '\\textasciicircum{}',
  };

  let result = text;
  for (const [char, replacement] of Object.entries(replacements)) {
    result = result.split(char).join(replacement);
  }
  return result;
}
