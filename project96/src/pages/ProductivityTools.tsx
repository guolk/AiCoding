

import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { Timer, Key, Repeat } from 'lucide-react';
import { generatePassword, convertLength, convertWeight, convertTemperature, unitConverters } from '../utils/productivity';

const ProductivityTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pomodoro' | 'password' | 'unit'>('pomodoro');

  return (
    <Layout title="效率工具">
      <div className="space-y-6">
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('pomodoro')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'pomodoro'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Timer className="w-5 h-5" />
            <span>番茄钟</span>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'password'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Key className="w-5 h-5" />
            <span>密码生成</span>
          </button>
          <button
            onClick={() => setActiveTab('unit')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'unit'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Repeat className="w-5 h-5" />
            <span>单位换算</span>
          </button>
        </div>

        {activeTab === 'pomodoro' && <PomodoroTool />}
        {activeTab === 'password' && <PasswordTool />}
        {activeTab === 'unit' && <UnitTool />}
      </div>
    </Layout>
  );
};

const PomodoroTool: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      alert(mode === 'work' ? '休息时间到！' : '工作时间到！');
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, mode]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'work' | 'break') => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl p-8 shadow-md text-center">
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={() => switchMode('work')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            mode === 'work' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          工作 (25分钟)
        </button>
        <button
          onClick={() => switchMode('break')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            mode === 'break' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          休息 (5分钟)
        </button>
      </div>
      <div className="text-6xl font-bold text-gray-800 mb-8">
        {formatTime(timeLeft)}
      </div>
      <div className="flex justify-center space-x-4">
        {!isRunning ? (
          <button
            onClick={start}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            开始
          </button>
        ) : (
          <button
            onClick={pause}
            className="px-8 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            暂停
          </button>
        )}
        <button
          onClick={reset}
          className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          重置
        </button>
      </div>
    </div>
  );
};

const PasswordTool: React.FC = () => {
  const [length, setLength] = useState(12);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState('');

  const generate = () => {
    setPassword(generatePassword(length, useUppercase, useLowercase, useNumbers, useSymbols));
  };

  const copy = () => {
    navigator.clipboard.writeText(password);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
        <input
          type="text"
          value={password}
          readOnly
          className="flex-1 bg-transparent font-mono text-lg"
          placeholder="点击生成密码"
        />
        <button
          onClick={copy}
          disabled={!password}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          复制
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            密码长度: {length}
          </label>
          <input
            type="range"
            min="4"
            max="64"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={useUppercase}
              onChange={(e) => setUseUppercase(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-gray-700">大写字母 (A-Z)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={useLowercase}
              onChange={(e) => setUseLowercase(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-gray-700">小写字母 (a-z)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={useNumbers}
              onChange={(e) => setUseNumbers(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-gray-700">数字 (0-9)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={useSymbols}
              onChange={(e) => setUseSymbols(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-gray-700">符号 (!@#$%^&amp;*)</span>
          </label>
        </div>
        <button
          onClick={generate}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          生成密码
        </button>
      </div>
    </div>
  );
};

const UnitTool: React.FC = () => {
  const [category, setCategory] = useState<'length' | 'weight' | 'temperature'>('length');
  const [fromValue, setFromValue] = useState('');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');
  const [toValue, setToValue] = useState('');

  const convert = () => {
    const value = parseFloat(fromValue);
    if (isNaN(value)) return;

    try {
      let result: number;
      if (category === 'length') {
        result = convertLength(value, fromUnit, toUnit);
      } else if (category === 'weight') {
        result = convertWeight(value, fromUnit, toUnit);
      } else {
        result = convertTemperature(value, fromUnit, toUnit);
      }
      setToValue(result.toString());
    } catch (e) {
      console.error(e);
    }
  };

  const units = {
    length: ['m', 'km', 'cm', 'mm', 'mi', 'yd', 'ft', 'in'],
    weight: ['kg', 'g', 'mg', 'lb', 'oz'],
    temperature: ['c', 'f', 'k']
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex space-x-3 mb-6">
        {(['length', 'weight', 'temperature'] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              category === c ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {c === 'length' ? '长度' : c === 'weight' ? '重量' : '温度'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">从</label>
          <input
            type="number"
            value={fromValue}
            onChange={(e) => setFromValue(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-lg mb-2"
            placeholder="输入数值"
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg"
          >
            {units[category].map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">到</label>
          <input
            type="text"
            value={toValue}
            readOnly
            className="w-full p-4 border border-gray-200 rounded-lg mb-2 bg-gray-50"
          />
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg"
          >
            {units[category].map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={convert}
        className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        转换
      </button>
    </div>
  );
};

export default ProductivityTools;

