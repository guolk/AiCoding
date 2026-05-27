

import React, { useState } from 'react';
import { marked } from 'marked';
import { saveAs } from 'file-saver';
import Layout from '../components/Layout';
import { 
  FileText, Code, BarChart3 
} from 'lucide-react';
import {
  jsonFormat,
  base64Encode, base64Decode,
  urlEncode, urlDecode,
  testRegex,
  getTextStats
} from '../utils/text';

const TextTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'markdown' | 'format' | 'stats'>('markdown');

  return (
    <Layout title="文本处理工具">
      <div className="space-y-6">
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('markdown')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'markdown'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Markdown 工具</span>
          </button>
          <button
            onClick={() => setActiveTab('format')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'format'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Code className="w-5 h-5" />
            <span>格式转换</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'stats'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>文字统计</span>
          </button>
        </div>

        {activeTab === 'markdown' && <MarkdownTool />}
        {activeTab === 'format' && <FormatTool />}
        {activeTab === 'stats' && <StatsTool />}
      </div>
    </Layout>
  );
};

const MarkdownTool: React.FC = () => {
  const [markdown, setMarkdown] = useState('# 欢迎使用\n\n这是一个 **Markdown** 预览工具');

  const handleExportHtml = () => {
    const html = marked(markdown);
    const blob = new Blob([`<!DOCTYPE html><html><body>${html}</body></html>`], { type: 'text/html' });
    saveAs(blob, 'document.html');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Markdown 输入</h3>
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          className="w-full h-96 p-4 border border-gray-200 rounded-lg font-mono text-sm resize-none"
          placeholder="输入 Markdown..."
        />
        <div className="flex space-x-3 mt-4">
          <button
            onClick={handleExportHtml}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            导出 HTML
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">预览</h3>
        <div
          className="prose max-w-none h-96 overflow-auto p-4 border border-gray-200 rounded-lg bg-gray-50"
          dangerouslySetInnerHTML={{ __html: marked(markdown) }}
        />
      </div>
    </div>
  );
};

const FormatTool: React.FC = () => {
  const [activeFormat, setActiveFormat] = useState<'json' | 'base64' | 'url' | 'regex'>('json');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [regexPattern, setRegexPattern] = useState('');
  const [regexFlags, setRegexFlags] = useState('');
  const [regexTestStr, setRegexTestStr] = useState('');
  const [regexResult, setRegexResult] = useState(false);

  const handleConvert = () => {
    try {
      setError('');
      if (activeFormat === 'json') {
        setOutput(jsonFormat(input));
      } else if (activeFormat === 'base64') {
        try {
          setOutput(base64Decode(input));
        } catch {
          setOutput(base64Encode(input));
        }
      } else if (activeFormat === 'url') {
        try {
          setOutput(urlDecode(input));
        } catch {
          setOutput(urlEncode(input));
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    }
  };

  const handleRegexTest = () => {
    try {
      setError('');
      setRegexResult(testRegex(regexPattern, regexFlags, regexTestStr));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid regex');
    }
  };

  if (activeFormat === 'regex') {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex space-x-3 mb-6">
          {['json', 'base64', 'url', 'regex'].map((format) => (
            <button
              key={format}
              onClick={() => setActiveFormat(format as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeFormat === format ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">正则表达式</label>
            <input
              type="text"
              value={regexPattern}
              onChange={(e) => setRegexPattern(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg font-mono"
              placeholder="输入正则表达式..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">标志 (g, i, m, s, u, y)</label>
            <input
              type="text"
              value={regexFlags}
              onChange={(e) => setRegexFlags(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg font-mono"
              placeholder="g"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">测试字符串</label>
            <textarea
              value={regexTestStr}
              onChange={(e) => setRegexTestStr(e.target.value)}
              className="w-full h-32 p-3 border border-gray-200 rounded-lg font-mono"
              placeholder="输入要测试的字符串..."
            />
          </div>
          <button
            onClick={handleRegexTest}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            测试
          </button>
          {error && <p className="text-red-600">{error}</p>}
          {!error && (
            <div className={`p-4 rounded-lg ${regexResult ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {regexResult ? '匹配成功！' : '未匹配'}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex space-x-3 mb-6">
        {['json', 'base64', 'url', 'regex'].map((format) => (
          <button
            key={format}
            onClick={() => setActiveFormat(format as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeFormat === format ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {format.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">输入</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-48 p-4 border border-gray-200 rounded-lg font-mono text-sm"
            placeholder={`输入 ${activeFormat.toUpperCase()}...`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">输出</label>
          <textarea
            value={output}
            readOnly
            className="w-full h-48 p-4 border border-gray-200 rounded-lg font-mono text-sm bg-gray-50"
          />
        </div>
      </div>
      <button
        onClick={handleConvert}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        转换
      </button>
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
};

const StatsTool: React.FC = () => {
  const [text, setText] = useState('');
  const stats = getTextStats(text);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">输入文本</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-64 p-4 border border-gray-200 rounded-lg resize-none"
          placeholder="输入要统计的文本..."
        />
      </div>
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">统计结果</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <span className="text-gray-600">字符数</span>
            <span className="font-bold text-blue-600 text-xl">{stats.chars}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
            <span className="text-gray-600">词数</span>
            <span className="font-bold text-purple-600 text-xl">{stats.words}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <span className="text-gray-600">行数</span>
            <span className="font-bold text-green-600 text-xl">{stats.lines}</span>
          </div>
          {stats.charFrequency.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">字符频率（前20）</h4>
              <div className="space-y-1">
                {stats.charFrequency.map(([char, count]) => (
                  <div key={char} className="flex justify-between text-sm">
                    <span className="text-gray-600">"{char === ' ' ? '空格' : char}"</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextTools;

