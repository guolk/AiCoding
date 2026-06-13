import { useState, useRef, useMemo } from 'react';
import { useWeatherStore } from '@/store';
import { parseCSV, generateSampleCSV, downloadCSV } from '@/utils/csv';
import { batchQualityCheck } from '@/utils/quality';
import type { Observation } from '@/types';
import { ELEMENT_LABELS } from '@/types';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle, Download, X, Loader2 } from 'lucide-react';

export default function DataImport() {
  const batchAddObservations = useWeatherStore((state) => state.batchAddObservations);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Observation[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setParsedData(null);
      setErrors([]);
      setImportSuccess(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setParsedData(null);
      setErrors([]);
      setImportSuccess(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleParse = async () => {
    if (!file) return;
    setIsParsing(true);
    setErrors([]);
    try {
      const text = await file.text();
      const { rows, errors: parseErrors } = parseCSV(text);
      
      if (parseErrors.length > 0) {
        setErrors(parseErrors);
      }

      if (rows.length > 0) {
        const checked = batchQualityCheck(rows);
        setParsedData(checked);
      } else {
        setParsedData([]);
      }
    } catch (e) {
      setErrors(['文件解析失败：' + (e as Error).message]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = () => {
    if (!parsedData || parsedData.length === 0) return;
    const cleanData = parsedData.map(({ id, qualityFlag, reviewStatus, remark, ...rest }) => rest);
    batchAddObservations(cleanData);
    setImportSuccess(true);
    setTimeout(() => {
      setFile(null);
      setParsedData(null);
      setErrors([]);
      setImportSuccess(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 2000);
  };

  const handleDownloadSample = () => {
    const csv = generateSampleCSV();
    downloadCSV(csv, '气象观测数据示例.csv');
  };

  const qualityStats = useMemo(() => {
    if (!parsedData) return null;
    const normal = parsedData.filter((o) => o.qualityFlag === 'normal').length;
    const outOfRange = parsedData.filter((o) => o.qualityFlag === 'out_of_range').length;
    const suspect = parsedData.filter((o) => o.qualityFlag === 'suspect').length;
    return { normal, outOfRange, suspect, total: parsedData.length };
  }, [parsedData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">CSV 数据导入</h1>
        <p className="text-slate-500 mt-1">批量导入气象观测历史数据</p>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-slate-700">下载示例文件</h3>
            <p className="text-sm text-slate-500 mt-1">
              可参考示例文件格式准备您的数据，支持中英文表头
            </p>
          </div>
          <button
            onClick={handleDownloadSample}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            下载示例 CSV
          </button>
        </div>
      </div>

      {!parsedData && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="card p-12 border-2 border-dashed border-slate-300 hover:border-primary-400 hover:bg-primary-50/30 transition-all cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              {file ? file.name : '点击或拖拽上传 CSV 文件'}
            </h3>
            <p className="text-slate-500 text-sm">
              支持 datetime, 气温(temperature), 湿度(humidity) 等中英文表头
            </p>
          </div>
        </div>
      )}

      {file && !parsedData && !isParsing && (
        <div className="flex gap-3">
          <button onClick={handleParse} className="btn btn-primary flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            解析并预览数据
          </button>
          <button
            onClick={() => {
              setFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="btn btn-secondary flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            取消
          </button>
        </div>
      )}

      {isParsing && (
        <div className="card p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mr-3" />
          <span className="text-slate-600">正在解析文件...</span>
        </div>
      )}

      {errors.length > 0 && (
        <div className="card p-4 bg-danger-50 border-danger-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-danger-800">解析警告（{errors.length}条）</h4>
              <ul className="mt-2 space-y-1">
                {errors.slice(0, 5).map((err, idx) => (
                  <li key={idx} className="text-sm text-danger-700">{err}</li>
                ))}
                {errors.length > 5 && (
                  <li className="text-sm text-danger-600">...还有 {errors.length - 5} 条警告</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {parsedData && qualityStats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card bg-gradient-to-br from-slate-500 to-slate-600">
              <p className="text-slate-200 text-sm">解析记录总数</p>
              <p className="text-white text-3xl font-bold mt-1">{qualityStats.total}</p>
            </div>
            <div className="stat-card bg-gradient-to-br from-emerald-500 to-emerald-600">
              <p className="text-emerald-100 text-sm">正常数据</p>
              <p className="text-white text-3xl font-bold mt-1">{qualityStats.normal}</p>
            </div>
            <div className="stat-card bg-gradient-to-br from-danger-500 to-danger-600">
              <p className="text-danger-100 text-sm">超范围数据</p>
              <p className="text-white text-3xl font-bold mt-1">{qualityStats.outOfRange}</p>
            </div>
            <div className="stat-card bg-gradient-to-br from-warning-500 to-warning-600">
              <p className="text-warning-100 text-sm">可疑数据</p>
              <p className="text-white text-3xl font-bold mt-1">{qualityStats.suspect}</p>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">数据预览（前10条）</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFile(null);
                    setParsedData(null);
                    setErrors([]);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="btn btn-secondary text-sm"
                >
                  重新选择
                </button>
                <button
                  onClick={handleImport}
                  disabled={importSuccess || qualityStats.total === 0}
                  className="btn btn-primary flex items-center gap-2 text-sm"
                >
                  {importSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      导入成功
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      确认导入
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>观测时间</th>
                    {(['temperature', 'humidity', 'pressure', 'windSpeed', 'windDirection', 'precipitation', 'visibility'] as const).map((key) => (
                      <th key={key}>{ELEMENT_LABELS[key]}</th>
                    ))}
                    <th>质量状态</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 10).map((obs, idx) => (
                    <tr key={idx}>
                      <td className="text-sm">{obs.datetime}</td>
                      <td>{obs.temperature?.toFixed(1) ?? '-'}</td>
                      <td>{obs.humidity?.toFixed(0) ?? '-'}</td>
                      <td>{obs.pressure?.toFixed(1) ?? '-'}</td>
                      <td>{obs.windSpeed?.toFixed(1) ?? '-'}</td>
                      <td>{obs.windDirection?.toFixed(0) ?? '-'}</td>
                      <td>{obs.precipitation?.toFixed(1) ?? '-'}</td>
                      <td>{obs.visibility?.toFixed(1) ?? '-'}</td>
                      <td>
                        {obs.qualityFlag === 'normal' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">
                            正常
                          </span>
                        )}
                        {obs.qualityFlag === 'out_of_range' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-rose-100 text-rose-700">
                            超范围
                          </span>
                        )}
                        {obs.qualityFlag === 'suspect' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">
                            可疑
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedData.length > 10 && (
              <p className="text-sm text-slate-500 mt-3 text-center">
                仅显示前10条，共 {parsedData.length} 条记录将被导入
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
