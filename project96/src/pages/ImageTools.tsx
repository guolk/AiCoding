

import React, { useState, useRef } from 'react';
import { saveAs } from 'file-saver';
import Layout from '../components/Layout';
import { Image, Crop, Eye, EyeOff } from 'lucide-react';
import { convertImageFormat, resizeImage, getExifData, removeExifData } from '../utils/image';

const ImageTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'convert' | 'resize' | 'exif'>('convert');

  return (
    <Layout title="图片处理工具">
      <div className="space-y-6">
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('convert')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'convert'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Image className="w-5 h-5" />
            <span>格式转换</span>
          </button>
          <button
            onClick={() => setActiveTab('resize')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'resize'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Crop className="w-5 h-5" />
            <span>裁剪缩放</span>
          </button>
          <button
            onClick={() => setActiveTab('exif')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'exif'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Eye className="w-5 h-5" />
            <span>EXIF 信息</span>
          </button>
        </div>

        {activeTab === 'convert' && <ConvertTool />}
        {activeTab === 'resize' && <ResizeTool />}
        {activeTab === 'exif' && <ExifTool />}
      </div>
    </Layout>
  );
};

const ConvertTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [quality, setQuality] = useState(0.8);
  const [preview, setPreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    setError('');
    if (!selectedFile.type.startsWith('image/')) {
      setError('请选择有效的图片文件');
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const convert = async () => {
    if (!file) return;
    try {
      const blob = await convertImageFormat(file, format, quality);
      saveAs(blob, `converted.${format}`);
    } catch (e) {
      setError('转换失败，请重试');
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">上传图片</label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : file
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="text-center">
              <Image className={`w-12 h-12 mx-auto mb-3 ${file ? 'text-green-500' : 'text-gray-400'}`} />
              <p className="text-sm font-medium text-gray-700">
                {file ? file.name : '点击或拖放图片到此处'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                支持 JPG, PNG, GIF, WebP 等格式
              </p>
            </div>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}
          {preview && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">预览</p>
              <img src={preview} alt="Preview" className="max-h-64 object-contain rounded-lg border border-gray-200" />
            </div>
          )}
        </div>
        <div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">目标格式</label>
              <div className="flex space-x-3">
                {['jpeg', 'png', 'webp'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      format === f ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                质量: {Math.round(quality * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <button
              onClick={convert}
              disabled={!file}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              转换并下载
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResizeTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);
  const [preview, setPreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    setError('');
    if (!selectedFile.type.startsWith('image/')) {
      setError('请选择有效的图片文件');
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const resize = async () => {
    if (!file) return;
    try {
      const blob = await resizeImage(file, maxWidth, maxHeight);
      saveAs(blob, 'resized.png');
    } catch (e) {
      setError('缩放失败，请重试');
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">上传图片</label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : file
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="text-center">
              <Image className={`w-12 h-12 mx-auto mb-3 ${file ? 'text-green-500' : 'text-gray-400'}`} />
              <p className="text-sm font-medium text-gray-700">
                {file ? file.name : '点击或拖放图片到此处'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                支持 JPG, PNG, GIF, WebP 等格式
              </p>
            </div>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}
          {preview && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">预览</p>
              <img src={preview} alt="Preview" className="max-h-64 object-contain rounded-lg border border-gray-200" />
            </div>
          )}
        </div>
        <div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">最大宽度 (px)</label>
              <input
                type="number"
                value={maxWidth}
                onChange={(e) => setMaxWidth(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">最大高度 (px)</label>
              <input
                type="number"
                value={maxHeight}
                onChange={(e) => setMaxHeight(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-200 rounded-lg"
              />
            </div>
            <button
              onClick={resize}
              disabled={!file}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              缩放并下载
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExifTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [exifData, setExifData] = useState<any>(null);
  const [preview, setPreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    setError('');
    if (!selectedFile.type.startsWith('image/')) {
      setError('请选择有效的图片文件');
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setExifData(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const readExif = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      const data = await getExifData(file);
      setExifData(data);
      setError('');
    } catch (e) {
      setError('读取 EXIF 失败');
    } finally {
      setIsLoading(false);
    }
  };

  const removeExif = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      const blob = await removeExifData(file);
      saveAs(blob, 'no-exif.jpg');
      setError('');
    } catch (e) {
      setError('移除 EXIF 失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">上传图片</label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : file
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="text-center">
              <Image className={`w-12 h-12 mx-auto mb-3 ${file ? 'text-green-500' : 'text-gray-400'}`} />
              <p className="text-sm font-medium text-gray-700">
                {file ? file.name : '点击或拖放图片到此处'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                支持 JPG, PNG, GIF, WebP 等格式
              </p>
            </div>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}
          {preview && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">预览</p>
              <img src={preview} alt="Preview" className="max-h-64 object-contain rounded-lg border border-gray-200" />
            </div>
          )}
          <div className="flex space-x-3 mt-4">
            <button
              onClick={readExif}
              disabled={!file || isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Eye className="w-4 h-4 inline mr-2" />
              {isLoading ? '读取中...' : '查看 EXIF'}
            </button>
            <button
              onClick={removeExif}
              disabled={!file || isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <EyeOff className="w-4 h-4 inline mr-2" />
              {isLoading ? '处理中...' : '移除 EXIF'}
            </button>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">EXIF 信息</h3>
          {exifData ? (
            <div className="space-y-2 max-h-96 overflow-auto">
              {Object.entries(exifData).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">{key}</span>
                  <span className="text-sm font-mono text-gray-800">{String(value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">点击"查看 EXIF"以显示信息</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageTools;

