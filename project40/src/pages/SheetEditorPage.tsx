import { useState } from 'react';
import Layout from '@/components/Layout';
import SheetMusicEditor from '@/components/SheetMusicEditor';
import { useToast } from '@/context/ToastContext';
import type { SheetMusic } from '@/types';

function SheetEditorPage() {
  const { showSuccess } = useToast();

  const handleSave = (sheetMusic: SheetMusic) => {
    try {
      const savedSheets = JSON.parse(localStorage.getItem('savedSheets') || '[]');
      const existingIndex = savedSheets.findIndex((s: any) => s.id === sheetMusic.id);
      
      if (existingIndex >= 0) {
        savedSheets[existingIndex] = sheetMusic;
      } else {
        savedSheets.push(sheetMusic);
      }
      
      localStorage.setItem('savedSheets', JSON.stringify(savedSheets));
      showSuccess(`乐谱 "${sheetMusic.title}" 保存成功！`);
    } catch (error) {
      console.error('保存乐谱失败:', error);
    }
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-12rem)]">
        <SheetMusicEditor onSave={handleSave} />
      </div>
    </Layout>
  );
}

export default SheetEditorPage;
