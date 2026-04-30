import React, { useState, useCallback, useRef } from 'react';

interface CodeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFileUpload: (content: string, filename: string) => void;
  filename?: string;
  placeholder?: string;
}

export const CodeInput: React.FC<CodeInputProps> = ({
  label,
  value,
  onChange,
  onFileUpload,
  filename,
  placeholder = '在此输入代码...'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileUpload(content, file.name);
    };
    reader.onerror = () => {
      console.error('文件读取失败');
    };
    reader.readAsText(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="input-section">
      <h3>{label}</h3>
      <textarea
        className="code-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <div
        className={`file-upload ${isDragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <p>拖拽文件到此处，或点击上传</p>
        {filename && <p className="file-info">当前文件: {filename}</p>}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
        accept=".js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.h,.html,.css,.json,.txt,.md"
      />
    </div>
  );
};
