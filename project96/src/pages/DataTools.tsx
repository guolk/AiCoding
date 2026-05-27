

import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import Layout from '../components/Layout';
import { Table, Filter, RefreshCw } from 'lucide-react';
import { csvToJson, jsonToCsv, filterData, sortData } from '../utils/data';

const DataTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'visualize' | 'convert'>('visualize');

  return (
    <Layout title="数据处理工具">
      <div className="space-y-6">
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('visualize')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'visualize'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Table className="w-5 h-5" />
            <span>数据可视化</span>
          </button>
          <button
            onClick={() => setActiveTab('convert')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'convert'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <RefreshCw className="w-5 h-5" />
            <span>格式转换</span>
          </button>
        </div>

        {activeTab === 'visualize' && <VisualizeTool />}
        {activeTab === 'convert' && <ConvertTool />}
      </div>
    </Layout>
  );
};

const VisualizeTool: React.FC = () => {
  const [input, setInput] = useState('name,age,city\nAlice,30,New York\nBob,25,London');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [data, setData] = useState<any[]>([]);
  const [filterKey, setFilterKey] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  const processData = () => {
    try {
      let parsed: any[];
      if (format === 'csv') {
        parsed = csvToJson(input);
      } else {
        parsed = JSON.parse(input);
      }
      setData(parsed);
    } catch (e) {
      alert('数据格式错误');
    }
  };

  const filteredData = filterKey ? filterData(data, filterKey, filterValue) : data;
  const sortedData = sortKey ? sortData(filteredData, sortKey, sortAsc) : filteredData;

  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex space-x-3 mb-4">
          <button
            onClick={() => setFormat('csv')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              format === 'csv' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            CSV
          </button>
          <button
            onClick={() => setFormat('json')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              format === 'json' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            JSON
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-32 p-4 border border-gray-200 rounded-lg font-mono text-sm"
          placeholder={`输入 ${format.toUpperCase()} 数据...`}
        />
        <button
          onClick={processData}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          解析数据
        </button>
      </div>

      {sortedData.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterKey}
                onChange={(e) => setFilterKey(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2"
              >
                <option value="">选择筛选字段</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <input
                type="text"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2"
                placeholder="筛选值..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2"
              >
                <option value="">选择排序字段</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                {sortAsc ? '↑' : '↓'}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  {headers.map((header) => (
                    <th key={header} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData.slice(0, 50).map((row, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    {headers.map((header) => (
                      <td key={header} className="px-4 py-3 text-sm text-gray-600">
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const ConvertTool: React.FC = () => {
  const [direction, setDirection] = useState<'csv2json' | 'json2csv'>('csv2json');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    try {
      if (direction === 'csv2json') {
        setOutput(JSON.stringify(csvToJson(input), null, 2));
      } else {
        setOutput(jsonToCsv(JSON.parse(input)));
      }
    } catch (e) {
      alert('格式错误');
    }
  };

  const download = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    saveAs(blob, direction === 'csv2json' ? 'data.json' : 'data.csv');
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex space-x-3 mb-6">
        <button
          onClick={() => setDirection('csv2json')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            direction === 'csv2json' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          CSV → JSON
        </button>
        <button
          onClick={() => setDirection('json2csv')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            direction === 'json2csv' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          JSON → CSV
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">输入</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-48 p-4 border border-gray-200 rounded-lg font-mono text-sm"
            placeholder={`输入 ${direction === 'csv2json' ? 'CSV' : 'JSON'}...`}
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
      <div className="flex space-x-3 mt-4">
        <button
          onClick={convert}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          转换
        </button>
        <button
          onClick={download}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          下载
        </button>
      </div>
    </div>
  );
};

export default DataTools;

