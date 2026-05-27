

import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Palette, Clock, Lock } from 'lucide-react';
import {
  hexToRgb, rgbToHex, rgbToHsl, hslToRgb,
  timestampToDate, dateToTimestamp,
  calculateHash
} from '../utils/dev';

const DevTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'color' | 'timestamp' | 'hash'>('color');

  return (
    <Layout title="开发辅助工具">
      <div className="space-y-6">
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('color')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'color'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Palette className="w-5 h-5" />
            <span>颜色工具</span>
          </button>
          <button
            onClick={() => setActiveTab('timestamp')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'timestamp'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>时间戳转换</span>
          </button>
          <button
            onClick={() => setActiveTab('hash')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'hash'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Lock className="w-5 h-5" />
            <span>哈希计算</span>
          </button>
        </div>

        {activeTab === 'color' && <ColorTool />}
        {activeTab === 'timestamp' && <TimestampTool />}
        {activeTab === 'hash' && <HashTool />}
      </div>
    </Layout>
  );
};

const ColorTool: React.FC = () => {
  const [hex, setHex] = useState('#3b82f6');
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });

  const updateFromHex = (newHex: string) => {
    setHex(newHex);
    try {
      const newRgb = hexToRgb(newHex);
      setRgb(newRgb);
      setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
    } catch {}
  };

  const updateFromRgb = (r: number, g: number, b: number) => {
    const newRgb = { r, g, b };
    setRgb(newRgb);
    setHex(rgbToHex(r, g, b));
    setHsl(rgbToHsl(r, g, b));
  };

  const updateFromHsl = (h: number, s: number, l: number) => {
    const newHsl = { h, s, l };
    setHsl(newHsl);
    const newRgb = hslToRgb(h, s, l);
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div
            className="w-full h-48 rounded-xl mb-6 shadow-inner"
            style={{ backgroundColor: hex }}
          />
          <input
            type="color"
            value={hex}
            onChange={(e) => updateFromHex(e.target.value)}
            className="w-full h-12 rounded-lg cursor-pointer"
          />
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">HEX</label>
            <input
              type="text"
              value={hex}
              onChange={(e) => updateFromHex(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">RGB</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={rgb.r}
                onChange={(e) => updateFromRgb(parseInt(e.target.value), rgb.g, rgb.b)}
                className="p-3 border border-gray-200 rounded-lg"
              />
              <input
                type="number"
                value={rgb.g}
                onChange={(e) => updateFromRgb(rgb.r, parseInt(e.target.value), rgb.b)}
                className="p-3 border border-gray-200 rounded-lg"
              />
              <input
                type="number"
                value={rgb.b}
                onChange={(e) => updateFromRgb(rgb.r, rgb.g, parseInt(e.target.value))}
                className="p-3 border border-gray-200 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">HSL</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={hsl.h}
                onChange={(e) => updateFromHsl(parseInt(e.target.value), hsl.s, hsl.l)}
                className="p-3 border border-gray-200 rounded-lg"
              />
              <input
                type="number"
                value={hsl.s}
                onChange={(e) => updateFromHsl(hsl.h, parseInt(e.target.value), hsl.l)}
                className="p-3 border border-gray-200 rounded-lg"
              />
              <input
                type="number"
                value={hsl.l}
                onChange={(e) => updateFromHsl(hsl.h, hsl.s, parseInt(e.target.value))}
                className="p-3 border border-gray-200 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimestampTool: React.FC = () => {
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000));
  const [date, setDate] = useState(new Date());

  const updateFromTimestamp = (ts: number) => {
    setTimestamp(ts);
    setDate(timestampToDate(ts));
  };

  const updateFromDate = (d: Date) => {
    setDate(d);
    setTimestamp(dateToTimestamp(d));
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Unix 时间戳</label>
          <input
            type="number"
            value={timestamp}
            onChange={(e) => updateFromTimestamp(parseInt(e.target.value))}
            className="w-full p-4 border border-gray-200 rounded-lg font-mono text-lg"
          />
          <button
            onClick={() => updateFromTimestamp(Math.floor(Date.now() / 1000))}
            className="mt-3 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            现在
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">日期时间</label>
          <input
            type="datetime-local"
            value={date.toISOString().slice(0, 16)}
            onChange={(e) => updateFromDate(new Date(e.target.value))}
            className="w-full p-4 border border-gray-200 rounded-lg"
          />
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">{date.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const HashTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [md5, setMd5] = useState('');
  const [sha1, setSha1] = useState('');
  const [sha256, setSha256] = useState('');

  const calculate = () => {
    setMd5(calculateHash(input, 'md5'));
    setSha1(calculateHash(input, 'sha1'));
    setSha256(calculateHash(input, 'sha256'));
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">输入文本</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-32 p-4 border border-gray-200 rounded-lg font-mono text-sm"
          placeholder="输入要计算哈希的文本..."
        />
        <button
          onClick={calculate}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          计算哈希
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">MD5</label>
          <input
            type="text"
            value={md5}
            readOnly
            className="w-full p-3 border border-gray-200 rounded-lg font-mono text-sm bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SHA-1</label>
          <input
            type="text"
            value={sha1}
            readOnly
            className="w-full p-3 border border-gray-200 rounded-lg font-mono text-sm bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SHA-256</label>
          <input
            type="text"
            value={sha256}
            readOnly
            className="w-full p-3 border border-gray-200 rounded-lg font-mono text-sm bg-gray-50"
          />
        </div>
      </div>
    </div>
  );
};

export default DevTools;

