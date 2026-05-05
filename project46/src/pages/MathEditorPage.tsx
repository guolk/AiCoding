import React, { useState, useEffect, useRef, useCallback } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import html2canvas from 'html2canvas';

// 数学符号分类和按钮
const mathSymbols = {
  基础运算: [
    { label: '+', value: '+', desc: '加号' },
    { label: '-', value: '-', desc: '减号' },
    { label: '×', value: '\\times', desc: '乘号' },
    { label: '÷', value: '\\div', desc: '除号' },
    { label: '±', value: '\\pm', desc: '正负号' },
    { label: '∓', value: '\\mp', desc: '负正号' },
    { label: '·', value: '\\cdot', desc: '点乘' },
    { label: '=', value: '=', desc: '等号' },
    { label: '≠', value: '\\neq', desc: '不等号' },
    { label: '≈', value: '\\approx', desc: '约等于' },
    { label: '<', value: '<', desc: '小于' },
    { label: '>', value: '>', desc: '大于' },
    { label: '≤', value: '\\leq', desc: '小于等于' },
    { label: '≥', value: '\\geq', desc: '大于等于' },
  ],
  分数与根号: [
    { label: '½', value: '\\frac{a}{b}', desc: '分数' },
    { label: '√', value: '\\sqrt{x}', desc: '平方根' },
    { label: '∛', value: '\\sqrt[3]{x}', desc: '三次方根' },
    { label: 'ⁿ√', value: '\\sqrt[n]{x}', desc: 'n次方根' },
  ],
  上标与下标: [
    { label: 'x²', value: 'x^2', desc: '上标' },
    { label: 'xₙ', value: 'x_n', desc: '下标' },
    { label: 'xᵧ', value: 'x^{y}', desc: '复杂上标' },
    { label: 'xᵧʸ', value: 'x_{y}', desc: '复杂下标' },
    { label: 'x₀', value: 'x_0', desc: '下标0' },
    { label: 'x₁', value: 'x_1', desc: '下标1' },
  ],
  求和与积分: [
    { label: '∑', value: '\\sum_{i=1}^{n}', desc: '求和' },
    { label: '∏', value: '\\prod_{i=1}^{n}', desc: '连乘' },
    { label: '∫', value: '\\int', desc: '积分' },
    { label: '∫ₐᵇ', value: '\\int_{a}^{b}', desc: '定积分' },
    { label: '∬', value: '\\iint', desc: '二重积分' },
    { label: '∭', value: '\\iiint', desc: '三重积分' },
    { label: '∮', value: '\\oint', desc: '闭合积分' },
  ],
  矩阵与括号: [
    { label: '[]', value: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}', desc: '方括号矩阵' },
    { label: '()', value: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', desc: '圆括号矩阵' },
    { label: '||', value: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}', desc: '行列式' },
    { label: '{ }', value: '\\left\\{ \\begin{matrix} a \\\\ b \\end{matrix} \\right.', desc: '分段函数' },
    { label: '|x|', value: '\\left| x \\right|', desc: '绝对值' },
    { label: '(x)', value: '\\left( x \\right)', desc: '自适应括号' },
  ],
  函数与三角: [
    { label: 'sin', value: '\\sin x', desc: '正弦' },
    { label: 'cos', value: '\\cos x', desc: '余弦' },
    { label: 'tan', value: '\\tan x', desc: '正切' },
    { label: 'cot', value: '\\cot x', desc: '余切' },
    { label: 'sec', value: '\\sec x', desc: '正割' },
    { label: 'csc', value: '\\csc x', desc: '余割' },
    { label: 'log', value: '\\log x', desc: '对数' },
    { label: 'ln', value: '\\ln x', desc: '自然对数' },
    { label: 'exp', value: '\\exp(x)', desc: '指数' },
    { label: '√', value: '\\sqrt{x}', desc: '平方根' },
  ],
  希腊字母: [
    { label: 'α', value: '\\alpha', desc: '阿尔法' },
    { label: 'β', value: '\\beta', desc: '贝塔' },
    { label: 'γ', value: '\\gamma', desc: '伽马' },
    { label: 'δ', value: '\\delta', desc: '德尔塔' },
    { label: 'ε', value: '\\epsilon', desc: '伊普西隆' },
    { label: 'θ', value: '\\theta', desc: '西塔' },
    { label: 'λ', value: '\\lambda', desc: '兰布达' },
    { label: 'μ', value: '\\mu', desc: '缪' },
    { label: 'π', value: '\\pi', desc: '派' },
    { label: 'σ', value: '\\sigma', desc: '西格玛' },
    { label: 'φ', value: '\\phi', desc: '菲' },
    { label: 'ω', value: '\\omega', desc: '欧米伽' },
    { label: 'Γ', value: '\\Gamma', desc: '大写伽马' },
    { label: 'Δ', value: '\\Delta', desc: '大写德尔塔' },
    { label: 'Θ', value: '\\Theta', desc: '大写西塔' },
    { label: 'Λ', value: '\\Lambda', desc: '大写兰布达' },
    { label: 'Σ', value: '\\Sigma', desc: '大写西格玛' },
    { label: 'Ω', value: '\\Omega', desc: '大写欧米伽' },
  ],
  特殊符号: [
    { label: '∞', value: '\\infty', desc: '无穷大' },
    { label: '∂', value: '\\partial', desc: '偏导' },
    { label: '∇', value: '\\nabla', desc: '拉普拉斯算子' },
    { label: '∀', value: '\\forall', desc: '任意' },
    { label: '∃', value: '\\exists', desc: '存在' },
    { label: '¬', value: '\\neg', desc: '非' },
    { label: '∧', value: '\\land', desc: '与' },
    { label: '∨', value: '\\lor', desc: '或' },
    { label: '→', value: '\\to', desc: '趋向于' },
    { label: '⇒', value: '\\Rightarrow', desc: '推出' },
    { label: '⇔', value: '\\Leftrightarrow', desc: '等价于' },
    { label: '∈', value: '\\in', desc: '属于' },
    { label: '∉', value: '\\notin', desc: '不属于' },
    { label: '⊂', value: '\\subset', desc: '包含于' },
    { label: '⊃', value: '\\supset', desc: '包含' },
    { label: '∩', value: '\\cap', desc: '交' },
    { label: '∪', value: '\\cup', desc: '并' },
    { label: '∅', value: '\\emptyset', desc: '空集' },
    { label: 'ℕ', value: '\\mathbb{N}', desc: '自然数集' },
    { label: 'ℤ', value: '\\mathbb{Z}', desc: '整数集' },
    { label: 'ℝ', value: '\\mathbb{R}', desc: '实数集' },
    { label: 'ℂ', value: '\\mathbb{C}', desc: '复数集' },
  ],
};

// 预设公式模板
const templateFormulas = [
  { name: '一元二次方程求根公式', latex: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}' },
  { name: '勾股定理', latex: 'a^2 + b^2 = c^2' },
  { name: '欧拉公式', latex: 'e^{i\\pi} + 1 = 0' },
  { name: '牛顿-莱布尼茨公式', latex: '\\int_{a}^{b} f(x)dx = F(b) - F(a)' },
  { name: '泰勒级数', latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n' },
  { name: '傅里叶变换', latex: 'F(\\omega) = \\int_{-\\infty}^{\\infty} f(t)e^{-i\\omega t}dt' },
  { name: '矩阵乘法', latex: 'C_{ij} = \\sum_{k=1}^{n} A_{ik} B_{kj}' },
  { name: '导数定义', latex: "f'(a) = \\lim_{h \\to 0} \\frac{f(a+h) - f(a)}{h}" },
];

const MathEditorPage: React.FC = () => {
  const [latexInput, setLatexInput] = useState<string>('\\frac{1}{2} + \\sqrt{3}');
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [renderError, setRenderError] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('基础运算');
  const [history, setHistory] = useState<string[]>([]);
  const [naturalDescription, setNaturalDescription] = useState<string>('');
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 从localStorage加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('formulaHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
  }, []);

  // 保存历史记录到localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('formulaHistory', JSON.stringify(history));
    }
  }, [history]);

  // 渲染LaTeX
  useEffect(() => {
    if (!latexInput) {
      setRenderedHtml('');
      setRenderError('');
      return;
    }

    try {
      const html = katex.renderToString(latexInput, {
        throwOnError: false,
        displayMode: true,
        output: 'htmlAndMathml',
      });
      setRenderedHtml(html);
      setRenderError('');
    } catch (error) {
      console.error('KaTeX render error:', error);
      setRenderError(error instanceof Error ? error.message : '渲染错误');
      setRenderedHtml('');
    }
  }, [latexInput]);

  // 插入符号到输入框
  const insertSymbol = useCallback((value: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const before = latexInput.substring(0, start);
      const after = latexInput.substring(end);
      const newLatex = before + value + after;
      setLatexInput(newLatex);
      
      // 设置光标位置到插入内容之后
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = start + value.length;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    } else {
      setLatexInput(prev => prev + value);
    }
  }, [latexInput]);

  // 保存到历史记录
  const saveToHistory = useCallback(() => {
    if (!latexInput.trim()) return;
    
    setHistory(prev => {
      // 移除重复项
      const filtered = prev.filter(item => item !== latexInput);
      // 添加到开头，最多保留20条
      const newHistory = [latexInput, ...filtered].slice(0, 20);
      return newHistory;
    });
  }, [latexInput]);

  // 从历史记录加载
  const loadFromHistory = useCallback((formula: string) => {
    setLatexInput(formula);
  }, []);

  // 清空历史记录
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('formulaHistory');
  }, []);

  // 转换为自然语言描述
  const convertToNaturalLanguage = useCallback(async () => {
    if (!latexInput.trim()) {
      setNaturalDescription('请先输入公式');
      return;
    }

    setIsConverting(true);
    setNaturalDescription('');

    try {
      const response = await fetch('/api/latex-to-natural', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latex: latexInput }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '转换失败');
      }

      const data = await response.json();
      setNaturalDescription(data.natural || '无法转换为自然语言描述');
    } catch (error) {
      console.error('转换错误:', error);
      setNaturalDescription(`转换失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsConverting(false);
    }
  }, [latexInput]);

  // 导出为PNG
  const exportAsPNG = useCallback(async () => {
    if (!previewRef.current) {
      alert('预览区域为空');
      return;
    }

    try {
      const canvas = await html2canvas(previewRef.current, {
        background: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `formula-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('PNG导出失败:', error);
      alert('导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  }, []);

  // 导出为SVG
  const exportAsSVG = useCallback(() => {
    if (!renderedHtml) {
      alert('预览区域为空');
      return;
    }

    try {
      // 创建SVG内容
      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
  <rect width="100%" height="100%" fill="white"/>
  <foreignObject x="10" y="10" width="780" height="380">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: 20px; text-align: center;">
      ${renderedHtml}
    </div>
  </foreignObject>
</svg>`;

      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `formula-${Date.now()}.svg`;
      link.href = url;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('SVG导出失败:', error);
      alert('导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  }, [renderedHtml]);

  // 复制LaTeX到剪贴板
  const copyLatexToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(latexInput);
      alert('LaTeX已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败');
    }
  }, [latexInput]);

  // 清空输入
  const clearInput = useCallback(() => {
    setLatexInput('');
    setNaturalDescription('');
    setRenderError('');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* 标题 */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            在线数学公式编辑器
          </h1>
          <p className="text-gray-600">
            支持LaTeX语法输入，实时渲染预览，公式转自然语言描述
          </p>
        </div>

        {/* 主内容区 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧：输入和符号面板 */}
          <div className="lg:col-span-5 space-y-6">
            {/* 输入框 */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-700">LaTeX 输入</h2>
                <div className="flex gap-2">
                  <button
                    onClick={copyLatexToClipboard}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                  >
                    复制
                  </button>
                  <button
                    onClick={clearInput}
                    className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                  >
                    清空
                  </button>
                </div>
              </div>
              <textarea
                ref={textareaRef}
                value={latexInput}
                onChange={(e) => setLatexInput(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                placeholder="在此输入LaTeX公式..."
              />
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={saveToHistory}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  保存到历史
                </button>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                >
                  {showTemplates ? '隐藏模板' : '常用模板'}
                </button>
              </div>
            </div>

            {/* 公式模板 */}
            {showTemplates && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">常用公式模板</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {templateFormulas.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => setLatexInput(template.latex)}
                      className="p-3 text-left bg-gray-50 rounded hover:bg-blue-50 transition-colors border border-gray-200"
                    >
                      <div className="font-medium text-sm text-gray-700">{template.name}</div>
                      <div className="mt-1 text-xs text-gray-500 font-mono truncate">
                        {template.latex}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 符号面板 */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">符号面板</h2>
              
              {/* 分类标签 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.keys(mathSymbols).map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      activeCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* 符号按钮 */}
              <div className="grid grid-cols-5 md:grid-cols-7 gap-2">
                {mathSymbols[activeCategory as keyof typeof mathSymbols]?.map((symbol, index) => (
                  <button
                    key={index}
                    onClick={() => insertSymbol(symbol.value)}
                    title={`${symbol.desc}: ${symbol.value}`}
                    className="p-2 text-xl bg-gray-50 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    {symbol.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 历史记录 */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-700">公式历史</h2>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  >
                    清空
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">
                  暂无历史记录，输入公式后点击"保存到历史"
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {history.map((formula, index) => (
                    <button
                      key={index}
                      onClick={() => loadFromHistory(formula)}
                      className="w-full p-2 text-left bg-gray-50 rounded hover:bg-blue-50 transition-colors border border-gray-200"
                    >
                      <div className="text-xs text-gray-500 font-mono truncate">
                        {formula}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右侧：预览、转换和导出 */}
          <div className="lg:col-span-7 space-y-6">
            {/* 实时预览 */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-700">实时预览</h2>
                <div className="flex gap-2">
                  <button
                    onClick={exportAsPNG}
                    className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                  >
                    导出PNG
                  </button>
                  <button
                    onClick={exportAsSVG}
                    className="px-3 py-1 text-sm bg-orange-50 text-orange-600 rounded hover:bg-orange-100 transition-colors"
                  >
                    导出SVG
                  </button>
                </div>
              </div>
              
              {/* 预览区域 */}
              <div
                ref={previewRef}
                className="min-h-32 p-8 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center"
              >
                {renderError ? (
                  <div className="text-red-600 text-sm">
                    <p className="font-medium">渲染错误:</p>
                    <p className="mt-1 font-mono">{renderError}</p>
                  </div>
                ) : renderedHtml ? (
                  <div
                    className="text-2xl"
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                  />
                ) : (
                  <p className="text-gray-400">输入公式后将在此处预览</p>
                )}
              </div>
            </div>

            {/* 公式转自然语言描述 */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-700">公式转语言描述</h2>
                <button
                  onClick={convertToNaturalLanguage}
                  disabled={isConverting}
                  className={`px-4 py-2 rounded-md transition-colors text-sm ${
                    isConverting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isConverting ? '转换中...' : '开始转换'}
                </button>
              </div>
              
              <div className="min-h-16 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                {naturalDescription ? (
                  <p className="text-gray-700 leading-relaxed">
                    {naturalDescription}
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm">
                    点击"开始转换"按钮，将LaTeX公式转换为自然语言描述
                  </p>
                )}
              </div>
              
              {/* 示例说明 */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-1">示例:</p>
                <p className="text-xs text-blue-700">
                  <code className="bg-blue-100 px-1 rounded">{'\\frac{a}{b}'}</code> → "a 除以 b"
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  <code className="bg-blue-100 px-1 rounded">{'\\int_{a}^{b} f(x)dx'}</code> → "从 a 到 b，对 f(x) d x 积分"
                </p>
              </div>
            </div>

            {/* 使用说明 */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">使用说明</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>
                    在左侧输入框中输入LaTeX公式，或点击符号面板中的符号快速插入
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>
                    右侧会实时显示公式渲染结果
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>
                    点击"保存到历史"可保存当前公式，方便后续使用
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">4.</span>
                  <span>
                    点击"导出PNG"或"导出SVG"可将公式保存为图片
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">5.</span>
                  <span>
                    点击"开始转换"可调用后端API将公式转换为自然语言描述
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathEditorPage;
